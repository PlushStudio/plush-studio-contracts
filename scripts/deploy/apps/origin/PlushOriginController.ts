import hre, { upgrades } from 'hardhat';

import { DevContractsAddresses } from '../../../../arguments/development/consts';

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
