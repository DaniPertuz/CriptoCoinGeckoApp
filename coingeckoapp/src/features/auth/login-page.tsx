import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { ApiError } from '../../lib/api';
import { getFirebaseAuthErrorMessage } from '../../lib/firebase-errors';
import { isFirebaseConfigured } from '../../lib/firebase';
import { useAuth } from './use-auth';
import { AuthShell } from './auth-shell';

const loginSchema = z.object({
  email: z.string().trim().email('Ingresa un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [googleLoading, setGoogleLoading] = useState(false);
  const redirectTo = (location.state as { from?: { pathname?: string; }; } | null)?.from?.pathname ?? '/dashboard';

  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await login(values);
      navigate(redirectTo, { replace: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo iniciar sesión');
    }
  });

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      await loginWithGoogle();
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(getFirebaseAuthErrorMessage(error));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <AuthShell
      description="Ingresa con tu cuenta para consultar el dashboard privado."
      title="Iniciar sesión"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field error={errors.email?.message} htmlFor="email" label="Email">
          <Input autoComplete="email" id="email" placeholder="daniel@example.com" {...register('email')} />
        </Field>
        <Field error={errors.password?.message} htmlFor="password" label="Contraseña">
          <Input autoComplete="current-password" id="password" type="password" {...register('password')} />
        </Field>
        <Button className="w-full hover:cursor-pointer" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Ingresando...' : 'Ingresar'}
        </Button>
      </form>

      <div className="my-5 flex items-center gap-3 text-xs text-slate-400 dark:text-slate-500">
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
        o
        <span className="h-px flex-1 bg-slate-200 dark:bg-slate-800" />
      </div>

      <Button
        className="w-full hover:cursor-pointer"
        disabled={!isFirebaseConfigured || googleLoading}
        onClick={handleGoogleLogin}
        variant="secondary"
      >
        <KeyRound className="h-4 w-4" />
        {googleLoading ? 'Conectando...' : 'Ingresar con Google'}
      </Button>
      {!isFirebaseConfigured ? (
        <p className="mt-2 text-center text-xs text-amber-700 dark:text-amber-300">
          Configura las variables VITE_FIREBASE_* para habilitar Google.
        </p>
      ) : null}

      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        ¿No tienes cuenta?{' '}
        <Link className="font-medium text-slate-950 underline-offset-4 hover:underline dark:text-slate-50" to="/register">
          Crear cuenta
        </Link>
      </p>
    </AuthShell>
  );
}
