import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '../../components/ui/button';
import { Field } from '../../components/ui/field';
import { Input } from '../../components/ui/input';
import type { CreateUserPayload, UpdateUserPayload, User } from '../../lib/types';

const userFormSchema = z.object({
  name: z.string().trim().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().trim().email('Ingresa un email válido'),
  password: z.string().optional(),
  role: z.enum(['user', 'admin']),
  avatarUrl: z.string().optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormProps {
  mode: 'create' | 'edit';
  user?: User | null;
  isSubmitting: boolean;
  onCancel: () => void;
  onSubmit: (payload: CreateUserPayload | UpdateUserPayload) => void;
}

export function UserForm({ mode, user, isSubmitting, onCancel, onSubmit }: UserFormProps) {
  const {
    formState: { errors },
    handleSubmit,
    register,
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'user',
      avatarUrl: user?.avatarUrl ?? '',
    },
  });

  useEffect(() => {
    reset({
      name: user?.name ?? '',
      email: user?.email ?? '',
      password: '',
      role: user?.role ?? 'user',
      avatarUrl: user?.avatarUrl ?? '',
    });
  }, [reset, user]);

  const submit = handleSubmit((values) => {
    const avatarUrl = values.avatarUrl?.trim() ? values.avatarUrl.trim() : null;

    if (mode === 'create') {
      onSubmit({
        name: values.name,
        email: values.email,
        password: values.password ?? '',
        role: values.role,
      });
      return;
    }

    onSubmit({
      name: values.name,
      email: values.email,
      role: values.role,
      avatarUrl,
      ...(values.password ? { password: values.password } : {}),
    });
  });

  return (
    <form className="space-y-4" onSubmit={submit}>
      <Field error={errors.name?.message} htmlFor="user-name" label="Nombre">
        <Input id="user-name" {...register('name')} />
      </Field>
      <Field error={errors.email?.message} htmlFor="user-email" label="Email">
        <Input id="user-email" type="email" {...register('email')} />
      </Field>
      <Field
        error={errors.password?.message}
        htmlFor="user-password"
        label={mode === 'create' ? 'Contraseña' : 'Nueva contraseña'}
      >
        <Input
          id="user-password"
          minLength={mode === 'create' ? 8 : undefined}
          placeholder={mode === 'edit' ? 'Opcional' : undefined}
          required={mode === 'create'}
          type="password"
          {...register('password', {
            validate: (value) =>
              mode === 'edit' || (value?.length ?? 0) >= 8 || 'La contraseña debe tener al menos 8 caracteres',
          })}
        />
      </Field>
      <div className="space-y-2">
        <label className="text-sm font-medium text-slate-800 dark:text-slate-200" htmlFor="user-role">
          Rol
        </label>
        <select
          className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-950 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:focus:ring-slate-800"
          id="user-role"
          {...register('role')}
        >
          <option value="user">user</option>
          <option value="admin">admin</option>
        </select>
      </div>
      {mode === 'edit' ? (
        <Field error={errors.avatarUrl?.message} htmlFor="user-avatar" label="Avatar URL">
          <Input id="user-avatar" placeholder="https://..." {...register('avatarUrl')} />
        </Field>
      ) : null}
      <div className="flex justify-end gap-3 pt-2">
        <Button onClick={onCancel} variant="secondary">
          Cancelar
        </Button>
        <Button disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  );
}
