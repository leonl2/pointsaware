import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Sign Up" };

export default function SignUpPage() {
  return (
    <div className="grain flex min-h-screen items-center justify-center bg-pj-midnight p-4">
      <div className="absolute inset-0 mesh-hero" />
      <div className="relative">
        <SignUp />
      </div>
    </div>
  );
}
