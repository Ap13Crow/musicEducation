import { z } from 'zod';
import { pool } from '../db.js';
import { chat } from '../ai.js';

export const evaluateAssessmentSchema = {
  assessment_id: z.string().describe('ID of the assessment to evaluate'),
  include_ai_report: z
    .boolean()
    .optional()
    .default(true)
    .describe('Whether to generate an AI narrative report in addition to the score'),
};

export type EvaluateAssessmentInput = z.infer<z.ZodObject<typeof evaluateAssessmentSchema>>;

interface AssessmentRow {
  id: string;
  user_id: string;
  started_at: Date;
  completed_at: Date | null;
  skill_level: string | null;
  duration_sec: number | null;
  xp_awarded: number | null;
}

interface AnswerRow {
  question_id: string;
  category: string;
  difficulty: string;
  instrument: string | null;
  question: string;
  selected_option: string | null;
  open_answer: string | null;
  is_correct: boolean | null;
}

export async function evaluateAssessment(input: EvaluateAssessmentInput): Promise<string> {
  const { assessment_id, include_ai_report } = input;

  const assessmentResult = await pool.query<AssessmentRow>(
    `SELECT id, "userId" AS user_id, "startedAt" AS started_at,
            "completedAt" AS completed_at, "skillLevel" AS skill_level,
            "durationSec" AS duration_sec, "xpAwarded" AS xp_awarded
     FROM "Assessment" WHERE id = $1`,
    [assessment_id],
  );

  if (assessmentResult.rows.length === 0) {
    return JSON.stringify({ error: `Assessment ${assessment_id} not found.` });
  }

  const assessment = assessmentResult.rows[0];

  const answersResult = await pool.query<AnswerRow>(
    `SELECT aa."questionId" AS question_id,
            aq.category, aq.difficulty, aq.instrument, aq.question,
            aa."selectedOption" AS selected_option,
            aa."openAnswer" AS open_answer,
            aa."isCorrect" AS is_correct
     FROM "AssessmentAnswer" aa
     JOIN "AssessmentQuestion" aq ON aq.id = aa."questionId"
     WHERE aa."assessmentId" = $1
     ORDER BY aq.category, aq.difficulty`,
    [assessment_id],
  );

  const answers = answersResult.rows;
  const total = answers.length;
  const correct = answers.filter((a) => a.is_correct === true).length;
  const score = total > 0 ? correct / total : 0;

  const byCategory = answers.reduce<Record<string, { total: number; correct: number }>>(
    (acc, a) => {
      if (!acc[a.category]) acc[a.category] = { total: 0, correct: 0 };
      acc[a.category].total++;
      if (a.is_correct) acc[a.category].correct++;
      return acc;
    },
    {},
  );

  const summary = {
    assessment_id,
    total_questions: total,
    correct_answers: correct,
    score_percent: Math.round(score * 100),
    skill_level: assessment.skill_level,
    xp_awarded: assessment.xp_awarded,
    duration_sec: assessment.duration_sec,
    category_breakdown: Object.entries(byCategory).map(([cat, s]) => ({
      category: cat,
      score_percent: Math.round((s.correct / s.total) * 100),
      total: s.total,
      correct: s.correct,
    })),
  };

  if (!include_ai_report) {
    return JSON.stringify(summary, null, 2);
  }

  const categoryText = summary.category_breakdown
    .map((c) => `  - ${c.category}: ${c.score_percent}% (${c.correct}/${c.total})`)
    .join('\n');

  const openAnswers = answers
    .filter((a) => a.open_answer)
    .map((a) => `Q: ${a.question}\nA: ${a.open_answer}`)
    .join('\n\n');

  const system = `You are an expert music education assessor. Your role is to interpret assessment results
and provide personalized, insightful feedback that helps students understand their current level
and guides their learning journey.`;

  const user = `Evaluate this music theory assessment result and write a brief narrative report.

Score: ${summary.score_percent}% (${correct}/${total} correct)
Determined Skill Level: ${assessment.skill_level ?? 'Unknown'}
Duration: ${assessment.duration_sec ? Math.round(assessment.duration_sec / 60) : '?'} minutes

Category Breakdown:
${categoryText}

${openAnswers ? `Open-ended answers:\n${openAnswers}\n` : ''}

Write a 3-4 paragraph report that:
1. Acknowledges what the student did well
2. Highlights the specific theory areas to focus on
3. Suggests 2-3 concrete next steps (courses, exercises, or topics)
4. Ends with an encouraging message about their musical journey

Be warm, specific, and constructive.`;

  const aiReport = await chat(system, user);

  return JSON.stringify({ ...summary, ai_report: aiReport }, null, 2);
}
