import { expect } from 'chai';
import { ContractFactory, Signer } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { PlushForest, PlushForestController, PlushGetTree } from '../types';

import {
  Plush,
  PlushAccounts,
  PlushApps,
} from '@plushfamily/plush-protocol-contracts';

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

  it('PlushForest -> Checking grant role for PlushGetTree', async () => {
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

  it('PlushForest -> Check minting from deployer', async () => {
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
});
