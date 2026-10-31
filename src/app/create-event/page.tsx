
"use client";

import { useRef, useState } from "react";
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

export default function Page() {
  const [eventType, setEventType] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState("");
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

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



  const handleUploadImage = async () => {
    if (!image) {
      setError("Please select an image first.");
      return null;
    }

    try {
      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Unable to get authentication token.");
      }

      const formData = new FormData();
      formData.append("image", image);

      const response = await fetch("http://localhost:5000/upload-image", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Image upload failed.");
      }

      return result.imageUrl;
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Image upload failed."
      );
      return null;
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);

      if (!eventType) {
        setError("Please select an event type.");
        return;
      }

      const { data: tokenData, error: tokenError } =
        await authClient.token();

      if (tokenError || !tokenData?.token) {
        throw new Error("Please login first.");
      }

      let imageUrl = "";

      if (image) {
        imageUrl = await handleUploadImage();

        if (!imageUrl) {
          return;
        }
      }

      const eventData = {
        title: formData.get("title"),
        eventType,
        location: formData.get("location"),
        eventDate: formData.get("eventDate"),
        eventTime: formData.get("eventTime"),
        description: formData.get("description"),
        image: imageUrl,
      };

      const response = await fetch("http://localhost:5000/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify(eventData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to create event.");
      }

      alert("Event created successfully!");

      form.reset();
      setEventType("");
      handleRemoveImage();
    } catch (err) {
      console.error(err);
      setError(
        err instanceof Error ? err.message : "Something went wrong."
      );
    }
  };




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

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="mb-2 font-semibold text-green-600">
            MAKE A DIFFERENCE
          </p>

          <h1 className="text-3xl font-bold tracking-tight text-slate-900 md:text-4xl">
            Create a New Event
          </h1>

          <p className="mt-3 text-slate-500">
            Bring people together and create positive change in your community.
          </p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardHeader className="border-b pb-5">
            <CardTitle className="text-xl">Event Information</CardTitle>
            <CardDescription>
              Fill in the details to publish your community event.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Title</label>
                <Input
                  name="title"
                  placeholder="e.g. Tree Plantation Program"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>

                <Select
                  value={eventType}
                  onValueChange={(value) => setEventType(value ?? "")}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="Plantation">Plantation</SelectItem>
                    <SelectItem value="Social Work">Social Work</SelectItem>
                    <SelectItem value="Education">Education</SelectItem>
                    <SelectItem value="Donation">Donation</SelectItem>
                    <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input
                  name="location"
                  placeholder="Enter event location"
                  required
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Date</label>
                  <Input name="eventDate" type="date" required />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Event Time</label>
                  <Input name="eventTime" type="time" required />
                </div>
              </div>

              {/* Event Image Upload */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Event Image</label>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                />

                {preview ? (
                  <div className="space-y-3">
                    <div className="overflow-hidden rounded-xl border bg-white">
                      <Image
                        src={preview}
                        alt="Event preview"
                        width={800}
                        height={400}
                        className="h-64 w-full object-cover"
                      />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
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
                    className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-10 text-center transition hover:border-green-500 hover:bg-green-50"
                  >
                    <span className="mb-3 text-4xl">📷</span>

                    <span className="font-semibold text-slate-700">
                      Click to upload event image
                    </span>

                    <span className="mt-2 text-sm text-slate-500">
                      Choose from your device gallery
                    </span>

                    <span className="mt-1 text-xs text-slate-400">
                      JPG, PNG, WEBP • Maximum 5 MB
                    </span>
                  </button>
                )}

                {error && (
                  <p className="text-sm text-red-500">{error}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  placeholder="Describe your event and its purpose..."
                  className="min-h-32 resize-none"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={!eventType}
              >
                Create Event
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
