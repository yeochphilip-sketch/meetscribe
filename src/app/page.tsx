import { Suspense } from 'react';
import LandingPageClient from './LandingPageClient';
import AuthCodeHandler from './AuthCodeHandler';

export default function LandingPage() {
  return (
    <>
      <Suspense fallback={null}>
        <AuthCodeHandler />
      </Suspense>
      <LandingPageClient />
    </>
  );
}
