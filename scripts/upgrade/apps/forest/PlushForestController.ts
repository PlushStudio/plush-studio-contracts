import { defender, ethers, upgrades } from 'hardhat';

import { DevContractsAddresses } from '../../../../arguments/development/consts';

async function main() {
  const proxyAddress = DevContractsAddresses.PLUSH_FOREST_CONTROLLER_ADDRESS; // address with contract proxy
  const multisig = DevContractsAddresses.PLUSH_STUDIO_DAO_ADDRESS; // Gnosis safe address
  const title = 'Upgrade to new version'; // defender update title
  const description = 'Update baseURI link'; // defender update description

  const plushForestControllerNewContract = await ethers.getContractFactory(
    'PlushForestController',
  );

  await upgrades.forceImport(proxyAddress, plushForestControllerNewContract);

  console.log('Preparing proposal...');

  const proposal = await defender.proposeUpgrade(
    proxyAddress,
    plushForestControllerNewContract,
    {
      title: title,
      description: description,
      multisig: multisig,
    },
  );
  console.log(
    'PlushForestController -> upgrade proposal created at:',
    proposal.url,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
