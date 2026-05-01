import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ApiError, apiFetch } from "../../lib/api";
import type { User } from "../../lib/types";

type UsersRes = { status: string; data: { users: User[] } };

export function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      const res = await apiFetch<UsersRes>("/api/v1/admin/users", { auth: true });
      return res.data.users;
    },
  });

  const updateRole = useMutation({
    mutationFn: async ({ id, roles }: { id: string; roles: "USER" | "ADMIN" }) => {
      setErrorText(null);
      setSuccessText(null);
      await apiFetch(`/api/v1/admin/users/${id}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify({ roles }),
      });
    },
    onSuccess: async () => {
      setSuccessText("User updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => setErrorText(e instanceof ApiError ? e.message : "Update failed"),
  });

  const deleteUser = useMutation({
    mutationFn: async (id: string) => {
      setErrorText(null);
      setSuccessText(null);
      await apiFetch(`/api/v1/admin/users/${id}`, { method: "DELETE", auth: true });
    },
    onSuccess: async () => {
      setSuccessText("User deleted.");
      await queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (e) => setErrorText(e instanceof ApiError ? e.message : "Delete failed"),
  });

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="font-display text-lg font-semibold text-white">Users</h2>

      {errorText ? <p className="mt-3 text-sm text-red-400">{errorText}</p> : null}
      {successText ? <p className="mt-3 text-sm text-emerald-400">{successText}</p> : null}

      {usersQuery.isPending ? (
        <p className="mt-4 text-zinc-500">Loading…</p>
      ) : usersQuery.isError ? (
        <p className="mt-4 text-sm text-red-400">
          {usersQuery.error instanceof Error ? usersQuery.error.message : "Failed to load"}
        </p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="text-zinc-500">
              <tr className="border-b border-zinc-800">
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Email</th>
                <th className="py-2 pr-4">Role</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersQuery.data?.map((u) => (
                <tr key={u.id} className="border-b border-zinc-900">
                  <td className="py-3 pr-4 text-zinc-200">{u.name}</td>
                  <td className="py-3 pr-4 text-zinc-400">{u.email}</td>
                  <td className="py-3 pr-4">
                    <select
                      value={String((u as any).roles ?? "USER")}
                      onChange={(e) =>
                        updateRole.mutate({
                          id: u.id,
                          roles: e.target.value as "USER" | "ADMIN",
                        })
                      }
                      className="rounded-lg border border-zinc-700 bg-zinc-950 px-2 py-1.5 text-white"
                    >
                      <option value="USER">USER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </td>
                  <td className="py-3 pr-4">
                    <button
                      type="button"
                      onClick={() => deleteUser.mutate(u.id)}
                      className="text-red-400 hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

