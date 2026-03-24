import { randomUUID } from 'crypto';

if (!globalThis.crypto) {
  (globalThis as any).crypto = {
    randomUUID,
  };
}
