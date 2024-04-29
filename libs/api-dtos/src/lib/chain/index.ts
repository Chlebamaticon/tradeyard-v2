import { http, webSocket } from 'viem';
import { polygonAmoy, sepolia } from 'viem/chains';

export const currentChain = sepolia;

export const transports = {
  [sepolia.id]: {
    https: http(
      'https://eth-sepolia.g.alchemy.com/v2/6oy61c9A1D8Dm4e_rZ0KAAwf5KOZRCWM',
      { key: 'alchemy' }
    ),
    wss: webSocket(
      'wss://eth-sepolia.g.alchemy.com/v2/6oy61c9A1D8Dm4e_rZ0KAAwf5KOZRCWM',
      { key: 'alchemy' }
    ),
  },
  [polygonAmoy.id]: {
    https: http(
      'https://polygon-amoy.g.alchemy.com/v2/3qRz7cWG_qr34OFx7kyfYz79Htsm2inC',
      { key: 'alchemy' }
    ),
    wss: webSocket(
      'wss://polygon-amoy.g.alchemy.com/v2/3qRz7cWG_qr34OFx7kyfYz79Htsm2inC',
      { key: 'alchemy' }
    ),
  },
};
