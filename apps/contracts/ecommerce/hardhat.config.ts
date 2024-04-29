import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';
import '@nomicfoundation/hardhat-verify';
import { polygonAmoy, sepolia } from 'viem/chains';

import 'tsconfig-paths/register';
import 'dotenv/config';

const config: HardhatUserConfig = {
  solidity: {
    version: '0.8.24',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    root: '../../..',
    sources: 'apps/contracts/ecommerce/contracts',
    tests: 'apps/contracts/ecommerce/tests',
    cache: 'dist/apps/contracts/ecommerce/cache',
    artifacts: 'dist/apps/contracts/ecommerce/artifacts',
  },
  networks: {
    amoy: {
      chainId: polygonAmoy.id,
      gas: 'auto',
      gasPrice: 'auto',
      url: 'https://polygon-amoy.g.alchemy.com/v2/3qRz7cWG_qr34OFx7kyfYz79Htsm2inC',
      accounts: [process.env.POLYGON_PRIVATE_KEY!],
    },
    sepolia: {
      chainId: sepolia.id,
      gas: 'auto',
      gasPrice: 'auto',
      url: 'https://eth-sepolia.g.alchemy.com/v2/6oy61c9A1D8Dm4e_rZ0KAAwf5KOZRCWM',
      accounts: [process.env.POLYGON_PRIVATE_KEY!],
    },
  },
  etherscan: {
    apiKey: {
      amoy: process.env.OKLINK_API_KEY!,
    },
    customChains: [
      {
        network: 'amoy',
        chainId: polygonAmoy.id,
        urls: {
          apiURL:
            'https://www.oklink.com/api/v5/explorer/contract/verify-source-code',
          browserURL: 'https://www.okx.com/explorer/amoy',
        },
      },
    ],
    enabled: true,
  },
  sourcify: {
    enabled: true,
  },
};

export default config;
