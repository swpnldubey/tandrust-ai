# CLAUDE.md — Tandrust AI (AIBoomi Startup Weekend Build)

## READ THIS FIRST — FULL CONTEXT

### The Hackathon
This is **AIBoomi Startup Weekend Bengaluru**, a 24-hour in-person builder sprint running from Saturday June 20 to Sunday June 21, 2025. The format: bring your own idea, build an MVP from scratch during the event, demo it live to a jury of VCs, angels, and founders.

**Key deadlines:**
- Submissions portal closes: **9:30 AM Sunday June 22** (target 9:20 AM to be safe)
- Initial judging (at desk, max 5 min): **10:00–11:30 AM Sunday**
- Final demos (shortlisted top 5): **12:00–1:00 PM Sunday**
- Current time: **5:30 PM Saturday June 20** — approximately **16 hours remaining**

**Judging rubric (100 points):**
- Problem Relevance: 20%
- Innovation & Creativity: 20%
- Technical Execution: 25%
- UX/UI: 15%
- Business Viability: 10%
- Presentation: 10%

**Prizes:** $10,000 OpenAI credits (1st), $5,000 (2nd), $2,500 (3rd) + Neysa podcast feature + AIBoomi flagship event passes.

**Submission requires:**
1. GitHub repo with README.md
2. Live demo link (strongly recommended)
3. Pitch deck (≤6 slides)
4. AI Impact Statement (≤200 words)

**Team:** Solo builder — Lucky

### The Idea — Tandrust AI
Lucky's mother (45, 83 kg) was told by her doctor to lose 10 kg in 2 months. She has never exercised. She can't afford a trainer. Commercial fitness apps are English-first, ad-heavy, subscription-gated, and built for gym-goers — not for Indian parents who just came back from the doctor.

**The insight from competitive research:** 100M-download apps like Home Workout, BodBot, and Lose Weight App all assume the user already wants to exercise. None of them start from a doctor's visit. None have Hindi voice. None do real-time camera form correction. None are privacy-first. Tandrust owns the post-doctor-visit moment — a specific, emotionally charged user journey that no existing app addresses.

### The Tools We Are Using
| Tool | Purpose |
|---|---|
| **Next.js 14** (TypeScript, App Router) | Frontend framework |
| **TailwindCSS + Hind font** | Styling + Hindi Devanagari rendering |
| **Neysa DeepSeek V4 Flash** | AI plan generation (hackathon sponsor infra, H100-backed) |
| **MediaPipe Tasks Vision** | Real-time in-browser pose detection — no video leaves device |
| **Web Speech API** | Hindi (hi-IN) voice feedback |
| **Vercel** | Deployment (provides HTTPS required for camera) |
| **localStorage** | All user data — no database, no auth |

**Neysa API details:**
- Base URL: `https://neysa-deepseek-v4flash.pipeshift.com/v1`
- Model: `deepseek-v4-flash`
- OpenAI-compatible SDK — just swap `baseURL`
- Disable reasoning for speed: `chat_template_kwargs: { thinking: false }`
- Auth: `Authorization: Bearer psai_...` (get key from Neysa desk)

**What we are NOT using:**
- ❌ OpenAI (no credits available)
- ❌ FastRouter (redundant with Neysa)
- ❌ Scalekit (enterprise SSO — irrelevant for this app)
- ❌ Firebase / any backend database
- ❌ Any auth / login system

### The Plan
Build a working web app with 4 screens and submit by 9:20 AM. That is the only goal. Not a perfect app. A working demo that a judge can open on a laptop, enter their details, and see their skeleton tracked on camera with Hindi voice feedback.

**The demo moment:** Judge opens laptop camera → does a squat → sees orange skeleton overlay on their body → hears "Thoda aur neeche jao!" in Hindi → "Wah! Ekdum mast! 🎉" on completion. That's the aha moment. Everything else is secondary.

**Build screen by screen. Do not move to the next screen until the current one runs without errors.**

**Build screen by screen. Do not move to the next screen until the current one runs without errors. Show me each screen before proceeding.**

---

## The One-Line Pitch

**Tandrust AI is the only fitness coach that starts from your doctor's visit — not your gym goals.**

