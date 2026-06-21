'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const profile = localStorage.getItem('tandrust_profile');
    if (profile) {
      router.replace('/home');
    } else {
      router.replace('/privacy');
    }
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#F4793B]">
      <div className="text-white text-2xl font-semibold">Tandrust AI लोड हो रहा है...</div>
    </div>
  );
}
