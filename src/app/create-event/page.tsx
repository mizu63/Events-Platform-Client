
"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { authClient } from "@/lib/auth-client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";
import { CheckCircle2, XCircle } from "lucide-react";

type ToastType = "success" | "error";

type ToastData = {
  message: string;
  type: ToastType;
};

export default function Page() {
  const router = useRouter();

  const [eventType, setEventType] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

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

  // Tomorrow's Date
  const getTomorrowDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const year = tomorrow.getFullYear();
    const month = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const day = String(tomorrow.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (toastTimer.current) {
        clearTimeout(toastTimer.current);
      }

      if (redirectTimer.current) {
        clearTimeout(redirectTimer.current);
      }
    };
  }, []);

  // Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      e.target.value = "";
      return;
    }

    if (preview) {
      URL.revokeObjectURL(preview);
    }

    const imagePreview = URL.createObjectURL(file);

    setImage(file);
    setPreview(imagePreview);
    setError("");
  };

  // Image Upload
  const handleUploadImage = async () => {
    if (!image) {
      throw new Error("Please select an event image.");
    }

    const { data: tokenData, error: tokenError } =
      await authClient.token();

    if (tokenError || !tokenData?.token) {
      throw new Error("Unable to get authentication token.");
    }

    const formData = new FormData();
    formData.append("image", image);

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/upload-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: formData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Image upload failed.");
    }

    if (!result.imageUrl) {
      throw new Error("Image URL was not returned by the server.");
    }

    return result.imageUrl;
  };

  // Remove Image
  const handleRemoveImage = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }

    setImage(null);
    setPreview("");
    setError("");

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Create Event
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      setLoading(true);

      if (!eventType) {
        throw new Error("Please select an event type.");
      }

      if (!image) {
        throw new Error("Please select an event image.");
      }

      const title = String(formData.get("title") || "").trim();
      const location = String(formData.get("location") || "").trim();
      const eventDate = String(formData.get("eventDate") || "");
      const eventTime = String(formData.get("eventTime") || "");
      const description = String(formData.get("description") || "").trim();

      if (!title || !location || !eventDate || !eventTime || !description) {
        throw new Error("Please fill in all fields.");
      }

      // Future Date Validation
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const selectedDate = new Date(`${eventDate}T00:00:00`);

      if (
        !eventDate ||
        isNaN(selectedDate.getTime()) ||
        selectedDate <= today
      ) {
        throw new Error("Please select a future event date.");
      }

      // Authentication
      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Please login first.");
      }

      // Upload Image
      const imageUrl = await handleUploadImage();

      // Event Data
      const eventData = {
        title,
        eventType,
        location,
        eventDate,
        eventTime,
        description,
        image: imageUrl,
      };

      // API Request
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/events`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${tokenData.token}`,
          },
          body: JSON.stringify(eventData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create event.");
      }

      // Success
      showToast("Event created successfully!", "success");

      form.reset();
      setEventType("");
      handleRemoveImage();

      // Redirect
      redirectTimer.current = setTimeout(() => {
       router.push("/events");
      }, 1500);
    } catch (err) {
      console.error(err);

      const message =
        err instanceof Error ? err.message : "Something went wrong.";

      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
    }
  };

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
              toast.type === "success" ? "bg-green-600" : "bg-red-600"
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
              aria-label="Close notification"
              onClick={() => {
                if (toastTimer.current) {
                  clearTimeout(toastTimer.current);
                  toastTimer.current = null;
                }

                setToast(null);
              }}
              className="ml-2 text-xl leading-none hover:opacity-75"
            >
              ×
            </button>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 font-semibold text-green-600">
            MAKE A DIFFERENCE
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white md:text-4xl">
            Create a New Event
          </h1>

          <p className="mt-3 text-slate-500 dark:text-slate-400">
            Bring people together and create positive change in your community.
          </p>
        </div>

        <Card className="border border-slate-200 bg-white text-slate-900 shadow-lg transition-colors dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          <CardHeader className="border-b border-slate-200 pb-5 dark:border-slate-700">
            <CardTitle className="text-xl text-slate-900 dark:text-white">
              Event Information
            </CardTitle>

            <CardDescription className="text-slate-500 dark:text-slate-400">
              Fill in the details to publish your community event.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">

              {/* Event Title */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Event Title
                </label>

                <Input
                  name="title"
                  placeholder="e.g. Tree Plantation Program"
                  required
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              {/* Event Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Event Type
                </label>

                <Select
                  value={eventType}
                  onValueChange={(value) => setEventType(value ?? "")}
                >
                  <SelectTrigger className="w-full border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Plantation">Plantation</SelectItem>
                    <SelectItem value="Social Work">Social Work</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Donation">Donation</SelectItem>
                    <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                       <SelectItem value="Entertainment">Entertainment</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Location
                </label>

                <Input
                  name="location"
                  placeholder="Enter event location"
                  required
                  className="border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                />
              </div>

              {/* Date and Time */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Event Date
                  </label>

                  <Input
                    name="eventDate"
                    type="date"
                    min={getTomorrowDate()}
                    required
                    className="border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                    Event Time
                  </label>

                  <Input
                    name="eventTime"
                    type="time"
                    required
                    className="border-slate-300 bg-white text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Event Image
                </label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {preview ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800">
                      <Image
                        src={preview}
                        alt="Event preview"
                        width={800}
                        height={400}
                        unoptimized
                        className="h-64 w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:hover:bg-slate-700"
                      >
                        Change Image
                      </Button>

                      <Button
                        type="button"
                        variant="destructive"
                        onClick={handleRemoveImage}
                      >
                        Remove Image
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:border-green-500 hover:bg-green-50 dark:border-slate-600 dark:bg-slate-800 dark:hover:border-green-500 dark:hover:bg-slate-700"
                  >
                    <span className="mb-3 text-4xl">📷</span>

                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      Click to upload event image
                    </span>

                    <span className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                      Choose from your device gallery
                    </span>

                    <span className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                      JPG, PNG, WEBP • Maximum 5 MB
                    </span>
                  </button>
                )}
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  Description
                </label>

                <Textarea
                  name="description"
                  placeholder="Describe your event and its purpose..."
                  className="min-h-32 resize-none border-slate-300 bg-white text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-500"
                  required
                />
              </div>

              {/* Error Message */}
              {error && (
                <p className="text-sm text-red-500" role="alert">
                  {error}
                </p>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-green-600 text-white hover:bg-green-700"
                disabled={loading}
              >
                {loading ? "Creating Event..." : "Create Event"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
