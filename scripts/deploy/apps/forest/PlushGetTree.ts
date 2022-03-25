import hre, { upgrades } from 'hardhat';

import * as args from '../../../../arguments/plushGetTreeArgs';

async function main() {
  const PlushGetTree = await hre.ethers.getContractFactory('PlushGetTree');

  const plushGetTree = await upgrades.deployProxy(
    PlushGetTree,
    [args.default[0], args.default[1], args.default[2]],
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
