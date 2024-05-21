import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import {
  AuthSignInBodyDto,
  AuthSignInDto,
  AuthSignUpBodyDto,
  AuthSignUpDto,
  GetWhoamiDto,
} from '@tradeyard-v2/api-dtos';

import { BaseApiService } from './base-api.service';

@Injectable()
export class AuthApiService {
  constructor(readonly baseApiService: BaseApiService) {}

  whoami(): Observable<GetWhoamiDto> {
    return this.baseApiService.get('auth/whoami', {});
  }

  signIn(body: AuthSignInBodyDto): Observable<AuthSignInDto> {
    return this.baseApiService.post<AuthSignInDto>('auth/sign-in', body, {});
  }

  signUp(body: AuthSignUpBodyDto): Observable<AuthSignUpDto> {
    return this.baseApiService.post<AuthSignUpDto>('auth/sign-up', body, {});
  }
}
