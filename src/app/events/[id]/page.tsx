
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
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

export default function EventDetailsPage() {
  const params = useParams();
  const id = params.id as string;

  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [joining, setJoining] = useState(false);
  const [alreadyJoined, setAlreadyJoined] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch(
          `http://localhost:5000/events/${id}`
        );

        if (!response.ok) {
          throw new Error("Event not found");
        }

        const data = await response.json();
        setEvent(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchEvent();
  }, [id]);

  useEffect(() => {
    const checkJoinedEvent = async () => {
      try {
        const { data } = await authClient.token();

        if (!data?.token) return;

        const response = await fetch(
          "http://localhost:5000/joined-events",
          {
            headers: {
              Authorization: `Bearer ${data.token}`,
            },
          }
        );

        if (!response.ok) return;

        const joinedEvents = await response.json();

        const isJoined = joinedEvents.some(
          (joinedEvent: { eventId: string }) =>
            joinedEvent.eventId === id
        );

        setAlreadyJoined(isJoined);
      } catch (error) {
        console.error("Failed to check joined event:", error);
      }
    };

    if (id) checkJoinedEvent();
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-700 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-200">
        Loading event details...
      </div>
    );
  }

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

  const handleJoinEvent = async () => {
    try {
      setJoining(true);

      const { data } = await authClient.token();

      const response = await fetch("http://localhost:5000/join-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data?.token}`,
        },
        body: JSON.stringify({
          eventId: id,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to join event");
      }

      alert("Successfully joined the event!");
      setAlreadyJoined(true);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setJoining(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">
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
                disabled={joining || alreadyJoined}
                className="w-full rounded-lg bg-green-600 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {alreadyJoined
                  ? "Already Joined"
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
