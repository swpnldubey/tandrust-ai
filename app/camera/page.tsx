'use client';

import { Suspense } from 'react';
import CameraCoach from './CameraCoach';

export default function CameraPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#0F0F0F] flex items-center justify-center text-white text-xl">
          Load ho raha hai... 🎥
        </div>
      }
    >
      <CameraCoach />
    </Suspense>
  );
}
