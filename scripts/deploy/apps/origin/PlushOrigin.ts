import hre, { ethers, upgrades } from 'hardhat';
import { constants } from 'ethers';

import { DevContractsAddresses } from '../../../../arguments/development/consts';

const MINTER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('MINTER_ROLE'),
);
const PAUSER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('PAUSER_ROLE'),
);
const UPGRADER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('UPGRADER_ROLE'),
);

async function main() {
  const PlushOrigin = await hre.ethers.getContractFactory('PlushOrigin');

  const plushOrigin = await upgrades.deployProxy(
    PlushOrigin,
    [DevContractsAddresses.LIFESPAN_ADDRESS],
    {
      kind: 'uups',
    },
  );

  const signers = await ethers.getSigners();

  await plushOrigin.deployed();
  console.log('PlushOrigin -> deployed to address:', plushOrigin.address);

  console.log('Add basic connection types...\n');

  const addConnectionType1 = await plushOrigin.addConnectionType(0, 2);
  await addConnectionType1.wait();

  const addConnectionType2 = await plushOrigin.addConnectionType(1, 1);
  await addConnectionType2.wait();

  const addConnectionType3 = await plushOrigin.addConnectionType(2, 0);
  await addConnectionType3.wait();

  const addConnectionType4 = await plushOrigin.addConnectionType(3, 3);
  await addConnectionType4.wait();

  console.log('Grant all roles for Plush Studio DAO...\n');

  const grantAdminRole = await plushOrigin.grantRole(
    constants.HashZero,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // ADMIN role

  await grantAdminRole.wait();

  const grantMinterRole = await plushOrigin.grantRole(
    MINTER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // MINTER role

  await grantMinterRole.wait();

  const grantPauserRole = await plushOrigin.grantRole(
    PAUSER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // PAUSER role

  await grantPauserRole.wait();

  const grantUpgraderRole = await plushOrigin.grantRole(
    UPGRADER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // UPGRADER role

  await grantUpgraderRole.wait();

  console.log('Revoke all roles from existing account...\n');

  const revokeMinterRole = await plushOrigin.revokeRole(
    MINTER_ROLE,
    await signers[0].getAddress(),
  ); // MINTER role

  await revokeMinterRole.wait();

  const revokePauserRole = await plushOrigin.revokeRole(
    PAUSER_ROLE,
    await signers[0].getAddress(),
  ); // PAUSER role

  await revokePauserRole.wait();

  const revokeUpgraderRole = await plushOrigin.revokeRole(
    UPGRADER_ROLE,
    await signers[0].getAddress(),
  ); // UPGRADER role

  await revokeUpgraderRole.wait();

  const revokeAdminRole = await plushOrigin.revokeRole(
    constants.HashZero,
    await signers[0].getAddress(),
  ); // ADMIN role

  await revokeAdminRole.wait();

  if (process.env.NETWORK != 'local') {
    console.log('Waiting 1m before verify contract\n');
    await new Promise(function (resolve) {
      setTimeout(resolve, 60000);
    });
    console.log('Verifying...\n');

    await hre.run('verify:verify', {
      address: await upgrades.erc1967.getImplementationAddress(
        plushOrigin.address,
      ),
    });
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
