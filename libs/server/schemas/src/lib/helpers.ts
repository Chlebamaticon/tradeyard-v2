import { EventType } from './types';

/**
 * @description
 * A helper function to create an array of existing event types.
 * @param types
 * @returns
 */
export function selectEventTypes<ET extends EventType[]>(...types: ET): ET {
  return types;
}
