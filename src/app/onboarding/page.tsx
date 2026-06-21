import { Suspense } from 'react';
import OnboardingContent from './OnboardingContent';

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
