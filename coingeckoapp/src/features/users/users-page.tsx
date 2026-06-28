import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit, Plus, Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Modal } from '../../components/ui/modal';
import { EmptyState, ErrorState, LoadingState } from '../../components/ui/state';
import { useAuth } from '../auth/use-auth';
import { api, ApiError } from '../../lib/api';
import { formatDateTime } from '../../lib/formatters';
import type { CreateUserPayload, UpdateUserPayload, User } from '../../lib/types';
import { UserForm } from './user-form';

export function UsersPage() {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const isAdmin = currentUser?.role === 'admin';

  const usersQuery = useQuery({
    queryFn: api.users,
    queryKey: ['users'],
  });

  const createUser = useMutation({
    mutationFn: (payload: CreateUserPayload) => api.createUser(payload),
    onSuccess: async () => {
      toast.success('Usuario creado');
      setModalMode(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo crear el usuario');
    },
  });

  const updateUser = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload; }) => api.updateUser(id, payload),
    onSuccess: async () => {
      toast.success('Usuario actualizado');
      setModalMode(null);
      setSelectedUser(null);
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo actualizar el usuario');
    },
  });

  const deleteUser = useMutation({
    mutationFn: (id: string) => api.deleteUser(id),
    onSuccess: async () => {
      toast.success('Usuario eliminado');
      await queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiError ? error.message : 'No se pudo eliminar el usuario');
    },
  });

  const sortedUsers = useMemo(
    () =>
      [...(usersQuery.data ?? [])].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      ),
    [usersQuery.data],
  );

  const openCreate = () => {
    setSelectedUser(null);
    setModalMode('create');
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
  };

  const handleDelete = (user: User) => {
    const confirmed = window.confirm(`¿Eliminar a ${user.name}? Esta acción no se puede deshacer.`);

    if (confirmed) {
      deleteUser.mutate(user.id);
    }
  };

  const handleSubmit = (payload: CreateUserPayload | UpdateUserPayload) => {
    if (modalMode === 'create') {
      createUser.mutate(payload as CreateUserPayload);
      return;
    }

    if (selectedUser) {
      updateUser.mutate({ id: selectedUser.id, payload: payload as UpdateUserPayload });
    }
  };

  if (usersQuery.error) {
    return (
      <ErrorState
        message="No se pudo cargar la lista de usuarios. Revisa tu sesión y la conexión con el backend."
        onRetry={() => usersQuery.refetch()}
      />
    );
  }

  if (!usersQuery.data) {
    return <LoadingState label="Cargando usuarios" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Administración</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-slate-50">Usuarios</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Consulta y administra los usuarios registrados.</p>
        </div>
        {isAdmin ? (
          <Button onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Crear usuario
          </Button>
        ) : (
          <Badge tone="warning">Modo lectura para rol {currentUser?.role}</Badge>
        )}
      </div>

      {!sortedUsers.length ? (
        <EmptyState
          action={isAdmin ? <Button onClick={openCreate}>Crear primer usuario</Button> : undefined}
          description="Cuando existan usuarios registrados aparecerán en esta tabla."
          title="No hay usuarios para mostrar"
        />
      ) : (
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Usuarios registrados</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-100 dark:divide-slate-800 md:hidden">
              {sortedUsers.map((user) => (
                <div className="space-y-4 p-4" key={user.id}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      {user.avatarUrl ? (
                        <img alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" src={user.avatarUrl} />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                          {user.name.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-950 dark:text-slate-50">{user.name}</p>
                        <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                      </div>
                    </div>
                    <Badge tone={user.role === 'admin' ? 'success' : 'neutral'}>{user.role}</Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Provider</p>
                      <p className="mt-1 font-medium">{user.provider}</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium uppercase text-slate-500 dark:text-slate-400">Creado</p>
                      <p className="mt-1 font-medium text-slate-600 dark:text-slate-300">
                        {formatDateTime(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  {isAdmin ? (
                    <div className="grid grid-cols-2 gap-2">
                      <Button className="w-full" onClick={() => openEdit(user)} variant="secondary">
                        <Edit className="h-4 w-4" />
                        Editar
                      </Button>
                      <Button
                        className="w-full"
                        disabled={deleteUser.isPending || user.id === currentUser?.id}
                        onClick={() => handleDelete(user)}
                        variant="danger"
                      >
                        <Trash2 className="h-4 w-4" />
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <span className="text-sm text-slate-400 dark:text-slate-500">Sin permisos</span>
                  )}
                </div>
              ))}
            </div>

            <div className="hidden overflow-x-auto md:block">
              <table className="w-full min-w-215 text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-3">Usuario</th>
                    <th className="px-5 py-3">Provider</th>
                    <th className="px-5 py-3">Rol</th>
                    <th className="px-5 py-3">Creado</th>
                    <th className="px-5 py-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {sortedUsers.map((user) => (
                    <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/60" key={user.id}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          {user.avatarUrl ? (
                            <img alt="" className="h-9 w-9 rounded-full object-cover" src={user.avatarUrl} />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                              {user.name.slice(0, 1).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-slate-950 dark:text-slate-50">{user.name}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">{user.provider}</td>
                      <td className="px-5 py-4">
                        <Badge tone={user.role === 'admin' ? 'success' : 'neutral'}>{user.role}</Badge>
                      </td>
                      <td className="px-5 py-4 text-slate-500 dark:text-slate-400">{formatDateTime(user.createdAt)}</td>
                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          {isAdmin ? (
                            <>
                              <Button onClick={() => openEdit(user)} variant="secondary">
                                <Edit className="h-4 w-4" />
                                Editar
                              </Button>
                              <Button
                                disabled={deleteUser.isPending || user.id === currentUser?.id}
                                onClick={() => handleDelete(user)}
                                variant="danger"
                              >
                                <Trash2 className="h-4 w-4" />
                                Eliminar
                              </Button>
                            </>
                          ) : (
                            <span className="text-sm text-slate-400 dark:text-slate-500">Sin permisos</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      <Modal
        description={modalMode === 'create' ? 'Crea una cuenta administrada.' : 'Actualiza datos básicos del usuario.'}
        onClose={() => setModalMode(null)}
        open={modalMode !== null}
        title={modalMode === 'create' ? 'Crear usuario' : 'Editar usuario'}
      >
        <UserForm
          isSubmitting={createUser.isPending || updateUser.isPending}
          mode={modalMode ?? 'create'}
          onCancel={() => setModalMode(null)}
          onSubmit={handleSubmit}
          user={selectedUser}
        />
      </Modal>
    </div>
  );
}
