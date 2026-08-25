import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-5 py-20">
      <SignIn />
    </div>
  );
}
