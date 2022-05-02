import { expect } from 'chai';
import { BigNumber, ContractFactory, Signer } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import {
  Plush,
  PlushAccounts,
  PlushApps,
} from '@plushfamily/plush-protocol-contracts';

import { PlushForest, PlushForestController, PlushGetTree } from '../types';

const MINTER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('MINTER_ROLE'),
);
const PAUSER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('PAUSER_ROLE'),
);
const UPGRADER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('UPGRADER_ROLE'),
);
const OPERATOR_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('OPERATOR_ROLE'),
);

const cacaoTree = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('CACAO'));
const caobaTree = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('CAOBA'));
const guabaTree = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('GUABA'));
const shihuahuacoTree = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('SHIHUAHUACO'),
);
const testTree = ethers.utils.keccak256(ethers.utils.toUtf8Bytes('TEST'));

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
      [
        plushForest.address,
        plush.address,
        plushAccounts.address,
        plushForestController.address,
      ],
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
      await plushForest.hasRole(MINTER_ROLE, await signers[0].getAddress()),
    ).to.eql(true);
    expect(
      await plushForest.hasRole(PAUSER_ROLE, await signers[0].getAddress()),
    ).to.eql(true);
    expect(
      await plushForest.hasRole(UPGRADER_ROLE, await signers[0].getAddress()),
    ).to.eql(true);
  });

  it('PlushForest -> Grant MINTER role for PlushGetTree contract', async () => {
    const grantMinterRole = await plushForest.grantRole(
      MINTER_ROLE,
      plushGetTree.address,
    );
    await grantMinterRole.wait();
    expect(await plushForest.hasRole(MINTER_ROLE, plushGetTree.address)).to.eql(
      true,
    );
  });

  it('PlushForest -> Check minting from deployer address', async () => {
    const mintToken = await plushForest.safeMint(await signers[0].getAddress());
    await mintToken.wait();
    expect(await plushForest.balanceOf(await signers[0].getAddress())).to.eql(
      ethers.constants.One,
    );
    expect(await plushForest.totalSupply()).to.eql(ethers.constants.One);
  });

  it('PlushGetTree -> Add trees', async () => {
    const addCacaoTree = await plushGetTree.addTreeType(
      cacaoTree,
      ethers.utils.parseUnits('5', 18),
      500,
    );
    await addCacaoTree.wait();

    const addCaobaTree = await plushGetTree.addTreeType(
      caobaTree,
      ethers.utils.parseUnits('4', 18),
      400,
    );
    await addCaobaTree.wait();

    const addGuabaTree = await plushGetTree.addTreeType(
      guabaTree,
      ethers.utils.parseUnits('3', 18),
      300,
    );
    await addGuabaTree.wait();

    const addShihuahuacoTree = await plushGetTree.addTreeType(
      shihuahuacoTree,
      ethers.utils.parseUnits('2', 18),
      200,
    );
    await addShihuahuacoTree.wait();

    const addTestTree = await plushGetTree.addTreeType(
      testTree,
      ethers.utils.parseUnits('1', 18),
      100,
    );
    await addTestTree.wait();
  });

  it('PlushGetTree -> Remove test tree', async () => {
    const removeTree = await plushGetTree.removeTreeType(testTree);
    await removeTree.wait();

    await expect(plushGetTree.getTreeTypeCount(testTree)).to.be.revertedWith(
      'Not a valid tree type',
    );

    await expect(plushGetTree.getTreeTypePrice(testTree)).to.be.revertedWith(
      'Not a valid tree type',
    );
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
      await plushGetTree.hasRole(OPERATOR_ROLE, await signers[0].getAddress()),
    ).to.eql(true);
    expect(
      await plushGetTree.hasRole(PAUSER_ROLE, await signers[0].getAddress()),
    ).to.eql(true);
    expect(
      await plushGetTree.hasRole(UPGRADER_ROLE, await signers[0].getAddress()),
    ).to.eql(true);
  });

  it('PlushGetTree -> Change tree count', async () => {
    const changeCacaoCount = await plushGetTree.setTreeTypeCount(
      cacaoTree,
      600,
    );
    await changeCacaoCount.wait();

    expect(await plushGetTree.getTreeTypeCount(cacaoTree)).to.eql(
      BigNumber.from(600),
    );
  });

  it('PlushGetTree -> Change tree price', async () => {
    const changeCacaoCount = await plushGetTree.setTreeTypePrice(
      cacaoTree,
      ethers.utils.parseUnits('6', 18),
    );
    await changeCacaoCount.wait();

    expect(await plushGetTree.getTreeTypePrice(cacaoTree)).to.eql(
      ethers.utils.parseUnits('6', 18),
    );
  });

  it('PlushGetTree -> Validate other trees count', async () => {
    expect(await plushGetTree.getTreeTypeCount(caobaTree)).to.eql(
      BigNumber.from(400),
    );
    expect(await plushGetTree.getTreeTypeCount(guabaTree)).to.eql(
      BigNumber.from(300),
    );
    expect(await plushGetTree.getTreeTypeCount(shihuahuacoTree)).to.eql(
      BigNumber.from(200),
    );
  });

  it('PlushGetTree -> Validate other trees price', async () => {
    expect(await plushGetTree.getTreeTypePrice(caobaTree)).to.eql(
      ethers.utils.parseUnits('4', 18),
    );
    expect(await plushGetTree.getTreeTypePrice(guabaTree)).to.eql(
      ethers.utils.parseUnits('3', 18),
    );
    expect(await plushGetTree.getTreeTypePrice(shihuahuacoTree)).to.eql(
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

    expect(
      await plushAccounts.getWalletAmount(await signers[0].getAddress()),
    ).to.eql(ethers.utils.parseUnits('6', 18));

    const buyTree = await plushGetTree.buyTree(
      cacaoTree,
      await signers[1].getAddress(),
    );
    await buyTree.wait();

    expect(await plushGetTree.getTreeTypeCount(cacaoTree)).to.eql(
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
