'use client';

import { useState } from 'react';
import { useMutation, useQuery, gql } from '@apollo/client';
import { useRouter } from 'next/navigation';
import { signIn, useSession } from 'next-auth/react';
import { BookOpen, Mic, Globe, Music } from 'lucide-react';

const START_ASSESSMENT = gql`
  mutation StartAssessment {
    startAssessment { id startedAt }
  }
`;

const GET_QUESTIONS = gql`
  query OnboardingAssessmentQuestions($category: String, $limit: Int) {
    assessmentQuestions(category: $category, limit: $limit) {
      id category difficulty instrument question options
    }
  }
`;

const SUBMIT_ANSWER = gql`
  mutation SubmitOnboardingAnswer($input: SubmitAssessmentAnswerInput!) {
    submitAssessmentAnswer(input: $input) { id }
  }
`;

const UPDATE_PREFERENCES = gql`
  mutation SaveOnboardingPreferences($input: UpdateProfileInput!) {
    updateProfile(input: $input) { id profile { instruments musicStyles } }
  }
`;

const COMPLETE_ONBOARDING = gql`
  mutation FinishOnboarding {
    completeOnboarding { id profile { onboardingDone } }
  }
`;

const COMPLETE_ASSESSMENT = gql`
  mutation CompleteAssessment($assessmentId: ID!) {
    completeAssessment(assessmentId: $assessmentId) {
      id skillLevel xpAwarded aiReport
    }
  }
`;

