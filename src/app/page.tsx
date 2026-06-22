import { Suspense } from 'react';
import LandingPageClient from './LandingPageClient';
import LandingAuthHandler from './LandingAuthHandler';

export default function LandingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <LandingAuthHandler />
      </Suspense>
      <LandingPageClient />
    </>
  );
}
