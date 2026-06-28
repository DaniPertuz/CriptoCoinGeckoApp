import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import { ApiError } from '../../lib/api';
import { AuthShell } from './auth-shell';
import { useAuth } from './use-auth';

const registerSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().trim().email('Ingresa un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { register: createAccount } = useAuth();
  const navigate = useNavigate();
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      await createAccount(values);
      navigate('/dashboard', { replace: true });
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo crear la cuenta');
    }
  });

  return (
    <AuthShell
      description="Crea una cuenta para acceder a los datos privados del mercado."
      title="Crear cuenta"
    >
      <form className="space-y-4" onSubmit={onSubmit}>
        <Field error={errors.name?.message} htmlFor="name" label="Nombre">
          <Input autoComplete="name" id="name" placeholder="Daniel Pertuz" {...register('name')} />
        </Field>
        <Field error={errors.email?.message} htmlFor="email" label="Email">
          <Input autoComplete="email" id="email" placeholder="daniel@example.com" {...register('email')} />
        </Field>
        <Field error={errors.password?.message} htmlFor="password" label="Contraseña">
          <Input autoComplete="new-password" id="password" type="password" {...register('password')} />
        </Field>
        <Button className="w-full" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Creando cuenta...' : 'Crear cuenta'}
        </Button>
      </form>
      <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
        ¿Ya tienes cuenta?{' '}
        <Link className="font-medium text-slate-950 underline-offset-4 hover:underline dark:text-slate-50" to="/login">
          Iniciar sesión
        </Link>
      </p>
    </AuthShell>
  );
}
