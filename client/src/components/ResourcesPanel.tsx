import { ExternalResource } from '@shared/types';
import { ExternalLink, BookOpen, Code2, Youtube, FileText } from 'lucide-react';

interface ResourcesPanelProps {
  resources: ExternalResource[];
  onComplete: () => void;
}

export function ResourcesPanel({ resources, onComplete }: ResourcesPanelProps) {
  const getIcon = (type: ExternalResource['type']) => {
    switch (type) {
      case 'leetcode':
      case 'neetcode':
      case 'hackerrank':
      case 'codeforces':
        return <Code2 className="w-5 h-5" />;
      case 'youtube':
        return <Youtube className="w-5 h-5" />;
      case 'article':
        return <FileText className="w-5 h-5" />;
      case 'documentation':
        return <BookOpen className="w-5 h-5" />;
      default:
        return <ExternalLink className="w-5 h-5" />;
    }
  };

  const getTypeColor = (type: ExternalResource['type']) => {
    switch (type) {
      case 'leetcode':
        return 'border-orange-500 bg-orange-900/20 hover:bg-orange-900/30';
      case 'neetcode':
        return 'border-green-500 bg-green-900/20 hover:bg-green-900/30';
      case 'youtube':
        return 'border-red-500 bg-red-900/20 hover:bg-red-900/30';
      case 'documentation':
        return 'border-blue-500 bg-blue-900/20 hover:bg-blue-900/30';
      default:
        return 'border-purple-500 bg-purple-900/20 hover:bg-purple-900/30';
    }
  };

  const getDifficultyColor = (difficulty?: 'easy' | 'medium' | 'hard') => {
    if (!difficulty) return '';
    switch (difficulty) {
      case 'easy':
        return 'bg-green-900 text-green-300 border-green-600';
      case 'medium':
        return 'bg-yellow-900 text-yellow-300 border-yellow-600';
      case 'hard':
        return 'bg-red-900 text-red-300 border-red-600';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 pt-24 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-purple-500 p-8">
          <h1 className="font-game text-3xl text-purple-300 mb-4 flex items-center gap-3">
            <span>📚</span>
            Practice Resources
          </h1>
          <p className="font-orbitron text-gray-300 mb-8">
            Continue your learning journey with these curated resources. Practice makes perfect!
          </p>

          <div className="space-y-4 mb-8">
            {resources.map((resource, idx) => (
              <a
                key={idx}
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`block p-6 rounded-lg border-2 transition-all ${getTypeColor(resource.type)}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-purple-300 mt-1">
                      {getIcon(resource.type)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-orbitron text-lg text-white">
                          {resource.title}
                        </h3>
                        {resource.difficulty && (
                          <span className={`px-2 py-1 rounded text-xs font-orbitron border ${getDifficultyColor(resource.difficulty)}`}>
                            {resource.difficulty}
                          </span>
                        )}
                      </div>
                      {resource.description && (
                        <p className="font-orbitron text-sm text-gray-400">
                          {resource.description}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-2">
                        <span className="px-3 py-1 rounded-full text-xs font-orbitron bg-slate-800 text-purple-300">
                          {resource.type.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <ExternalLink className="w-5 h-5 text-gray-400" />
                </div>
              </a>
            ))}
          </div>

          <button
            onClick={onComplete}
            className="w-full px-6 py-4 rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 font-game text-lg text-white transition-all glow"
          >
            ✨ Complete Level & Earn XP
          </button>
        </div>
      </div>
    </div>
  );
}
