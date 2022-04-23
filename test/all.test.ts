import { expect } from 'chai';
import { BigNumber, ContractFactory, Signer } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import {
  Plush,
  PlushAccounts,
  PlushApps,
} from '@plushfamily/plush-protocol-contracts';

import { PlushForest, PlushForestController, PlushGetTree } from '../types';

describe('Launching the testing of the Plush Studio contracts', () => {
  let signers: Signer[];

  async function addSigners() {
    [...signers] = await ethers.getSigners();
  }

  addSigners();

  let PlushFactory: ContractFactory;
  let plush: Plush;

  let PlushAppsFactory: ContractFactory;
  let plushApps: PlushApps;

  let PlushAccountsFactory: ContractFactory;
  let plushAccounts: PlushAccounts;
  const plushAccountsRandomSafeAddress = ethers.Wallet.createRandom();

  let PlushForestFactory: ContractFactory;
  let plushForest: PlushForest;

  let PlushForestControllerFactory: ContractFactory;
  let plushForestController: PlushForestController;

  let PlushGetTreeFactory: ContractFactory;
  let plushGetTree: PlushGetTree;

  it('[Deploy contract] Plush Protocol – Plush', async () => {
    PlushFactory = await ethers.getContractFactory('Plush');
    plush = (await PlushFactory.deploy()) as Plush;
    await plush.deployed();
  });

  it('[Deploy contract] Plush Protocol – PlushApps', async () => {
    PlushAppsFactory = await ethers.getContractFactory('PlushApps');
    plushApps = (await upgrades.deployProxy(PlushAppsFactory, {
      kind: 'uups',
    })) as PlushApps;
    await plushApps.deployed();
  });

  it('[Deploy contract] Plush Protocol – PlushAccounts', async () => {
    PlushAccountsFactory = await ethers.getContractFactory('PlushAccounts');
    plushAccounts = (await upgrades.deployProxy(
      PlushAccountsFactory,
      [
        plush.address,
        plushApps.address,
        plushAccountsRandomSafeAddress.address,
      ],
      {
        kind: 'uups',
      },
    )) as PlushAccounts;
    await plushAccounts.deployed();
  });

  it('[Deploy contract] PlushForest', async () => {
    PlushForestFactory = await ethers.getContractFactory('PlushForest');
    plushForest = (await upgrades.deployProxy(PlushForestFactory, {
      kind: 'uups',
    })) as PlushForest;
    await plushForest.deployed();
  });

  it('[Deploy contract] PlushForestController', async () => {
    PlushForestControllerFactory = await ethers.getContractFactory(
      'PlushForestController',
    );
    plushForestController = (await upgrades.deployProxy(
      PlushForestControllerFactory,
      [plush.address, plushAccounts.address],
      {
        kind: 'uups',
      },
    )) as PlushForestController;
    await plushForestController.deployed();
  });

  it('[Deploy contract] PlushGetTree', async () => {
    PlushGetTreeFactory = await ethers.getContractFactory('PlushGetTree');
    plushGetTree = (await upgrades.deployProxy(
      PlushGetTreeFactory,
      [plushForest.address, plush.address, plushForestController.address],
      {
        kind: 'uups',
      },
    )) as PlushGetTree;
    await plushGetTree.deployed();
  });

  it('[Plush Protocol] Connect PlushForest controller to ecosystem', async () => {
    const connectApp = await plushApps.addNewApp(
      'forest',
      plushForestController.address,
      '100',
    );
    await connectApp.wait();
    expect(await plushApps.getFeeApp(plushForestController.address)).to.eql(
      BigNumber.from(100),
    );
  });

  it('PlushForest -> Check total supply', async () => {
    expect(await plushForest.totalSupply()).to.eql(ethers.constants.Zero);
  });

  it('PlushForest -> Checking role assignments', async () => {
    expect(
      await plushForest.hasRole(
        ethers.constants.HashZero,
        await signers[0].getAddress(),
      ),
    ).to.eql(true); // ADMIN role
    expect(
      await plushForest.hasRole(
        '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6',
        await signers[0].getAddress(),
      ),
    ).to.eql(true); // MINTER role
    expect(
      await plushForest.hasRole(
        '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a',
        await signers[0].getAddress(), // PAUSER role
      ),
    ).to.eql(true);
    expect(
      await plushForest.hasRole(
        '0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3',
        await signers[0].getAddress(), // UPGRADER role
      ),
    ).to.eql(true);
  });

  it('PlushForest -> Grant MINTER role for PlushGetTree contract', async () => {
    const grantMinterRole = await plushForest.grantRole(
      '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', // MINTER role
      plushGetTree.address,
    );
    await grantMinterRole.wait();
    expect(
      await plushForest.hasRole(
        '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6', // MINTER role
        plushGetTree.address,
      ),
    ).to.eql(true);
  });

  it('PlushForest -> Check minting from deployer address', async () => {
    const mintToken = await plushForest.safeMint(await signers[0].getAddress());
    await mintToken.wait();
    expect(await plushForest.balanceOf(await signers[0].getAddress())).to.eql(
      ethers.constants.One,
    );
    expect(await plushForest.totalSupply()).to.eql(ethers.constants.One);
  });

  it('PlushForest -> Check pause contract', async () => {
    const pauseContract = await plushForest.pause();
    await pauseContract.wait();
    expect(await plushForest.paused()).to.eql(true);
    const onpauseContract = await plushForest.unpause();
    await onpauseContract.wait();
  });

  it('PlushForest -> Check upgrade contract', async () => {
    const plushForestNEW = (await upgrades.upgradeProxy(
      plushForest.address,
      PlushForestFactory,
      { kind: 'uups' },
    )) as PlushForest;
    await plushForestNEW.deployed();
    expect(plushForestNEW.address).to.eq(plushForest.address);
    expect(await plushForest.totalSupply()).to.eql(ethers.constants.One);
  });

  it('PlushGetTree -> Checking role assignments', async () => {
    expect(
      await plushGetTree.hasRole(
        ethers.constants.HashZero,
        await signers[0].getAddress(),
      ),
    ).to.eql(true); // ADMIN role
    expect(
      await plushGetTree.hasRole(
        '0x97667070c54ef182b0f5858b034beac1b6f3089aa2d3188bb1e8929f4fa9b929',
        await signers[0].getAddress(),
      ),
    ).to.eql(true); // OPERATOR role
    expect(
      await plushGetTree.hasRole(
        '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a',
        await signers[0].getAddress(), // PAUSER role
      ),
    ).to.eql(true);
    expect(
      await plushGetTree.hasRole(
        '0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3',
        await signers[0].getAddress(), // UPGRADER role
      ),
    ).to.eql(true);
  });

  it('PlushGetTree -> Add trees', async () => {
    const addCacaoTree = await plushGetTree.addTreeType(
      'CACAO',
      ethers.utils.parseUnits('5', 18),
      500,
    );
    await addCacaoTree.wait();

    const addCaobaTree = await plushGetTree.addTreeType(
      'CAOBA',
      ethers.utils.parseUnits('4', 18),
      400,
    );
    await addCaobaTree.wait();

    const addGuabaTree = await plushGetTree.addTreeType(
      'GUABA',
      ethers.utils.parseUnits('3', 18),
      300,
    );
    await addGuabaTree.wait();

    const addShihuahuacoTree = await plushGetTree.addTreeType(
      'SHIHUAHUACO',
      ethers.utils.parseUnits('2', 18),
      200,
    );
    await addShihuahuacoTree.wait();

    const addTestTree = await plushGetTree.addTreeType(
      'TEST',
      ethers.utils.parseUnits('1', 18),
      100,
    );
    await addTestTree.wait();
  });

  it('PlushGetTree -> Remove test tree', async () => {
    const removeTree = await plushGetTree.removeTreeType('TEST');
    await removeTree.wait();

    await expect(plushGetTree.getTreeTypeCount('TEST')).to.be.revertedWith(
      'Not a valid tree type.',
    );

    await expect(plushGetTree.getTreeTypePrice('TEST')).to.be.revertedWith(
      'Not a valid tree type.',
    );
  });

  it('PlushGetTree -> Change tree count', async () => {
    const changeCacaoCount = await plushGetTree.setTreeTypeCount('CACAO', 600);
    await changeCacaoCount.wait();

    expect(await plushGetTree.getTreeTypeCount('CACAO')).to.eql(
      BigNumber.from(600),
    );
  });

  it('PlushGetTree -> Change tree price', async () => {
    const changeCacaoCount = await plushGetTree.setTreeTypePrice(
      'CACAO',
      ethers.utils.parseUnits('6', 18),
    );
    await changeCacaoCount.wait();

    expect(await plushGetTree.getTreeTypePrice('CACAO')).to.eql(
      ethers.utils.parseUnits('6', 18),
    );
  });

  it('PlushGetTree -> Validate other trees count', async () => {
    expect(await plushGetTree.getTreeTypeCount('CAOBA')).to.eql(
      BigNumber.from(400),
    );
    expect(await plushGetTree.getTreeTypeCount('GUABA')).to.eql(
      BigNumber.from(300),
    );
    expect(await plushGetTree.getTreeTypeCount('SHIHUAHUACO')).to.eql(
      BigNumber.from(200),
    );
  });

  it('PlushGetTree -> Validate other trees price', async () => {
    expect(await plushGetTree.getTreeTypePrice('CAOBA')).to.eql(
      ethers.utils.parseUnits('4', 18),
    );
    expect(await plushGetTree.getTreeTypePrice('GUABA')).to.eql(
      ethers.utils.parseUnits('3', 18),
    );
    expect(await plushGetTree.getTreeTypePrice('SHIHUAHUACO')).to.eql(
      ethers.utils.parseUnits('2', 18),
    );
  });

  it('PlushGetTree -> Test minting', async () => {
    const setTokenApprove = await plush.approve(
      plushAccounts.address,
      ethers.utils.parseUnits('6', 18),
    );
    await setTokenApprove.wait();

    const depositToSafe = await plushAccounts.deposit(
      await signers[0].getAddress(),
      ethers.utils.parseUnits('6', 18),
    );
    await depositToSafe.wait();

    const buyTree = await plushGetTree.mint(
      await signers[1].getAddress(),
      ethers.utils.parseUnits('6', 18),
      'CACAO',
    );
    await buyTree.wait();

    expect(await plushGetTree.getTreeTypeCount('CACAO')).to.eql(
      BigNumber.from(599),
    );

    expect(await plushForest.balanceOf(await signers[1].getAddress())).to.eql(
      ethers.constants.One,
    );
    expect(await plushForest.totalSupply()).to.eql(ethers.constants.Two);
  });

  it('PlushGetTree -> Checking that the meeting fees were distributed correctly', async () => {
    expect(
      await plushAccounts.getWalletAmount(plushForestController.address),
    ).to.eql(BigNumber.from('5994000000000000000')); // 99 percent of the cost was transferred to the owner of the application
    expect(
      await plushAccounts.getWalletAmount(
        plushAccountsRandomSafeAddress.address,
      ),
    ).to.eql(BigNumber.from('6000000000000000')); // 1 percent of the cost was transferred to the ecosystem
  });

  it('PlushForestController -> Test withdrawal for the app owner', async () => {
    const addWithdrawAddress =
      await plushForestController.addNewWithdrawalAddress(
        await signers[1].getAddress(),
      );
    await addWithdrawAddress.wait();

    const withdraw = await plushForestController
      .connect(signers[1])
      .withdraw(BigNumber.from('1000000000000000'));
    await withdraw.wait();

    expect(
      await plushAccounts.getWalletAmount(plushForestController.address),
    ).to.eql(BigNumber.from('5993000000000000000'));

    expect(await plush.balanceOf(await signers[1].getAddress())).to.eql(
      BigNumber.from('1000000000000000'),
    );
  });
});
