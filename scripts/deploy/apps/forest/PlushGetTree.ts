import hre, { ethers, upgrades } from 'hardhat';
import { constants } from 'ethers';

const PAUSER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('PAUSER_ROLE'),
);
const OPERATOR_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('OPERATOR_ROLE'),
);
const UPGRADER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('UPGRADER_ROLE'),
);

import { DevContractsAddresses } from '../../../../arguments/development/consts';

async function main() {
  const PlushGetTree = await hre.ethers.getContractFactory('PlushGetTree');

  const plushGetTree = await upgrades.deployProxy(
    PlushGetTree,
    [
      DevContractsAddresses.PLUSH_FOREST_ADDRESS,
      DevContractsAddresses.PLUSH_ACCOUNTS_ADDRESS,
      DevContractsAddresses.PLUSH_FOREST_CONTROLLER_ADDRESS,
    ],
    {
      kind: 'uups',
    },
  );

  await plushGetTree.deployed();
  console.log('PlushGetTree -> deployed to address:', plushGetTree.address);

  console.log('Grant all roles for Plush Studio DAO...\n');

  console.log('Grant ADMIN role...');

  const grantAdminRole = await plushGetTree.grantRole(
    constants.HashZero,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // ADMIN role

  await grantAdminRole.wait();

  console.log('Grant OPERATOR role...');

  const grantOperatorRole = await plushGetTree.grantRole(
    OPERATOR_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // OPERATOR role

  await grantOperatorRole.wait();

  console.log('Grant PAUSER role...');

  const grantPauserRole = await plushGetTree.grantRole(
    PAUSER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // PAUSER role

  await grantPauserRole.wait();

  console.log('Grant UPGRADER role...\n');

  const grantUpgraderRole = await plushGetTree.grantRole(
    UPGRADER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // UPGRADER role

  await grantUpgraderRole.wait();

  console.log('Revoke all roles from existing account...\n');

  const signers = await ethers.getSigners();

  console.log('Revoke OPERATOR role...');

  const revokeOperatorRole = await plushGetTree.revokeRole(
    OPERATOR_ROLE,
    await signers[0].getAddress(),
  ); // OPERATOR role

  await revokeOperatorRole.wait();

  console.log('Revoke UPGRADER role...');

  const revokeUpgraderRole = await plushGetTree.revokeRole(
    UPGRADER_ROLE,
    await signers[0].getAddress(),
  ); // UPGRADER role

  await revokeUpgraderRole.wait();

  console.log('Revoke PAUSER role...');

  const revokePauserRole = await plushGetTree.revokeRole(
    PAUSER_ROLE,
    await signers[0].getAddress(),
  ); // PAUSER role

  await revokePauserRole.wait();

  console.log('Revoke ADMIN role...\n');

  const revokeAdminRole = await plushGetTree.revokeRole(
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
        plushGetTree.address,
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
