/**
 * One request_id per user intent. A retry, double-click or resend of the SAME action (same function and
 * arguments) reuses the id so the server can replay instead of applying twice. The id is dropped once the
 * outcome is known (success or a definite failure); after an unknown outcome it is kept for the retry.
 */
import { safeRandomUUID } from './uuid';

const open = new Map<string, string>();

export const intentKey = (fn: string, identity: unknown): string => `${fn}:${JSON.stringify(identity)}`;

export function intentRequestId(key: string): string {
  let id = open.get(key);
  if (!id) {
    id = safeRandomUUID();
    open.set(key, id);
  }
  return id;
}

export const settleIntent = (key: string): void => {
  open.delete(key);
};
