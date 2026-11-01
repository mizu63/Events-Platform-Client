"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type JoinedEvent = {
  _id: string;
  eventId: string;
  joinedAt: string;
  title: string;
  eventType: string;
  location: string;
  eventDate: string;
  eventTime: string;
  description: string;
  image?: string;
};

type ToastType = "success" | "error";

type ToastData = {
  message: string;
  type: ToastType;
};

export default function Page() {
  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [leavingEventId, setLeavingEventId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastData | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Toast Notification
  const showToast = (message: string, type: ToastType) => {
    if (toastTimer.current) {
      clearTimeout(toastTimer.current);
    }

    setToast({ message, type });

    toastTimer.current = setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3000);
  };

  // Clear Toast Timer
  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }
    };
  }, []);

  // Fetch Joined Events
  useEffect(() => {
    const controller = new AbortController();

    const fetchJoinedEvents = async () => {
      try {
        setLoading(true);

        const { data } = await authClient.token();

        if (!data?.token) {
          setJoinedEvents([]);
          return;
        }

        const response = await fetch(
          "http://localhost:5000/joined-events",
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
            signal: controller.signal,
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch joined events");
        }

        const result: JoinedEvent[] = await response.json();

        const sortedEvents = [...result].sort(
          (a, b) =>
            new Date(a.eventDate).getTime() -
            new Date(b.eventDate).getTime()
        );

        setJoinedEvents(sortedEvents);
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") return;

        console.error("Failed to fetch joined events:", error);
        showToast(
          error instanceof Error
            ? error.message
            : "Something went wrong",
          "error"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    fetchJoinedEvents();

    return () => controller.abort();
  }, []);

  // Leave Event
  const handleLeaveEvent = async (eventId: string) => {
    if (leavingEventId) return;

    try {
      setLeavingEventId(eventId);

      const { data } = await authClient.token();

      if (!data?.token) {
        showToast("Please login first.", "error");
        return;
      }

      const response = await fetch(
        `http://localhost:5000/leave-event/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${data.token}`,
          },
        }
      );

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to leave event"
        );
      }

      setJoinedEvents((previousEvents) =>
        previousEvents.filter((event) => event.eventId !== eventId)
      );

      showToast("Successfully left the event!", "success");
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : "Something went wrong",
        "error"
      );
    } finally {
      setLeavingEventId(null);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-white">
        <p className="text-lg font-medium">Loading...</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      {/* Toast Notification */}
      {toast && (
        <div
          role="alert"
          aria-live="polite"
          className="fixed right-5 top-5 z-50"
        >
          <div
            className={`flex items-center gap-3 rounded-xl px-5 py-4 text-white shadow-lg ${
              toast.type === "success"
                ? "bg-green-600"
                : "bg-red-600"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 size={22} />
            ) : (
              <XCircle size={22} />
            )}

            <p className="font-medium">{toast.message}</p>

            <button
              type="button"
              onClick={() => {
                if (toastTimer.current) {
                  clearTimeout(toastTimer.current);
                  toastTimer.current = null;
                }

                setToast(null);
              }}
              aria-label="Close notification"
              className="ml-2 text-xl leading-none hover:opacity-75"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900 dark:text-white">
          My Joined Events
        </h1>

        {joinedEvents.length === 0 ? (
          <p className="text-slate-600 dark:text-slate-400">
            You haven't joined any events yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {joinedEvents.map((event) => (
              <div
                key={event._id}
                className="overflow-hidden rounded-xl bg-white shadow-md transition-colors duration-300 dark:bg-slate-900"
              >
                {event.image ? (
                  <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-800">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-52 items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
                    No Image Available
                  </div>
                )}

                <div className="space-y-3 p-5">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900 dark:text-green-200">
                    {event.eventType}
                  </span>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </h2>

                  <p className="text-slate-600 dark:text-slate-300">
                    {event.description}
                  </p>

                  <p className="text-slate-700 dark:text-slate-300">
                    📍 {event.location}
                  </p>

                  <p className="text-slate-700 dark:text-slate-300">
                    📅 {event.eventDate || "Not provided"}
                  </p>

                  <p className="text-slate-700 dark:text-slate-300">
                    🕒 {event.eventTime || "Not provided"}
                  </p>

                  <p className="border-t border-slate-200 pt-3 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
                    Joined: {new Date(event.joinedAt).toLocaleString()}
                  </p>

                  <Link
                    href={`/events/${event.eventId}`}
                    className="block rounded-lg bg-green-600 py-2 text-center font-semibold text-white transition hover:bg-green-700"
                  >
                    View Details
                  </Link>

                  <button
                    onClick={() => handleLeaveEvent(event.eventId)}
                    disabled={leavingEventId !== null}
                    className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {leavingEventId === event.eventId
                      ? "Leaving..."
                      : "Leave Event"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}