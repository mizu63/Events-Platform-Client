
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
  image?: string;
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUpcomingEvents = async () => {
      try {
        const response = await fetch(
          "http://localhost:5000/upcoming-events"
        );

        if (!response.ok) {
          throw new Error("Failed to fetch upcoming events");
        }

        const data = await response.json();

        const today = new Date().toLocaleDateString("en-CA");

        const upcomingEvents = data
          .filter((event: Event) => event.eventDate >= today)
          .sort(
            (a: Event, b: Event) =>
              new Date(a.eventDate).getTime() -
              new Date(b.eventDate).getTime()
          )
          .slice(0, 6);

        setEvents(upcomingEvents);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchUpcomingEvents();
  }, []);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

      {/* Hero Banner */}
      <section className="bg-gradient-to-r from-green-700 to-emerald-500 px-5 py-24 text-center text-white">
        <div className="mx-auto max-w-4xl">
          <p className="mb-4 font-semibold tracking-widest">
            SOCIAL DEVELOPMENT EVENTS PLATFORM
          </p>

          <h1 className="text-4xl font-extrabold leading-tight md:text-6xl">
            Together We Can Make A Difference
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-green-50">
            Join community events, help people, protect nature,
            and build a better society together.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/events"
              className="rounded-lg bg-white px-7 py-3 font-bold text-green-700 transition hover:bg-green-50"
            >
              Explore Events
            </Link>

            <Link
              href="/create-event"
              className="rounded-lg border border-white px-7 py-3 font-bold text-white transition hover:bg-white hover:text-green-700"
            >
              Create Event
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <p className="font-semibold text-green-600">
            WHAT WE DO
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            Make A Positive Impact
          </h2>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-xl bg-white p-7 text-center shadow transition-colors dark:bg-slate-900">
            <div className="text-5xl">🌱</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Plantation
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Participate in tree plantation activities and
              help create a greener environment.
            </p>
          </div>

          <div className="rounded-xl bg-white p-7 text-center shadow transition-colors dark:bg-slate-900">
            <div className="text-5xl">🤝</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Community Support
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Connect with people and support communities
              through meaningful activities.
            </p>
          </div>

          <div className="rounded-xl bg-white p-7 text-center shadow transition-colors dark:bg-slate-900">
            <div className="text-5xl">❤️</div>
            <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">
              Charity
            </h3>
            <p className="mt-3 text-slate-600 dark:text-slate-300">
              Join charitable initiatives and contribute
              to positive social development.
            </p>
          </div>
        </div>
      </section>

      {/* Recent Upcoming Events */}
      <section className="bg-white px-5 py-16 transition-colors dark:bg-slate-900">
        <div className="mx-auto max-w-6xl">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-green-600">
                JOIN OUR COMMUNITY
              </p>

              <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                Upcoming Events
              </h2>
            </div>

            <Link
              href="/events"
              className="rounded-lg bg-green-600 px-5 py-3 font-semibold text-white hover:bg-green-700"
            >
              View All Events
            </Link>
          </div>

          {loading ? (
            <p className="py-10 text-center text-slate-500 dark:text-slate-400">
              Loading events...
            </p>
          ) : events.length === 0 ? (
            <p className="rounded-xl bg-slate-50 p-10 text-center text-slate-600 dark:bg-slate-800 dark:text-slate-300">
              No upcoming events available.
            </p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <div
                  key={event._id}
                  className="overflow-hidden rounded-xl bg-slate-50 shadow-md transition hover:-translate-y-1 hover:shadow-lg dark:bg-slate-800"
                >
                  <div className="relative h-52 w-full bg-slate-100 dark:bg-slate-700">
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
                    <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-700 dark:bg-green-900 dark:text-green-200">
                      {event.eventType}
                    </span>

                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                      {event.title}
                    </h3>

                    <p className="line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                      {event.description}
                    </p>

                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      📍 {event.location}
                    </p>

                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      📅 {event.eventDate}
                    </p>

                    <Link
                      href={`/events/${event._id}`}
                      className="block rounded-lg bg-green-600 py-3 text-center font-semibold text-white hover:bg-green-700"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Gallery Section */}
      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="mb-10 text-center">
          <p className="font-semibold text-green-600">
            OUR ACTIVITIES
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
            Community Gallery
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
          <div className="flex h-48 items-center justify-center rounded-xl bg-green-100 text-5xl dark:bg-green-950">
            🌳
          </div>

          <div className="flex h-48 items-center justify-center rounded-xl bg-blue-100 text-5xl dark:bg-blue-950">
            🤝
          </div>

          <div className="flex h-48 items-center justify-center rounded-xl bg-yellow-100 text-5xl dark:bg-yellow-950">
            ❤️
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-green-700 px-5 py-16 text-center text-white">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-3xl font-bold">
            Stay Connected With Us
          </h2>

          <p className="mt-4 text-green-100">
            Stay informed about upcoming community events
            and social development activities.
          </p>

          <div className="mx-auto mt-7 flex max-w-lg flex-col gap-3 sm:flex-row">
            <input
              type="email"
              placeholder="Enter your email address"
              className="min-w-0 flex-1 rounded-lg bg-white px-4 py-3 text-slate-900 outline-none"
            />

            <button
              type="button"
              className="rounded-lg bg-yellow-400 px-6 py-3 font-bold text-green-900 hover:bg-yellow-300"
            >
              Subscribe
            </button>
          </div>

          <p className="mt-3 text-xs text-green-100">
            Newsletter design preview. Subscription is not enabled.
          </p>
        </div>
      </section>

    </main>
  );
}
