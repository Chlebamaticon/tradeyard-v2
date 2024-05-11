import assert from 'assert';

import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { ACTOR_ALLOW_ONLY_KEY, ActorType } from '../decorators';

@Injectable()
export class ActorGuard {
  constructor(private reflector: Reflector) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const allowOnlyTo =
      this.reflector.getAllAndOverride<ActorType[]>(ACTOR_ALLOW_ONLY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];
    const http = context.switchToHttp();
    const [request] = [http.getRequest<Request>()];
    const { user } = request;

    return allowOnlyTo.every((actorType) => {
      switch (actorType) {
        case 'customer':
          return !!user.customer_id;
        case 'merchant':
          return !!user.merchant_id;
        case 'moderator':
          return !!user.moderator_id;
        case 'user':
          return !!user.user_id;
        default:
          assert.fail('Invalid actor type');
      }
    });
  }
}
