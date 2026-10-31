
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

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

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("http://localhost:5000/events");

        if (!response.ok) {
          throw new Error("Failed to fetch events");
        }

        const data = await response.json();
        // setEvents(data);
        const today = new Date().toLocaleDateString("en-CA");

        const upcomingEvents = data.filter(
          (event: Event) => event.eventDate >= today
        );

        setEvents(upcomingEvents);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Something went wrong"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-lg font-medium">Loading events...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10 text-center">
          <p className="font-semibold text-green-600">
            MAKE A DIFFERENCE
          </p>

          <h1 className="mt-2 text-3xl font-bold text-slate-900 md:text-4xl">
            Explore All Events
          </h1>

          <p className="mt-3 text-slate-500">
            Discover events and join hands to make a positive change.
          </p>
        </div>

        {events.length === 0 ? (
          <div className="rounded-xl bg-white p-10 text-center shadow">
            <h2 className="text-xl font-semibold">
              No Events Found
            </h2>
            <p className="mt-2 text-slate-500">
              Be the first to create a community event!
            </p>

            <Link
              href="/create-event"
              className="mt-5 inline-block rounded-lg bg-green-600 px-5 py-3 text-white hover:bg-green-700"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((event) => (
              <div
                key={event._id}
                className="overflow-hidden rounded-2xl bg-white shadow-md transition hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="relative h-52 w-full bg-slate-100">
                  {event.image ? (
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-slate-400">
                      No Image Available
                    </div>
                  )}
                </div>

                <div className="space-y-3 p-5">
                  <span className="inline-block rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                    {event.eventType}
                  </span>

                  <h2 className="text-xl font-bold text-slate-900">
                    {event.title}
                  </h2>

                  <p className="line-clamp-2 text-sm text-slate-500">
                    {event.description}
                  </p>

                  <div className="space-y-2 border-t pt-3 text-sm text-slate-600">
                    <p>📍 {event.location}</p>
                    <p>📅 {event.eventDate}</p>
                    <p>🕒 {event.eventTime}</p>
                  </div>

                  <Link
                    href={`/events/${event._id}`}
                    className="block rounded-lg bg-green-600 py-2.5 text-center font-semibold text-white transition hover:bg-green-700"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
