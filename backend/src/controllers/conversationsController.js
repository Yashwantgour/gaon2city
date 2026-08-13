import * as conversationsService from '../services/conversationsService.js';

/**
 * GET /api/conversations
 */
export async function listConversations(req, res, next) {
  try {
    const conversations = await conversationsService.listConversations(req.user.id);
    res.json(conversations);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/conversations
 */
export async function createConversation(req, res, next) {
  try {
    const conversation = await conversationsService.createConversation(req.user.id, req.body);
    res.status(201).json(conversation);
  } catch (err) {
    next(err);
  }
}

/**
 * GET /api/conversations/:id/messages
 */
export async function getMessages(req, res, next) {
  try {
    const messages = await conversationsService.getMessages(req.params.id, req.user.id);
    res.json(messages);
  } catch (err) {
    next(err);
  }
}

/**
 * POST /api/conversations/:id/messages
 */
export async function sendMessage(req, res, next) {
  try {
    const message = await conversationsService.sendMessage(req.params.id, req.user.id, req.body);
    res.status(201).json(message);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/messages/:id/read
 */
export async function markMessageRead(req, res, next) {
  try {
    const message = await conversationsService.markMessageRead(req.params.id, req.user.id);
    res.json(message);
  } catch (err) {
    next(err);
  }
}

/**
 * PATCH /api/conversations/:id/read
 */
export async function markConversationRead(req, res, next) {
  try {
    const messages = await conversationsService.markConversationRead(req.params.id, req.user.id);
    res.json({ success: true, updatedCount: messages.length });
  } catch (err) {
    next(err);
  }
}
