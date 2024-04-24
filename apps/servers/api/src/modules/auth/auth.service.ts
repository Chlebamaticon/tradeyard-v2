import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import {
  AuthSignUpBodyDto,
  CustomerDto,
  MerchantDto,
  UserDto,
} from '@tradeyard-v2/api-dtos';

import { UserCredentialService } from '../../modules/users';
import { CustomerService } from '../customers';
import { MerchantService } from '../merchants';

@Injectable()
export class AuthService {
  constructor(
    private customerService: CustomerService,
    private merchantService: MerchantService,
    private userCredentialService: UserCredentialService,
    private jwtService: JwtService
  ) {}

  async validateUser(email: string, password: string): Promise<UserDto> {
    return this.userCredentialService.matchOrFail(email, password);
  }

  async signIn(
    email: string,
    password: string
  ): Promise<{ access_token: string }> {
    const user = await this.userCredentialService.matchOrFail(email, password);
    return this.#issueJwtToken(user);
  }

  async signUp({ type, ...body }: AuthSignUpBodyDto): Promise<{
    access_token: string;
  }> {
    const user =
      type === 'merchant'
        ? await this.#signUpAsMerchant(body)
        : await this.#signUpAsCustomer(body);

    return this.#issueJwtToken(user);
  }

  async #signUpAsCustomer(
    body: Omit<AuthSignUpBodyDto, 'type'>
  ): Promise<CustomerDto> {
    const customer = await this.customerService.createOne({
      ...body,
    });
    await this.#saveCredentials(body.email, body.password);
    return customer;
  }

  async #signUpAsMerchant(
    body: Omit<AuthSignUpBodyDto, 'type'>
  ): Promise<MerchantDto> {
    const merchant = await this.merchantService.createOne({
      ...body,
    });
    await this.#saveCredentials(body.email, body.password);
    return merchant;
  }

  async #saveCredentials(email: string, password: string): Promise<void> {
    await this.userCredentialService.create(email, password);
  }

  async #issueJwtToken(user: UserDto): Promise<{ access_token: string }> {
    const payload = { sub: user.user_id, email: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
