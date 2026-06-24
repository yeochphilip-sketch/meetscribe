import { Suspense } from "react";
import OnboardingContent from "./OnboardingContent";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><p className="text-white">Loading...</p></div>}>
      <OnboardingContent />
    </Suspense>
  );
}
