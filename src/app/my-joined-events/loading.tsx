export default function Loading() {
    return (
        <div className="min-h-screen bg-base-100 px-4 py-10">
            <div className="mx-auto max-w-7xl">
                {/* Page Title Skeleton */}
                <div className="mb-8">
                    <div className="h-8 w-56 animate-pulse rounded-lg bg-base-300"></div>
                    <div className="mt-3 h-4 w-72 animate-pulse rounded bg-base-300"></div>
                </div>

                {/* Event Cards Skeleton */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3, 4, 5, 6].map((item) => (
                        <div
                            key={item}
                            className="overflow-hidden rounded-xl border border-base-300"
                        >
                            <div className="h-52 w-full animate-pulse bg-base-300"></div>

                            <div className="space-y-3 p-5">
                                <div className="h-5 w-3/4 animate-pulse rounded bg-base-300"></div>
                                <div className="h-4 w-1/2 animate-pulse rounded bg-base-300"></div>
                                <div className="h-4 w-2/3 animate-pulse rounded bg-base-300"></div>
                                <div className="mt-4 h-10 w-full animate-pulse rounded-lg bg-base-300"></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}