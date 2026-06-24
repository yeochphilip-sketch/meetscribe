import { Suspense } from "react";
import LoginContent from "./LoginContent";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black flex items-center justify-center">
          <p className="text-white">Loading...</p>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
