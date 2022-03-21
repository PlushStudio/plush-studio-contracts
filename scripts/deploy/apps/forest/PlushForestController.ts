import hre from 'hardhat';

import * as args from '../../../../arguments/plushForestController';

async function main() {
  const PlushForestController = await hre.ethers.getContractFactory(
    'PlushForestController',
  );

  const plushForestController = await PlushForestController.deploy(
    args.default[0],
    args.default[1],
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
      address: plushForestController.address,
      contract:
        'contracts/apps/forest/PlushForestController.sol:PlushForestController',
      constructorArguments: [args.default[0], args.default[1]],
    });
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
