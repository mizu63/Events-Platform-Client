
"use client";

import { authClient } from "@/lib/auth-client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CheckCircle2, XCircle } from "lucide-react";

type Event = {
  _id: string;
  title: string;
  description: string;
  eventType: string;
  location: string;
  eventDate: string;
  eventTime: string;
  image?: string;
};

type ToastType = "success" | "error";

type ToastData = {
  message: string;
  type: ToastType;
};

export default function Page() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [updating, setUpdating] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Show Toast
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

  // Fetch My Events
  useEffect(() => {
    const getMyEvents = async () => {
      try {
        const { data: tokenData } = await authClient.token();

        if (!tokenData?.token) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/my-events`, {
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch your events");
        }

        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error(error);
        showToast(
          error instanceof Error ? error.message : "Something went wrong",
          "error"
        );
      } finally {
        setLoading(false);
      }
    };

    getMyEvents();
  }, []);

  // Update Event
  const handleUpdateEvent = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    const form = e.currentTarget;

    if (!selectedEvent) return;

    try {
      setUpdating(true);

      const formData = new FormData(form);

      const updatedData = {
        title: String(formData.get("title") || ""),
        description: String(formData.get("description") || ""),
        eventType: String(formData.get("eventType") || ""),
        location: String(formData.get("location") || ""),
        eventDate: String(formData.get("eventDate") || ""),
        eventTime: String(formData.get("eventTime") || ""),
      };

      // Event Date Validation
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(
        `${updatedData.eventDate}T00:00:00`
      );

      if (!updatedData.eventDate || selectedDate < today) {
        showToast("Please select today or a future date.", "error");
        return;
      }

      const { data: tokenData } = await authClient.token();

      if (!tokenData?.token) {
        showToast("Please login first.", "error");
        return;
      }

      const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/my-events/${selectedEvent._id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.token}`,
          },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update event");
      }

      setEvents((previousEvents) =>
        previousEvents.map((event) =>
          event._id === selectedEvent._id
            ? { ...event, ...updatedData }
            : event
        )
      );

      setSelectedEvent(null);
      showToast("Event updated successfully!", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Something went wrong",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  // Delete Event
  const handleDeleteEvent = async (eventId: string) => {
  
    try {
      const { data: tokenData } = await authClient.token();

      if (!tokenData?.token) {
        showToast("Please login first.", "error");
        return;
      }

      const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/my-events/${eventId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${tokenData.token}`,
          },
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete event");
      }

      setEvents((previousEvents) =>
        previousEvents.filter((event) => event._id !== eventId)
      );

      showToast("Event deleted successfully!", "success");
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Something went wrong",
        "error"
      );
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 transition-colors duration-300 dark:bg-slate-950">
        <p className="text-lg font-semibold text-slate-600 dark:text-slate-300">
          Loading your events...
        </p>
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
          className="fixed right-5 top-5 z-[100] max-w-sm"
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
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
            My Events
          </h1>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage and explore the events you have created.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow-sm transition-colors dark:bg-slate-900">
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              No Events Found
            </h2>

            <p className="mt-2 text-slate-500 dark:text-slate-400">
              You haven't created any events yet.
            </p>

            <Link
              href="/create-event"
              className="mt-6 inline-block rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="overflow-hidden rounded-xl bg-white shadow-md transition duration-300 hover:-translate-y-1 hover:shadow-xl dark:bg-slate-900"
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
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900 dark:text-green-200">
                    {event.eventType || "Event"}
                  </span>

                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {event.title}
                  </h2>

                  <p className="line-clamp-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                    {event.description}
                  </p>

                  <div className="space-y-2 border-t border-slate-200 pt-3 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300">
                    <p>📍 {event.location || "Not provided"}</p>
                    <p>📅 {event.eventDate || "Not provided"}</p>
                    <p>🕒 {event.eventTime || "Not provided"}</p>
                  </div>

                  <Link
                    href={`/events/${event._id}`}
                    className="block rounded-lg bg-green-600 py-3 text-center font-semibold text-white transition hover:bg-green-700"
                  >
                    View Details
                  </Link>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="flex-1 rounded-lg bg-blue-600 py-2.5 font-semibold text-white transition hover:bg-blue-700"
                    >
                      Update
                    </button>

                    <button
                      onClick={() => handleDeleteEvent(event._id)}
                      className="flex-1 rounded-lg bg-red-600 py-2.5 font-semibold text-white transition hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Update Event Dialog */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
          <div className="my-8 w-full max-w-lg rounded-xl bg-white p-6 text-slate-900 shadow-xl transition-colors duration-300 dark:bg-slate-900 dark:text-slate-100">
            <h2 className="mb-6 text-2xl font-bold text-slate-900 dark:text-white">
              Update Event
            </h2>

            <form onSubmit={handleUpdateEvent} className="space-y-4">
              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
                  Event Title
                </label>

                <input
                  name="title"
                  defaultValue={selectedEvent.title}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
                  Event Type
                </label>

                <input
                  name="eventType"
                  defaultValue={selectedEvent.eventType}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
                  Location
                </label>

                <input
                  name="location"
                  defaultValue={selectedEvent.location}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
                  Event Date
                </label>

                <input
                  type="date"
                  name="eventDate"
                  defaultValue={selectedEvent.eventDate}
                  min={new Date().toLocaleDateString("en-CA")}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
                  Event Time
                </label>

                <input
                  type="time"
                  name="eventTime"
                  defaultValue={selectedEvent.eventTime}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="mb-1 block font-medium text-slate-700 dark:text-slate-200">
                  Description
                </label>

                <textarea
                  name="description"
                  defaultValue={selectedEvent.description}
                  required
                  rows={4}
                  className="w-full rounded-lg border border-slate-300 bg-white p-3 text-slate-900 outline-none focus:border-blue-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEvent(null)}
                  disabled={updating}
                  className="flex-1 rounded-lg border border-slate-300 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={updating}
                  className="flex-1 rounded-lg bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                >
                  {updating ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
