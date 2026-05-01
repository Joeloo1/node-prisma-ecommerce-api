import { Link, NavLink, Outlet } from "react-router-dom";
import { AppErrorBoundary } from "./AppErrorBoundary";
import { useAuth } from "../context/AuthContext";

const navClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
    isActive
      ? "bg-zinc-800 text-white"
      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
  }`;

export function Layout() {
  const { token, user, logout } = useAuth();
  const isSignedIn = Boolean(token);
  const roles = user ? (user as unknown as { roles?: unknown }).roles : undefined;
  const isAdmin = isSignedIn && String(roles) === "ADMIN";

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link
            to="/"
            className="font-display text-lg font-semibold tracking-tight text-white"
          >
            Northline
          </Link>
          <nav className="flex flex-wrap items-center gap-1 sm:gap-2" aria-label="Main">
            <NavLink to="/products" className={navClass}>
              Shop
            </NavLink>
            <NavLink to="/about" className={navClass}>
              About
            </NavLink>
            {isSignedIn ? (
              <>
                <NavLink to="/cart" className={navClass}>
                  Cart
                </NavLink>
                <NavLink to="/orders" className={navClass}>
                  Orders
                </NavLink>
                <NavLink to="/account/profile" className={navClass}>
                  Account
                </NavLink>
                {isAdmin ? (
                  <NavLink to="/admin/products" className={navClass}>
                    Admin
                  </NavLink>
                ) : null}
                <button
                  type="button"
                  onClick={() => logout()}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                >
                  Sign out
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={navClass}>
                  Sign in
                </NavLink>
                <NavLink
                  to="/register"
                  className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                >
                  Join
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="mx-auto min-h-[50vh] w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
        <AppErrorBoundary>
          <Outlet />
        </AppErrorBoundary>
      </main>
      <footer className="border-t border-zinc-800 bg-zinc-950/80 py-8 text-sm text-zinc-500">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
          <p>Northline commerce demo · {new Date().getFullYear()}</p>
          <nav className="flex flex-wrap gap-4">
            <Link to="/" className="hover:text-zinc-300">
              Home
            </Link>
            <Link to="/products" className="hover:text-zinc-300">
              Shop
            </Link>
            <Link to="/about" className="hover:text-zinc-300">
              About
            </Link>
            {isSignedIn ? (
              <Link to="/account/profile" className="hover:text-zinc-300">
                Account
              </Link>
            ) : (
              <Link to="/login" className="hover:text-zinc-300">
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </footer>
    </div>
  );
}
