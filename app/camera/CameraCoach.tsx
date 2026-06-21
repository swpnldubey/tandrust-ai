'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { drawSkeleton } from '@/utils/pose';
import { speak, resetSpeechCooldown } from '@/utils/speech';
import { processFormRules, createInitialState, ExerciseState, Feedback } from '@/utils/formRules';

const CELEBRATIONS = [
  'Wah! Ekdum mast!',
  'Doctor sahab khush honge!',
  'Ek aur step sehat ki taraf!',
  'Champion ho aap!',
  'Bahut badhiya! Kal bhi karna!',
  'Himmat karke shuru kiya — yahi sabse bada kaam hai!',
  'Aaj ka kaam ho gaya!',
  'Mast chal raha hai! Aise hi chalo!',
];

const CELEBRATION_EMOJIS = ['🎉', '🩺', '🌟', '🏆', '🔥', '❤️', '💪', '😄'];

interface Exercise {
  id: string;
  hindiName: string;
  englishName: string;
  emoji: string;
  reps: number | null;
  rounds: number;
  durationSec: number | null;
  equipment: string;
  voiceCue: string;
  whyItHelps?: string;
}

type CamStatus = 'loading' | 'ready' | 'denied';

export default function CameraCoach() {
  const router = useRouter();
  const params = useSearchParams();
  const exerciseId = params.get('exercise') || 'squat';

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const stateRef = useRef<ExerciseState>(createInitialState());
  const poseLandmarkerRef = useRef<unknown>(null);
  const startTimeRef = useRef<number>(0);
  const doneRef = useRef(false);

  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [camStatus, setCamStatus] = useState<CamStatus>('loading');
  const [mediapipeLoaded, setMediapipeLoaded] = useState(false);
  const [exerciseStarted, setExerciseStarted] = useState(false);
  const [feedback, setFeedback] = useState<Feedback>({ text: '', isGood: false });
  const [repCount, setRepCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [done, setDone] = useState(false);
  const [celebrationIdx, setCelebrationIdx] = useState(0);

  const totalTarget = exercise
    ? exercise.reps
      ? exercise.reps * exercise.rounds
      : (exercise.durationSec ?? 30) * exercise.rounds
    : 0;
  const isTimerBased = !exercise?.reps && !!exercise?.durationSec;
  const timerRemaining = Math.max(0, totalTarget - elapsed);

  // Load exercise
  useEffect(() => {
    const rawPlan = localStorage.getItem('tandrust_plan');
    if (rawPlan) {
      const plan = JSON.parse(rawPlan);
      const ex = plan.exercises?.find((e: Exercise) => e.id === exerciseId);
      if (ex) setExercise(ex);
    }
  }, [exerciseId]);

  // Load MediaPipe
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const { FilesetResolver, PoseLandmarker } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );
        const lm = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numPoses: 1,
        });
        if (!cancelled) { poseLandmarkerRef.current = lm; setMediapipeLoaded(true); }
      } catch {
        if (!cancelled) setMediapipeLoaded(true);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // Acquire camera stream (don't touch videoRef yet — it may not be mounted)
  useEffect(() => {
    if (!mediapipeLoaded) return;
    async function startCam() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } },
        });
        streamRef.current = stream;
        setCamStatus('ready');
      } catch {
        setCamStatus('denied');
      }
    }
    startCam();
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      cancelAnimationFrame(rafRef.current);
    };
  }, [mediapipeLoaded]);

  // Attach stream AFTER video element mounts (camStatus transitions to 'ready')
  useEffect(() => {
    if (camStatus !== 'ready') return;
    const video = videoRef.current;
    if (!video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    video.play().catch(() => {});
    // Read the voice cue on prep screen
    if (exercise?.voiceCue) {
      resetSpeechCooldown();
      setTimeout(() => speak(exercise.voiceCue, true), 600);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camStatus]);

  // Detection loop
  const runDetection = useCallback(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const lm = poseLandmarkerRef.current as {
      detectForVideo: (v: HTMLVideoElement, t: number) => {
        landmarks: Array<Array<{ x: number; y: number; visibility?: number }>>;
      };
    } | null;

    if (!video || !canvas || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(runDetection);
      return;
    }
    if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
    }
    if (lm && video.videoWidth > 0) {
      try {
        const results = lm.detectForVideo(video, performance.now());
        if (results.landmarks[0]) {
          drawSkeleton(results.landmarks[0], canvas);
          const { feedback: fb, repDone } = processFormRules(
            results.landmarks[0], exerciseId, stateRef.current
          );
          if (fb.text) {
            setFeedback(fb);
            if (fb.text !== stateRef.current.lastFeedback) {
              speak(fb.text);
              stateRef.current.lastFeedback = fb.text;
            }
          } else {
            setFeedback({ text: '', isGood: false });
          }
          if (repDone) {
            stateRef.current.repCount += 1;
            setRepCount(stateRef.current.repCount);
          }
        }
      } catch { /* ignore per-frame errors */ }
    }
    rafRef.current = requestAnimationFrame(runDetection);
  }, [exerciseId]);

  // Start detection loop only after user taps "Shuru karein"
  useEffect(() => {
    if (!exerciseStarted) return;
    startTimeRef.current = Date.now();
    rafRef.current = requestAnimationFrame(runDetection);
    return () => cancelAnimationFrame(rafRef.current);
  }, [exerciseStarted, runDetection]);

  // Timer tick
  useEffect(() => {
    if (!exerciseStarted || !isTimerBased) return;
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
    }, 500);
    return () => clearInterval(interval);
  }, [exerciseStarted, isTimerBased]);

  // Completion check
  useEffect(() => {
    if (!exerciseStarted || done || !exercise) return;
    if (exercise.reps && repCount >= totalTarget) finishExercise();
    if (!exercise.reps && exercise.durationSec && elapsed >= totalTarget) finishExercise();
  });

  function startExercise() {
    setExerciseStarted(true);
    resetSpeechCooldown();
    if (exercise?.voiceCue) speak(exercise.voiceCue, true);
  }

  function finishExercise() {
    if (doneRef.current) return;
    doneRef.current = true;
    cancelAnimationFrame(rafRef.current);
    const idx = Math.floor(Math.random() * CELEBRATIONS.length);
    setCelebrationIdx(idx);
    setDone(true);
    speak(CELEBRATIONS[idx], true);
    const rawProfile = localStorage.getItem('tandrust_profile');
    if (rawProfile) {
      const profile = JSON.parse(rawProfile);
      profile.completedExercises = profile.completedExercises ?? {};
      profile.completedExercises[exerciseId] = true;
      localStorage.setItem('tandrust_profile', JSON.stringify(profile));
    }
  }

  function goHome() {
    cancelAnimationFrame(rafRef.current);
    streamRef.current?.getTracks().forEach((t) => t.stop());
    router.push('/home');
  }

  function replayVoice() {
    resetSpeechCooldown();
    speak(exercise?.voiceCue ?? feedback.text, true);
  }

  // --- Loading screen ---
  if (!mediapipeLoaded || camStatus === 'loading') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center text-white gap-4">
        <div className="text-5xl animate-pulse">🤖</div>
        <p className="text-xl font-semibold">Coach aa raha hai...</p>
        <p className="text-gray-400 text-sm">Pehli baar thoda time lagta hai</p>
      </div>
    );
  }

  // --- Camera denied ---
  if (camStatus === 'denied') {
    return (
      <div className="min-h-screen bg-[#0F0F0F] flex flex-col items-center justify-center px-6 text-white text-center gap-6">
        <div className="text-6xl">📵</div>
        <h2 className="text-2xl font-bold">Camera blocked hai</h2>
        <p className="text-gray-400 max-w-sm">Browser settings mein camera permission allow karein.</p>
        <button onClick={goHome} className="bg-[#F4793B] text-white rounded-2xl px-8 py-4 font-bold text-lg">
          ← Wapas jao
        </button>
      </div>
    );
  }

  // --- Main camera UI ---
  return (
    <div className="flex flex-row h-screen bg-[#0F0F0F] overflow-hidden">

      {/* ══ LEFT: Camera area ══ */}
      <div className={`relative overflow-hidden ${exerciseStarted && !done ? 'flex-1' : 'w-full'}`}>
        {/* Video */}
        <video
          ref={videoRef}
          autoPlay playsInline muted
          className="absolute inset-0 w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* Skeleton canvas */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 pointer-events-none" style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, transparent 30%, transparent 55%, rgba(0,0,0,0.85) 100%)',
        }} />

        {/* TOP BAR */}
        <div className="absolute top-0 left-0 right-0 z-50 px-4 pt-4 pb-3">
          <div className="flex items-center justify-between">
            <button onClick={goHome}
              className="text-white text-xl bg-black/40 rounded-full w-10 h-10 flex items-center justify-center">
              ←
            </button>
            <span className="text-white font-bold text-lg">
              {exercise ? `${exercise.emoji} ${exercise.hindiName}` : 'Exercise'}
            </span>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full text-white text-xs font-semibold"
              style={{ backgroundColor: '#1A73E8' }}>
              🔒 On-device
            </div>
          </div>

          {exerciseStarted && !done && (
            <div className="flex justify-center mt-2">
              <div className="bg-black/50 rounded-2xl px-6 py-2 text-white text-center">
                {isTimerBased
                  ? <span className="text-2xl font-bold">{timerRemaining}s</span>
                  : <span className="text-2xl font-bold">{repCount} / {totalTarget} reps</span>
                }
              </div>
            </div>
          )}
        </div>

        {/* ─── PREP OVERLAY (full screen, before exercise starts) ─── */}
        {!exerciseStarted && !done && (
          <div className="absolute inset-0 z-40 flex flex-col" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
            <div className="flex-1 flex flex-col items-center justify-center px-4 pt-16">
              <p className="text-white/70 text-xs font-semibold uppercase tracking-widest mb-3">
                Dekhein kaise karte hain
              </p>
              <div className="relative rounded-2xl overflow-hidden border-2 border-white/20"
                style={{ width: 200, height: 280 }}>
                <div className="absolute inset-0 flex items-center justify-center bg-black/60">
                  <span className="text-7xl">{exercise?.emoji}</span>
                </div>
                <video key={exercise?.id} autoPlay muted loop playsInline
                  className="absolute inset-0 w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}>
                  <source src={`/exercises/${exercise?.id}.mp4`} type="video/mp4" />
                </video>
              </div>
              <p className="text-white/40 text-xs mt-2">Loop mein chal raha hai</p>
            </div>

            <div className="px-4 pb-6">
              <div className="rounded-2xl p-4 mb-3" style={{ backgroundColor: 'rgba(0,0,0,0.88)' }}>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl">{exercise?.emoji}</span>
                  <div className="flex-1">
                    <p className="text-white font-bold text-lg leading-tight">{exercise?.hindiName}</p>
                    <p className="text-gray-400 text-xs">{exercise?.englishName}</p>
                  </div>
                  <span className="bg-[#F4793B] text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                    {isTimerBased
                      ? `${exercise?.durationSec}s × ${exercise?.rounds}`
                      : `${exercise?.reps} × ${exercise?.rounds}`}
                  </span>
                </div>
                <p className="text-white text-sm leading-relaxed">{exercise?.voiceCue}</p>
                {exercise?.whyItHelps && (
                  <p className="text-[#F4C430] text-xs mt-2">💡 {exercise.whyItHelps}</p>
                )}
                <button onClick={replayVoice}
                  className="mt-3 flex items-center gap-2 text-[#F4793B] text-sm font-medium">
                  🔊 Dobara sunein
                </button>
              </div>
              <button onClick={startExercise}
                className="w-full text-white font-bold text-xl rounded-2xl py-4 active:scale-95 transition-all"
                style={{ backgroundColor: '#F4793B', minHeight: '64px' }}>
                Shuru karein
              </button>
            </div>
          </div>
        )}

        {/* ─── FEEDBACK BOX (during exercise, only when pose is detected) ─── */}
        {exerciseStarted && !done && feedback.text && (
          <div className="absolute bottom-24 left-4 right-4 z-50">
            <div className="rounded-2xl p-4 flex items-center gap-3" style={{ backgroundColor: 'rgba(0,0,0,0.82)' }}>
              <p className="flex-1 font-bold text-xl leading-tight"
                style={{ color: feedback.isGood ? '#2ECC71' : '#FFFFFF' }}>
                {feedback.text || 'Sahi karo...'}
              </p>
              <button onClick={replayVoice}
                className="text-xl bg-white/20 rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                🔊
              </button>
            </div>
          </div>
        )}

        {/* HO GAYA */}
        {exerciseStarted && !done && (
          <div className="absolute bottom-4 left-4 right-4 z-50">
            <button onClick={finishExercise}
              className="w-full text-white font-bold text-xl rounded-2xl py-4 active:scale-95 transition-all"
              style={{ backgroundColor: '#2ECC71', minHeight: '56px' }}>
              Ho gaya ✓
            </button>
          </div>
        )}
      </div>

      {/* ══ RIGHT: Exercise demo panel (only during exercise) ══ */}
      {exerciseStarted && !done && (
        <div className="flex flex-col border-l border-white/10" style={{ width: 360, backgroundColor: '#0a0a0a' }}>
          {/* Header */}
          <div className="px-3 py-3 border-b border-white/10 text-center">
            <p className="text-white/50 text-xs font-semibold uppercase tracking-wider">Aise karo</p>
            <p className="text-white text-sm font-bold mt-0.5">{exercise?.hindiName}</p>
          </div>

          {/* Demo video — fills available space */}
          <div className="relative flex-1 bg-black min-h-0">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-7xl">{exercise?.emoji}</span>
            </div>
            <video
              key={`panel-${exercise?.id}`}
              autoPlay muted loop playsInline
              className="absolute inset-0 w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLVideoElement).style.display = 'none'; }}
            >
              <source src={`/exercises/${exercise?.id}.mp4`} type="video/mp4" />
            </video>
          </div>

          {/* Live feedback in panel */}
          <div className="px-3 py-3 border-t border-white/10" style={{ backgroundColor: '#111' }}>
            <p className="text-xs font-semibold uppercase tracking-wider mb-1"
              style={{ color: feedback.isGood ? '#2ECC71' : '#F4793B' }}>
              {feedback.isGood ? 'Bilkul sahi!' : 'Coach bol raha hai:'}
            </p>
            <p className="text-white text-sm leading-snug">
              {feedback.text || exercise?.voiceCue}
            </p>
          </div>

          {/* Target */}
          <div className="px-3 py-2 text-center" style={{ backgroundColor: '#0a0a0a' }}>
            <span className="text-white/40 text-xs">
              {isTimerBased
                ? `${timerRemaining}s baaki`
                : `${repCount} / ${totalTarget} reps`}
            </span>
          </div>
        </div>
      )}

      {/* ══ CELEBRATION — fixed overlay covers full screen ══ */}
      {done && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center px-6 text-center"
          style={{ backgroundColor: 'rgba(0,0,0,0.92)' }}>
          <div className="text-8xl mb-5 animate-bounce">{CELEBRATION_EMOJIS[celebrationIdx]}</div>
          <h2 className="text-white text-3xl font-bold mb-3 leading-snug">
            {CELEBRATIONS[celebrationIdx]}
          </h2>
          <p className="text-gray-300 text-lg mb-8">
            {isTimerBased ? `${elapsed}s ki mehnat ho gayi!` : `${repCount} reps complete!`} Wah wah!
          </p>
          <button onClick={goHome}
            className="bg-[#F4793B] text-white font-bold text-xl rounded-2xl px-10 py-4 active:scale-95 transition-all"
            style={{ minHeight: '64px' }}>
            Aage chalein
          </button>
        </div>
      )}
    </div>
  );
}
