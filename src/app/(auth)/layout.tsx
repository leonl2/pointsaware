export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grain relative flex min-h-screen items-center justify-center overflow-hidden bg-pj-midnight p-4">
      <div className="absolute inset-0 mesh-hero" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
