import { expect } from 'chai';
import { ContractFactory, Signer } from 'ethers';
import { ethers, upgrades } from 'hardhat';
import { PlushForest, PlushForestController, PlushGetTree } from '../types';

import {
  LifeSpan,
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

  let LifeSpanFactory: ContractFactory;
  let lifeSpan: LifeSpan;

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

  it('[Deploy contract] Plush Protocol – LifeSpan', async () => {
    LifeSpanFactory = await ethers.getContractFactory('LifeSpan');
    lifeSpan = (await upgrades.deployProxy(LifeSpanFactory, {
      kind: 'uups',
    })) as LifeSpan;
    await lifeSpan.deployed();
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
});
