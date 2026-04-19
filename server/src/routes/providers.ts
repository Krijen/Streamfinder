import { Router, Request, Response } from 'express';
import { getProviders } from '../services/tmdb';
import { getPricedSources } from '../services/watchmode';

const router = Router();

router.get('/:mediaType/:id', async (req: Request, res: Response) => {
  const { mediaType, id } = req.params;
  const country = (req.query.country as string) || 'NO';

  if (mediaType !== 'movie' && mediaType !== 'tv') {
    res.status(400).json({ error: 'mediaType must be "movie" or "tv"' });
    return;
  }

  const [tmdbResult, watchmodeResult] = await Promise.allSettled([
    getProviders(mediaType, Number(id), country),
    getPricedSources(Number(id), mediaType, country),
  ]);

  if (tmdbResult.status === 'rejected') {
    console.error('TMDB providers error:', tmdbResult.reason);
    res.status(500).json({ error: 'Failed to fetch streaming providers' });
    return;
  }

  if (watchmodeResult.status === 'rejected') {
    console.error('Watchmode error:', watchmodeResult.reason);
  }

  res.json({
    providers: tmdbResult.value,
    pricedSources: watchmodeResult.status === 'fulfilled' ? watchmodeResult.value : [],
    country,
  });
});

export default router;
