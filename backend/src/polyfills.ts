import { randomUUID } from 'crypto';

interface CryptoPolyfill {
  randomUUID: typeof randomUUID;
}

if (!globalThis.crypto) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const g = globalThis as any;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  g.crypto = {
    randomUUID,
  } as CryptoPolyfill;
}
