import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { ApiError, apiFetch } from "../../lib/api";
import type { Product } from "../../lib/types";

type ProductsRes = {
  status: string;
  data: { products: Product[] };
};

type UpdateProductRes = { status: string; data: { product: Product } };

export function AdminProductsPage() {
  const queryClient = useQueryClient();
  const [selected, setSelected] = useState<Product | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [brand, setBrand] = useState("");
  const [availability, setAvailability] = useState(true);
  const [files, setFiles] = useState<FileList | null>(null);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [successText, setSuccessText] = useState<string | null>(null);

  const productsQuery = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => {
      const res = await apiFetch<ProductsRes>("/api/v1/products?limit=100", { auth: true });
      return res.data.products;
    },
  });

  const productOptions = useMemo(() => productsQuery.data ?? [], [productsQuery.data]);

  const updateProduct = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      setErrorText(null);
      setSuccessText(null);
      const payload: Record<string, unknown> = {
        name: name.trim() || selected.name,
        brand: brand.trim() || undefined,
        availability,
        price: Number(price) || selected.price,
      };
      const res = await apiFetch<UpdateProductRes>(`/api/v1/admin/products/${selected.product_id}`, {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(payload),
      });
      return res.data.product;
    },
    onSuccess: async () => {
      setSuccessText("Product updated.");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e) => setErrorText(e instanceof ApiError ? e.message : "Update failed"),
  });

  const deleteProduct = useMutation({
    mutationFn: async () => {
      if (!selected) return;
      setErrorText(null);
      setSuccessText(null);
      await apiFetch(`/api/v1/admin/products/${selected.product_id}`, {
        method: "DELETE",
        auth: true,
      });
    },
    onSuccess: async () => {
      setSelected(null);
      setSuccessText("Product deleted.");
      await queryClient.invalidateQueries({ queryKey: ["admin-products"] });
    },
    onError: (e) => setErrorText(e instanceof ApiError ? e.message : "Delete failed"),
  });

  const uploadImages = useMutation({
    mutationFn: async () => {
      if (!selected) throw new Error("Select a product first");
      if (!files || files.length === 0) throw new Error("Pick images first");
      setErrorText(null);
      setSuccessText(null);

      const body = new FormData();
      Array.from(files).forEach((f) => body.append("images", f));

      await apiFetch(`/api/v1/admin/products/${selected.product_id}/images?mode=append`, {
        method: "POST",
        auth: true,
        body,
      });
    },
    onSuccess: async () => {
      setFiles(null);
      setSuccessText("Images uploaded.");
      await queryClient.invalidateQueries({ queryKey: ["product", selected?.product_id] });
    },
    onError: (e) => setErrorText(e instanceof ApiError ? e.message : "Upload failed"),
  });

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="font-display text-lg font-semibold text-white">Products</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Uses public product list for selection, then admin endpoints for edits and uploads.
      </p>

      {productsQuery.isError ? (
        <p className="mt-4 text-sm text-red-400">
          {productsQuery.error instanceof Error ? productsQuery.error.message : "Failed to load"}
        </p>
      ) : null}

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm text-zinc-400">Select product</label>
          <select
            value={selected?.product_id ?? ""}
            onChange={(e) => {
              const p = productOptions.find((x) => x.product_id === e.target.value) ?? null;
              setSelected(p);
              setErrorText(null);
              setSuccessText(null);
              if (p) {
                setName(p.name);
                setPrice(String(p.price));
                setBrand(p.brand ?? "");
                setAvailability(Boolean(p.availability));
              }
            }}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
          >
            <option value="">—</option>
            {productOptions.map((p) => (
              <option key={p.product_id} value={p.product_id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {selected ? (
          <div className="space-y-3">
            {errorText ? <p className="text-sm text-red-400">{errorText}</p> : null}
            {successText ? <p className="text-sm text-emerald-400">{successText}</p> : null}

            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                placeholder="Name"
              />
              <input
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                placeholder="Price"
              />
              <input
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
                placeholder="Brand"
              />
              <label className="flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  checked={availability}
                  onChange={(e) => setAvailability(e.target.checked)}
                />
                Available
              </label>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => updateProduct.mutate()}
                disabled={updateProduct.isPending}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {updateProduct.isPending ? "Saving…" : "Save changes"}
              </button>
              <button
                type="button"
                onClick={() => deleteProduct.mutate()}
                disabled={deleteProduct.isPending}
                className="rounded-lg border border-red-800/60 bg-red-950/30 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-950/50 disabled:opacity-50"
              >
                {deleteProduct.isPending ? "Deleting…" : "Delete product"}
              </button>
            </div>

            <div className="mt-4 space-y-2 rounded-xl border border-zinc-800 bg-zinc-950/40 p-4">
              <p className="text-sm font-medium text-white">Upload gallery images</p>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFiles(e.target.files)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-zinc-200"
              />
              <button
                type="button"
                onClick={() => uploadImages.mutate()}
                disabled={uploadImages.isPending}
                className="rounded-lg bg-zinc-100 px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-white disabled:opacity-50"
              >
                {uploadImages.isPending ? "Uploading…" : "Upload images"}
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-zinc-800 bg-zinc-950/30 p-4 text-sm text-zinc-500">
            Select a product to edit or upload images.
          </div>
        )}
      </div>
    </section>
  );
}