Every other app (Home Workout 100M downloads, BodBot 10M, Lose Weight App 100M) assumes you already want to exercise. Tandrust starts at the moment your doctor says "you need to lose weight" — and walks you through what to do next, watching your form live via camera.

---

## The User

Indian parent, 40–65 years old. Just came back from the doctor. Told to lose weight, reduce BP, manage diabetes risk. Has never exercised. Intimidated by gym apps showing young fit Western bodies. Doesn't want ads interrupting them. Prefers Hindi voice instructions. Worried about privacy — doesn't want their workout video uploaded anywhere.

This is not a generic fitness app. It is a post-doctor-visit AI coach.

---

## Tech Stack

- **Framework:** Next.js 14, App Router, TypeScript
- **Styling:** TailwindCSS + Hind font from Google Fonts (renders Hindi Devanagari beautifully)
- **Pose Detection:** `@mediapipe/tasks-vision` — runs 100% in browser, no video leaves device
- **AI Plan Generation:** Neysa DeepSeek V4 Flash via OpenAI-compatible SDK
  - Base URL: `https://neysa-deepseek-v4flash.pipeshift.com/v1`
  - Model: `deepseek-v4-flash`
  - Auth: `Authorization: Bearer ${process.env.NEYSA_API_KEY}`
  - Disable reasoning: `chat_template_kwargs: { thinking: false }`
- **Voice:** Web Speech API, `lang: 'hi-IN'`
- **Storage:** localStorage only — no database, no backend, no Firebase
- **Deploy:** Vercel (provides HTTPS which MediaPipe camera requires)

---

## Environment Variables

`.env.local`:
```
NEYSA_API_KEY=psai_...
```
Add same key to Vercel dashboard before deploying.

---

## Install Commands

```bash
npx create-next-app@latest tandrust-ai --typescript --tailwind --app
cd tandrust-ai
npm install @mediapipe/tasks-vision openai
```

---

## App Flow — 4 Screens

```
Screen 1: Privacy Screen (camera permission)
    ↓ user taps "Allow Camera"
Screen 2: Onboarding (one-time, saves to localStorage)
    ↓ AI generates plan
Screen 3: Home (seen every day)
    ↓ user taps an exercise card
Screen 4: Camera Coach (the demo moment)
    ↓ "Ho gaya ✓" → back to Home
```

---

## SCREEN 1: Privacy Screen

Show this BEFORE requesting camera permission. It is a feature, not a legal disclaimer.

```
Full screen, background: #F4793B (saffron)

Centre content:
  Large lock icon: 🔒
  
  Heading (white, bold, 32px):
  "Aapka camera sirf aapke paas"
  
  Subheading (white, 18px, max-w-sm, centered):
  "Tandrust AI apke camera ko sirf aapke device pe
  use karta hai. Koi bhi video, photo, ya body data
  kabhi bhi kisi server pe nahi jaata."
  
  English below (white, 14px, opacity 80%):
  "All pose detection runs on your device.
  Nothing is uploaded. Ever."

Big white button (full width, 56px height, rounded-xl):
  "Camera allow karein 📷"
  → onClick: call getUserMedia → on success → navigate to /onboarding
  
Small text below button (white, 12px):
  "Camera access is only used while you exercise"
```

---

## SCREEN 2: Onboarding

One-time. Check `localStorage.getItem('tandrust_profile')` on app load — if exists, skip to `/home`.

### Layout

```
Background: #FFF8F3 (warm off-white)
Top: Tandrust AI logo text (saffron, bold, 24px)

Heading (28px, bold, #1A1A1A):
"Pehle thoda jaana pehchaana ho jaye 😄"

Subtext (16px, #6B6B6B):
"Aapki jaankari se hum aapke liye
sahi exercise plan banayenge"
```

### Form Fields (large labels, large inputs, 56px min height)

