import { SetMetadata } from '@nestjs/common';

export type ActorType = 'moderator' | 'merchant' | 'customer' | 'user';

export const ACTOR_ALLOW_ONLY_KEY = '_ACTOR_ALLOW_ONLY_KEY_';
export const AllowOnlyTo = (...actors: ActorType[]) =>
  SetMetadata(ACTOR_ALLOW_ONLY_KEY, actors);
