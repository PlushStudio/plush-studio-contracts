import 'hardhat-contract-sizer';
import 'dotenv/config';
import '@nomiclabs/hardhat-ethers';
import '@nomiclabs/hardhat-etherscan';
import '@openzeppelin/hardhat-upgrades';
import '@openzeppelin/hardhat-defender';

const {
  NETWORK,
  MUMBAI_API_URL,
  GOERLI_API_URL,
  MAINNET_API_URL,
  POLYGON_API_URL,
  PRIVATE_KEY,
  ETHERSCAN_API_KEY,
  POLYGONSCAN_API_KEY,
  DEFENDER_TEAM_API_KEY,
  DEFENDER_TEAM_API_SECRET_KEY,
} = process.env;

if (
  !NETWORK ||
  !MUMBAI_API_URL ||
  !GOERLI_API_URL ||
  !MAINNET_API_URL ||
  !POLYGON_API_URL ||
  !PRIVATE_KEY ||
  !ETHERSCAN_API_KEY ||
  !POLYGONSCAN_API_KEY ||
  !DEFENDER_TEAM_API_KEY ||
  !DEFENDER_TEAM_API_SECRET_KEY
) {
  throw new Error('Not all variables are specified in the env file!');
}

if (!['local', 'goerli', 'mumbai', 'mainnet', 'polygon'].includes(NETWORK)) {
  throw new Error('Network not supported!');
}

let API_KEY = '';

if (['goerli', 'mainnet'].includes(NETWORK)) {
  API_KEY = ETHERSCAN_API_KEY;
}

if (['mumbai', 'polygon'].includes(NETWORK)) {
  API_KEY = POLYGONSCAN_API_KEY;
}

export default {
  solidity: {
    compilers: [
      {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.8.4',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.8.2',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.6',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.2',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: '0.6.0',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
    overrides: {
      'contracts/apps/forest/token/ERC721/PlushForest.sol': {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      'contracts/apps/forest/PlushForestController.sol': {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      'contracts/apps/forest/PlushGetTree.sol': {
        version: '0.8.9',
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
    contractSizer: {
      alphaSort: true,
      runOnCompile: true,
      disambiguatePaths: false,
    },
  },
  defaultNetwork: NETWORK,
  networks: {
    local: {
      url: 'http://127.0.0.1:7545',
    },
    goerli: {
      url: GOERLI_API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    mumbai: {
      url: MUMBAI_API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    mainnet: {
      url: MAINNET_API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    polygon: {
      url: POLYGON_API_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
  etherscan: {
    apiKey: API_KEY,
  },
  defender: {
    apiKey: DEFENDER_TEAM_API_KEY,
    apiSecret: DEFENDER_TEAM_API_SECRET_KEY,
  },
};