```
Label: "Aapka naam?"
Input: text, placeholder: "Jaise: Sunita, Rekha, Ramesh..."

Label: "Umar (years)"  
Input: number, default: 50

Label: "Gender"
Segmented buttons (large, easy tap):
  [ 👩 Female ]  [ 👨 Male ]

Label: "Abhi ka wajan (kg)"
Input: number, default: 80

Label: "Doctor ne kya kaha?"
Subtext: "Ye optional hai, par isse hum better plan bana sakte hain"
Text area (3 rows), placeholder:
"Jaise: 10 kg wajan kam karna hai, BP thoda high hai,
ghutne mein dard hota hai kabhi kabhi..."

Label: "Kitna wajan kam karna hai?"
Segmented buttons:
  [ 3 kg ]  [ 5 kg ]  [ 8 kg ]  [ 10 kg ]
Default selected: 5 kg
```

### Submit Button

```
Full width, 64px height, background: #F4793B, white text, bold 20px:
"Plan banao 🚀"

→ onClick:
  1. Show loading state: "DeepSeek aapka plan bana raha hai... 🤔"
  2. POST to /api/generate-plan with form data
  3. On success: save { profile, plan } to localStorage
  4. Navigate to /home
  5. On error: show "Dobara try karein" button — never leave user stuck
```

---

## SCREEN 3: Home

Read everything from localStorage. This is what the user sees every day.

### Top Section

```
Greeting (28px bold): "[plan.greeting]"  ← from DeepSeek response
Daily tip card (saffron bg, white text, rounded-xl, p-4):
  "💡 Aaj ka tip: [plan.dailyTip]"
```

### Progress Card

```
White card, shadow, rounded-xl, p-4

Title: "🎯 Aapka lakshya"

Row: "Shuru: [currentWeight] kg  →  Goal: [goalWeight] kg"

Progress bar:
  width: ((currentWeight - latestWeight) / (currentWeight - goalWeight)) * 100 + "%"
  background: #F4793B
  height: 12px, rounded-full

Encouragement text below bar:
  0%:    "Shuruat ho gayi — yahi kaafi hai! 🌱"
  1-25%: "Wah! Chal padi ho! 💪"
  26-50%: "Aadhe raste par ho! 🔥"
  51-75%: "Bahut badhiya! Lakshya paas aa raha hai! 🌟"
  76-99%: "Bas thoda sa baaki! Chhoo lo isko! 🎯"
  100%:  "KAR DIYA!!! 🎉🎉🎉 Doctor bhi khush honge!"

Small button below: "⚖️ Aaj ka wajan likhein"
  → opens simple prompt() for weight input (hackathon-grade is fine)
  → saves to localStorage as latestWeight
```

### Exercise Grid

8 cards in 2×4 grid (on mobile) or 4×2 (on desktop).

Each card:
```
White bg, rounded-xl, shadow-sm, p-4, cursor-pointer
hover: scale-105 transition

Large emoji (40px): exercise.emoji
Hindi name (18px bold): exercise.hindiName
English name (13px, #6B6B6B): exercise.englishName
Category tag (12px, saffron bg, rounded-full, px-2): exercise.category

If today's exercise is done → green ✅ badge top-right corner

onClick → router.push('/camera?exercise=' + exercise.id)
```

### Doctor's Note Card (bottom of screen)

```
Light blue card (#EBF5FB), rounded-xl, p-4
Icon: 🩺
Text (14px): "Doctor ne kaha tha: [profile.doctorNote]"
Subtext (12px, grey): "Yeh note aapke plan mein consider kiya gaya hai"

Only show if profile.doctorNote is not empty
```

---

## SCREEN 4: Camera Coach

This is the demo moment. This is what judges see. Make it look impressive.

### Layout

```
Full screen, dark background (#0F0F0F)

TOP BAR (fixed, z-50):
  ← back button (white, large)  |  Exercise name (white, bold)  |  🔒 On-device (blue pill)
  Below: rep counter or timer    |                               |

MIDDLE (full screen):
  <video> element — mirrored (transform: scaleX(-1)), full width
  <canvas> — position: absolute, inset: 0, same dimensions as video
              pointer-events: none
              draws saffron (#F4793B) skeleton on top of video

FEEDBACK BOX (fixed bottom, above button):
  Dark semi-transparent bg (#000000CC), rounded-xl, mx-4, p-4
  Large white text (20px bold): current feedback message
  Example: "Thoda aur neeche jao! 👇"
  
  🔊 button (small, right side): replays voice cue

HO GAYA BUTTON (fixed, very bottom):
  Full width minus margins, 64px height
  Background: #2ECC71 (success green)
  White bold text 20px: "Ho gaya ✓"
  → onClick: mark done, show celebration, go home
```

