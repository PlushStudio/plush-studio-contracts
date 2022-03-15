# Plush Studio contracts

This repository contains the source code for Ethereum contracts.

## Project structure

`arguments` directory with source code of arguments for deploying contracts

`contracts` directory with source code of contracts

`scripts/deploy` directory with scripts for deploying contracts

`hardhat.config.ts` hardhat configuration

## Installation

First you need to make sure that the Node.js platform is installed.

Link to download: [download Node.js](https://nodejs.org/en/)

Next, you need to install the yarn package manager: `npm install --global yarn`

Before starting the project, you need to install all project dependencies: `yarn install`


## Configuration

Create `.env` from example file.

Support networks:
1. Goerli (`goerli`)
2. Mumbai (`mumbai`)
3. Mainnet ETH (`mainnet`)
4. Polygon mainnet (`polygon`)
5. Local (`local`) # for Ganache

## Using

1. Get api keys on [Etherscan](https://docs.etherscan.io/getting-started/viewing-api-usage-statistics) and [Polygonscan](https://polygonscan.com/myapikey) websites
2. It is necessary to set a working network in `.env` file in the variable `NETWORK`
3. Change the values in the contract call arguments
4. To deploy contract use: `npx hardhat run scripts/deploy/{ScriptName}`