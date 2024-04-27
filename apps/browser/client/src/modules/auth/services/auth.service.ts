import { AlchemySigner } from '@alchemy/aa-alchemy';
import { chains } from '@alchemy/aa-core';
import { EventEmitter, Inject, Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import {
  catchError,
  defaultIfEmpty,
  defer,
  EMPTY,
  exhaustMap,
  filter,
  firstValueFrom,
  from,
  fromEvent,
  map,
  merge,
  Observable,
  of,
  startWith,
  switchMap,
  tap,
} from 'rxjs';
import { createWalletClient, webSocket } from 'viem';
import { polygonAmoy } from 'viem/chains';

import {
  AuthSignInBodyDto,
  AuthSignInDto,
  AuthSignUpBodyDto,
  AuthSignUpDto,
} from '@tradeyard-v2/api-dtos';

import { BasicHeaderEmitter } from '../../api/providers';
import { AuthApiService, UserWalletApiService } from '../../api/services';

const signer = new AlchemySigner({
  client: {
    connection: {
      apiKey: '3qRz7cWG_qr34OFx7kyfYz79Htsm2inC',
    },
    iframeConfig: {
      iframeContainerId: 'turnkey',
    },
  },
  sessionConfig: {
    storage: 'localStorage',
    expirationTimeMs: 60 * 60 * 1000,
  },
});

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  get signer(): AlchemySigner {
    return signer;
  }

  get accessToken(): string | undefined {
    return localStorage.getItem('access_token') ?? undefined;
  }

  set accessToken(token: string | undefined) {
    if (token) {
      localStorage.setItem('access_token', token);
    } else {
      localStorage.removeItem('access_token');
    }
  }

  get payload(): (JwtPayload & { email?: string }) | null {
    return this.accessToken ? jwtDecode(this.accessToken) : null;
  }

  readonly accessTokenChanges = merge(
    of(this.accessToken),
    fromEvent<StorageEvent>(window, 'storage').pipe(
      filter((event) => event.key === 'access_token'),
      map(({ newValue }) => newValue)
    )
  );

  readonly updateHeadersWithAccessToken$ = this.accessTokenChanges
    .pipe(
      map((accessToken) =>
        accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : { Authorization: [] }
      )
    )
    .subscribe(this.basicHeaderEmitter);

  constructor(
    @Inject(BasicHeaderEmitter)
    readonly basicHeaderEmitter: EventEmitter<
      Record<string, string | string[]>
    >,
    readonly authApi: AuthApiService,
    readonly userWalletApiService: UserWalletApiService
  ) {}

  getWalletClient() {
    return createWalletClient({
      transport: webSocket(
        'wss://polygon-amoy.g.alchemy.com/v2/3qRz7cWG_qr34OFx7kyfYz79Htsm2inC'
      ),
      chain: chains.polygonAmoy,
      account: signer.toViemAccount(),
    });
  }

  signOut() {
    this.accessToken = undefined;
  }

  signIn(body: AuthSignInBodyDto): Observable<AuthSignInDto> {
    return this.authApi
      .signIn(body)
      .pipe(tap(({ access_token }) => (this.accessToken = access_token)));
  }

  signUp(body: AuthSignUpBodyDto): Observable<AuthSignUpDto> {
    return this.authApi
      .signUp(body)
      .pipe(tap(({ access_token }) => (this.accessToken = access_token)));
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

  async createOrUsePasskey(customEmail?: string): Promise<string> {
    const email = customEmail ?? this.payload?.email;
    if (!email) throw new Error('No email provided');

    const createPasskey$ = defer(() =>
      from(this.signupWithPasskey(email))
    ).pipe(
      switchMap(() => this.signer.getAddress()),
      exhaustMap((address) =>
        this.userWalletApiService.create({
          address,
          type: 'turnkey',
          chain: `${polygonAmoy.id}`,
        })
      ),
      map(({ address }) => address)
    );

    const usePasskey$ = defer(() => from(this.signer.getAddress())).pipe(
      catchError(() =>
        from(this.authenticateWithPasskey()).pipe(
          exhaustMap(() => this.signer.getAddress())
        )
      )
    );

    const createOrUsePasskey$ = from(
      this.signer.inner.lookupUserByEmail(email).catch(() => null)
    ).pipe(exhaustMap((org) => (org ? usePasskey$ : createPasskey$)));

    return firstValueFrom(createOrUsePasskey$);
  }
}