### Privacy Badge (always visible in top bar)

```
Small pill: 🔒 On-device
Background: #1A73E8 (trust blue)
White text, 11px
Tooltip on hover: "Video aapke device pe hi process hoti hai"
```

---

## Neysa API Route

### `/app/api/generate-plan/route.ts`

```typescript
import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://neysa-deepseek-v4flash.pipeshift.com/v1',
  apiKey: process.env.NEYSA_API_KEY!,
});

export async function POST(req: Request) {
  const { name, age, gender, currentWeight, goalWeight, doctorNote, weightLossGoal } = await req.json();

  const response = await client.chat.completions.create({
    model: 'deepseek-v4-flash',
    max_tokens: 2000,
    temperature: 0.7,
    stream: false,
    // @ts-ignore
    chat_template_kwargs: { thinking: false },
    messages: [
      {
        role: 'system',
        content: 'You are a gentle, expert fitness coach for Indian beginners aged 40-65. You specialize in post-doctor-visit exercise planning. Respond ONLY with valid JSON. No markdown. No explanation outside JSON.',
      },
      {
        role: 'user',
        content: `Create a personalized home exercise plan for this person who just came back from their doctor:

Name: ${name}
Age: ${age}
Gender: ${gender}
Current weight: ${currentWeight} kg
Goal: Lose ${weightLossGoal} kg (target: ${currentWeight - weightLossGoal} kg)
Doctor's advice / health concerns: ${doctorNote || 'General weight loss advised'}
Equipment: Water bottles (500ml) only
Fitness level: Complete beginner, never exercised before
Location: Home in India

IMPORTANT: This person has NEVER exercised before. The doctor sent them here. Be gentle, encouraging, and start very easy. Account for any health concerns mentioned above.

Return ONLY this JSON:
{
  "greeting": "Warm 2-sentence Hindi welcome for ${name}, acknowledge they took a brave step after doctor visit",
  "dailyTip": "One practical Hindi tip relevant to their doctor's advice",
  "exercises": [
    {
      "id": "squat",
      "hindiName": "हल्का स्क्वाट",
      "englishName": "Mini Squat",
      "emoji": "🦵",
      "category": "Legs",
      "reps": 10,
      "rounds": 2,
      "durationSec": null,
      "equipment": "None",
      "voiceCue": "2-3 Hindi sentences to speak aloud when starting",
      "whyItHelps": "One Hindi sentence on why this helps their specific situation"
    },
    { "id": "bicep_curl", "hindiName": "बोतल कर्ल", "englishName": "Bottle Curl", "emoji": "💪", "category": "Arms", "reps": 12, "rounds": 2, "durationSec": null, "equipment": "2 water bottles", "voiceCue": "...", "whyItHelps": "..." },
    { "id": "lateral_raise", "hindiName": "साइड रेज़", "englishName": "Lateral Raise", "emoji": "🙌", "category": "Shoulders", "reps": 10, "rounds": 2, "durationSec": null, "equipment": "2 water bottles", "voiceCue": "...", "whyItHelps": "..." },
    { "id": "calf_raise", "hindiName": "पंजे उठाना", "englishName": "Calf Raise", "emoji": "🦶", "category": "Legs", "reps": 15, "rounds": 2, "durationSec": null, "equipment": "None", "voiceCue": "...", "whyItHelps": "..." },
    { "id": "seated_leg_raise", "hindiName": "बैठ के पैर उठाना", "englishName": "Seated Leg Raise", "emoji": "🪑", "category": "Core", "reps": 10, "rounds": 2, "durationSec": null, "equipment": "Chair", "voiceCue": "...", "whyItHelps": "..." },
    { "id": "shoulder_roll", "hindiName": "कंधे घुमाना", "englishName": "Shoulder Rolls", "emoji": "🔄", "category": "Warm-up", "reps": null, "rounds": 2, "durationSec": 20, "equipment": "None", "voiceCue": "...", "whyItHelps": "..." },
    { "id": "arm_circle", "hindiName": "हाथ घुमाना", "englishName": "Arm Circles", "emoji": "⭕", "category": "Warm-up", "reps": null, "rounds": 2, "durationSec": 20, "equipment": "None", "voiceCue": "...", "whyItHelps": "..." },
    { "id": "march", "hindiName": "जगह पर चलना", "englishName": "March in Place", "emoji": "🚶", "category": "Cardio", "reps": null, "rounds": 1, "durationSec": 60, "equipment": "None", "voiceCue": "...", "whyItHelps": "..." }
  ],
  "motivationalMessage": "Closing warm Hindi message for ${name} — acknowledge the doctor visit, celebrate that they started, mention the ${currentWeight - weightLossGoal}kg goal"
}`,
      },
    ],
  });

  const text = response.choices[0]?.message?.content ?? '';
  try {
    const clean = text.replace(/```json|```/g, '').trim();
    return Response.json(JSON.parse(clean));
  } catch {
    return Response.json({ error: 'Parse failed', raw: text }, { status: 500 });
  }
}
```

