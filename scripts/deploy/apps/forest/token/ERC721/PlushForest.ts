import { ethers, upgrades, run } from 'hardhat';

async function main() {
  const PlushForest = await ethers.getContractFactory('PlushForest');
  const plushForest = await upgrades.deployProxy(PlushForest, {
    kind: 'uups',
  });

  await plushForest.deployed();
  console.log('PlushForest -> deployed to address:', plushForest.address);

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
