import { ExecutionContext, createParamDecorator } from '@nestjs/common';
import { Request } from 'express';

export const User = createParamDecorator(
  (propertyKey: keyof Request['user'], ctx: ExecutionContext) => {
    const http = ctx.switchToHttp();
    const { user } = http.getRequest<Request>();
    return propertyKey ? user?.[propertyKey] : user;
  }
);