---

## MediaPipe Setup

```typescript
import { PoseLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';

// Initialize once when camera screen loads
const vision = await FilesetResolver.forVisionTasks(
  'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
);
const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
  baseOptions: {
    modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
    delegate: 'GPU',
  },
  runningMode: 'VIDEO',
  numPoses: 1,
});

// Detection loop — start only after video.readyState >= 2
function detect() {
  if (!videoRef.current || !canvasRef.current) return;
  const results = poseLandmarker.detectForVideo(videoRef.current, performance.now());
  if (results.landmarks[0]) {
    drawSkeleton(results.landmarks[0], canvasRef.current);
    processFormRules(results.landmarks[0], exerciseId);
  }
  requestAnimationFrame(detect);
}
```

**Common failures — fix these before moving on:**
- WASM not loading → use the CDN path above exactly
- Camera permission denied → show a helpful message, link back to Screen 1
- Canvas blank → set canvas width/height from `video.videoWidth/videoHeight` on `video.onloadedmetadata`
- MediaPipe needs HTTPS → Vercel handles this; localhost works for dev too

---

## Pose Utilities (`/utils/pose.ts`)

```typescript
export function calculateAngle(
  a: { x: number; y: number },
  b: { x: number; y: number },
  c: { x: number; y: number }
): number {
  const rad = Math.atan2(c.y - b.y, c.x - b.x) - Math.atan2(a.y - b.y, a.x - b.x);
  let angle = Math.abs(rad * 180 / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
}

export function drawSkeleton(
  kp: Array<{ x: number; y: number; visibility?: number }>,
  canvas: HTMLCanvasElement
) {
  const ctx = canvas.getContext('2d')!;
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  const connections = [
    [11,12],[11,13],[13,15],[12,14],[14,16],
    [11,23],[12,24],[23,24],
    [23,25],[25,27],[24,26],[26,28],
  ];
  
  ctx.strokeStyle = '#F4793B';
  ctx.lineWidth = 3;
  for (const [i, j] of connections) {
    const a = kp[i], b = kp[j];
    if ((a.visibility ?? 1) > 0.5 && (b.visibility ?? 1) > 0.5) {
      ctx.beginPath();
      ctx.moveTo(a.x * canvas.width, a.y * canvas.height);
      ctx.lineTo(b.x * canvas.width, b.y * canvas.height);
      ctx.stroke();
    }
  }
  
  ctx.fillStyle = '#FFFFFF';
  for (const p of kp) {
    if ((p.visibility ?? 1) > 0.5) {
      ctx.beginPath();
      ctx.arc(p.x * canvas.width, p.y * canvas.height, 5, 0, 2 * Math.PI);
      ctx.fill();
    }
  }
}
```

---

## Form Rules — All 8 Exercises

