'use client';

import { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { BookOpen, Mic, Globe, Music } from 'lucide-react';

const START_ASSESSMENT = gql`
  mutation StartAssessment {
    startAssessment { id startedAt }
  }
`;

const COMPLETE_ASSESSMENT = gql`
  mutation CompleteAssessment($assessmentId: ID!) {
    completeAssessment(assessmentId: $assessmentId) {
      id skillLevel xpAwarded aiReport
    }
  }
`;

const steps = [
  { id: 'welcome', title: 'Welcome!', icon: Music },
  { id: 'theory', title: 'Music Theory', icon: BookOpen },
  { id: 'performance', title: 'Performance', icon: Mic },
  { id: 'culture', title: 'Musical Culture', icon: Globe },
  { id: 'preferences', title: 'Your Preferences', icon: Music },
];

const theoryQuestions = [
  {
    id: 'q1',
    prompt: 'How many semitones are in a perfect fifth?',
    options: [
      { id: 'a', text: '5', isCorrect: false },
      { id: 'b', text: '7', isCorrect: true },
      { id: 'c', text: '12', isCorrect: false },
      { id: 'd', text: '4', isCorrect: false },
    ],
  },
  {
    id: 'q2',
    prompt: 'Which clef is typically used for cello music?',
    options: [
      { id: 'a', text: 'Treble clef', isCorrect: false },
      { id: 'b', text: 'Alto clef', isCorrect: false },
      { id: 'c', text: 'Bass clef', isCorrect: true },
      { id: 'd', text: 'Soprano clef', isCorrect: false },
    ],
  },
];

const cultureQuestions = [
  {
    id: 'c1',
    prompt: 'During which period did Ludwig van Beethoven primarily compose?',
    options: [
      { id: 'a', text: 'Baroque', isCorrect: false },
      { id: 'b', text: 'Classical / Early Romantic', isCorrect: true },
      { id: 'c', text: 'Modern', isCorrect: false },
      { id: 'd', text: 'Renaissance', isCorrect: false },
    ],
  },
];

const instruments = ['Piano', 'Violin', 'Viola', 'Cello', 'Double Bass', 'Flute', 'Oboe', 'Clarinet', 'Bassoon', 'Horn', 'Trumpet', 'Trombone', 'Guitar', 'Harp', 'Voice'];
const styles = ['Baroque', 'Classical', 'Romantic', 'Contemporary', 'Opera', 'Chamber Music', 'Orchestral', 'Solo Piano', 'Early Music'];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const [startAssessment] = useMutation(START_ASSESSMENT);
  const [completeAssessment, { loading: completing }] = useMutation(COMPLETE_ASSESSMENT);

  async function handleStart() {
    try {
      const { data } = await startAssessment();
      setAssessmentId(data.startAssessment.id);
      setStep(1);
    } catch {
      setStep(1); // proceed without auth for demo
    }
  }

  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
  }

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  async function handleComplete() {
    if (assessmentId) {
      try {
        const { data } = await completeAssessment({ variables: { assessmentId } });
        setResult(data.completeAssessment);
        setStep(steps.length);
      } catch {
        setStep(steps.length);
      }
    } else {
      setStep(steps.length);
    }
  }

  const currentStep = steps[step];
  const progress = (step / (steps.length - 1)) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Progress bar */}
        {step > 0 && step < steps.length && (
          <div className="mb-8">
            <div className="mb-2 flex justify-between text-sm text-gray-500">
              <span>Step {step} of {steps.length - 1}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 rounded-full bg-gray-200">
              <div className="h-2 rounded-full bg-primary-600 transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {/* Welcome */}
        {step === 0 && (
          <div className="card p-10 text-center">
            <Music className="mx-auto mb-6 h-16 w-16 text-primary-600" />
            <h1 className="mb-4 text-3xl font-bold">Welcome to My Music Coach</h1>
            <p className="mb-8 text-gray-600">
              Take our 15-minute music assessment and let our AI build your personalised learning path.
              We&apos;ll evaluate your theory knowledge, musical culture and guide you to the best courses, teachers and events.
            </p>
            <button onClick={handleStart} className="btn-primary px-10 py-3 text-base">
              Start Assessment
            </button>
          </div>
        )}

        {/* Theory questions */}
        {step === 1 && (
          <div className="card p-8">
            <h2 className="mb-6 text-2xl font-bold">Music Theory</h2>
            <div className="space-y-8">
              {theoryQuestions.map((q) => (
                <div key={q.id}>
                  <p className="mb-3 font-medium text-gray-800">{q.prompt}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => selectAnswer(q.id, opt.id)}
                        className={`rounded-lg border p-3 text-sm text-left transition-colors ${
                          answers[q.id] === opt.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-end">
              <button onClick={() => setStep(2)} className="btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* Performance (recording) */}
        {step === 2 && (
          <div className="card p-8 text-center">
            <Mic className="mx-auto mb-4 h-12 w-12 text-primary-600" />
            <h2 className="mb-4 text-2xl font-bold">Performance</h2>
            <p className="mb-6 text-gray-600">
              Play or sing a short musical phrase of your choice (30-60 seconds) and we&apos;ll analyse your technique.
            </p>
            <div className="mb-6 rounded-xl border-2 border-dashed border-gray-300 p-10">
              <p className="text-sm text-gray-400">Recording upload / microphone capture coming soon.</p>
              <p className="mt-1 text-xs text-gray-400">(Skip for now — you can add this later)</p>
            </div>
            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
              <button onClick={() => setStep(3)} className="btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* Culture */}
        {step === 3 && (
          <div className="card p-8">
            <h2 className="mb-6 text-2xl font-bold">Musical Culture</h2>
            <div className="space-y-8">
              {cultureQuestions.map((q) => (
                <div key={q.id}>
                  <p className="mb-3 font-medium text-gray-800">{q.prompt}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => selectAnswer(q.id, opt.id)}
                        className={`rounded-lg border p-3 text-sm text-left transition-colors ${
                          answers[q.id] === opt.id
                            ? 'border-primary-500 bg-primary-50 text-primary-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {opt.text}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 flex justify-between">
              <button onClick={() => setStep(2)} className="btn-secondary">Back</button>
              <button onClick={() => setStep(4)} className="btn-primary">Next</button>
            </div>
          </div>
        )}

        {/* Preferences */}
        {step === 4 && (
          <div className="card p-8">
            <h2 className="mb-2 text-2xl font-bold">Your Preferences</h2>
            <p className="mb-6 text-gray-500 text-sm">Select your instruments and music styles.</p>

            <h3 className="mb-3 font-semibold">Instruments</h3>
            <div className="mb-6 flex flex-wrap gap-2">
              {instruments.map((instr) => (
                <button
                  key={instr}
                  onClick={() => toggleItem(selectedInstruments, setSelectedInstruments, instr)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedInstruments.includes(instr)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {instr}
                </button>
              ))}
            </div>

            <h3 className="mb-3 font-semibold">Music Styles</h3>
            <div className="mb-8 flex flex-wrap gap-2">
              {styles.map((style) => (
                <button
                  key={style}
                  onClick={() => toggleItem(selectedStyles, setSelectedStyles, style)}
                  className={`rounded-full border px-3 py-1 text-sm transition-colors ${
                    selectedStyles.includes(style)
                      ? 'border-primary-500 bg-primary-50 text-primary-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {style}
                </button>
              ))}
            </div>

            <div className="flex justify-between">
              <button onClick={() => setStep(3)} className="btn-secondary">Back</button>
              <button onClick={handleComplete} disabled={completing} className="btn-primary">
                {completing ? 'Analyzing...' : 'Complete Assessment'}
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {step === steps.length && (
          <div className="card p-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <span className="text-4xl">🎵</span>
            </div>
            <h2 className="mb-2 text-2xl font-bold">Assessment Complete!</h2>
            {result && (
              <div className="mb-6">
                <p className="mb-1 text-gray-600">Your level:</p>
                <span className="inline-block rounded-full bg-primary-100 px-4 py-1 text-lg font-semibold text-primary-700">
                  {result.skillLevel}
                </span>
                <p className="mt-3 text-sm text-gray-500">+{result.xpAwarded} XP earned!</p>
              </div>
            )}
            <p className="mb-8 text-gray-600">
              Your personalised learning path is ready. Explore your recommended courses, teachers and events.
            </p>
            <button onClick={() => router.push('/dashboard')} className="btn-primary px-8 py-3 text-base">
              View My Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
