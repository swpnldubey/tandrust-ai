# CHANGES.md — Tandrust AI Session Log

## [Step 1] — Project audit
- Files created/modified: CHANGES.md
- Status: Working
- What works: Fresh Next.js 16 app, @mediapipe/tasks-vision + openai installed, .env.local with NEYSA_API_KEY present
- What's next: Build all files
- Any errors or blockers: None

## [Step 2] — Foundational files
- Files created/modified: app/globals.css, app/layout.tsx, app/page.tsx
- Status: Working
- What works: Hind font loaded (devanagari + latin), design tokens in CSS variables + @theme, root page redirects to /privacy or /home based on localStorage
- What's next: API route + utils

## [Step 3] — API route + utility files
- Files created/modified: app/api/generate-plan/route.ts, utils/pose.ts, utils/speech.ts, utils/formRules.ts
- Status: Working
- What works:
  - Neysa DeepSeek V4 Flash API route (OpenAI-compatible, cast to `any` to pass chat_template_kwargs)
  - pose.ts: calculateAngle + drawSkeleton with saffron skeleton, white dots
  - speech.ts: Hindi hi-IN TTS with 3s cooldown, force flag
  - formRules.ts: all 8 exercise form rules (squat, bicep_curl, lateral_raise, calf_raise, seated_leg_raise, shoulder_roll, arm_circle, march)
- What's next: Screens

## [Step 4] — All 4 screens built
- Files created/modified:
  - app/privacy/page.tsx (Screen 1)
  - app/onboarding/page.tsx (Screen 2)
  - app/home/page.tsx (Screen 3)
  - app/camera/page.tsx + app/camera/CameraCoach.tsx (Screen 4)
  - next.config.ts (turbopack root fix)
- Status: Working ✅ — `npm run build` passes clean, dev server responds 200
- What works:
  - Screen 1: Saffron privacy screen, camera permission, redirects to /onboarding
  - Screen 2: Full onboarding form (name, age, gender, weight, doctor note, goal), calls Neysa API, saves to localStorage
  - Screen 3: Home dashboard with greeting, daily tip, progress bar, 8 exercise cards, doctor note
  - Screen 4: Camera + MediaPipe skeleton overlay (saffron), form feedback, rep counter, timer, voice cues, "Ho gaya" completion
- Any errors or blockers:
  - chat_template_kwargs is not in OpenAI SDK types — worked around with `as any` cast
  - Turbopack root warning fixed in next.config.ts

## What's next
1. Test the full flow in browser (camera, pose detection, Hindi TTS)
2. Deploy to Vercel for HTTPS (required for camera in production)
3. Get NEYSA_API_KEY into Vercel env vars
4. Record Loom demo by 8 AM
5. Submit by 9:20 AM
