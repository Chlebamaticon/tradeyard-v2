import { applyDecorators, UseGuards } from '@nestjs/common';

import { ActorGuard } from '../guards';

import { AllowOnlyTo } from './allow-only-to.decorator';

export const ModeratorOnly = applyDecorators(
  AllowOnlyTo('moderator'),
  UseGuards(ActorGuard)
);
