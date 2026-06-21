'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

const WEIGHT_GOALS = [3, 5, 8, 10];

export default function OnboardingScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    age: 50,
    gender: 'female' as 'female' | 'male',
    currentWeight: 80,
    doctorNote: '',
    weightLossGoal: 5,
  });

  async function handleSubmit() {
    if (!form.name.trim()) {
      setError('Apna naam zaroor likhein!');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          age: form.age,
          gender: form.gender,
          currentWeight: form.currentWeight,
          goalWeight: form.currentWeight - form.weightLossGoal,
          doctorNote: form.doctorNote,
          weightLossGoal: form.weightLossGoal,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || 'API error');
      }

      const profile = {
        name: form.name,
        age: form.age,
        gender: form.gender,
        currentWeight: form.currentWeight,
        goalWeight: form.currentWeight - form.weightLossGoal,
        weightLossGoal: form.weightLossGoal,
        doctorNote: form.doctorNote,
        latestWeight: form.currentWeight,
        completedExercises: {} as Record<string, boolean>,
        lastDate: new Date().toDateString(),
      };

      localStorage.setItem('tandrust_profile', JSON.stringify(profile));
      localStorage.setItem('tandrust_plan', JSON.stringify(data));

      router.push('/home');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Kuch gadbad ho gayi. Dobara try karein.'
      );
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#FFF8F3] px-5 py-8 pb-24">
      <div className="max-w-lg mx-auto">
        {/* Logo */}
        <div className="text-center mb-6">
          <span className="text-[#F4793B] font-bold text-2xl">🏃 Tandrust AI</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl font-bold text-[#1A1A1A] mb-2 text-center">
          Pehle thoda jaana pehchaana ho jaye 😄
        </h1>
        <p className="text-[#6B6B6B] text-base text-center mb-8 leading-relaxed">
          Aapki jaankari se hum aapke liye sahi exercise plan banayenge
        </p>

        <div className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-[#1A1A1A] font-semibold text-lg mb-2">
              Aapka naam?
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Jaise: Sunita, Rekha, Ramesh..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg text-[#1A1A1A] bg-white focus:outline-none focus:border-[#F4793B] transition-colors"
              style={{ minHeight: '56px' }}
            />
          </div>

          {/* Age */}
          <div>
            <label className="block text-[#1A1A1A] font-semibold text-lg mb-2">
              Umar (years)
            </label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 50 })}
              min={18}
              max={90}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg text-[#1A1A1A] bg-white focus:outline-none focus:border-[#F4793B] transition-colors"
              style={{ minHeight: '56px' }}
            />
          </div>

          {/* Gender */}
          <div>
            <label className="block text-[#1A1A1A] font-semibold text-lg mb-2">
              Gender
            </label>
            <div className="flex gap-3">
              {(['female', 'male'] as const).map((g) => (
                <button
                  key={g}
                  onClick={() => setForm({ ...form, gender: g })}
                  className={`flex-1 rounded-xl py-4 text-lg font-semibold border-2 transition-all ${
                    form.gender === g
                      ? 'bg-[#F4793B] text-white border-[#F4793B]'
                      : 'bg-white text-[#1A1A1A] border-gray-200'
                  }`}
                  style={{ minHeight: '56px' }}
                >
                  {g === 'female' ? '👩 Female' : '👨 Male'}
                </button>
              ))}
            </div>
          </div>

          {/* Current weight */}
          <div>
            <label className="block text-[#1A1A1A] font-semibold text-lg mb-2">
              Abhi ka wajan (kg)
            </label>
            <input
              type="number"
              value={form.currentWeight}
              onChange={(e) =>
                setForm({ ...form, currentWeight: parseFloat(e.target.value) || 80 })
              }
              min={30}
              max={200}
              step={0.5}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-4 text-lg text-[#1A1A1A] bg-white focus:outline-none focus:border-[#F4793B] transition-colors"
              style={{ minHeight: '56px' }}
            />
          </div>

          {/* Doctor note */}
          <div>
            <label className="block text-[#1A1A1A] font-semibold text-lg mb-1">
              Doctor ne kya kaha?
            </label>
            <p className="text-[#6B6B6B] text-sm mb-2">
              Ye optional hai, par isse hum better plan bana sakte hain
            </p>
            <textarea
              value={form.doctorNote}
              onChange={(e) => setForm({ ...form, doctorNote: e.target.value })}
              rows={3}
              placeholder="Jaise: 10 kg wajan kam karna hai, BP thoda high hai, ghutne mein dard hota hai kabhi kabhi..."
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-[#1A1A1A] bg-white focus:outline-none focus:border-[#F4793B] transition-colors resize-none"
            />
          </div>

          {/* Weight loss goal */}
          <div>
            <label className="block text-[#1A1A1A] font-semibold text-lg mb-2">
              Kitna wajan kam karna hai?
            </label>
            <div className="flex gap-2">
              {WEIGHT_GOALS.map((kg) => (
                <button
                  key={kg}
                  onClick={() => setForm({ ...form, weightLossGoal: kg })}
                  className={`flex-1 rounded-xl py-4 text-base font-semibold border-2 transition-all ${
                    form.weightLossGoal === kg
                      ? 'bg-[#F4793B] text-white border-[#F4793B]'
                      : 'bg-white text-[#1A1A1A] border-gray-200'
                  }`}
                  style={{ minHeight: '56px' }}
                >
                  {kg} kg
                </button>
              ))}
            </div>
          </div>

          {/* Target weight display */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 text-center">
            <p className="text-[#F4793B] font-semibold">
              Aapka target:{' '}
              <strong>{(form.currentWeight - form.weightLossGoal).toFixed(1)} kg</strong>
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-center">
              {error}
              <button
                onClick={() => setError('')}
                className="block mt-2 underline text-sm mx-auto"
              >
                Dobara try karein
              </button>
            </div>
          )}

          {/* Submit button */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#F4793B] text-white font-bold text-xl rounded-2xl py-5 px-6 transition-all active:scale-95 disabled:opacity-70 shadow-lg mt-4"
            style={{ minHeight: '64px' }}
          >
            {loading ? 'Aapka plan ban raha hai... ☕ Ek chai pi lo!' : 'Plan banao 🚀'}
          </button>

          {loading && (
            <div className="text-center text-[#6B6B6B] text-sm animate-pulse">
              Thoda sabr... aapke doctor ki baat sun ke khaas plan taiyaar ho raha hai 🩺
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
