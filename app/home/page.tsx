'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Exercise {
  id: string;
  hindiName: string;
  englishName: string;
  emoji: string;
  category: string;
  reps: number | null;
  rounds: number;
  durationSec: number | null;
  equipment: string;
  whyItHelps: string;
}

interface Plan {
  greeting: string;
  dailyTip: string;
  exercises: Exercise[];
  motivationalMessage: string;
}

interface Profile {
  name: string;
  currentWeight: number;
  goalWeight: number;
  latestWeight: number;
  doctorNote: string;
  completedExercises: Record<string, boolean>;
  lastDate: string;
}

function getProgressText(pct: number): string {
  if (pct <= 0) return 'Shuruat ho gayi — yahi kaafi hai! 🌱';
  if (pct < 25) return 'Wah! Chal padi ho! 💪';
  if (pct < 50) return 'Aadhe raste par ho! 🔥';
  if (pct < 75) return 'Bahut badhiya! Lakshya paas aa raha hai! 🌟';
  if (pct < 100) return 'Bas thoda sa baaki! Chhoo lo isko! 🎯';
  return 'KAR DIYA!!! 🎉🎉🎉 Doctor bhi khush honge!';
}

export default function HomeScreen() {
  const router = useRouter();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const rawProfile = localStorage.getItem('tandrust_profile');
    const rawPlan = localStorage.getItem('tandrust_plan');

    if (!rawProfile || !rawPlan) {
      router.replace('/privacy');
      return;
    }

    const p = JSON.parse(rawProfile) as Profile;
    const today = new Date().toDateString();

    // Reset completed exercises if it's a new day
    if (p.lastDate !== today) {
      p.completedExercises = {};
      p.lastDate = today;
      localStorage.setItem('tandrust_profile', JSON.stringify(p));
    }

    setProfile(p);
    setPlan(JSON.parse(rawPlan) as Plan);
  }, [router]);

  function handleWeightUpdate() {
    const input = window.prompt('Aaj ka wajan kitna hai? (kg mein likhein)');
    if (!input) return;
    const w = parseFloat(input);
    if (isNaN(w) || w < 20 || w > 300) {
      alert('Sahi wajan likhein (20-300 kg ke beech)');
      return;
    }
    const rawProfile = localStorage.getItem('tandrust_profile');
    if (!rawProfile) return;
    const p = JSON.parse(rawProfile) as Profile;
    p.latestWeight = w;
    localStorage.setItem('tandrust_profile', JSON.stringify(p));
    setProfile({ ...p });
  }

  function handleResetProfile() {
    if (window.confirm('Kya aap apna profile delete karna chahte hain? Sab data mitega.')) {
      localStorage.removeItem('tandrust_profile');
      localStorage.removeItem('tandrust_plan');
      router.replace('/privacy');
    }
  }

  if (!plan || !profile) {
    return (
      <div className="min-h-screen bg-[#FFF8F3] flex items-center justify-center">
        <div className="text-[#F4793B] text-xl font-semibold animate-pulse">
          Load ho raha hai... 🏃
        </div>
      </div>
    );
  }

  const progressPct = Math.min(
    100,
    Math.max(
      0,
      ((profile.currentWeight - profile.latestWeight) /
        (profile.currentWeight - profile.goalWeight)) *
        100
    )
  );

  return (
    <div className="min-h-screen bg-[#FFF8F3] pb-8">
      {/* Top bar */}
      <div className="sticky top-0 z-40 bg-[#F4793B] px-5 py-4 flex items-center justify-between shadow-sm">
        <span className="text-white font-bold text-xl">🏃 Tandrust AI</span>
        <button onClick={handleResetProfile} className="text-white text-sm opacity-75 underline">
          Reset
        </button>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-5 space-y-5">
        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A1A] leading-snug">{plan.greeting}</h1>
        </div>

        {/* Daily tip */}
        <div className="bg-[#F4793B] rounded-2xl p-4 text-white">
          <p className="text-base font-semibold leading-relaxed">💡 Aaj ka tip: {plan.dailyTip}</p>
        </div>

        {/* Progress card */}
        <div className="bg-white rounded-2xl shadow-sm p-5">
          <h2 className="text-lg font-bold text-[#1A1A1A] mb-3">🎯 Aapka lakshya</h2>
          <div className="flex justify-between text-sm text-[#6B6B6B] mb-2">
            <span>Shuru: {profile.currentWeight} kg</span>
            <span>Goal: {profile.goalWeight} kg</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
            <div
              className="bg-[#F4793B] h-3 rounded-full transition-all duration-700"
              style={{ width: `${progressPct}%` }}
            />
          </div>
          <p className="text-sm text-[#1A1A1A] font-medium mb-1">
            Abhi: <strong>{profile.latestWeight} kg</strong>
          </p>
          <p className="text-sm text-[#6B6B6B] mb-3">{getProgressText(progressPct)}</p>
          <button
            onClick={handleWeightUpdate}
            className="text-sm text-[#F4793B] font-semibold border border-[#F4793B] rounded-xl px-4 py-2 active:scale-95 transition-all"
          >
            ⚖️ Aaj ka wajan likhein
          </button>
        </div>

        {/* Exercise heading */}
        <h2 className="text-xl font-bold text-[#1A1A1A] pt-2">Aaj ke exercises</h2>

        {/* Exercise grid */}
        <div className="grid grid-cols-2 gap-3">
          {plan.exercises.map((ex) => {
            const done = !!profile.completedExercises?.[ex.id];
            return (
              <button
                key={ex.id}
                onClick={() => router.push(`/camera?exercise=${ex.id}`)}
                className="relative bg-white rounded-2xl shadow-sm p-4 text-left transition-all active:scale-95 hover:shadow-md"
              >
                {done && (
                  <span className="absolute top-2 right-2 text-lg">✅</span>
                )}
                <div className="text-4xl mb-2">{ex.emoji}</div>
                <div className="text-base font-bold text-[#1A1A1A] leading-tight mb-1">
                  {ex.hindiName}
                </div>
                <div className="text-xs text-[#6B6B6B] mb-2">{ex.englishName}</div>
                <div className="inline-block bg-[#F4793B] text-white text-xs rounded-full px-2 py-0.5">
                  {ex.category}
                </div>
                <div className="text-xs text-[#6B6B6B] mt-1">
                  {ex.reps ? `${ex.reps} reps × ${ex.rounds}` : `${ex.durationSec}s × ${ex.rounds}`}
                </div>
              </button>
            );
          })}
        </div>

        {/* Motivational message */}
        <div className="bg-white rounded-2xl shadow-sm p-5 border-l-4 border-[#F4793B]">
          <p className="text-base text-[#1A1A1A] leading-relaxed">{plan.motivationalMessage}</p>
        </div>

        {/* Doctor note */}
        {profile.doctorNote && (
          <div className="bg-[#EBF5FB] rounded-2xl p-4">
            <div className="flex gap-3 items-start">
              <span className="text-2xl">🩺</span>
              <div>
                <p className="text-sm text-[#1A1A1A] leading-relaxed">
                  Doctor ne kaha tha: {profile.doctorNote}
                </p>
                <p className="text-xs text-[#6B6B6B] mt-1">
                  Yeh note aapke plan mein consider kiya gaya hai
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
