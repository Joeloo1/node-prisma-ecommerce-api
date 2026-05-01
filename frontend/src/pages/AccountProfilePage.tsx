import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ApiError, apiFetch } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import type { User } from "../lib/types";

function getProfileImageUrl(image?: string): string | null {
  if (!image) return null;
  if (image.startsWith("http")) return image;

  const base = import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "";
  // When VITE_API_URL is unset in dev, keep it relative so Vite proxy can serve `/public/*`.
  return `${base}/public/users/${image}`;
}

function safeUserFields(user: User) {
  const u = user as Record<string, unknown>;
  return {
    id: String(u.id ?? ""),
    name: String(u.name ?? ""),
    email: String(u.email ?? ""),
    roles: u.roles != null ? String(u.roles as string | object) : "—",
    phoneNumber: u.phoneNumber != null ? String(u.phoneNumber) : null,
    profileImage: u.profileImage != null ? String(u.profileImage) : undefined,
  };
}

export function AccountProfilePage() {
  const { user, isLoading: profileLoading, profileError } = useAuth();
  const queryClient = useQueryClient();

  const safe = useMemo(() => (user ? safeUserFields(user as User) : null), [user]);
  const isAdmin = safe?.roles === "ADMIN";

  const [profileName, setProfileName] = useState("");
  const [profileEmail, setProfileEmail] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileErrorText, setProfileErrorText] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!safe) return;
    setProfileName(safe.name ?? "");
    setProfileEmail(safe.email ?? "");
    setProfilePhone(safe.phoneNumber ?? "");
  }, [safe?.id, safe?.name, safe?.email, safe?.phoneNumber]);

  const updateProfile = useMutation({
    mutationFn: async () => {
      const payload: Record<string, string> = {};
      if (profileName.trim()) payload.name = profileName.trim();
      if (profileEmail.trim()) payload.email = profileEmail.trim();
      if (profilePhone.trim()) payload.phoneNumber = profilePhone.trim();

      if (profileImageFile) {
        const body = new FormData();
        if (payload.name) body.append("name", payload.name);
        if (payload.email) body.append("email", payload.email);
        if (payload.phoneNumber) body.append("phoneNumber", payload.phoneNumber);
        body.append("profileImage", profileImageFile);
        await apiFetch("/api/v1/users/updateMe", {
          method: "PATCH",
          auth: true,
          body,
        });
        return;
      }

      await apiFetch("/api/v1/users/updateMe", {
        method: "PATCH",
        auth: true,
        body: JSON.stringify(payload),
      });
    },
    onSuccess: async () => {
      setProfileErrorText(null);
      setProfileSuccess("Profile updated successfully.");
      setProfileImageFile(null);
      await queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: (e) => {
      setProfileSuccess(null);
      setProfileErrorText(
        e instanceof ApiError ? e.message : "Could not update profile",
      );
    },
  });

  function onUpdateProfile(e: FormEvent) {
    e.preventDefault();
    setProfileErrorText(null);
    setProfileSuccess(null);
    updateProfile.mutate();
  }

  return (
    <section className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6">
      <h2 className="font-display text-lg font-semibold text-white">Profile</h2>

      {profileError ? (
        <div className="mt-4 rounded-xl border border-amber-900/40 bg-amber-950/20 p-4 text-amber-100/90">
          <p className="text-sm">{profileError}</p>
          <p className="mt-2 text-sm text-zinc-400">
            Try signing out and back in. If your session expired, the API will
            reject requests until you log in again.
          </p>
        </div>
      ) : profileLoading ? (
        <p className="mt-4 text-sm text-zinc-500">Loading…</p>
      ) : safe ? (
        <>
          <div className="mt-4 flex items-center gap-4">
            {getProfileImageUrl(safe.profileImage) ? (
              <img
                src={getProfileImageUrl(safe.profileImage)!}
                alt="Profile"
                className="size-16 rounded-full border border-zinc-700 object-cover"
              />
            ) : (
              <div className="flex size-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-lg font-semibold text-zinc-200">
                {(safe.name || "U").charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <p className="text-sm text-zinc-300">Profile photo</p>
              <p className="text-xs text-zinc-500">
                Upload JPG/PNG. We resize to 500×500 JPEG.
              </p>
            </div>
          </div>

          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-zinc-500">Name</dt>
              <dd className="text-white">{safe.name || "—"}</dd>
            </div>
            <div>
              <dt className="text-zinc-500">Email</dt>
              <dd className="text-white">{safe.email || "—"}</dd>
            </div>
            {isAdmin ? (
              <div>
                <dt className="text-zinc-500">Role</dt>
                <dd className="text-white">{safe.roles}</dd>
              </div>
            ) : null}
            {safe.phoneNumber ? (
              <div>
                <dt className="text-zinc-500">Phone</dt>
                <dd className="text-white">{safe.phoneNumber}</dd>
              </div>
            ) : null}
          </dl>

          <form
            onSubmit={onUpdateProfile}
            className="mt-8 space-y-3 border-t border-zinc-800 pt-8"
          >
            <h3 className="text-sm font-medium text-white">Update profile</h3>
            {profileErrorText ? (
              <p className="text-sm text-red-400">{profileErrorText}</p>
            ) : null}
            {profileSuccess ? (
              <p className="text-sm text-emerald-400">{profileSuccess}</p>
            ) : null}

            <input
              required
              minLength={2}
              placeholder="Name"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={profileEmail}
              onChange={(e) => setProfileEmail(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            />
            <input
              placeholder="Phone (optional)"
              value={profilePhone}
              onChange={(e) => setProfilePhone(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-white"
            />
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImageFile(e.target.files?.[0] ?? null)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-3 py-2 text-sm text-zinc-200 file:mr-3 file:rounded-md file:border-0 file:bg-zinc-800 file:px-3 file:py-1.5 file:text-zinc-200"
            />

            <button
              type="submit"
              disabled={updateProfile.isPending}
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
            >
              {updateProfile.isPending ? "Updating…" : "Save profile"}
            </button>
          </form>
        </>
      ) : (
        <p className="mt-4 text-sm text-zinc-400">
          No profile data is available yet. Try refreshing the page or signing
          out and back in.
        </p>
      )}
    </section>
  );
}

