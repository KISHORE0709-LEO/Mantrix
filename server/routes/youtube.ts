import { Router } from 'express';
import { getRecommendedVideos } from '../services/youtube';

const router = Router();

router.post('/recommendations', async (req, res) => {
  try {
    const { topic, difficulty } = req.body;
    
    if (!topic) {
      return res.status(400).json({ error: 'Topic is required' });
    }
    
    const videos = await getRecommendedVideos(topic, difficulty || 'beginner');
    res.json({ videos });
  } catch (error) {
    console.error('Error fetching video recommendations:', error);
    res.status(500).json({ error: 'Failed to fetch recommendations' });
  }
});

export default router;
