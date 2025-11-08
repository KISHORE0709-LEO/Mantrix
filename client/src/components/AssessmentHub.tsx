import { useState, useEffect } from 'react';
import { Level, QuizQuestion, CodingProblem } from '@shared/types';
import { CheckCircle, XCircle, Code, Play, Lightbulb } from 'lucide-react';

interface AssessmentHubProps {
  level: Level;
  onComplete: () => void;
  onAIHelp?: (context?: { type: 'quiz' | 'coding'; title?: string; description?: string; userCode?: string; testResults?: string; attempts?: number; }) => void;
}

export function AssessmentHub({ level, onComplete, onAIHelp }: AssessmentHubProps) {
  const [currentMode, setCurrentMode] = useState<'quiz' | 'coding'>('quiz');
  const [quizAnswers, setQuizAnswers] = useState<Record<string, string>>({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  
  const [currentCode, setCurrentCode] = useState('');
  const [codeOutput, setCodeOutput] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<{passed: number, total: number} | null>(null);
  const [currentProblemIndex, setCurrentProblemIndex] = useState(0);
  const [quizAttempts, setQuizAttempts] = useState(0);

  const hasQuiz = level.quizQuestions && level.quizQuestions.length > 0;
  const hasCoding = level.codingProblems && level.codingProblems.length > 0;
  const currentProblem = level.codingProblems?.[currentProblemIndex];

  useEffect(() => {
    if (currentProblem) {
      setCurrentCode(currentProblem.starterCode);
    }
  }, [currentProblem]);

  const handleQuizSubmit = () => {
    if (!level.quizQuestions) return;
    
    let correct = 0;
    level.quizQuestions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
        correct++;
      }
    });
    
    setQuizScore(correct);
    setQuizSubmitted(true);
    setQuizAttempts(prev => prev + 1);
  };

  const handleRequestQuizHint = (question: QuizQuestion) => {
    if (onAIHelp) {
      onAIHelp({
        type: 'quiz',
        title: question.question,
        description: question.options?.join(', ') || '',
        attempts: quizAttempts
      });
    }
  };

  const [codingAttempts, setCodingAttempts] = useState(0);

  const handleRequestCodingHint = () => {
    if (onAIHelp && currentProblem) {
      onAIHelp({
        type: 'coding',
        title: currentProblem.title,
        description: currentProblem.description,
        userCode: currentCode,
        testResults: testResults 
          ? `Passed ${testResults.passed}/${testResults.total} tests. Output: ${codeOutput.join('; ')}`
          : undefined,
        attempts: codingAttempts
      });
    }
  };

  const handleRunCode = () => {
    if (!currentProblem) return;
    
    setCodingAttempts(prev => prev + 1);
    const output: string[] = [];
    let passed = 0;
    
    try {
      // Execute user code and return the function they defined
      const userFunction = new Function(`
        ${currentCode}
        return ${currentProblem.functionName};
      `)();
      
      if (typeof userFunction !== 'function') {
        throw new Error(`Expected function '${currentProblem.functionName}' but got ${typeof userFunction}. Make sure you define a function with this exact name.`);
      }
      
      currentProblem.testCases.forEach((test, idx) => {
        try {
          const input = JSON.parse(test.input);
          const result = Array.isArray(input) ? userFunction(...input) : userFunction(input);
          const expected = JSON.parse(test.expectedOutput);
          
          if (JSON.stringify(result) === JSON.stringify(expected)) {
            passed++;
            output.push(`✓ Test ${idx + 1}: PASSED`);
          } else {
            output.push(`✗ Test ${idx + 1}: FAILED (Expected: ${JSON.stringify(expected)}, Got: ${JSON.stringify(result)})`);
          }
        } catch (e) {
          output.push(`✗ Test ${idx + 1}: ERROR - ${(e as Error).message}`);
        }
      });
      
      setTestResults({ passed, total: currentProblem.testCases.length });
      setCodeOutput(output);
    } catch (e) {
      setCodeOutput([`Error: ${(e as Error).message}`]);
      setTestResults({ passed: 0, total: currentProblem.testCases.length });
    }
  };

  const allTestsPassed = testResults && testResults.passed === testResults.total;
  const quizPassed = quizSubmitted && quizScore >= (level.quizQuestions?.length || 0) * 0.7;
  const canComplete = (!hasQuiz || quizPassed) && (!hasCoding || allTestsPassed);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-purple-500 p-8">
          <h1 className="font-game text-3xl text-purple-300 mb-6 flex items-center gap-3">
            <span>⚡</span>
            Assessment: {level.title}
          </h1>

          {/* Mode Selector */}
          {hasQuiz && hasCoding && (
            <div className="flex gap-4 mb-8">
              <button
                onClick={() => setCurrentMode('quiz')}
                className={`flex-1 px-6 py-3 rounded-lg font-orbitron transition-all ${
                  currentMode === 'quiz'
                    ? 'bg-purple-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                📝 Quiz Questions
              </button>
              <button
                onClick={() => setCurrentMode('coding')}
                className={`flex-1 px-6 py-3 rounded-lg font-orbitron transition-all ${
                  currentMode === 'coding'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                }`}
              >
                <Code className="inline w-4 h-4 mr-2" />
                Coding Challenge
              </button>
            </div>
          )}

          {/* Quiz Section */}
          {currentMode === 'quiz' && hasQuiz && (
            <div className="space-y-6">
              {level.quizQuestions!.map((question, idx) => (
                <div key={question.id} className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                  <h3 className="font-orbitron text-lg text-white mb-4">
                    {idx + 1}. {question.question}
                  </h3>
                  
                  {question.type === 'multiple-choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option) => (
                        <label
                          key={option}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all ${
                            quizAnswers[question.id] === option
                              ? 'bg-purple-600/30 border-2 border-purple-500'
                              : 'bg-slate-800 border-2 border-slate-700 hover:border-purple-500'
                          }`}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={option}
                            checked={quizAnswers[question.id] === option}
                            onChange={(e) =>
                              setQuizAnswers({ ...quizAnswers, [question.id]: e.target.value })
                            }
                            className="w-4 h-4"
                            disabled={quizSubmitted}
                          />
                          <span className="font-orbitron text-sm text-gray-300">{option}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  
                  {!quizSubmitted && (
                    <button
                      onClick={() => handleRequestQuizHint(question)}
                      className="mt-3 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 font-orbitron text-xs text-white transition-colors flex items-center gap-2"
                    >
                      <Lightbulb className="w-3 h-3" />
                      Get AI Hint
                    </button>
                  )}

                  {quizSubmitted && (
                    <div className={`mt-4 p-4 rounded-lg ${
                      quizAnswers[question.id] === question.correctAnswer
                        ? 'bg-green-900/30 border border-green-500'
                        : 'bg-red-900/30 border border-red-500'
                    }`}>
                      <p className="font-orbitron text-sm text-white mb-2">
                        {quizAnswers[question.id] === question.correctAnswer ? '✓ Correct!' : '✗ Incorrect'}
                      </p>
                      <p className="font-orbitron text-xs text-gray-300">{question.explanation}</p>
                    </div>
                  )}
                </div>
              ))}

              {!quizSubmitted && (
                <button
                  onClick={handleQuizSubmit}
                  className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-game text-white transition-all"
                >
                  Submit Quiz
                </button>
              )}

              {quizSubmitted && (
                <div className="bg-slate-900 rounded-lg p-6 border-2 border-purple-500">
                  <h3 className="font-game text-xl text-white mb-2">
                    Score: {quizScore}/{level.quizQuestions!.length}
                  </h3>
                  <p className="font-orbitron text-sm text-gray-300">
                    {quizPassed ? '🎉 Passed! ' : '❌ Need 70% to pass. '} 
                    {hasCoding && 'Complete the coding challenge to proceed.'}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Coding Section */}
          {currentMode === 'coding' && hasCoding && currentProblem && (
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                <h3 className="font-game text-xl text-purple-300 mb-2">{currentProblem.title}</h3>
                <p className="font-orbitron text-sm text-gray-300 mb-4">{currentProblem.description}</p>
                <div className="bg-indigo-900/30 border border-indigo-500/50 rounded-lg p-3 mb-4">
                  <p className="font-mono text-xs text-indigo-300">
                    💡 Define a function named: <span className="font-bold text-white">{currentProblem.functionName}</span>
                  </p>
                </div>
                <div className="flex gap-2 mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-orbitron ${
                    currentProblem.difficulty === 'easy' ? 'bg-green-900 text-green-300' :
                    currentProblem.difficulty === 'medium' ? 'bg-yellow-900 text-yellow-300' :
                    'bg-red-900 text-red-300'
                  }`}>
                    {currentProblem.difficulty}
                  </span>
                  {currentProblem.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs font-orbitron bg-purple-900 text-purple-300">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <textarea
                value={currentCode}
                onChange={(e) => setCurrentCode(e.target.value)}
                className="w-full h-64 px-4 py-3 rounded-lg bg-slate-900 border-2 border-slate-700 focus:border-indigo-500 outline-none font-mono text-sm text-white resize-y"
                placeholder="Write your solution here..."
              />

              <div className="flex gap-4">
                <button
                  onClick={handleRunCode}
                  className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 font-game text-white transition-all flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Run Tests
                </button>
                <button
                  onClick={handleRequestCodingHint}
                  className="px-6 py-3 rounded-lg bg-purple-600 hover:bg-purple-500 font-orbitron text-sm text-white transition-colors flex items-center gap-2"
                >
                  <Lightbulb className="w-4 h-4" />
                  AI Hint
                </button>
              </div>

              {codeOutput.length > 0 && (
                <div className="bg-slate-900 rounded-lg p-6 border border-slate-700">
                  <h4 className="font-orbitron text-sm text-gray-400 mb-3">Test Results:</h4>
                  <div className="space-y-2 font-mono text-sm">
                    {codeOutput.map((line, idx) => (
                      <div
                        key={idx}
                        className={`p-2 rounded ${
                          line.startsWith('✓') ? 'bg-green-900/30 text-green-300' :
                          line.startsWith('✗') ? 'bg-red-900/30 text-red-300' :
                          'text-gray-300'
                        }`}
                      >
                        {line}
                      </div>
                    ))}
                  </div>
                  {testResults && (
                    <div className="mt-4 p-4 rounded-lg bg-slate-800">
                      <p className="font-orbitron text-white">
                        Passed: {testResults.passed}/{testResults.total} tests
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Complete Button */}
          {canComplete && (
            <button
              onClick={onComplete}
              className="w-full mt-8 px-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-game text-lg text-white transition-all glow"
            >
              ✨ Complete Assessment & Continue
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
