import { AlchemySigner } from '@alchemy/aa-alchemy';
import { chains } from '@alchemy/aa-core';
import { Injectable } from '@angular/core';
import { createWalletClient, http } from 'viem';

const signer = new AlchemySigner({
  client: {
    connection: {
      apiKey: 'alcht_jFwYTq4RwGJlXVuG2oGx5MwgdOaqrZ',
    },
    iframeConfig: {
      iframeContainerId: 'turnkey',
    },
  },
});

@Injectable()
export class AuthService {
  get signer() {
    return signer;
  }

  getWalletClient() {
    return createWalletClient({
      transport: http(
        'https://polygon-mumbai.g.alchemy.com/v2/htE35Fah1VZdE01bd0O09oGg1sa2QF9F'
      ),
      chain: chains.polygonMumbai,
      account: signer.toViemAccount(),
    });
  }

  authenticate(email: string) {
    return signer.authenticate({
      type: 'email',
      email,
    });
  }

  completeAuthentication(bundle: string, orgId: string) {
    return signer.inner.completeEmailAuth({
      orgId,
      bundle,
    });
  }
}
