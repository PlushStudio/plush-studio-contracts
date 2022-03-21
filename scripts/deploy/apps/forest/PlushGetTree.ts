import hre from 'hardhat';

import * as args from '../../../../arguments/plushGetTreeArgs';

async function main() {
  const PlushGetTree = await hre.ethers.getContractFactory('PlushGetTree');

  const plushGetTree = await PlushGetTree.deploy(
    args.default[0],
    args.default[1],
    args.default[2],
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
      address: plushGetTree.address,
      contract: 'contracts/apps/forest/PlushGetTree.sol:PlushGetTree',
      constructorArguments: [args.default[0], args.default[1], args.default[2]],
    });
  }
}
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
