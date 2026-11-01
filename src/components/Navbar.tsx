
"use client";

import Link from "next/link";
import { useState, Suspense } from "react";
import { usePathname } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import ThemeToggle from "@/components/ThemeToggle";

const NavbarContent = () => {
    const [menuOpen, setMenuOpen] = useState(false);
    const [profileOpen, setProfileOpen] = useState(false);

    const pathname = usePathname();
    const { data: session, isPending } = authClient.useSession();

    const handleLogout = async () => {
        await authClient.signOut();
        setProfileOpen(false);
        setMenuOpen(false);
    };

    const navLinkClass = (path: string) =>
        `transition-all duration-200 font-medium ${pathname === path
            ? "text-green-700 dark:text-green-400"
            : "text-gray-600 hover:text-green-700 dark:text-gray-300 dark:hover:text-green-400"
        }`;

    return (
        <header className="sticky top-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 shadow-sm transition-colors">
            <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="h-20 flex items-center justify-between">

                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2 group">
                        <div className="w-11 h-11 rounded-xl bg-green-600 flex items-center justify-center text-white text-2xl shadow-md shadow-green-200 group-hover:bg-green-700 transition">
                            ✦
                        </div>

                        <div>
                            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                                Event<span className="text-green-600">Connect</span>
                            </h1>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 tracking-wider">
                                TOGETHER WE MAKE A DIFFERENCE
                            </p>
                        </div>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="/" className={navLinkClass("/")}>
                            Home
                        </Link>

                        <Link href="/events" className={navLinkClass("/events")}>
                            Upcoming Events
                        </Link>

                        {!isPending && (
                            <>
                                {session ? (
                                    <div
                                        className="relative"
                                        onMouseEnter={() => setProfileOpen(true)}
                                        onMouseLeave={() => setProfileOpen(false)}
                                    >
                                        <button
                                            onClick={() => setProfileOpen(!profileOpen)}
                                            aria-expanded={profileOpen}
                                            className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-green-50 dark:hover:bg-gray-800 transition"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 border-2 border-green-200 dark:border-green-700 flex items-center justify-center text-green-700 dark:text-green-300 font-bold text-lg">
                                                {session.user.name?.charAt(0)?.toUpperCase() || "U"}
                                            </div>

                                            <div className="text-left">
                                                <p className="text-sm font-semibold text-gray-800 dark:text-white">
                                                    {session.user.name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                                    My Account
                                                </p>
                                            </div>

                                            <span className="text-gray-500 dark:text-gray-400 text-xs">
                                                {profileOpen ? "▲" : "▼"}
                                            </span>
                                        </button>

                                        {profileOpen && (
                                            <div className="absolute right-0 top-full mt-3 w-60 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 py-3 overflow-hidden">
                                                <div className="px-4 pb-3 border-b border-gray-100 dark:border-gray-700">
                                                    <p className="font-semibold text-gray-800 dark:text-white">
                                                        {session.user.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                        {session.user.email}
                                                    </p>
                                                </div>
                                                <Link
                                                    href="/profile"
                                                    onClick={() => setProfileOpen(false)}
                                                    className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700 transition"
                                                >
                                                    👤 My Profile
                                                </Link>

                                                <div className="p-2 space-y-1">
                                                    <Link href="/create-event" onClick={() => setProfileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700 transition">
                                                        ✚ Create Event
                                                    </Link>

                                                    <Link href="/my-events" onClick={() => setProfileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700 transition">
                                                        ◈ Manage Events
                                                    </Link>

                                                    <Link href="/my-joined-events" onClick={() => setProfileOpen(false)} className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700 transition">
                                                        ♡ Joined Events
                                                    </Link>
                                                </div>

                                                <div className="border-t border-gray-100 dark:border-gray-700 p-2">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950 transition"
                                                    >
                                                        ↪ Logout
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Link
                                        href="/login"
                                        className="bg-green-600 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-green-200 hover:bg-green-700 hover:-translate-y-0.5 transition-all duration-200"
                                    >
                                        Login / Join Us
                                    </Link>
                                )}
                            </>
                        )}

                        {/* Theme Toggle */}
                        <ThemeToggle />
                    </div>

                    {/* Mobile Controls */}
                    <div className="flex items-center gap-3 md:hidden">
                        <ThemeToggle />

                        <button
                            onClick={() => setMenuOpen(!menuOpen)}
                            className="w-11 h-11 rounded-xl bg-green-50 dark:bg-gray-800 text-green-700 dark:text-green-400 text-2xl flex items-center justify-center hover:bg-green-100 dark:hover:bg-gray-700 transition"
                            aria-label="Toggle menu"
                            aria-expanded={menuOpen}
                        >
                            {menuOpen ? "✕" : "☰"}
                        </button>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {menuOpen && (
                    <div className="md:hidden border-t border-gray-100 dark:border-gray-800 py-5 space-y-3">
                        <Link
                            href="/"
                            onClick={() => setMenuOpen(false)}
                            className={`block px-4 py-3 rounded-xl ${navLinkClass("/")} hover:bg-green-50 dark:hover:bg-gray-800`}
                        >
                            Home
                        </Link>

                        <Link
                            href="/events"
                            onClick={() => setMenuOpen(false)}
                            className={`block px-4 py-3 rounded-xl ${navLinkClass("/events")} hover:bg-green-50 dark:hover:bg-gray-800`}
                        >
                            Upcoming Events
                        </Link>

                        {!isPending && (
                            <>
                                {session ? (
                                    <>
                                        <div className="px-4 py-3 bg-green-50 dark:bg-gray-800 rounded-xl">
                                            <p className="font-semibold text-green-800 dark:text-green-300">
                                                {session.user.name}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {session.user.email}
                                            </p>
                                        </div>
                                        <Link
                                            href="/profile"
                                            onClick={() => setMenuOpen(false)}
                                            className="block px-3 py-2.5 rounded-lg text-sm text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800 hover:text-green-700 transition"
                                        >
                                            👤 My Profile
                                        </Link>

                                        <Link href="/create-event" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800">
                                            ✚ Create Event
                                        </Link>

                                        <Link href="/my-events" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800">
                                            ◈ Manage Events
                                        </Link>

                                        <Link href="/my-joined-events" onClick={() => setMenuOpen(false)} className="block px-4 py-3 rounded-xl text-gray-700 dark:text-gray-200 hover:bg-green-50 dark:hover:bg-gray-800">
                                            ♡ Joined Events
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-3 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                        >
                                            ↪ Logout
                                        </button>
                                    </>
                                ) : (
                                    <Link
                                        href="/login"
                                        onClick={() => setMenuOpen(false)}
                                        className="block text-center bg-green-600 text-white px-5 py-3 rounded-xl font-semibold"
                                    >
                                        Login / Join Us
                                    </Link>
                                )}
                            </>
                        )}
                    </div>
                )}
            </nav>
        </header>
    );
};

export default function Navbar() {
    return (
        <Suspense fallback={<div className="h-20" />}>
            <NavbarContent />
        </Suspense>
    );
}
