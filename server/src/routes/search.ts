import { Router, Request, Response } from 'express';
import { searchMulti } from '../services/tmdb';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const { query, page } = req.query;

  if (!query || typeof query !== 'string') {
    res.status(400).json({ error: 'query parameter is required' });
    return;
  }

  try {
    const data = await searchMulti(query, page ? Number(page) : 1);
    res.json(data);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Failed to search media' });
  }
});

export default router;
