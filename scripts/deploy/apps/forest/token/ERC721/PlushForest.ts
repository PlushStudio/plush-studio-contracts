import { ethers, upgrades, run } from 'hardhat';
import { constants } from 'ethers';

import { DevContractsAddresses } from '../../../../../../arguments/development/consts';

const PAUSER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('PAUSER_ROLE'),
);
const MINTER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('MINTER_ROLE'),
);
const UPGRADER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('UPGRADER_ROLE'),
);

async function main() {
  const PlushForest = await ethers.getContractFactory('PlushForest');
  const plushForest = await upgrades.deployProxy(PlushForest, {
    kind: 'uups',
  });

  await plushForest.deployed();
  console.log('PlushForest -> deployed to address:', plushForest.address);

  console.log('Grant all roles for Plush Studio DAO...\n');

  console.log('Grant ADMIN role...');

  const grantAdminRole = await plushForest.grantRole(
    constants.HashZero,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // ADMIN role

  await grantAdminRole.wait();

  console.log('Grant MINTER role...');

  const grantMinterRole = await plushForest.grantRole(
    MINTER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // MINTER role

  await grantMinterRole.wait();

  console.log('Grant PAUSER role...');

  const grantPauserRole = await plushForest.grantRole(
    PAUSER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // PAUSER role

  await grantPauserRole.wait();

  console.log('Grant UPGRADER role...\n');

  const grantUpgraderRole = await plushForest.grantRole(
    UPGRADER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // UPGRADER role

  await grantUpgraderRole.wait();

  console.log('Revoke all roles from existing account...\n');

  const signers = await ethers.getSigners();

  console.log('Revoke MINTER role...');

  const revokeMinterRole = await plushForest.revokeRole(
    MINTER_ROLE,
    await signers[0].getAddress(),
  ); // MINTER role

  await revokeMinterRole.wait();

  console.log('Revoke UPGRADER role...');

  const revokeUpgraderRole = await plushForest.revokeRole(
    UPGRADER_ROLE,
    await signers[0].getAddress(),
  ); // UPGRADER role

  await revokeUpgraderRole.wait();

  console.log('Revoke PAUSER role...');

  const revokePauserRole = await plushForest.revokeRole(
    PAUSER_ROLE,
    await signers[0].getAddress(),
  ); // PAUSER role

  await revokePauserRole.wait();

  console.log('Revoke ADMIN role...\n');

  const revokeAdminRole = await plushForest.revokeRole(
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

    await run('verify:verify', {
      address: await upgrades.erc1967.getImplementationAddress(
        plushForest.address,
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