```typescript
// /utils/formRules.ts
import { calculateAngle } from './pose';

type Keypoint = { x: number; y: number; visibility?: number };
type Feedback = { text: string; isGood: boolean };

// State that persists between frames — store in useRef
export interface ExerciseState {
  repCount: number;
  phase: string;
  frameBuffer: number[];  // rolling buffer for time-based exercises
  lastFeedback: string;
}

export function processFormRules(
  kp: Keypoint[],
  exerciseId: string,
  state: ExerciseState
): { feedback: Feedback; repDone: boolean } {
  let feedback: Feedback = { text: '', isGood: false };
  let repDone = false;

  switch (exerciseId) {
    case 'squat': {
      const angle = calculateAngle(kp[23], kp[25], kp[27]);
      if (angle > 160) feedback = { text: 'Thoda aur neeche jao! 👇', isGood: false };
      else if (angle < 70) feedback = { text: 'Itna neeche nahi! ⚠️', isGood: false };
      else if (angle >= 85 && angle <= 120) feedback = { text: 'Bilkul sahi! ✅', isGood: true };
      // Rep: down (angle<110) then up (angle>150)
      if (angle < 110 && state.phase === 'standing') state.phase = 'squatting';
      if (angle > 150 && state.phase === 'squatting') { state.phase = 'standing'; repDone = true; }
      break;
    }
    case 'bicep_curl': {
      const angle = calculateAngle(kp[12], kp[14], kp[16]);
      const drift = Math.abs(kp[14].x - kp[12].x);
      if (drift > 0.15) feedback = { text: 'Kohni body se chipkao! 🔒', isGood: false };
      else if (angle > 150) feedback = { text: 'Haath upar uthao! 💪', isGood: false };
      else if (angle < 40) feedback = { text: 'Wah! Ab dheere neeche ⬇️', isGood: true };
      else feedback = { text: 'Sahi ja raha hai! 🔥', isGood: true };
      if (angle < 60 && state.phase === 'down') state.phase = 'up';
      if (angle > 150 && state.phase === 'up') { state.phase = 'down'; repDone = true; }
      break;
    }
    case 'lateral_raise': {
      const diff = kp[12].y - kp[14].y;
      if (diff < -0.05) feedback = { text: 'Haath kandhe tak uthao! 🙌', isGood: false };
      else if (diff > 0.08) feedback = { text: 'Kandhe se upar mat jao! ⚠️', isGood: false };
      else feedback = { text: 'Perfect raise! ✅', isGood: true };
      if (diff < -0.08 && state.phase === 'up') state.phase = 'down';
      if (diff > 0 && state.phase === 'down') { state.phase = 'up'; repDone = true; }
      break;
    }
    case 'calf_raise': {
      const diff = kp[25].y - kp[27].y;
      if (diff > 0.35) feedback = { text: 'Panjon pe khade ho! 🦶', isGood: false };
      else if (diff < 0.15) feedback = { text: 'Upar rok ke rakho! ⬆️', isGood: true };
      if (diff < 0.20 && state.phase === 'down') state.phase = 'up';
      if (diff > 0.32 && state.phase === 'up') { state.phase = 'down'; repDone = true; }
      break;
    }
    case 'seated_leg_raise': {
      const legRaised = kp[23].y - kp[25].y > 0.05;
      feedback = legRaised
        ? { text: 'Roko! Bahut badhiya! ✅', isGood: true }
        : { text: 'Pair seedha uthao! 🦵', isGood: false };
      if (legRaised && state.phase === 'down') state.phase = 'up';
      if (!legRaised && state.phase === 'up') { state.phase = 'down'; repDone = true; }
      break;
    }
    case 'shoulder_roll': {
      state.frameBuffer.push(kp[11].y);
      if (state.frameBuffer.length > 30) state.frameBuffer.shift();
      const range = Math.max(...state.frameBuffer) - Math.min(...state.frameBuffer);
      feedback = range < 0.015
        ? { text: 'Ghumao, ruko mat! 🔄', isGood: false }
        : { text: 'Bahut badhiya! 🌀', isGood: true };
      break; // timer-based, repDone not used
    }
    case 'arm_circle': {
      state.frameBuffer.push(kp[15].y);
      if (state.frameBuffer.length > 30) state.frameBuffer.shift();
      const range = Math.max(...state.frameBuffer) - Math.min(...state.frameBuffer);
      feedback = range < 0.08
        ? { text: 'Bade gol banao! ⭕', isGood: false }
        : { text: 'Sahi hai! Aise hi karo! ✅', isGood: true };
      break; // timer-based
    }
    case 'march': {
      const leftUp = kp[23].y - kp[25].y > 0.05;
      const rightUp = kp[24].y - kp[26].y > 0.05;
      feedback = (!leftUp && !rightUp)
        ? { text: 'Ghutne upar uthao! 🚶', isGood: false }
        : { text: 'Chalo chalo! 🔥', isGood: true };
      break; // timer-based
    }
  }

  return { feedback, repDone };
}
```

