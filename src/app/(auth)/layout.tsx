export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary text-primary-foreground mb-4">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M3 7v4a1 1 0 0 0 1 1h3" />
              <path d="M7 7v4a1 1 0 0 0 1 1h3" />
              <path d="M11 7v4a1 1 0 0 0 1 1h3" />
              <path d="M15 7v4a1 1 0 0 0 1 1h3" />
              <path d="M3 11h18" />
              <path d="M3 15h18" />
              <path d="M3 19h18" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            RestoOS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Restaurant Management Platform
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
