import { classifyRpcError } from './errors';

/**
 * A lifecycle call (start / open lobby / abort / finalize) may report INVALID_TRANSITION or lose its response
 * even though it committed. Ask the server where the room is now: if it is already in the state we wanted,
 * the action succeeded and must not be shown as an error.
 */
export async function lifecycleAlreadyDone(
  err: unknown,
  roomId: string,
  target: string | string[],
  getStatus: (roomId: string) => Promise<string>,
): Promise<boolean> {
  const cls = classifyRpcError(err);
  if (cls !== 'ROOM_NOT_ACTIVE' && cls !== 'OUTCOME_UNKNOWN') return false;
  try {
    return (Array.isArray(target) ? target : [target]).includes(await getStatus(roomId));
  } catch {
    return false;
  }
}