---

## Hindi Voice (`/utils/speech.ts`)

```typescript
let lastSpoken = 0;
const COOLDOWN = 3000;

export function speak(text: string, force = false) {
  if (!force && Date.now() - lastSpoken < COOLDOWN) return;
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'hi-IN';
  u.rate = 0.9;
  u.pitch = 1.05;
  const voices = speechSynthesis.getVoices();
  const v = voices.find(v => v.lang === 'hi-IN') || voices.find(v => v.lang.startsWith('hi'));
  if (v) u.voice = v;
  speechSynthesis.cancel();
  speechSynthesis.speak(u);
  lastSpoken = Date.now();
}
```

**CRITICAL:** Call `speechSynthesis.getVoices()` only inside a button onClick handler. Never on mount. Browser blocks TTS without a user gesture.

---

## Colours & Design Tokens

```css
/* globals.css */
:root {
  --primary:        #F4793B;  /* Saffron */
  --background:     #FFF8F3;  /* Warm off-white */
  --surface:        #FFFFFF;
  --text:           #1A1A1A;
  --text-secondary: #6B6B6B;
  --success:        #2ECC71;
  --accent:         #F4C430;  /* Turmeric */
  --privacy:        #1A73E8;  /* Trust blue */
}
```

Font in `layout.tsx`:
```typescript
import { Hind } from 'next/font/google';
const hind = Hind({ subsets: ['devanagari', 'latin'], weight: ['400', '600', '700'] });
```

Minimum font size: 16px body, 18px instructions, 28px headings, 18px buttons.
Minimum tap target: 56px height.

---

## Celebration Messages (random on "Ho gaya" tap)

```typescript
const CELEBRATIONS = [
  'Wah! Ekdum mast! 🎉',
  'Doctor sahab khush honge! 🩺😄',
  'Ek aur step sehat ki taraf! 🌟',
  'Champion ho aap! 🏆',
  'Bahut badhiya! Kal bhi karna! 🔥',
  'Himmat karke shuru kiya — yahi sabse bada kaam hai! ❤️',
  'Aaj ka kaam ho gaya! 💪',
  'Mast chal raha hai! Aise hi chalo! 😄',
];
```

---

## Build Order — DO NOT SKIP STEPS

1. **Setup + first deploy to Vercel** (30 min) — get live HTTPS URL before writing features
2. **Neysa API route** `/api/generate-plan` (20 min) — test with curl/Postman before building UI
3. **Privacy screen** — Screen 1, camera permission (15 min)
4. **Onboarding** — Screen 2, form + API call + localStorage save (30 min)
5. **Home screen** — Screen 3, greeting + progress + 8 exercise cards (30 min)
6. **Camera scaffold** — Screen 4, video + canvas stacked, confirm video plays (20 min)
7. **MediaPipe** — skeleton detection and drawing (45 min — allow extra time)
8. **Form rules + voice** — wire processFormRules + speak() (30 min)
9. **Rep counter + Ho gaya** — completion flow + celebration (20 min)
10. **README + Loom recording** — do this by 8:30 AM at latest (30 min)

---

## README.md (complete — paste this in)

