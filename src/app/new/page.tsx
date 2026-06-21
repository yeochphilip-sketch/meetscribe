import { Suspense } from 'react';
import NewContent from './NewContent';

export default function NewPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <NewContent />
    </Suspense>
  );
}
