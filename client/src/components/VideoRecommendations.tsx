import { useEffect, useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';

interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  videoUrl: string;
}

interface VideoRecommendationsProps {
  topic: string;
  difficulty: string;
  aiSuggestedVideos?: YouTubeVideo[];
  hasGame?: boolean;
  onComplete: () => void;
}

export default function VideoRecommendations({ topic, difficulty, aiSuggestedVideos, hasGame, onComplete }: VideoRecommendationsProps) {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (aiSuggestedVideos && aiSuggestedVideos.length > 0) {
      setVideos(aiSuggestedVideos);
      setLoading(false);
    } else {
      // Fallback videos if AI suggested videos aren't available
      const fallbackVideos = [
        {
          id: 'fallback-1',
          title: 'HTML Crash Course For Absolute Beginners',
          channelTitle: 'Traversy Media',
          thumbnailUrl: 'https://i.ytimg.com/vi/UB1O30fR-EE/maxresdefault.jpg',
          videoUrl: 'https://www.youtube.com/watch?v=UB1O30fR-EE'
        },
        {
          id: 'fallback-2',
          title: 'Learn HTML5 and CSS3 From Scratch',
          channelTitle: 'Programming with Mosh',
          thumbnailUrl: 'https://i.ytimg.com/vi/qz0aGYrrlhU/maxresdefault.jpg',
          videoUrl: 'https://www.youtube.com/watch?v=qz0aGYrrlhU'
        },
        {
          id: 'fallback-3',
          title: 'Semantic HTML - Why It Matters',
          channelTitle: 'Kevin Powell',
          thumbnailUrl: 'https://i.ytimg.com/vi/kGW8Al_cga4/maxresdefault.jpg',
          videoUrl: 'https://www.youtube.com/watch?v=kGW8Al_cga4'
        }
      ];
      setVideos(fallbackVideos);
      setLoading(false);
    }
  }, [topic, difficulty, aiSuggestedVideos]);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/youtube/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic, difficulty }),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch videos');
      }

      const data = await response.json();
      setVideos(data.videos);
    } catch (err) {
      setError('Could not load video recommendations');
      console.error('Video fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-2xl font-game">Loading videos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <div className="text-white text-xl mb-4">{error}</div>
        <Button onClick={onComplete}>Continue Anyway</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-game text-white mb-2 text-center">
          🤖 AI Recommended Videos
        </h1>
        <p className="text-gray-300 text-center mb-8">
          Watch these AI-curated tutorials about {topic} to prepare for the next challenge
        </p>

        {videos.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {videos.map((video) => (
                <Card key={video.id} className="bg-gray-800 border-2 border-purple-500 hover:border-purple-400 hover:scale-105 transition-all overflow-hidden shadow-2xl">
                  <a href={video.videoUrl} target="_blank" rel="noopener noreferrer" className="block">
                    {video.thumbnailUrl && (
                      <div className="relative">
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="w-full h-64 object-cover"
                          onError={(e) => {
                            console.log('Image failed to load:', video.thumbnailUrl);
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjY2NjIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxOCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPllvdVR1YmUgVmlkZW88L3RleHQ+PC9zdmc+';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        <div className="absolute bottom-4 left-4 right-4">
                          <h3 className="text-white font-bold text-xl mb-1 drop-shadow-lg">
                            {video.title}
                          </h3>
                          <p className="text-gray-200 text-sm drop-shadow-md">{video.channelTitle}</p>
                        </div>
                      </div>
                    )}
                  </a>
                </Card>
              ))}
            </div>

            <div className="flex justify-center">
              <Button
                onClick={onComplete}
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-xl font-game"
              >
                {hasGame ? 'Continue to Practice Game →' : 'Continue to Assessment →'}
              </Button>
            </div>
          </>
        ) : (
          <div className="text-center">
            <p className="text-gray-300 text-xl mb-8">No videos available at the moment.</p>
            <Button
              onClick={onComplete}
              className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 text-xl font-game"
            >
              {hasGame ? 'Continue to Practice Game →' : 'Continue to Assessment →'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
