import { createHash } from 'node:crypto';
import type { DocumentSnapshot } from 'firebase-admin/firestore';

import env from '../config/env';
import { getFirestore } from '../config/firebase';

interface CryptoCacheEntry<TData = unknown> {
  cacheKey: string;
  url: string;
  data: TData;
  cachedAt: number;
  expiresAt: number;
}

const collection = () => getFirestore().collection(env.firestore.cryptoCacheCollection);

const docIdForKey = (cacheKey: string): string => createHash('sha256').update(cacheKey).digest('hex');

const mapDocToCacheEntry = <TData>(doc: DocumentSnapshot): CryptoCacheEntry<TData> | null => {
  if (!doc.exists) {
    return null;
  }

  return doc.data() as CryptoCacheEntry<TData>;
};

const findByKey = async <TData>(cacheKey: string): Promise<CryptoCacheEntry<TData> | null> => {
  const doc = await collection().doc(docIdForKey(cacheKey)).get();
  return mapDocToCacheEntry<TData>(doc);
};

const save = async <TData>(entry: CryptoCacheEntry<TData>): Promise<void> => {
  await collection().doc(docIdForKey(entry.cacheKey)).set(entry);
};

export type {
  CryptoCacheEntry,
};

export {
  findByKey,
  save,
};
