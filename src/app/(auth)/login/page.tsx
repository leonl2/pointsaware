import { SignIn } from "@clerk/nextjs";

export const metadata = { title: "Sign In" };

export default function LoginPage() {
  return (
    <div className="grain flex min-h-screen items-center justify-center bg-pj-midnight p-4">
      <div className="absolute inset-0 mesh-hero" />
      <div className="relative">
        <SignIn />
      </div>
    </div>
  );
}
