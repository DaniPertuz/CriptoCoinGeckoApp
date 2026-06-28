import type { DocumentSnapshot, QueryDocumentSnapshot } from 'firebase-admin/firestore';

import env from '../config/env';
import { getFirestore } from '../config/firebase';
import { normalizeEmail } from '../models/user.model';
import type { NewUser, User, UserUpdateData } from '../types/user';

const collection = () => getFirestore().collection(env.firestore.usersCollection);

const mapDocToUser = (doc: DocumentSnapshot | QueryDocumentSnapshot): User | null => {
  if (!doc.exists) {
    return null;
  }

  return {
    ...(doc.data() as Omit<User, 'id'>),
    id: doc.id,
  };
};

const create = async (user: NewUser): Promise<User> => {
  const docRef = user.id ? collection().doc(user.id) : collection().doc();
  const userToSave = {
    ...user,
    id: docRef.id,
  } as User;

  await docRef.set(userToSave);
  return userToSave;
};

const findById = async (id: string): Promise<User | null> => {
  const doc = await collection().doc(id).get();
  return mapDocToUser(doc);
};

const findByEmail = async (email: string): Promise<User | null> => {
  const snapshot = await collection().where('email', '==', normalizeEmail(email)).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  return mapDocToUser(snapshot.docs[0]);
};

const findByGoogleId = async (googleId: string): Promise<User | null> => {
  const snapshot = await collection().where('googleId', '==', googleId).limit(1).get();

  if (snapshot.empty) {
    return null;
  }

  return mapDocToUser(snapshot.docs[0]);
};

const list = async ({ limit = 20 }: { limit?: number } = {}): Promise<User[]> => {
  const snapshot = await collection().orderBy('createdAt', 'desc').limit(limit).get();
  return snapshot.docs.map(mapDocToUser).filter((user): user is User => Boolean(user));
};

const update = async (id: string, data: UserUpdateData): Promise<User> => {
  const docRef = collection().doc(id);
  const updatedAt = new Date().toISOString();

  await docRef.update({
    ...data,
    updatedAt,
  });

  const updatedUser = await findById(id);

  if (!updatedUser) {
    throw new Error(`User ${id} was not found after update`);
  }

  return updatedUser;
};

const remove = async (id: string): Promise<void> => {
  await collection().doc(id).delete();
};

export {
  create,
  findById,
  findByEmail,
  findByGoogleId,
  list,
  update,
  remove,
};
