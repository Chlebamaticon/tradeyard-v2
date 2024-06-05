import { EventEmitter, Inject, Injectable } from '@angular/core';
import { jwtDecode, JwtPayload } from 'jwt-decode';
import { filter, fromEvent, map, merge, Observable, of, tap } from 'rxjs';

import {
  AuthSignInBodyDto,
  AuthSignInDto,
  AuthSignUpBodyDto,
  AuthSignUpDto,
  UserExtendedDto,
} from '@tradeyard-v2/api-dtos';

import { BasicHeaderEmitter } from '../../api/providers';
import { AuthApiService, UserWalletApiService } from '../../api/services';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
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

  get payload(): (JwtPayload & UserExtendedDto) | null {
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
}
