import hre, { ethers, upgrades } from 'hardhat';

import { DevContractsAddresses } from '../../../../arguments/development/consts';
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

async function main() {
  const PlushOriginController = await hre.ethers.getContractFactory(
    'PlushOriginController',
  );

  const plushOriginController = await upgrades.deployProxy(
    PlushOriginController,
    [
      DevContractsAddresses.PLUSH_COIN_ADDRESS,
      DevContractsAddresses.PLUSH_ACCOUNTS_ADDRESS,
    ],
    {
      kind: 'uups',
    },
  );

  await plushOriginController.deployed();

  console.log(
    'PlushForestController -> deployed to address:',
    plushOriginController.address,
  );

  console.log('Grant all roles for Plush Studio DAO...\n');

  console.log('Grant ADMIN role...');

  const grantAdminRole = await plushOriginController.grantRole(
    constants.HashZero,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // ADMIN role

  await grantAdminRole.wait();

  console.log('Grant OPERATOR role...');

  const grantOperatorRole = await plushOriginController.grantRole(
    OPERATOR_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // OPERATOR role

  await grantOperatorRole.wait();

  console.log('Grant BANKER role...');

  const grantBankerRole = await plushOriginController.grantRole(
    BANKER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // BANKER role

  await grantBankerRole.wait();

  console.log('Grant PAUSER role...');

  const grantPauserRole = await plushOriginController.grantRole(
    PAUSER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // PAUSER role

  await grantPauserRole.wait();

  console.log('Grant UPGRADER role...\n');

  const grantUpgraderRole = await plushOriginController.grantRole(
    UPGRADER_ROLE,
    DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS,
  ); // UPGRADER role

  await grantUpgraderRole.wait();

  console.log('Revoke all roles from existing account...\n');

  const signers = await ethers.getSigners();

  console.log('Revoke OPERATOR role...');

  const revokeOperatorRole = await plushOriginController.revokeRole(
    OPERATOR_ROLE,
    await signers[0].getAddress(),
  ); // OPERATOR role

  await revokeOperatorRole.wait();

  console.log('Revoke BANKER role...');

  const revokeBankerRole = await plushOriginController.revokeRole(
    BANKER_ROLE,
    await signers[0].getAddress(),
  ); // BANKER role

  await revokeBankerRole.wait();

  console.log('Revoke UPGRADER role...');

  const revokeUpgraderRole = await plushOriginController.revokeRole(
    UPGRADER_ROLE,
    await signers[0].getAddress(),
  ); // UPGRADER role

  await revokeUpgraderRole.wait();

  console.log('Revoke PAUSER role...');

  const revokePauserRole = await plushOriginController.revokeRole(
    PAUSER_ROLE,
    await signers[0].getAddress(),
  ); // PAUSER role

  await revokePauserRole.wait();

  console.log('Revoke ADMIN role...\n');

  const revokeAdminRole = await plushOriginController.revokeRole(
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
        'contracts/apps/origin/PlushOriginController.sol:PlushOriginController',
      address: await upgrades.erc1967.getImplementationAddress(
        plushOriginController.address,
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
