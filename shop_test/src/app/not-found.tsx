'use client'
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-4 py-16">
      <div className="max-w-md text-center">
        <h1 className="mb-4 text-5xl font-bold text-primary">404</h1>
        <h2 className="mb-2 text-2xl font-semibold">Page Not Found</h2>
        <p className="mb-6 text-muted-foreground">
          Sorry, the page you are looking for does not exist or has been moved.
        </p>
        <Button onClick={() => router.push("/")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Go Home
        </Button>
      </div>
    </div>
  );
}
