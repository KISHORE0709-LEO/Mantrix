import { useState } from 'react';
import { Button } from './ui/button';
import { PlayCircle, CheckCircle2, BookOpen } from 'lucide-react';

interface TeachingGameProps {
  topic: string;
  concept: string;
  interactive: {
    title: string;
    description: string;
    demoCode?: string;
    visualDemo?: string;
  };
  onComplete: () => void;
}

export default function TeachingGame({ topic, concept, interactive, onComplete }: TeachingGameProps) {
  const [step, setStep] = useState<'intro' | 'demo' | 'interactive' | 'complete'>('intro');
  const [understood, setUnderstood] = useState(false);

  const handleNext = () => {
    if (step === 'intro') setStep('demo');
    else if (step === 'demo') setStep('interactive');
    else if (step === 'interactive') setStep('complete');
  };

  if (step === 'complete' || understood) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-8">
        <div className="max-w-2xl w-full bg-slate-800/90 rounded-3xl p-12 border-4 border-green-500 text-center">
          <CheckCircle2 className="w-24 h-24 text-green-400 mx-auto mb-6" />
          <h1 className="text-4xl font-game text-white mb-4">Concept Mastered!</h1>
          <p className="text-xl text-gray-300 mb-8 font-orbitron">
            You now understand <span className="text-purple-400 font-bold">{topic}</span>
          </p>
          <Button
            onClick={onComplete}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white px-12 py-6 text-xl font-game"
          >
            Continue to Learn More →
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        {step === 'intro' && (
          <div className="bg-slate-800/90 rounded-3xl p-8 border-4 border-indigo-500">
            <div className="text-center mb-8">
              <PlayCircle className="w-20 h-20 text-indigo-400 mx-auto mb-4" />
              <h1 className="text-4xl font-game text-white mb-4">Let's Learn: {topic}</h1>
              <p className="text-xl text-gray-300 font-orbitron">{concept}</p>
            </div>
            
            <div className="bg-slate-900 rounded-xl p-6 mb-8 border-2 border-purple-500">
              <h2 className="text-2xl font-game text-purple-300 mb-4">What You'll Discover</h2>
              <p className="text-gray-300 font-orbitron leading-relaxed">
                {interactive.description}
              </p>
            </div>

            <Button
              onClick={handleNext}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-6 text-xl font-game"
            >
              Start Learning →
            </Button>
          </div>
        )}

        {step === 'demo' && (
          <div className="bg-slate-800/90 rounded-3xl p-8 border-4 border-purple-500">
            <div className="mb-6">
              <BookOpen className="w-16 h-16 text-purple-400 mx-auto mb-4" />
              <h2 className="text-3xl font-game text-white text-center mb-6">{interactive.title}</h2>
            </div>

            {interactive.demoCode && (
              <div className="bg-slate-900 rounded-xl p-6 mb-8 border-2 border-indigo-500 font-mono text-sm">
                <pre className="text-green-400 whitespace-pre-wrap">{interactive.demoCode}</pre>
              </div>
            )}

            {interactive.visualDemo && (
              <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-xl p-8 mb-8 border-2 border-purple-400">
                <p className="text-white text-center text-xl font-orbitron">{interactive.visualDemo}</p>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                onClick={() => setStep('intro')}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-4 font-game"
              >
                ← Back
              </Button>
              <Button
                onClick={handleNext}
                className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white py-4 font-game"
              >
                I Understand! →
              </Button>
            </div>
          </div>
        )}

        {step === 'interactive' && (
          <div className="bg-slate-800/90 rounded-3xl p-8 border-4 border-green-500">
            <h2 className="text-3xl font-game text-white text-center mb-6">Quick Check!</h2>
            <p className="text-xl text-gray-300 mb-6 font-orbitron text-center">
              Do you understand <span className="text-purple-400 font-bold">{topic}</span>?
            </p>
            
            <div className="bg-slate-900 rounded-xl p-6 mb-6 border-2 border-purple-500">
              <p className="text-white font-orbitron mb-4">
                Which statement best describes this concept?
              </p>
              <div className="space-y-3">
                {['I understand the core idea', 'I need more examples', 'I want to review again'].map((option, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      if (idx === 0) {
                        setUnderstood(true);
                      } else if (idx === 1) {
                        setStep('demo');
                      } else {
                        setStep('intro');
                      }
                    }}
                    className="w-full p-4 bg-slate-800 hover:bg-purple-700 border-2 border-purple-500 hover:border-purple-400 rounded-lg text-white font-orbitron transition-all"
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
