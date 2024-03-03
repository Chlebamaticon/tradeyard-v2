import { HardhatUserConfig } from 'hardhat/config';
import '@nomicfoundation/hardhat-toolbox-viem';

import 'tsconfig-paths/register';

const config: HardhatUserConfig = {
  solidity: '0.8.24',
  paths: {
    root: '../../..',
    sources: 'apps/contracts/ecommerce/contracts',
    tests: 'apps/contracts/ecommerce/tests',
    cache: 'dist/apps/contracts/ecommerce/cache',
    artifacts: 'dist/apps/contracts/ecommerce/artifacts',
  },
};

export default config;
