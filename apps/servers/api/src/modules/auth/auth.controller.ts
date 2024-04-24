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
  UserDto,
} from '@tradeyard-v2/api-dtos';

import { AuthService } from './auth.service';
import { Public, User } from './decorators';

@Controller()
export class AuthController {
  readonly logger = new Logger(AuthController.name);

  constructor(private readonly authService: AuthService) {}

  @Get('whoami')
  async getAuth(@User() user: UserDto): Promise<UserDto> {
    return user;
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
