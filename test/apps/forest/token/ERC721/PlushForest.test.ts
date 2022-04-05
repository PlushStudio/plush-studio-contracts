import { expect } from 'chai';
import { constants, Contract } from 'ethers';
import { ethers, upgrades } from 'hardhat';

import { PlushForest } from '../../../../../typechain-types';

describe('PlushForest', () => {
  let plushForest: Contract;

  beforeEach(async () => {
    const PlushForestFactory = await ethers.getContractFactory('PlushForest');
    plushForest = (await upgrades.deployProxy(PlushForestFactory, {
      kind: 'uups',
    })) as PlushForest;
  });

  it('Check initial balance', async () => {
    expect(await plushForest.totalSupply()).to.eql(constants.Zero);
  });
});
