import hre, { upgrades } from 'hardhat';

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
