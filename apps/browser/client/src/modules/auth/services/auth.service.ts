import { AlchemySigner } from '@alchemy/aa-alchemy';
import { chains } from '@alchemy/aa-core';
import { Injectable } from '@angular/core';
import { createWalletClient, webSocket } from 'viem';

const signer = new AlchemySigner({
  client: {
    connection: {
      apiKey: '3qRz7cWG_qr34OFx7kyfYz79Htsm2inC',
    },
    iframeConfig: {
      iframeContainerId: 'turnkey',
    },
  },
});

@Injectable()
export class AuthService {
  get signer(): AlchemySigner {
    return signer;
  }

  getWalletClient() {
    return createWalletClient({
      transport: webSocket(
        'wss://polygon-amoy.g.alchemy.com/v2/3qRz7cWG_qr34OFx7kyfYz79Htsm2inC'
      ),
      chain: chains.polygonAmoy,
      account: signer.toViemAccount(),
    });
  }

  authenticateWithEmail(email: string) {
    return signer.authenticate({
      type: 'email',
      email,
    });
  }

  authenticateWithPasskey() {
    return signer.authenticate({
      type: 'passkey',
      createNew: false,
    });
  }

  signupWithPasskey(email: string) {
    return signer.authenticate({
      type: 'passkey',
      createNew: true,
      username: email,
    });
  }

  signupWithEmail(email: string) {
    const redirectParams = new URLSearchParams();
    redirectParams.set('email', email);
    return signer.authenticate({
      type: 'email',
      email,
      redirectParams,
    });
  }

  completeAuthentication(bundle: string, orgId: string) {
    return signer.inner.completeEmailAuth({
      orgId,
      bundle,
    });
  }
}
