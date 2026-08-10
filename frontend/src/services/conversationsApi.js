import api from './api';

export async function listConversations() {
  return await api.get('/conversations');
}

export async function createConversation(data) {
  return await api.post('/conversations', data);
}

export async function getMessages(conversationId) {
  return await api.get(`/conversations/${conversationId}/messages`);
}

export async function sendMessage(conversationId, messageData) {
  return await api.post(`/conversations/${conversationId}/messages`, messageData);
}

export async function markMessageRead(messageId) {
  return await api.patch(`/conversations/messages/${messageId}/read`);
}
