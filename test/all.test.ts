import { expect } from 'chai';
import { BigNumber, ContractFactory, Signer } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import {
  Plush,
  PlushAccounts,
  PlushApps,
} from '@plushfamily/plush-protocol-contracts';

import {
  LifeSpan,
  PlushForest,
  PlushForestController,
  PlushGetTree,
  PlushOrigin,
  PlushOriginController,
} from '../types';

const MINTER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('MINTER_ROLE'),
);
const BANKER_ROLE = ethers.utils.keccak256(
  ethers.utils.toUtf8Bytes('BANKER_ROLE'),
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

const cacaoTree = ethers.utils.formatBytes32String('CACAO');
const caobaTree = ethers.utils.formatBytes32String('CAOBA');
const guabaTree = ethers.utils.formatBytes32String('GUABA');
const shihuahuacoTree = ethers.utils.formatBytes32String('SHIHUAHUACO');
const testTree = ethers.utils.formatBytes32String('TEST');

describe('Launching the testing of the Plush Studio contracts', () => {
  let signers: Signer[];

  async function addSigners() {
    [...signers] = await ethers.getSigners();
  }

  addSigners();

  let PlushFactory: ContractFactory;
  let plush: Plush;

  let LifeSpanFactory: ContractFactory;
  let lifespan: LifeSpan;

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

  let PlushOriginControllerFactory: ContractFactory;
  let plushOriginController: PlushOriginController;

  let PlushOriginFactory: ContractFactory;
  let plushOrigin: PlushOrigin;

  it('[Deploy contract] Plush Protocol – Plush', async () => {
    PlushFactory = await ethers.getContractFactory('Plush');
    plush = (await PlushFactory.deploy()) as Plush;
    await plush.deployed();
  });

  it('[Deploy contract] Plush Protocol – LifeSpan', async () => {
    LifeSpanFactory = await ethers.getContractFactory('LifeSpan');
    lifespan = (await upgrades.deployProxy(
      LifeSpanFactory,
      [
        'https://home.plush.dev/token/',
        'https://api.plush.dev/user/tokens/render',
      ],
      {
        kind: 'uups',
      },
    )) as LifeSpan;
    await lifespan.deployed();
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
        plushAccounts.address,
        plushForestController.address,
      ],
      {
        kind: 'uups',
      },
    )) as PlushGetTree;
    await plushGetTree.deployed();
  });

  it('[Deploy contract] PlushOriginController', async () => {
    PlushOriginControllerFactory = await ethers.getContractFactory(
      'PlushOriginController',
    );
    plushOriginController = (await upgrades.deployProxy(
      PlushOriginControllerFactory,
      [plush.address, plushAccounts.address],
      {
        kind: 'uups',
      },
    )) as PlushOriginController;
    await plushOriginController.deployed();
  });

  it('[Deploy contract] PlushOrigin', async () => {
    PlushOriginFactory = await ethers.getContractFactory('PlushOrigin');
    plushOrigin = (await upgrades.deployProxy(
      PlushOriginFactory,
      [lifespan.address],
      {
        kind: 'uups',
      },
    )) as PlushOrigin;
    await plushOrigin.deployed();
  });

  it('[LifeSpan] -> Add genders', async () => {
    const male = await lifespan.addGender(0, 'MALE'); // MALE gender
    await male.wait();

    const female = await lifespan.addGender(1, 'FEMALE'); // FEMALE gender
    await female.wait();
  });

  it('[Plush Protocol] Connect PlushForest controller to ecosystem', async () => {
    const connectApp = await plushApps.addNewApp(
      ethers.utils.formatBytes32String('forest'),
      plushForestController.address,
      '100',
    );
    await connectApp.wait();

    expect(await plushApps.getFeeApp(plushForestController.address)).to.eql(
      BigNumber.from(100),
    );
  });

  it('[Plush Protocol] Connect PlushOrigin controller to ecosystem', async () => {
    const connectApp = await plushApps.addNewApp(
      ethers.utils.formatBytes32String('origin'),
      plushOriginController.address,
      '100',
    );
    await connectApp.wait();

    expect(await plushApps.getFeeApp(plushOriginController.address)).to.eql(
      BigNumber.from(100),
    );
  });

  it('plushForestController -> Add PlushGetTree', async () => {
    const addNewApp = await plushForestController.addNewAppAddress(
      plushGetTree.address,
    );
    await addNewApp.wait();
  });

  it('plushOriginController -> Add PlushOrigin', async () => {
    const addNewApp = await plushOriginController.addNewAppAddress(
      plushOrigin.address,
    );
    await addNewApp.wait();
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

    await expect(plushGetTree.getTreeTypeCount(testTree)).to.be.reverted;

    await expect(plushGetTree.getTreeTypePrice(testTree)).to.be.reverted;
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
      await plushAccounts.getAccountBalance(await signers[0].getAddress()),
    ).to.eql(ethers.utils.parseUnits('6', 18));

    const mintTree = await plushGetTree.mint(
      cacaoTree,
      await signers[1].getAddress(),
    );
    await mintTree.wait();

    expect(await plushGetTree.getTreeTypeCount(cacaoTree)).to.deep.equal(
      BigNumber.from(599),
    );

    expect(await plushForest.balanceOf(await signers[1].getAddress())).to.eql(
      ethers.constants.One,
    );
    expect(await plushForest.totalSupply()).to.eql(ethers.constants.Two);
  });

  it('PlushGetTree -> Checking that the meeting fees were distributed correctly', async () => {
    expect(
      await plushAccounts.getAccountBalance(plushForestController.address),
    ).to.eql(BigNumber.from('5994000000000000000')); // 99 percent of the cost was transferred to the owner of the application
    expect(
      await plushAccounts.getAccountBalance(
        plushAccountsRandomSafeAddress.address,
      ),
    ).to.eql(BigNumber.from('6000000000000000')); // 1 percent of the cost was transferred to the ecosystem
  });

  it('PlushForestController -> Test withdrawal for the app owner', async () => {
    const addWithdrawAddress = await plushForestController.grantRole(
      BANKER_ROLE,
      await signers[1].getAddress(),
    );
    await addWithdrawAddress.wait();

    const withdraw = await plushForestController
      .connect(signers[1])
      .withdraw(BigNumber.from('1000000000000000'));
    await withdraw.wait();

    expect(
      await plushAccounts.getAccountBalance(plushForestController.address),
    ).to.eql(BigNumber.from('5993000000000000000'));

    expect(await plush.balanceOf(await signers[1].getAddress())).to.eql(
      BigNumber.from('1000000000000000'),
    );
  });

  it('PlushOrigin -> Checking role assignments', async () => {
    expect(
      await plushOrigin.hasRole(
        ethers.constants.HashZero,
        await signers[0].getAddress(),
      ),
    ).to.eql(true); // ADMIN role
    expect(
      await plushOrigin.hasRole(OPERATOR_ROLE, await signers[0].getAddress()),
    ).to.eql(true);
    expect(
      await plushOrigin.hasRole(PAUSER_ROLE, await signers[0].getAddress()),
    ).to.eql(true);
    expect(
      await plushOrigin.hasRole(UPGRADER_ROLE, await signers[0].getAddress()),
    ).to.eql(true);
  });

  it('Plush Origin -> Add basic connection types', async () => {
    const addConnectionType1 = await plushOrigin.addConnectionType(0, 2);
    await addConnectionType1.wait();

    const addConnectionType2 = await plushOrigin.addConnectionType(1, 1);
    await addConnectionType2.wait();

    const addConnectionType3 = await plushOrigin.addConnectionType(2, 0);
    await addConnectionType3.wait();

    const addConnectionType4 = await plushOrigin.addConnectionType(3, 3);
    await addConnectionType4.wait();
  });

  it('LifeSpan -> Mint test tokens for test Plush Origin connection', async () => {
    const mintFirstToken = await lifespan.safeMint(
      await signers[0].getAddress(),
      'Tester',
      0,
      918606632,
    );
    await mintFirstToken.wait();

    const mintSecondToken = await lifespan.safeMint(
      await signers[0].getAddress(),
      'Testik',
      1,
      918406632,
    );
    await mintSecondToken.wait();

    const mintThirdToken = await lifespan.safeMint(
      await signers[1].getAddress(),
      'Testik',
      0,
      918306632,
    );
    await mintThirdToken.wait();
  });

  it('Plush Origin -> Add test connection', async () => {
    const firstConnection = await plushOrigin.addConnection(
      0,
      1,
      0,
      Math.floor(new Date().getTime() / 1000),
      Math.floor(+new Date() / 1000) + 14 * 24 * 60 * 60,
    );
    await firstConnection.wait();

    const getFirstConnectionData = await plushOrigin.getConnectionById(0);

    expect(getFirstConnectionData.lifespanParentId).to.eql(BigNumber.from(0));
    expect(getFirstConnectionData.lifespanChildId).to.eql(BigNumber.from(1));
    expect(getFirstConnectionData.typeConnectionId).to.eql(BigNumber.from(0));
    expect(getFirstConnectionData.isActive).to.eql(true); // check auto-connect if user have two tokens

    const secondConnection = await plushOrigin.addConnection(
      0,
      2,
      0,
      Math.floor(new Date().getTime() / 1000),
      Math.floor(+new Date() / 1000) + 14 * 24 * 60 * 60,
    );
    await secondConnection.wait();

    const getSecondConnectionData = await plushOrigin.getConnectionById(1);

    expect(getSecondConnectionData.lifespanParentId).to.eql(BigNumber.from(1));
    expect(getSecondConnectionData.lifespanChildId).to.eql(BigNumber.from(0));
    expect(getSecondConnectionData.typeConnectionId).to.eql(BigNumber.from(2));
    expect(getSecondConnectionData.isActive).to.eql(true);
  });

  it('Plush Origin -> Check unapproved connection', async () => {
    const getConnectionData = await plushOrigin.getConnectionById(3);

    expect(getConnectionData.lifespanParentId).to.eql(BigNumber.from(2));
    expect(getConnectionData.lifespanChildId).to.eql(BigNumber.from(0));
    expect(getConnectionData.typeConnectionId).to.eql(BigNumber.from(2));
    expect(getConnectionData.isActive).to.eql(false);
  });

  it('Plush Origin -> Approve connection', async () => {
    const approveConnection = await plushOrigin
      .connect(signers[1])
      .approveConnection(2, 0);
    await approveConnection.wait();

    const getConnectionData = await plushOrigin.getConnectionById(3);
    expect(getConnectionData.isActive).to.eql(true);
  });
});
