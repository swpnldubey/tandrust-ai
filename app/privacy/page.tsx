'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function PrivacyScreen() {
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'requesting' | 'denied' | 'error'>('idle');

  async function handleAllow() {
    setStatus('requesting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach((t) => t.stop());
      const profile = localStorage.getItem('tandrust_profile');
      router.push(profile ? '/home' : '/onboarding');
    } catch (err) {
      setStatus(
        err instanceof DOMException && err.name === 'NotAllowedError' ? 'denied' : 'error'
      );
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 py-10" style={{ backgroundColor: '#F4793B' }}>
      <div className="w-full max-w-sm flex flex-col items-center gap-6">

        {/* Lock icon */}
        <div className="text-7xl select-none drop-shadow-lg">🔒</div>

        {/* App name */}
        <p className="text-white/80 font-semibold text-base tracking-wide uppercase">Tandrust AI</p>

        {/* Heading */}
        <h1 className="text-white font-bold text-3xl leading-tight text-center">
          Aapka camera sirf aapke paas
        </h1>

        {/* Hindi body */}
        <p className="text-white/90 text-base leading-relaxed text-center max-w-xs">
          Tandrust AI sirf aapke device pe camera use karta hai.
          Koi bhi video ya body data kabhi server pe nahi jaata.
        </p>

        {/* Proof points — dark bg so white text is readable */}
        <div
          className="w-full rounded-2xl p-4 space-y-3"
          style={{ backgroundColor: 'rgba(0,0,0,0.25)' }}
        >
          {[
            ['🧠', 'AI aapke device pe hi chalti hai'],
            ['🚫', 'Koi account, login ya cloud storage nahi'],
            ['🔐', 'Sirf browser mein save hota hai, kahin nahi jaata'],
          ].map(([icon, text]) => (
            <div key={text} className="flex items-center gap-3">
              <span className="text-xl w-7 text-center">{icon}</span>
              <span className="text-white font-medium text-sm">{text}</span>
            </div>
          ))}
        </div>

        {/* English sub-line */}
        <p className="text-white/70 text-xs text-center">
          All pose detection runs on your device. Nothing is uploaded. Ever.
        </p>

        {/* CTA */}
        <button
          onClick={handleAllow}
          disabled={status === 'requesting'}
          className="w-full font-bold text-xl rounded-2xl py-4 px-6 transition-all active:scale-95 disabled:opacity-60 shadow-xl"
          style={{ backgroundColor: '#FFFFFF', color: '#F4793B', minHeight: '60px' }}
        >
          {status === 'requesting' ? 'Permission maang rahe hain...' : 'Camera allow karein 📷'}
        </button>

        <p className="text-white/60 text-xs text-center">
          Camera sirf exercise ke waqt use hota hai
        </p>

        {/* Error states */}
        {status === 'denied' && (
          <div className="w-full rounded-2xl p-4 text-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <p className="text-white font-semibold mb-1">📵 Camera block ho gaya</p>
            <p className="text-white/80 text-sm">
              Browser settings mein jaake camera permission allow karein, phir wapas aayein.
            </p>
          </div>
        )}

        {status === 'error' && (
          <div className="w-full rounded-2xl p-4 text-center" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}>
            <p className="text-white font-semibold mb-1">😔 Kuch gadbad ho gayi</p>
            <p className="text-white/80 text-sm mb-3">Browser refresh karke dobara try karein.</p>
            <button onClick={() => setStatus('idle')} className="text-white underline text-sm">
              Dobara try karein
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
