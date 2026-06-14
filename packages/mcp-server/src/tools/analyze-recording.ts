import { z } from 'zod';
import { chat } from '../ai.js';

export const analyzeRecordingSchema = {
  recording_url: z.string().url().describe('URL of the audio or video recording to analyze'),
  instrument: z.string().describe('Musical instrument being played (e.g. piano, violin, guitar)'),
  skill_level: z
    .enum(['BEGINNER', 'ELEMENTARY', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'])
    .describe("Student's current skill level"),
  piece_name: z.string().optional().describe('Name of the musical piece being performed'),
  focus_areas: z
    .array(z.string())
    .optional()
    .describe('Specific aspects to evaluate (e.g. intonation, rhythm, dynamics, technique)'),
};

export type AnalyzeRecordingInput = z.infer<z.ZodObject<typeof analyzeRecordingSchema>>;

export async function analyzeRecording(input: AnalyzeRecordingInput): Promise<string> {
  const { recording_url, instrument, skill_level, piece_name, focus_areas } = input;

  const focusText = focus_areas?.length
    ? `Focus especially on: ${focus_areas.join(', ')}.`
    : 'Evaluate tone, intonation, rhythm, dynamics, and technique.';

  const pieceText = piece_name ? `The student is playing: "${piece_name}".` : '';

  const system = `You are an expert music educator and performance coach specializing in ${instrument}.
Your role is to provide detailed, constructive, and encouraging feedback on student recordings.
Always structure your feedback to be actionable and appropriate for the student's level.`;

  const user = `Please analyze this student recording and provide structured feedback.

Recording URL: ${recording_url}
Instrument: ${instrument}
Skill Level: ${skill_level}
${pieceText}
${focusText}

Provide your analysis in the following format:

## Overall Impression
[2-3 sentence summary]

## Strengths
- [Specific strength 1]
- [Specific strength 2]
- [Specific strength 3]

## Areas for Improvement
- [Specific area 1 with concrete suggestion]
- [Specific area 2 with concrete suggestion]

## Practice Recommendations
1. [Specific exercise or technique for the next week]
2. [Second recommendation]
3. [Third recommendation]

## Encouragement
[Motivating closing message tailored to ${skill_level} level]`;

  return await chat(system, user);
}
