import { expect } from 'chai';
import { constants, ContractFactory } from 'ethers';
import { ethers, upgrades } from 'hardhat';

import { PlushForest } from '../../../../../typechain-types';

describe('PlushForest', () => {
  let PlushForestFactory: ContractFactory;
  let signer: { address: any }[];
  let plushForest: PlushForest;

  it('Deploy contract', async () => {
    PlushForestFactory = await ethers.getContractFactory('PlushForest');
    signer = await ethers.getSigners();
    plushForest = (await upgrades.deployProxy(PlushForestFactory, {
      kind: 'uups',
    })) as PlushForest;
    await plushForest.deployed();
  });

  it('Checking role assignments', async () => {
    expect(
      await plushForest.hasRole(constants.HashZero, signer[0].address),
    ).to.eql(true);
    expect(
      await plushForest.hasRole(
        '0x9f2df0fed2c77648de5860a4cc508cd0818c85b8b8a1ab4ceeef8d981c8956a6',
        signer[0].address,
      ),
    ).to.eql(true);
    expect(
      await plushForest.hasRole(
        '0x65d7a28e3265b37a6474929f336521b332c1681b933f6cb9f3376673440d862a',
        signer[0].address,
      ),
    ).to.eql(true);
    expect(
      await plushForest.hasRole(
        '0x189ab7a9244df0848122154315af71fe140f3db0fe014031783b0946b8c9d2e3',
        signer[0].address,
      ),
    ).to.eql(true);
  });

  it('Check initial balance', async () => {
    expect(await plushForest.totalSupply()).to.eql(constants.Zero);
  });

  it('Check minting', async () => {
    const mintToken = await plushForest.safeMint(signer[0].address);
    await mintToken.wait();
    expect(await plushForest.balanceOf(signer[0].address)).to.equal(
      constants.One,
    );
  });

  it('Check burning', async () => {
    const burnToken = await plushForest.burn(constants.Zero);
    await burnToken.wait();
    expect(await plushForest.balanceOf(signer[0].address)).to.equal(
      constants.Zero,
    );
  });

  it('Check pause', async () => {
    const pauseContract = await plushForest.pause();
    await pauseContract.wait();
    expect(await plushForest.paused()).to.eql(true);
    const onpauseContract = await plushForest.unpause();
    await onpauseContract.wait();
  });

  it('Check upgrade', async () => {
    const plushForestNEW = (await upgrades.upgradeProxy(
      plushForest.address,
      PlushForestFactory,
      { kind: 'uups' },
    )) as PlushForest;
    await plushForestNEW.deployed();
    expect(plushForestNEW.address).to.eq(plushForest.address);
  });
});
