import {
  Body,
  Controller,
  Get,
  Logger,
  Post,
  UnauthorizedException,
} from '@nestjs/common';

import {
  AuthSignInBodyDto,
  AuthSignUp,
  AuthSignUpBody,
  AuthSignUpBodyDto,
  AuthSignUpDto,
  GetWhoami,
  GetWhoamiDto,
  UserDto,
} from '@tradeyard-v2/api-dtos';

import { UserWalletService } from '../../users/services/user-wallet.service';
import { AuthService } from '../auth.service';
import { Public, User } from '../decorators';

@Controller()
export class AuthController {
  readonly logger = new Logger(AuthController.name);

  constructor(
    readonly authService: AuthService,
    readonly userWalletService: UserWalletService
  ) {}

  @Get('whoami')
  async getWhoami(@User() user: UserDto): Promise<GetWhoamiDto> {
    const { items: wallets } = await this.userWalletService.getMany({
      user_id: user.user_id,
    });
    return GetWhoami.parse({
      ...user,
      wallets,
    });
  }

  @Public()
  @Post('sign-in')
  async signIn(@Body() body: AuthSignInBodyDto) {
    return this.authService.signIn(body.email, body.password).catch((error) => {
      this.logger.warn(error);
      throw new UnauthorizedException();
    });
  }

  @Public()
  @Post('sign-up')
  async signUp(@Body() body: AuthSignUpBodyDto): Promise<AuthSignUpDto> {
    const validatedBody = AuthSignUpBody.parse(body);
    return AuthSignUp.parse(await this.authService.signUp(validatedBody));
  }
}
