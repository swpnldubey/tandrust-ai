import OpenAI from 'openai';

const client = new OpenAI({
  baseURL: 'https://neysa-deepseek-v4-flash.pipeshift.com/v1',
  apiKey: process.env.NEYSA_API_KEY!,
});

function buildFallbackPlan(name: string, currentWeight: number, goalWeight: number, doctorNote: string, weightLossGoal: number) {
  const concern = doctorNote?.toLowerCase() || '';
  const hasBP = concern.includes('bp') || concern.includes('blood pressure');
  const hasKnee = concern.includes('ghutne') || concern.includes('knee');

  const dailyTip = hasBP
    ? 'Roz subah 10 minute ki walk zaroor karein — BP ke liye yeh bahut faydemand hai.'
    : hasKnee
    ? 'Ghutne dard mein seated exercises sabse safe hain — chair pe baith ke karo.'
    : `Pani khub piyo — din mein kam se kam 8 glass. Yeh wajan ghataane mein madad karta hai.`;

  return {
    greeting: `${name} ji, aapne bilkul sahi faisla kiya! Doctor ki baat sunna aur exercise shuru karna — yeh bahut himmat ka kaam hai. Hum milke ${weightLossGoal} kg ghataayenge, dheere dheere aur sahi tarike se.`,
    dailyTip,
    exercises: [
      {
        id: 'squat',
        hindiName: 'हल्का स्क्वाट',
        englishName: 'Mini Squat',
        emoji: '🦵',
        category: 'Legs',
        reps: hasKnee ? 8 : 10,
        rounds: 2,
        durationSec: null,
        equipment: 'None',
        voiceCue: 'Paon kandhe ki seedh mein rakhein, dheere neeche jao jaise kursi pe baithne wale ho. Ghutne paon ki ungli se aage na jaayen.',
        whyItHelps: 'Squat karne se pair ki muscles mazboot hoti hain aur wajan ghataane mein madad milti hai.',
      },
      {
        id: 'bicep_curl',
        hindiName: 'बोतल कर्ल',
        englishName: 'Bottle Curl',
        emoji: '💪',
        category: 'Arms',
        reps: 12,
        rounds: 2,
        durationSec: null,
        equipment: '2 water bottles',
        voiceCue: 'Paani ki bottle dono haathon mein lo. Kohni seedhi rakho, dheere haath upar uthao aur dheere neeche laao.',
        whyItHelps: 'Baahon ki muscles mazboot hoti hain aur calorie burn hoti hai.',
      },
      {
        id: 'lateral_raise',
        hindiName: 'साइड रेज़',
        englishName: 'Lateral Raise',
        emoji: '🙌',
        category: 'Shoulders',
        reps: 10,
        rounds: 2,
        durationSec: null,
        equipment: '2 water bottles',
        voiceCue: 'Bottle dono taraf pakdo. Dono haath ek saath kandhe tak uthao, ek second roko, phir neeche laao.',
        whyItHelps: 'Kandhe aur upper body mazboot hote hain — posture sudarta hai.',
      },
      {
        id: 'shoulder_roll',
        hindiName: 'कंधे घुमाना',
        englishName: 'Shoulder Rolls',
        emoji: '🔄',
        category: 'Warm-up',
        reps: null,
        rounds: 2,
        durationSec: 20,
        equipment: 'None',
        voiceCue: 'Haath dhile chhod do. Dono kandhe ek saath aage ki taraf gol gol ghumaao. Phir peeche ki taraf ghumaao.',
        whyItHelps: 'Kandhe aur gardan ki akadahat door hoti hai — perfect warm-up.',
      },
      {
        id: 'march',
        hindiName: 'जगह पर चलना',
        englishName: 'March in Place',
        emoji: '🚶',
        category: 'Cardio',
        reps: null,
        rounds: 1,
        durationSec: 60,
        equipment: 'None',
        voiceCue: 'Ek jagah khade hokar chalna shuru karo. Ghutne thoda upar uthao, haath bhi hilao. Apni speed se karo — koi jaldi nahi.',
        whyItHelps: hasBP
          ? 'Dil ki dharkan badhti hai aur BP control mein rehta hai — best cardio for beginners.'
          : 'Heart rate badhti hai aur calorie burn hoti hai — sabse safe cardio.',
      },
    ],
    motivationalMessage: `${name} ji, aaj aapne pehla kadam uthaya — aur yahi sabse mushkil tha! ${currentWeight} se ${goalWeight} kg tak ka safar mushkil lagta hai, par roz thodi thodi koshish se yeh possible hai. Doctor ne jo kaha, hum woh kaam karenge — saath mein. Aap kar sakte hain! 💪`,
  };
}