```markdown
# Tandrust AI 🏃

> The AI fitness coach that starts from your doctor's visit — not your gym goals.

## Problem & Who It Affects
Every major fitness app (Home Workout: 100M downloads, BodBot: 10M, Lose Weight App: 100M) assumes the user already wants to exercise. Nobody builds for the moment a doctor says "you need to lose weight" to someone who has never exercised in their life.

In India, 200M+ adults aged 40-65 are sedentary. Exercise is seen as an indulgence of the elite. When a doctor finally tells a parent to get active, they have nowhere to go — apps are English-first, show young Western bodies, are full of ads, and give zero feedback on whether they're doing it right.

## Users & Context
Indian parents aged 40–65 who:
- Just received medical advice to exercise (weight loss, BP, diabetes risk)
- Have never been to a gym or followed an exercise routine
- Prefer Hindi voice instructions over English text
- Are concerned about privacy — do not want workout video uploaded
- Use basic smartphones and are not tech-savvy

## Solution
Tandrust AI is a browser-based AI fitness coach that:
1. Asks about your doctor's advice — and uses it to personalize your plan
2. Generates a beginner-safe, home-friendly 8-exercise plan via Neysa DeepSeek V4 Flash
3. Opens your camera and watches your form in real-time using MediaPipe (100% on-device)
4. Gives live Hindi voice correction when form breaks ("Thoda aur neeche jao!")
5. Celebrates every completed exercise with warm, encouraging messages

**Privacy by design:** No video, no frames, no keypoints ever leave your device.

## Live Demo
[Vercel URL]

## Demo Video
[Loom link]

## Setup & Run
\`\`\`bash
git clone [repo]
cd tandrust-ai
npm install
echo "NEYSA_API_KEY=psai_..." > .env.local
npm run dev
\`\`\`

## Tech Stack
- Next.js 14 (TypeScript), TailwindCSS, Hind font
- MediaPipe BlazePose Lite — in-browser pose estimation (Apache 2.0)
- Neysa DeepSeek V4 Flash on H100 — personalized plan generation
- Web Speech API — Hindi (hi-IN) voice feedback
- Vercel deployment

## Models & Data
| Model | Provider | Purpose | License |
|---|---|---|---|
| deepseek-v4-flash | Neysa (H100) | Exercise plan generation | API |
| BlazePose Lite | Google MediaPipe | Real-time pose estimation | Apache 2.0 |

No video data transmitted. User profile (name, age, weight) sent to Neysa API for plan generation only. All data stored in browser localStorage.

## Evaluation & Guardrails
- JSON schema prompt prevents freestyle generation — model fills a fixed template
- Reasoning disabled (`thinking: false`) for deterministic, fast output
- Server-side JSON parse validation before returning to client
- Real-time form correction is rule-based (angle thresholds) — NO LLM in correction loop — zero hallucination risk during live feedback
- Exercises selected for general beginner safety regardless of fitness level
- Conservative angle thresholds — corrections fire early
- "Stop if you feel pain" voice prompt at session start

## Known Limitations
- Pose detection needs good lighting and full-body camera framing
- Hindi TTS quality varies by OS/browser (best on Chrome/Windows)
- 8 exercises in prototype; production would need physiotherapist-verified library
- localStorage only — data lost if browser storage cleared
- Not a medical app — recommend consulting doctor before starting

## Team
[Your name] — Solo, AIBoomi Startup Weekend Bengaluru, June 2025
```

---

## AI Impact Statement (copy-paste into submission form)

Tandrust AI uses two AI components. Neysa's DeepSeek V4 Flash (H100 infrastructure) generates personalized Hindi-language exercise plans calibrated to the user's doctor's advice, age, weight, and health concerns. Reasoning is disabled for speed and determinism. A strict JSON schema prompt prevents hallucination in plan generation; server-side validation rejects malformed output.

MediaPipe BlazePose Lite (Google, Apache 2.0) performs real-time body pose estimation entirely in the browser via WebAssembly. No video, frames, or keypoints ever leave the user's device — a deliberate privacy-first design choice. Real-time form correction uses deterministic angle-threshold rules, not LLM inference, ensuring zero hallucination risk during live exercise feedback.

Data: user video never transmitted. Name, age, weight sent to Neysa API for plan generation only, not stored server-side. All user data in browser localStorage. Bias mitigations: exercises safe for general Indian beginners aged 40-65 regardless of fitness level. Guardrails include conservative correction thresholds and stop-if-pain voice prompts.

---

## Constraints

- ❌ No OpenAI (no credits — use Neysa)
- ❌ No FastRouter
- ❌ No Scalekit
- ❌ No Firebase / database / auth
- ❌ No features beyond this spec
- ✅ Get psai_ key from Neysa desk NOW before writing API code
- ✅ Deploy to Vercel in Step 1 — camera needs HTTPS
- ✅ Test Hindi TTS on demo laptop specifically
- ✅ Record fallback Loom video by 8 AM (skeleton + voice visible)
- ✅ Submit by 9:20 AM

