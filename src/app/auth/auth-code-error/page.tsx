import { Suspense } from 'react';
import AuthCodeErrorContent from './AuthCodeErrorContent';

export default function AuthCodeErrorPage() {
  return (
    <Suspense fallback={null}>
      <AuthCodeErrorContent />
    </Suspense>
  );
}
