import { useEffect, useMemo, useState } from "react";
import { supabase } from "./lib/supabase";

export default function App() {
  const [loading, setLoading] = useState(true);
  const [sessionReady, setSessionReady] = useState(false);

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const isValid = useMemo(() => {
    if (password.length < 6) return false;
    if (password !== confirm) return false;
    return true;
  }, [password, confirm]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase.auth.getSession();

      if (error || !data.session) {
        setSessionReady(false);
        setError("Reset link is invalid or expired. Please request a new one.");
      } else {
        setSessionReady(true);
      }

      setLoading(false);
    };

    init();
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!sessionReady) {
      setError("No recovery session found. Please use the reset link again.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setError(error.message || "Failed to update password.");
        return;
      }

      setSuccess("Password updated successfully. You can now login.");
      setPassword("");
      setConfirm("");

      // Optional but recommended: clear recovery session
      await supabase.auth.signOut();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-linear-to-b from-background to-muted/40 px-4 py-10 items-center justify-center flex">
      {/* Mobile-first container */}
      <div className="mx-auto w-full max-w-md">
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 border-b p-4">
            <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <img
                src="./shajipaints_icon.png"
                alt="Logo"
                className="h-8 w-8 object-contain animate-pulse"
              />
            </div>

            <div className="flex-1">
              <h1 className="text-base font-bold leading-tight">
                Reset Password
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Securely update your account password
              </p>
            </div>

            {/* Spinner */}
            {loading ? (
              <div className="h-5 w-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            ) : (
              <div className="h-5 w-5" />
            )}
          </div>

          {/* Body */}
          <div className="p-4">
            {loading ? (
              <div className="py-10 text-center">
                <div className="mx-auto mb-3 h-8 w-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
                <p className="text-sm font-semibold">
                  Loading recovery session…
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Please wait a moment
                </p>

                {/* Skeleton */}
                <div className="mt-6 space-y-3">
                  <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                  <div className="h-10 w-full rounded-xl bg-muted animate-pulse" />
                  <div className="h-4 w-1/2 rounded bg-muted animate-pulse" />
                  <div className="h-10 w-full rounded-xl bg-muted animate-pulse" />
                </div>
              </div>
            ) : (
              <>
                {error && (
                  <div className="mb-4 rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm font-semibold text-destructive">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm font-semibold text-green-700">
                    {success}
                  </div>
                )}

                <form onSubmit={handleUpdatePassword} className="space-y-3">
                  <div>
                    <label className="text-sm font-semibold">
                      New Password
                    </label>
                    <input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      type="password"
                      placeholder="Minimum 6 characters"
                      autoComplete="new-password"
                      disabled={!sessionReady || saving}
                      className="mt-2 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    />
                  </div>

                  <div>
                    <label className="text-sm font-semibold">
                      Confirm Password
                    </label>
                    <input
                      value={confirm}
                      onChange={(e) => setConfirm(e.target.value)}
                      type="password"
                      placeholder="Re-enter password"
                      autoComplete="new-password"
                      disabled={!sessionReady || saving}
                      className="mt-2 w-full rounded-xl border bg-background px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-60"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={!isValid || saving || !sessionReady}
                    className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-extrabold text-primary-foreground shadow-sm transition active:scale-[0.99] disabled:opacity-50"
                  >
                    {saving ? "Updating…" : "Update Password"}
                  </button>

                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters.
                  </p>
                </form>

                {/* Go to Login Button */}
                <div className="mt-4">
                  <a
                    href="https://lms.shajipaints.com/login"
                    className="block w-full rounded-xl border bg-background px-4 py-3 text-center text-sm font-bold hover:bg-muted transition"
                  >
                    Go to Login
                  </a>
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          <div className="border-t px-4 py-3 text-center text-xs text-muted-foreground">
            Powered by Supabase Auth · Secure password recovery
          </div>
        </div>

        {/* Desktop spacing + little note */}
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Tip: Use a strong password (letters + numbers).
        </p>
      </div>
    </div>
  );
}