// Onboarding is a one-time introductory evaluation, not something to
// re-trigger on every visit - completeAssessment already sets
// profile.onboardingDone, but nothing ever checked it. This is what makes
// the resume screen below possible: the latest completed assessment's own
// result stands in for "your evaluation, on file" instead of the quiz
// re-running from scratch.
const GET_ONBOARDING_STATUS = gql`
  query GetOnboardingStatus {
    me {
      id
      profile { onboardingDone }
    }
    myAssessments {
      id completedAt skillLevel xpAwarded aiReport
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

const instruments = ['Piano', 'Violin', 'Viola', 'Cello', 'Double Bass', 'Flute', 'Oboe', 'Clarinet', 'Bassoon', 'Horn', 'Trumpet', 'Trombone', 'Guitar', 'Harp', 'Voice'];
const styles = ['Baroque', 'Classical', 'Romantic', 'Contemporary', 'Opera', 'Chamber Music', 'Orchestral', 'Solo Piano', 'Early Music'];

export default function OnboardingPage() {
  const router = useRouter();
  const { status } = useSession();
  const [step, setStep] = useState(0);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [selectedInstruments, setSelectedInstruments] = useState<string[]>([]);
  const [selectedStyles, setSelectedStyles] = useState<string[]>([]);
  const [result, setResult] = useState<any>(null);

  const { data: statusData, loading: statusLoading } = useQuery(GET_ONBOARDING_STATUS, {
    skip: status !== 'authenticated',
    fetchPolicy: 'network-only',
  });
  const alreadyOnboarded = Boolean(statusData?.me?.profile?.onboardingDone);
  // myAssessments is ordered startedAt desc; the most recent *completed*
  // one is the result "on file" (an abandoned, never-finished retake could
  // otherwise sort above it).
  const latestCompleted = (statusData?.myAssessments ?? []).find((a: any) => a.completedAt) ?? null;
  const latestFeedback = latestCompleted?.aiReport ? JSON.parse(latestCompleted.aiReport).feedback : null;

  const [startAssessment] = useMutation(START_ASSESSMENT);
  const [submitAnswer] = useMutation(SUBMIT_ANSWER);
  const [updatePreferences] = useMutation(UPDATE_PREFERENCES);
  const [completeOnboarding] = useMutation(COMPLETE_ONBOARDING);
  const [completeAssessment, { loading: completing }] = useMutation(COMPLETE_ASSESSMENT);

  // Real question bank, not a hardcoded 2-question array - assessmentQuestions
  // existed on the backend but nothing ever called it, so the "evaluation"
  // was never actually evaluating anything (every submission scored 0
  // answers -> always BEGINNER, always 0 XP). Only fetched once account +
  // assessment exist, so a signed-out visitor never pays for this query.
  const { data: theoryData } = useQuery(GET_QUESTIONS, { variables: { category: 'THEORY', limit: 6 }, skip: !assessmentId });
  const { data: cultureData } = useQuery(GET_QUESTIONS, { variables: { category: 'CULTURE', limit: 6 }, skip: !assessmentId });
  const theoryQuestions = theoryData?.assessmentQuestions ?? [];
  const cultureQuestions = cultureData?.assessmentQuestions ?? [];

  async function handleStart() {
    // startAssessment (and completeOnboarding at the end) require an account.
    // Previously this ran the whole quiz unauthenticated and only discovered
    // that at the final "Complete Assessment" step, silently discarding the
    // visitor's answers. Check up front instead, and make account creation
    // feel like step 1 of this same flow: signIn's callbackUrl brings them
    // straight back here to continue exactly where they left off.
    if (status !== 'authenticated') {
      void signIn('keycloak', { callbackUrl: '/onboarding' });
      return;
    }
    try {
      const { data } = await startAssessment();
      setAssessmentId(data.startAssessment.id);
      setStep(1);
    } catch {
      setStep(1);
    }
  }

  // Submits immediately (not just local state) so an abandoned assessment
  // still has partial answers recorded, and upserts server-side, so
  // reconsidering an answer after going back a step safely replaces it
  // rather than double-counting toward the final score.
  function selectAnswer(questionId: string, optionId: string) {
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    if (assessmentId) {
      void submitAnswer({ variables: { input: { assessmentId, questionId, selectedOption: optionId } } });
    }
  }

  function toggleItem(list: string[], setList: (v: string[]) => void, item: string) {
    setList(list.includes(item) ? list.filter((i) => i !== item) : [...list, item]);
  }

  async function handleComplete() {
    try {
      await updatePreferences({
        variables: { input: { instruments: selectedInstruments, musicStyles: selectedStyles } },
      });
      let assessmentResult = null;
      if (assessmentId) {
        const { data } = await completeAssessment({ variables: { assessmentId } });
        assessmentResult = data?.completeAssessment ?? null;
      }
      await completeOnboarding();
      setResult(assessmentResult);
      setStep(steps.length);
    } catch {
      // Keep the user on the final step so their preferences are not silently lost.
    }
  }

  const currentStep = steps[step];
  const progress = (step / (steps.length - 1)) * 100;
  const feedback = result?.aiReport ? JSON.parse(result.aiReport).feedback : null;

  // Already completed the one-time evaluation and hasn't explicitly chosen
  // to retake it - show the result on file instead of restarting the quiz.
  // Gated on step === 0 so this only applies before the flow begins; there's
  // no "back to welcome" path once step has moved past 0 during a retake.
  if (status === 'authenticated' && step === 0 && (statusLoading || alreadyOnboarded)) {
    if (statusLoading) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white px-4 py-12">
          <div className="mx-auto max-w-2xl">
            <div className="card h-64 animate-pulse p-10" />
          </div>
        </div>
      );
    }
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white px-4 py-12">
        <div className="mx-auto max-w-2xl">
          <div className="card p-10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <span className="text-4xl">🎵</span>
            </div>
            <h1 className="mb-2 text-3xl font-bold">You&rsquo;ve already completed onboarding</h1>
            <p className="mb-6 text-gray-600">
              This is a one-time introductory evaluation, not something to redo on every visit. Here&rsquo;s the result on file:
            </p>
            {latestCompleted ? (
              <div className="mb-8">
                <p className="mb-1 text-gray-600">Your level:</p>
                <span className="inline-block rounded-full bg-primary-100 px-4 py-1 text-lg font-semibold text-primary-700">
                  {latestCompleted.skillLevel}
                </span>
                <p className="mt-3 text-sm text-gray-500">
                  Completed {new Date(latestCompleted.completedAt).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                  {typeof latestCompleted.xpAwarded === 'number' ? ` · +${latestCompleted.xpAwarded} XP earned` : ''}
                </p>
                {latestFeedback && <p className="mx-auto mt-4 max-w-md text-sm text-gray-600">{latestFeedback}</p>}
              </div>
            ) : (
              <p className="mb-8 text-sm text-gray-500">No assessment result is on file, but your profile is set up.</p>
            )}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <button onClick={() => router.push('/dashboard')} className="btn-primary px-8 py-3 text-base">
                View My Dashboard
              </button>
              <button onClick={handleStart} className="btn-secondary px-8 py-3 text-base">
                Retake assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
              Create a useful starting profile for your teacher and learning plan. Audio analysis will be added when the private AI pipeline is activated.
              We&apos;ll evaluate your theory knowledge, musical culture and guide you to the best courses, teachers and events.
            </p>
            {status !== 'authenticated' && (
              <p className="mb-4 text-sm text-gray-500">
                You&rsquo;ll create your account first — it takes a minute, then you&rsquo;re straight back here to continue.
              </p>
            )}
            <button onClick={handleStart} disabled={status === 'loading'} className="btn-primary px-10 py-3 text-base">
              {status === 'authenticated' ? 'Start Assessment' : 'Create account & start'}
            </button>
          </div>
        )}

        {/* Theory questions */}
        {step === 1 && (
          <div className="card p-8">
            <h2 className="mb-6 text-2xl font-bold">Music Theory</h2>
            <div className="space-y-8">
              {theoryQuestions.length === 0 && <p className="text-sm text-gray-500">Loading questions…</p>}
              {theoryQuestions.map((q: any) => (
                <div key={q.id}>
                  <p className="mb-3 font-medium text-gray-800">{q.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt: any) => (
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
              {cultureQuestions.length === 0 && <p className="text-sm text-gray-500">Loading questions…</p>}
              {cultureQuestions.map((q: any) => (
                <div key={q.id}>
                  <p className="mb-3 font-medium text-gray-800">{q.question}</p>
                  <div className="grid grid-cols-2 gap-2">
                    {q.options.map((opt: any) => (
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
                {feedback && <p className="mx-auto mt-4 max-w-md text-sm text-gray-600">{feedback}</p>}
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
