import { defender, ethers, upgrades } from 'hardhat';

import { DevContractsAddresses } from '../../../../../../arguments/development/consts';

async function main() {
  const proxyAddress = DevContractsAddresses.PLUSH_FOREST_ADDRESS; // address with contract proxy
  const multisig = DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS; // Gnosis safe address
  const title = 'Upgrade to new version'; // defender update title
  const description = 'Update baseURI link'; // defender update description

  const plushForestNewContract = await ethers.getContractFactory('PlushForest');

  await upgrades.forceImport(proxyAddress, plushForestNewContract);

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
