# Tandrust AI 🏃

> The AI fitness coach that starts from your doctor's visit — not your gym goals.
>> git repo: https://github.com/swpnldubey/tandrust-ai.git

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

[Add Vercel URL after deployment]

## Demo Video

[Add Loom link after recording]

## Setup & Run

```bash
git clone [repo]
cd tandrust-ai
npm install
echo "NEYSA_API_KEY=psai_..." > .env.local
npm run dev
```

Open http://localhost:3000

## Tech Stack

- Next.js 16 (TypeScript, App Router), TailwindCSS 4, Hind font (Devanagari rendering)
- MediaPipe BlazePose Lite — in-browser pose estimation (Apache 2.0), zero upload
- Neysa DeepSeek V4 Flash on H100 — personalized Hindi plan generation
- Web Speech API — Hindi (hi-IN) real-time voice feedback
- Vercel deployment (HTTPS required for camera API)

## Models & Data

| Model | Provider | Purpose | License |
|---|---|---|---|
| deepseek-v4-flash | Neysa (H100) | Exercise plan generation | API |
| BlazePose Lite | Google MediaPipe | Real-time pose estimation | Apache 2.0 |

No video data transmitted. User profile (name, age, weight) sent to Neysa API for plan generation only. All data stored in browser localStorage only.

## Evaluation & Guardrails

- JSON schema prompt prevents freestyle generation — model fills a fixed template
- Reasoning disabled (`thinking: false`) for deterministic, fast output
- Server-side JSON parse validation before returning to client
- Real-time form correction is rule-based (angle thresholds) — NO LLM in correction loop — zero hallucination risk during live feedback
- Exercises selected for general beginner safety regardless of fitness level
- Conservative angle thresholds — corrections fire early

## Known Limitations

- Pose detection needs good lighting and full-body camera framing
- Hindi TTS quality varies by OS/browser (best on Chrome/Windows)
- 8 exercises in prototype; production would need physiotherapist-verified library
- localStorage only — data lost if browser storage cleared
- Not a medical app — recommend consulting doctor before starting

## Team

Lucky — Solo builder, AIBoomi Startup Weekend Bengaluru, June 2025
