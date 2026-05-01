import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { ApiError, apiFetch } from "../../lib/api";
import type { Category } from "../../lib/types";

type CategoriesRes = { status: string; data: { categories: Category[] } };

export function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [errorText, setErrorText] = useState<string | null>(null);

  const categoriesQuery = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => {
      const res = await apiFetch<CategoriesRes>("/api/v1/categories", { auth: true });
      return res.data.categories;
    },
  });

  const createCategory = useMutation({
    mutationFn: async () => {
      setErrorText(null);
      await apiFetch("/api/v1/admin/categories", {
        method: "POST",
        auth: true,
        body: JSON.stringify({ name: name.trim() }),
      });
    },
    onSuccess: async () => {
      setName("");
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => setErrorText(e instanceof ApiError ? e.message : "Create failed"),
  });

  const deleteCategory = useMutation({
    mutationFn: async (id: number) => {
      setErrorText(null);
      await apiFetch(`/api/v1/admin/categories/${id}`, { method: "DELETE", auth: true });
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-categories"] });
      await queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
    onError: (e) => setErrorText(e instanceof ApiError ? e.message : "Delete failed"),
  });

  function onCreate(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    createCategory.mutate();
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="font-display text-lg font-semibold text-white">Categories</h2>
      {errorText ? <p className="mt-3 text-sm text-red-400">{errorText}</p> : null}

      <form onSubmit={onCreate} className="mt-4 flex flex-wrap gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New category name"
          className="min-w-[240px] flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
        />
        <button
          type="submit"
          disabled={createCategory.isPending}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
        >
          {createCategory.isPending ? "Creating…" : "Create"}
        </button>
      </form>

      {categoriesQuery.isPending ? (
        <p className="mt-4 text-zinc-500">Loading…</p>
      ) : categoriesQuery.isError ? (
        <p className="mt-4 text-sm text-red-400">
          {categoriesQuery.error instanceof Error ? categoriesQuery.error.message : "Failed to load"}
        </p>
      ) : (
        <ul className="mt-6 space-y-2">
          {categoriesQuery.data?.map((c) => (
            <li
              key={c.category_id}
              className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-950/40 px-4 py-3"
            >
              <span className="text-zinc-200">{c.name}</span>
              <button
                type="button"
                onClick={() => deleteCategory.mutate(c.category_id)}
                className="text-sm text-red-400 hover:underline"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

