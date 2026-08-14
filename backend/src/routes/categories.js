import { Router } from 'express';
import { supabaseAdmin } from '../config/supabase.js';

const router = Router();

export const CANONICAL_CATEGORY_IDS = [
  '11111111-1111-4111-a111-111111111111', // Agriculture
  '22222222-2222-4222-a222-222222222222', // Dairy & Milk
  '33333333-3333-4333-a333-333333333333', // Fruits & Vegetables
  '44444444-4444-4444-a444-444444444444', // Handicrafts
  '55555555-5555-4555-a555-555555555555', // Clothing
  '66666666-6666-4666-a666-666666666666', // Electronics
  '77777777-7777-4777-a777-777777777777', // Home & Kitchen
  '88888888-8888-4888-a888-888888888888', // Vehicles
  '99999999-9999-4999-a999-999999999999', // Tools & Equipment
  'aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa', // Services
  'bbbbbbbb-bbbb-4bbb-abbb-bbbbbbbbbbbb', // Food & Snacks
  'cccccccc-cccc-4ccc-accc-cccccccccccc', // Health & Beauty
];

/**
 * GET /api/categories
 * List the 12 canonical product categories
 */
router.get('/', async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('id, name, slug, parent_id')
      .in('id', CANONICAL_CATEGORY_IDS)
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
