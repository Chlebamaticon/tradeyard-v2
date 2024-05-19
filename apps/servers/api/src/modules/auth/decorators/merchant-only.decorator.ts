import { applyDecorators, UseGuards } from '@nestjs/common';

import { ActorGuard } from '../guards';

import { AllowOnlyTo } from './allow-only-to.decorator';

export const MerchantOnly = applyDecorators(
  AllowOnlyTo('merchant'),
  UseGuards(ActorGuard)
);
