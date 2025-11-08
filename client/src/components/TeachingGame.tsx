import { useState } from 'react';
import { Button } from './ui/button';
import { PlayCircle, CheckCircle2 } from 'lucide-react';

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
  const [step, setStep] = useState<'intro' | 'complete'>('intro');

  const handleNext = () => {
    if (step === 'intro') setStep('complete');
  };

  if (step === 'complete') {
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

            <div className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 rounded-xl p-6 mb-6 border-2 border-yellow-500">
              <h2 className="text-2xl font-game text-yellow-300 mb-3 flex items-center gap-2">
                <span>🎮</span> Why This Game?
              </h2>
              <p className="text-gray-200 font-orbitron leading-relaxed text-lg">
                This interactive game will help you understand <span className="text-purple-300 font-bold">{topic}</span> by letting you practice in a fun way. You'll see how the concept works step-by-step, making it easier to remember when solving coding problems later!
              </p>
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
      </div>
    </div>
  );
}
