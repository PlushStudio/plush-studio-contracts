import hre, { ethers, upgrades } from 'hardhat';
import { constants } from 'ethers';

const PAUSER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('PAUSER_ROLE'),
);
const OPERATOR_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('OPERATOR_ROLE'),
);
const BANKER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('BANKER_ROLE'),
);
const UPGRADER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('UPGRADER_ROLE'),
);

import { DevContractsAddresses } from '../../../../arguments/development/consts';

async function main() {
  const PlushForestController = await hre.ethers.getContractFactory(
    'PlushForestController',
  );

  const plushForestController = await upgrades.deployProxy(
    PlushForestController,
    [
      DevContractsAddresses.PLUSH_COIN_ADDRESS,
      DevContractsAddresses.PLUSH_ACCOUNTS_ADDRESS,
    ],
    {
      kind: 'uups',
    },
  );

  await plushForestController.deployed();

  console.log(
    'PlushForestController -> deployed to address:',
    plushForestController.address,
  );

  console.log('Grant all roles for Plush Studio DAO...\n');

  console.log('Grant ADMIN role...');

  const grantAdminRole = await plushForestController.grantRole(
    constants.HashZero,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // ADMIN role

  await grantAdminRole.wait();

  console.log('Grant OPERATOR role...');

  const grantOperatorRole = await plushForestController.grantRole(
    OPERATOR_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // OPERATOR role

  await grantOperatorRole.wait();

  console.log('Grant BANKER role...');

  const grantBankerRole = await plushForestController.grantRole(
    BANKER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // BANKER role

  await grantBankerRole.wait();

  console.log('Grant PAUSER role...');

  const grantPauserRole = await plushForestController.grantRole(
    PAUSER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // PAUSER role

  await grantPauserRole.wait();

  console.log('Grant UPGRADER role...\n');

  const grantUpgraderRole = await plushForestController.grantRole(
    UPGRADER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // UPGRADER role

  await grantUpgraderRole.wait();

  console.log('Revoke all roles from existing account...\n');

  const signers = await ethers.getSigners();

  console.log('Revoke OPERATOR role...');

  const revokeOperatorRole = await plushForestController.revokeRole(
    OPERATOR_ROLE,
    await signers[0].getAddress(),
  ); // OPERATOR role

  await revokeOperatorRole.wait();

  console.log('Revoke BANKER role...');

  const revokeBankerRole = await plushForestController.revokeRole(
    BANKER_ROLE,
    await signers[0].getAddress(),
  ); // BANKER role

  await revokeBankerRole.wait();

  console.log('Revoke UPGRADER role...');

  const revokeUpgraderRole = await plushForestController.revokeRole(
    UPGRADER_ROLE,
    await signers[0].getAddress(),
  ); // UPGRADER role

  await revokeUpgraderRole.wait();

  console.log('Revoke PAUSER role...');

  const revokePauserRole = await plushForestController.revokeRole(
    PAUSER_ROLE,
    await signers[0].getAddress(),
  ); // PAUSER role

  await revokePauserRole.wait();

  console.log('Revoke ADMIN role...\n');

  const revokeAdminRole = await plushForestController.revokeRole(
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
      contract:
        'contracts/apps/forest/PlushForestController.sol:PlushForestController',
      address: await upgrades.erc1967.getImplementationAddress(
        plushForestController.address,
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
