export default function GlobalNotFound() {
  return (
    <html>
      <body>
        <div className="bg-background flex min-h-screen flex-col items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <h1 className="text-primary mb-4 text-5xl font-bold">404</h1>
            <h2 className="mb-2 text-2xl font-semibold">Page Not Found</h2>
            <p className="text-muted-foreground mb-6">
              Sorry, the page you are looking for does not exist or has been
              moved.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
