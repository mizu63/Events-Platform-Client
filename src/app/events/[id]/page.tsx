"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { authClient } from "@/lib/auth-client";

type Event = {
  _id: string;
  title: string;
  eventType: string;
  location: string;
  eventDate: string;
  eventTime: string;
  description: string;
  image: string;
  creatorEmail: string;
};

type ToastType = "success" | "error";

type ToastData = {
  message: string;
  type: ToastType;
};

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);
  const [checkingJoined, setCheckingJoined] = useState(true);
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

  // Fetch Event Details
  useEffect(() => {
    const controller = new AbortController();

    const fetchEvent = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
         `${process.env.NEXT_PUBLIC_API_URL}/events/${id}`,
          { signal: controller.signal }
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Event not found"
              : "Failed to load event details"
          );
        }

        const data: Event = await response.json();
        setEvent(data);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") return;

        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    if (id) {
      fetchEvent();
    }

    return () => controller.abort();
  }, [id]);

  // Check Whether User Already Joined
  useEffect(() => {
    let active = true;

    const checkJoinedEvent = async () => {
      try {
        setCheckingJoined(true);

        const { data } = await authClient.token();

        if (!data?.token) {
          if (active) setAlreadyJoined(false);
          return;
        }

        const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/joined-events`,
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to check joined event");
        }

        const joinedEvents = await response.json();

        const isJoined = joinedEvents.some(
          (joinedEvent: { eventId: string }) =>
            joinedEvent.eventId === id
        );

        if (active) {
          setAlreadyJoined(isJoined);
        }
      } catch (err) {
        console.error("Failed to check joined event:", err);
      } finally {
        if (active) {
          setCheckingJoined(false);
        }
      }
    };

    if (id) {
      checkJoinedEvent();
    }

    return () => {
      active = false;
    };
  }, [id]);

  // Join Event
  const handleJoinEvent = async () => {
    if (joining || alreadyJoined) return;

    try {
      setJoining(true);

      const { data } = await authClient.token();

      if (!data?.token) {
        showToast("Please login first to join this event.", "error");
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/join-event`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify({
          eventId: id,
        }),
      });

      const result = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          result?.message || "Failed to join event. Please try again."
        );
      }

      setAlreadyJoined(true);
      showToast("Successfully joined the event!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Something went wrong",
        "error"
      );
    } finally {
      setJoining(false);
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-200">
        Loading event details...
      </div>
    );
  }

  // Error State
  if (error || !event) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
        <p className="text-red-500">{error || "Event not found"}</p>

        <Link
          href="/events"
          className="text-green-600 hover:text-green-700"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

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

      <div className="mx-auto max-w-4xl">
        <Link
          href="/events"
          className="mb-6 inline-block font-semibold text-green-600 transition hover:text-green-700"
        >
          ← Back to Events
        </Link>

        <div className="overflow-hidden rounded-2xl bg-white shadow-lg transition-colors duration-300 dark:bg-slate-900">
          {event.image ? (
            <div className="relative h-64 w-full bg-slate-100 dark:bg-slate-800 sm:h-96">
              <Image
                src={event.image}
                alt={event.title}
                fill
                sizes="(max-width: 768px) 100vw, 896px"
                className="object-contain"
              />
            </div>
          ) : (
            <div className="flex h-64 items-center justify-center bg-slate-100 text-slate-400 dark:bg-slate-800">
              No Image Available
            </div>
          )}

          <div className="space-y-5 p-6 sm:p-8">
            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900 dark:text-green-200">
              {event.eventType}
            </span>

            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              {event.title}
            </h1>

            <p className="leading-7 text-slate-600 dark:text-slate-300">
              {event.description}
            </p>

            <div className="space-y-3 border-t border-slate-200 pt-5 text-slate-700 dark:border-slate-700 dark:text-slate-300">
              <p>📍 Location: {event.location}</p>
              <p>📅 Date: {event.eventDate || "Not provided"}</p>
              <p>🕒 Time: {event.eventTime || "Not provided"}</p>
              <p>👤 Created by: {event.creatorEmail}</p>

              <button
                onClick={handleJoinEvent}
                disabled={joining || alreadyJoined || checkingJoined}
                className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {alreadyJoined
                  ? "Already Joined"
                  : checkingJoined
                    ? "Checking..."
                    : joining
                      ? "Joining..."
                      : "Join Event"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}