interface FirebaseErrorLike {
  code?: string
  message?: string
}

export function getFirebaseAuthErrorMessage(error: unknown): string {
  const firebaseError = error as FirebaseErrorLike

  switch (firebaseError.code) {
    case 'auth/configuration-not-found':
      return 'Firebase Auth no está configurado para este proyecto. Habilita Authentication y el proveedor Google en Firebase Console, y revisa las variables VITE_FIREBASE_* del frontend.'
    case 'auth/operation-not-allowed':
      return 'El proveedor Google no está habilitado en Firebase Authentication.'
    case 'auth/popup-closed-by-user':
      return 'La ventana de Google se cerró antes de completar el inicio de sesión.'
    case 'auth/unauthorized-domain':
      return 'El dominio actual no está autorizado en Firebase Authentication.'
    case 'auth/api-key-not-valid.-please-pass-a-valid-api-key.':
    case 'auth/invalid-api-key':
      return 'La API key de Firebase no es válida. Revisa VITE_FIREBASE_API_KEY.'
    default:
      return firebaseError.message ?? 'No se pudo iniciar sesión con Google.'
  }
}
