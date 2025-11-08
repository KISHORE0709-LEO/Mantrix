import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;

interface BehavioralData {
  timeToSolve: number;
  hintsUsed: number;
  mistakeCount: number;
  attemptsCount: number;
  successRate: number;
}

export interface PerformanceAnalysis {
  strengths: string[];
  weaknesses: string[];
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  suggestedTopics: string[];
  encouragement: string;
}

export async function analyzeUserPerformance(
  userId: number,
  currentTopic: string,
  behavioralData: BehavioralData[]
): Promise<PerformanceAnalysis> {
  if (!openai) {
    return getFallbackAnalysis(behavioralData);
  }

  try {
    const avgTime = behavioralData.reduce((sum, d) => sum + d.timeToSolve, 0) / behavioralData.length;
    const avgHints = behavioralData.reduce((sum, d) => sum + d.hintsUsed, 0) / behavioralData.length;
    const avgMistakes = behavioralData.reduce((sum, d) => sum + d.mistakeCount, 0) / behavioralData.length;
    const avgSuccess = behavioralData.reduce((sum, d) => sum + d.successRate, 0) / behavioralData.length;

    const prompt = `Analyze this student's learning performance for ${currentTopic}:
- Average time to solve: ${avgTime}s
- Average hints used: ${avgHints}
- Average mistakes: ${avgMistakes}
- Success rate: ${avgSuccess}%

Provide:
1. 2-3 specific strengths
2. 2-3 areas for improvement
3. Recommended difficulty level (beginner/intermediate/advanced/expert)
4. 2-3 suggested related topics to study next
5. Brief encouraging message

Format as JSON with fields: strengths[], weaknesses[], recommendedDifficulty, suggestedTopics[], encouragement`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const analysis = JSON.parse(response.choices[0].message.content || '{}');
    return analysis;
  } catch (error) {
    console.error('AI tutor analysis error:', error);
    return getFallbackAnalysis(behavioralData);
  }
}

function getFallbackAnalysis(data: BehavioralData[]): PerformanceAnalysis {
  const avgSuccess = data.reduce((sum, d) => sum + d.successRate, 0) / data.length;
  const avgHints = data.reduce((sum, d) => sum + d.hintsUsed, 0) / data.length;
  
  let recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' = 'beginner';
  if (avgSuccess > 80 && avgHints < 1) recommendedDifficulty = 'expert';
  else if (avgSuccess > 70) recommendedDifficulty = 'advanced';
  else if (avgSuccess > 50) recommendedDifficulty = 'intermediate';

  return {
    strengths: avgSuccess > 60 ? ['Good problem-solving speed', 'Consistent performance'] : ['Perseverance'],
    weaknesses: avgHints > 2 ? ['Consider reviewing fundamentals', 'Practice more independently'] : ['Keep challenging yourself'],
    recommendedDifficulty,
    suggestedTopics: ['Related algorithms', 'Data structures practice'],
    encouragement: 'Keep up the great work! Every challenge makes you stronger.',
  };
}

export async function getAdaptiveHint(
  topic: string,
  userCode: string,
  mistakesMade: number
): Promise<string> {
  if (!openai) {
    return `Hint: Think about how ${topic} works step by step. Try breaking down the problem.`;
  }

  try {
    const hintLevel = mistakesMade < 2 ? 'subtle' : mistakesMade < 4 ? 'moderate' : 'direct';
    
    const prompt = `Provide a ${hintLevel} hint for this ${topic} problem. User's current code:
${userCode}

Mistakes made so far: ${mistakesMade}
Give an encouraging ${hintLevel} hint without spoiling the solution.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.8,
    });

    return response.choices[0].message.content || 'Keep trying! You\'re on the right track.';
  } catch (error) {
    console.error('Adaptive hint error:', error);
    return `Hint: Consider the key concepts of ${topic}. What patterns do you see?`;
  }
}
