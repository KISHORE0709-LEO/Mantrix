import fetch from 'node-fetch';

interface YouTubeVideo {
  id: string;
  title: string;
  channelTitle: string;
  thumbnailUrl: string;
  videoUrl: string;
}

export async function getRecommendedVideos(topic: string, difficulty: string): Promise<YouTubeVideo[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  
  if (!apiKey) {
    console.warn('YouTube API key not found, returning fallback videos');
    return getFallbackVideos(topic);
  }

  try {
    const searchQuery = `${topic} ${difficulty} tutorial programming`;
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=5&key=${apiKey}&videoDuration=medium&relevanceLanguage=en`;
    
    const response = await fetch(url);
    const data = await response.json() as any;
    
    if (data.items) {
      return data.items.map((item: any) => ({
        id: item.id.videoId,
        title: item.snippet.title,
        channelTitle: item.snippet.channelTitle,
        thumbnailUrl: item.snippet.thumbnails.medium.url,
        videoUrl: `https://www.youtube.com/watch?v=${item.id.videoId}`,
      }));
    }
    
    return getFallbackVideos(topic);
  } catch (error) {
    console.error('YouTube API error:', error);
    return getFallbackVideos(topic);
  }
}

function getFallbackVideos(topic: string): YouTubeVideo[] {
  const fallbackVideos: Record<string, YouTubeVideo[]> = {
    'Arrays': [
      { id: 'fallback1', title: 'Arrays Explained - Data Structures', channelTitle: 'Programming Channel', thumbnailUrl: '', videoUrl: 'https://www.youtube.com/results?search_query=arrays+tutorial' }
    ],
    'Linked Lists': [
      { id: 'fallback2', title: 'Linked Lists Tutorial', channelTitle: 'Coding Channel', thumbnailUrl: '', videoUrl: 'https://www.youtube.com/results?search_query=linked+list+tutorial' }
    ],
  };
  
  return fallbackVideos[topic] || [
    { id: 'fallback', title: `${topic} Tutorial`, channelTitle: 'Educational', thumbnailUrl: '', videoUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(topic)}+tutorial` }
  ];
}
