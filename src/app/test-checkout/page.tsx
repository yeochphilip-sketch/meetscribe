import { Suspense } from 'react';
import TestCheckoutContent from './TestCheckoutContent';

export default function TestCheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <TestCheckoutContent />
    </Suspense>
  );
}
