import { defender, ethers, upgrades } from 'hardhat';

async function main() {
  const proxyAddress = '0x356881528562ab0F269a5d1982fd21B83fb835B0'; // address with contract proxy
  const multisig = '0xBB8Fe52cAA5F35Ec1475ac2ac6f1A273D67E2a10'; // Gnosis safe address
  const title = 'Upgrade to new version'; // defender update title
  const description = 'Update baseURI link'; // defender update description

  const plushForestNewContract = await ethers.getContractFactory('PlushForest');

  // await upgrades.forceImport(proxyAddress, plushForestNEW); // uncommit if there is no file in the local cache

  console.log('Preparing proposal...');

  const proposal = await defender.proposeUpgrade(
    proxyAddress,
    plushForestNewContract,
    {
      title: title,
      description: description,
      multisig: multisig,
    },
  );
  console.log('PlushForest -> upgrade proposal created at:', proposal.url);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
