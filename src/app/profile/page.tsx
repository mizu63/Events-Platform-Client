
"use client";

import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { User, Mail, Camera, Save, Loader2 } from "lucide-react";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();

  const [name, setName] = useState("");
  const [image, setImage] = useState("");
  const [initialized, setInitialized] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState("");

  // Load current user information
  if (session && !initialized) {
    setName(session.user.name || "");
    setImage(session.user.image || "");
    setInitialized(true);
  }

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!name.trim()) {
      setToast("Name is required!");
      return;
    }

    setLoading(true);
    setToast("");

    try {
      const result = await authClient.updateUser({
        name: name.trim(),
        image: image.trim() || null,
      });

      if (result.error) {
        setToast(result.error.message || "Profile update failed!");
      } else {
        setToast("Profile updated successfully!");
      }
    } catch (error) {
      setToast("Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-5 dark:bg-slate-950">
        <div className="rounded-xl bg-white p-8 text-center shadow dark:bg-slate-900">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Please Login
          </h2>
          <p className="mt-3 text-slate-600 dark:text-slate-300">
            You need to login to view your profile.
          </p>
          <a
            href="/login"
            className="mt-5 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-5 py-16 dark:bg-slate-950">
      <div className="mx-auto max-w-2xl">

        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Profile
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            View and update your profile information.
          </p>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-lg dark:bg-slate-900 md:p-8">

          {/* Profile Image */}
          <div className="mb-8 flex flex-col items-center">
            {image ? (
              <img
                src={image}
                alt="Profile"
                className="h-28 w-28 rounded-full border-4 border-green-100 object-cover dark:border-green-900"
              />
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200">
                <User size={48} />
              </div>
            )}

            <h2 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              {session.user.name}
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {session.user.email}
            </p>
          </div>

          {/* Update Form */}
          <form onSubmit={handleUpdate} className="space-y-5">

            <div>
              <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <User size={18} />
                Full Name
              </label>

              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Enter your name"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <Mail size={18} />
                Email Address
              </label>

              <input
                type="email"
                value={session.user.email}
                readOnly
                className="w-full cursor-not-allowed rounded-lg border border-slate-300 bg-slate-100 px-4 py-3 text-slate-500 outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400"
              />
            </div>

            <div>
              <label className="mb-2 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200">
                <Camera size={18} />
                Profile Image URL
              </label>

              <input
                type="url"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none focus:border-green-600 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="Enter profile image URL"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Updating...
                </>
              ) : (
                <>
                  <Save size={20} />
                  Update Profile
                </>
              )}
            </button>
          </form>

          {/* Toast */}
          {toast && (
            <div
              className={`mt-5 rounded-lg p-4 text-center font-medium ${
                toast.includes("successfully")
                  ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-200"
                  : "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-200"
              }`}
            >
              {toast}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
