import {
  applicationDefault,
  cert,
  getApp,
  getApps,
  initializeApp,
  type App,
  type Credential,
  type ServiceAccount,
} from 'firebase-admin/app';
import type { Firestore } from 'firebase-admin/firestore';
import { getFirestore as getAdminFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

import env from './env';

let firestore: Firestore | undefined;

const decodeServiceAccount = (): ServiceAccount | null => {
  if (!env.firebase.serviceAccountBase64) {
    return null;
  }

  const json = Buffer.from(env.firebase.serviceAccountBase64, 'base64').toString('utf8');
  return JSON.parse(json) as ServiceAccount;
};

const buildCredential = (): Credential => {
  const serviceAccount = decodeServiceAccount();

  if (serviceAccount) {
    return cert(serviceAccount);
  }

  if (env.firebase.projectId && env.firebase.clientEmail && env.firebase.privateKey) {
    return cert({
      projectId: env.firebase.projectId,
      clientEmail: env.firebase.clientEmail,
      privateKey: env.firebase.privateKey,
    });
  }

  return applicationDefault();
};

const initializeFirebase = (): App => {
  if (!getApps().length) {
    initializeApp({
      credential: buildCredential(),
      projectId: env.firebase.projectId,
    });
  }

  return getApp();
};

const getFirestore = (): Firestore => {
  if (!firestore) {
    const app = initializeFirebase();
    firestore = getAdminFirestore(app);
  }

  return firestore;
};

const getFirebaseAuth = () => getAuth(initializeFirebase());

export {
  getFirebaseAuth,
  getFirestore,
  initializeFirebase,
};
