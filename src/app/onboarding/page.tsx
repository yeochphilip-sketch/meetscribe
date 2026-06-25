import { Suspense } from "react";
import OnboardingContent from "./OnboardingContent";

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-gray-400">Loading...</div>}>
      <OnboardingContent />
    </Suspense>
  );
}
