import { AuthApiService } from './auth-api.service';
import { BaseApiService } from './base-api.service';
import { OfferApiService } from './offer-api.service';
import { OrderApiService } from './order-api.service';
import { TokenApiService } from './token-api.service';
import { UserWalletApiService } from './user-wallet-api.service';

export {
  AuthApiService,
  BaseApiService,
  OfferApiService,
  OrderApiService,
  TokenApiService,
  UserWalletApiService,
};

export default [
  BaseApiService,
  AuthApiService,
  OfferApiService,
  OrderApiService,
  TokenApiService,
  UserWalletApiService,
];
