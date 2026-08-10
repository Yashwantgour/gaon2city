import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createConversationValidators,
  sendMessageValidators,
  conversationIdValidator,
  messageIdValidator,
} from '../validators/chatValidators.js';
import * as conversationsController from '../controllers/conversationsController.js';

const router = Router();

// All chat routes require authentication
router.use(authenticate);

// GET /api/conversations — list my conversations
router.get('/', conversationsController.listConversations);

// POST /api/conversations — start or get existing conversation
router.post('/', createConversationValidators, validate, conversationsController.createConversation);

// GET /api/conversations/:id/messages — get messages
router.get('/:id/messages', conversationIdValidator, validate, conversationsController.getMessages);

// POST /api/conversations/:id/messages — send message
router.post('/:id/messages', sendMessageValidators, validate, conversationsController.sendMessage);

// PATCH /api/messages/:id/read — mark message as read
// Note: This is mounted here but the path is /messages/:id/read
router.patch('/messages/:id/read', messageIdValidator, validate, conversationsController.markMessageRead);

export default router;
