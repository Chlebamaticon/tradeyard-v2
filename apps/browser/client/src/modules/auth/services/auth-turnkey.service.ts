import { Injectable } from '@angular/core';
import { Turnkey } from '@turnkey/sdk-browser';
import { createAccount } from '@turnkey/viem';
import { createWalletClient, LocalAccount, publicActions } from 'viem';

import { currentChain, transports } from '@tradeyard-v2/api-dtos';

type TurnkeyIdentity = {
  organizationId: string;
  organizationName: string;
  userId: string;
  username: string;
};

@Injectable()
export class AuthTurnkeyService {
  readonly turnkey = new Turnkey({
    apiBaseUrl: 'https://api.turnkey.com',
    defaultOrganizationId: '2909eeb3-4ffa-46fe-97fc-44d21a664ad7',
  });
  readonly passkeyClient = this.turnkey.passkeyClient();

  createWallet(email?: string) {
    return this.passkeyClient.createUserPasskey({
      publicKey: {
        user: {
          name: email,
          displayName: `tradeyard - ${email}`,
        },
      },
    });
  }

  async authenticate(): Promise<TurnkeyIdentity> {
    return await this.passkeyClient.login();
  }

  async createTurnkeyAccount(identity: {
    address: string;
    sub_organization_id: string;
  }) {
    return await createAccount({
      client: this.passkeyClient,
      organizationId: identity.sub_organization_id,
      signWith: identity.address,
    });
  }

  async createTurnkeyWalletClient(account: LocalAccount) {
    return createWalletClient({
      account,
      chain: currentChain,
      transport: transports[currentChain.id].https,
    }).extend(publicActions);
  }
}
