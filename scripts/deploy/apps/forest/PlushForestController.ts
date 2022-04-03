import hre, { upgrades } from 'hardhat';

import { DevContractsAddresses } from '../../../../arguments/development/consts';

async function main() {
  const PlushForestController = await hre.ethers.getContractFactory(
    'PlushForestController',
  );

  const plushForestController = await upgrades.deployProxy(
    PlushForestController,
    [
      DevContractsAddresses.PLUSH_COIN_ADDRESS,
      DevContractsAddresses.PLUSH_COIN_WALLETS_ADDRESS,
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
