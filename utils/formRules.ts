import { calculateAngle } from './pose';

type Keypoint = { x: number; y: number; visibility?: number };

export interface Feedback {
  text: string;
  isGood: boolean;
}

export interface ExerciseState {
  repCount: number;
  phase: string;
  frameBuffer: number[];
  lastFeedback: string;
}

export function createInitialState(): ExerciseState {
  return {
    repCount: 0,
    phase: 'standing',
    frameBuffer: [],
    lastFeedback: '',
  };
}

function isVisible(kp: Keypoint[], ...indices: number[]): boolean {
  return indices.every((i) => kp[i] && (kp[i].visibility ?? 0) > 0.5);
}

export function processFormRules(
  kp: Keypoint[],
  exerciseId: string,
  state: ExerciseState
): { feedback: Feedback; repDone: boolean } {
  let feedback: Feedback = { text: '', isGood: false };
  let repDone = false;

  // Both shoulders must be visible — if not, person isn't properly in frame
  if (!isVisible(kp, 11, 12)) {
    return { feedback: { text: '', isGood: false }, repDone: false };
  }

  switch (exerciseId) {
    case 'squat': {
      const angle = calculateAngle(kp[23], kp[25], kp[27]);
      if (angle > 160) feedback = { text: 'Thoda aur neeche jao! 👇', isGood: false };
      else if (angle < 70) feedback = { text: 'Itna neeche nahi! ⚠️', isGood: false };
      else if (angle >= 85 && angle <= 120) feedback = { text: 'Bilkul sahi! ✅', isGood: true };
      else feedback = { text: 'Aur neeche... sahi ja raha hai! 💪', isGood: false };

      if (angle < 110 && state.phase === 'standing') state.phase = 'squatting';
      if (angle > 150 && state.phase === 'squatting') {
        state.phase = 'standing';
        repDone = true;
      }
      break;
    }

    case 'bicep_curl': {
      const angle = calculateAngle(kp[12], kp[14], kp[16]);
      const drift = Math.abs(kp[14].x - kp[12].x);

      if (drift > 0.15) feedback = { text: 'Kohni body se chipkao! 🔒', isGood: false };
      else if (angle > 150) feedback = { text: 'Haath upar uthao! 💪', isGood: false };
      else if (angle < 40) feedback = { text: 'Wah! Ab dheere neeche ⬇️', isGood: true };
      else feedback = { text: 'Sahi ja raha hai! 🔥', isGood: true };

      if (angle < 60 && (state.phase === 'down' || state.phase === 'standing')) state.phase = 'up';
      if (angle > 150 && state.phase === 'up') {
        state.phase = 'down';
        repDone = true;
      }
      break;
    }

    case 'lateral_raise': {
      const diff = kp[12].y - kp[14].y;

      if (diff < -0.05) feedback = { text: 'Haath kandhe tak uthao! 🙌', isGood: false };
      else if (diff > 0.08) feedback = { text: 'Kandhe se upar mat jao! ⚠️', isGood: false };
      else feedback = { text: 'Perfect raise! ✅', isGood: true };

      if (diff < -0.08 && (state.phase === 'up' || state.phase === 'standing')) state.phase = 'down';
      if (diff > 0 && state.phase === 'down') {
        state.phase = 'up';
        repDone = true;
      }
      break;
    }

    case 'calf_raise': {
      const diff = kp[25].y - kp[27].y;

      if (diff > 0.35) feedback = { text: 'Panjon pe khade ho! 🦶', isGood: false };
      else if (diff < 0.15) feedback = { text: 'Upar rok ke rakho! ⬆️', isGood: true };
      else feedback = { text: 'Achha! Aur upar! 💪', isGood: false };

      if (diff < 0.20 && state.phase === 'down') state.phase = 'up';
      if (diff > 0.32 && state.phase === 'up') {
        state.phase = 'down';
        repDone = true;
      }
      break;
    }

    case 'seated_leg_raise': {
      const legRaised = kp[23].y - kp[25].y > 0.05;
      feedback = legRaised
        ? { text: 'Roko! Bahut badhiya! ✅', isGood: true }
        : { text: 'Pair seedha uthao! 🦵', isGood: false };

      if (legRaised && state.phase === 'down') state.phase = 'up';
      if (!legRaised && state.phase === 'up') {
        state.phase = 'down';
        repDone = true;
      }
      break;
    }

    case 'shoulder_roll': {
      state.frameBuffer.push(kp[11].y);
      if (state.frameBuffer.length > 30) state.frameBuffer.shift();
      const range =
        Math.max(...state.frameBuffer) - Math.min(...state.frameBuffer);
      feedback =
        range < 0.015
          ? { text: 'Ghumao, ruko mat! 🔄', isGood: false }
          : { text: 'Bahut badhiya! 🌀', isGood: true };
      break;
    }

    case 'arm_circle': {
      state.frameBuffer.push(kp[15].y);
      if (state.frameBuffer.length > 30) state.frameBuffer.shift();
      const range =
        Math.max(...state.frameBuffer) - Math.min(...state.frameBuffer);
      feedback =
        range < 0.08
          ? { text: 'Bade gol banao! ⭕', isGood: false }
          : { text: 'Sahi hai! Aise hi karo! ✅', isGood: true };
      break;
    }

    case 'march': {
      const leftUp = kp[23].y - kp[25].y > 0.05;
      const rightUp = kp[24].y - kp[26].y > 0.05;
      feedback =
        !leftUp && !rightUp
          ? { text: 'Ghutne upar uthao! 🚶', isGood: false }
          : { text: 'Chalo chalo! 🔥', isGood: true };
      break;
    }

    default:
      feedback = { text: 'Sahi karo! 💪', isGood: true };
  }

  return { feedback, repDone };
}