export async function POST(req: Request) {
  const { name, age, gender, currentWeight, goalWeight, doctorNote, weightLossGoal } =
    await req.json();

  const prompt = `Create a personalized home exercise plan for this person who just came back from their doctor:

Name: ${name}
Age: ${age}
Gender: ${gender}
Current weight: ${currentWeight} kg
Goal: Lose ${weightLossGoal} kg (target: ${goalWeight} kg)
Doctor's advice / health concerns: ${doctorNote || 'General weight loss advised'}
Equipment: Water bottles (500ml) only
Fitness level: Complete beginner, never exercised before
Location: Home in India

IMPORTANT: This person has NEVER exercised before. The doctor sent them here. Be gentle, encouraging, and start very easy. Account for any health concerns mentioned above.

Return ONLY this JSON (no markdown, no extra text):
{
  "greeting": "Warm 2-sentence Hindi welcome for ${name}, acknowledge they took a brave step after doctor visit",
  "dailyTip": "One practical Hindi tip relevant to their doctor's advice",
  "exercises": [
    { "id": "shoulder_roll", "hindiName": "कंधे घुमाना", "englishName": "Shoulder Rolls", "emoji": "🔄", "category": "Warm-up", "reps": null, "rounds": 2, "durationSec": 20, "equipment": "None", "voiceCue": "2-3 Hindi sentences", "whyItHelps": "One Hindi sentence" },
    { "id": "squat", "hindiName": "हल्का स्क्वाट", "englishName": "Mini Squat", "emoji": "🦵", "category": "Legs", "reps": 10, "rounds": 2, "durationSec": null, "equipment": "None", "voiceCue": "...", "whyItHelps": "..." },
    { "id": "bicep_curl", "hindiName": "बोतल कर्ल", "englishName": "Bottle Curl", "emoji": "💪", "category": "Arms", "reps": 12, "rounds": 2, "durationSec": null, "equipment": "2 water bottles", "voiceCue": "...", "whyItHelps": "..." },
    { "id": "lateral_raise", "hindiName": "साइड रेज़", "englishName": "Lateral Raise", "emoji": "🙌", "category": "Shoulders", "reps": 10, "rounds": 2, "durationSec": null, "equipment": "2 water bottles", "voiceCue": "...", "whyItHelps": "..." },
    { "id": "march", "hindiName": "जगह पर चलना", "englishName": "March in Place", "emoji": "🚶", "category": "Cardio", "reps": null, "rounds": 1, "durationSec": 60, "equipment": "None", "voiceCue": "...", "whyItHelps": "..." }
  ],
  "motivationalMessage": "Closing warm Hindi message"
}`;

  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await (client.chat.completions.create as any)({
      model: 'deepseek-v4-flash',
      max_tokens: 2000,
      temperature: 0.7,
      stream: false,
      chat_template_kwargs: { thinking: false },
      messages: [
        {
          role: 'system',
          content:
            'You are a gentle, expert fitness coach for Indian beginners aged 40-65. Respond ONLY with valid JSON. No markdown. No explanation outside JSON.',
        },
        { role: 'user', content: prompt },
      ],
    });

    const text: string = response.choices[0]?.message?.content ?? '';
    const clean = text.replace(/```json|```/g, '').trim();
    return Response.json(JSON.parse(clean));
  } catch {
    // API unreachable (wrong network, key invalid, etc.) — use high-quality fallback
    const fallback = buildFallbackPlan(name, currentWeight, goalWeight, doctorNote, weightLossGoal);
    return Response.json({ ...fallback, _source: 'fallback' });
  }
}
