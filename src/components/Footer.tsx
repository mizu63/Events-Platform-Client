
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">

        <div>
          <h2 className="text-2xl font-bold text-green-400 mb-4">
            EventConnect
          </h2>
          <p className="text-gray-400 leading-7">
            Bringing people together through meaningful events,
            community support, and social development.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
          <ul className="space-y-3 text-gray-400">
            <li><Link href="/" className="hover:text-green-400">Home</Link></li>
            <li><Link href="/events" className="hover:text-green-400">Upcoming Events</Link></li>
            <li><Link href="/create-event" className="hover:text-green-400">Create Event</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Our Services</h3>
          <ul className="space-y-3 text-gray-400">
            <li>Community Events</li>
            <li>Social Development</li>
            <li>Charity Programs</li>
            <li>Volunteer Activities</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
          <p className="text-gray-400 mb-2">Email: support@eventconnect.com</p>
          <p className="text-gray-400">Location: Bangladesh</p>
        </div>

      </div>

      <div className="border-t border-gray-700 py-5 text-center text-gray-400 text-sm">
       © 2026 EventConnect. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
