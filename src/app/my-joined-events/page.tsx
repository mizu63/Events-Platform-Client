
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
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

export default function Page() {
  const [joinedEvents, setJoinedEvents] = useState<JoinedEvent[]>([]);
  const [loading, setLoading] = useState(true);


  const handleLeaveEvent = async (eventId: string) => {
    try {
      const { data } = await authClient.token();

      if (!data?.token) {
        alert("Please login first");
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

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to leave event");
      }

      setJoinedEvents((previousEvents) =>
        previousEvents.filter((event) => event.eventId !== eventId)
      );

      alert("Successfully left the event!");
    } catch (error) {
      alert(error instanceof Error ? error.message : "Something went wrong");
    }
  };




  useEffect(() => {
    const fetchJoinedEvents = async () => {
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

        if (!response.ok) {
          throw new Error("Failed to fetch joined events");
        }

        // const result = await response.json();

        const result = await response.json();

        const sortedEvents = result.sort(
          (a: JoinedEvent, b: JoinedEvent) =>
            new Date(a.eventDate).getTime() -
            new Date(b.eventDate).getTime()
        );

        setJoinedEvents(sortedEvents);

      
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchJoinedEvents();
  }, []);

  if (loading) {
    return <div className="p-10 text-center">Loading...</div>;
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-bold text-slate-900">
          My Joined Events
        </h1>

        {joinedEvents.length === 0 ? (
          <p className="text-slate-600">
            You haven't joined any events yet.
          </p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {joinedEvents.map((event) => (
              <div
                key={event._id}
                className="overflow-hidden rounded-xl bg-white shadow-md"
              >
                {event.image ? (
                  <div className="relative h-52 w-full">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-52 items-center justify-center bg-slate-100 text-slate-400">
                    No Image Available
                  </div>
                )}

                <div className="space-y-3 p-5">
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700">
                    {event.eventType}
                  </span>

                  <h2 className="text-xl font-bold text-slate-900">
                    {event.title}
                  </h2>

                  <p className="text-slate-600">
                    {event.description}
                  </p>

                  <p>📍 {event.location}</p>
                  <p>📅 {event.eventDate || "Not provided"}</p>
                  <p>🕒 {event.eventTime || "Not provided"}</p>

                  <p className="border-t pt-3 text-sm text-slate-500">
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
                    className="w-full rounded-lg bg-red-600 py-2 font-semibold text-white transition hover:bg-red-700"
                  >
                    Leave Event
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
