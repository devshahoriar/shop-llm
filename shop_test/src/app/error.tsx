"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { AlertTriangle } from "lucide-react";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="max-w-md rounded-lg border bg-white p-8 shadow-lg text-center">
        <div className="flex justify-center mb-4">
          <AlertTriangle className="h-12 w-12 text-red-500" />
        </div>
        <h1 className="mb-2 text-2xl font-bold text-red-600">Something went wrong</h1>
        <p className="mb-6 text-muted-foreground">{error?.message || "An unexpected error occurred. Please try again."}</p>
        <div className="flex flex-col gap-2">
          <Button variant="default" onClick={() => reset()}>Try Again</Button>
          <Button variant="outline" onClick={() => router.push("/products")}>Go to Products</Button>
        </div>
      </div>
    </div>
  );
}
