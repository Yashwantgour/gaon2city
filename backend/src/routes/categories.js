import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

/**
 * GET /api/categories
 * List all active product categories
 */
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, parent_id')
      .order('name', { ascending: true });

    if (error) {
      return res.status(500).json({ message: 'Failed to fetch categories: ' + error.message });
    }

    res.json(data || []);
  } catch (err) {
    next(err);
  }
});

export default router;
