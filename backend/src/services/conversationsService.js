import { supabaseAdmin } from '../config/supabase.js';
import { ApiError } from '../utils/ApiError.js';

/**
 * List conversations for a user.
 */
export async function listConversations(userId) {
  const { data, error } = await supabaseAdmin
    .from('conversations')
    .select(`
      *,
      buyer:profiles!buyer_id(id, name, avatar_url),
      seller:profiles!seller_id(id, name, avatar_url),
      product:products(id, title, slug, images:product_images(storage_path))
    `)
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order('updated_at', { ascending: false });

  if (error) {
    throw ApiError.internal('Failed to fetch conversations');
  }

  // Enrich with last message & unread count
  const enriched = await Promise.all(
    (data || []).map(async (conv) => {
      // Last message
      const { data: lastMsg } = await supabaseAdmin
        .from('messages')
        .select('message, created_at')
        .eq('conversation_id', conv.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Unread count
      const { count } = await supabaseAdmin
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', conv.id)
        .neq('sender_id', userId)
        .is('read_at', null);

      return {
        ...conv,
        last_message: lastMsg?.message || null,
        last_message_at: lastMsg?.created_at || conv.updated_at,
        unread_count: count || 0,
      };
    })
  );

  return enriched;
}

/**
 * Create a new conversation.
 */
export async function createConversation(buyerId, { seller_id, product_id, order_id }) {
  // Check if conversation already exists
  let query = supabaseAdmin
    .from('conversations')
    .select(`
      *,
      buyer:profiles!buyer_id(id, name, avatar_url),
      seller:profiles!seller_id(id, name, avatar_url),
      product:products(id, title, slug, images:product_images(storage_path))
    `)
    .eq('buyer_id', buyerId)
    .eq('seller_id', seller_id);

  if (product_id) {
    query = query.eq('product_id', product_id);
  }

  const { data: existing } = await query.limit(1).single();

  if (existing) {
    return existing; // Return existing conversation with enriched relations
  }

  const { data: newRow, error } = await supabaseAdmin
    .from('conversations')
    .insert({
      buyer_id: buyerId,
      seller_id,
      product_id: product_id || null,
      order_id: order_id || null,
    })
    .select(`
      *,
      buyer:profiles!buyer_id(id, name, avatar_url),
      seller:profiles!seller_id(id, name, avatar_url),
      product:products(id, title, slug, images:product_images(storage_path))
    `)
    .single();

  if (error) {
    // If foreign key relation join fails on insert, fallback to bare insert and manual fetch
    const { data: bareRow, error: bareError } = await supabaseAdmin
      .from('conversations')
      .insert({
        buyer_id: buyerId,
        seller_id,
        product_id: product_id || null,
        order_id: order_id || null,
      })
      .select()
      .single();

    if (bareError) {
      throw ApiError.internal('Failed to create conversation');
    }
    return bareRow;
  }

  return newRow;
}

/**
 * Get messages for a conversation. User must be a participant.
 */
export async function getMessages(conversationId, userId) {
  // Verify participation
  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single();

  if (!conv) {
    throw ApiError.notFound('Conversation not found');
  }

  if (conv.buyer_id !== userId && conv.seller_id !== userId) {
    throw ApiError.forbidden('You do not have access to this conversation');
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });

  if (error) {
    throw ApiError.internal('Failed to fetch messages');
  }

  return data || [];
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(conversationId, senderId, { message, image_path }) {
  // Verify participation
  const { data: conv } = await supabaseAdmin
    .from('conversations')
    .select('buyer_id, seller_id')
    .eq('id', conversationId)
    .single();

  if (!conv) {
    throw ApiError.notFound('Conversation not found');
  }

  if (conv.buyer_id !== senderId && conv.seller_id !== senderId) {
    throw ApiError.forbidden('You do not have access to this conversation');
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      message,
      image_path: image_path || null,
    })
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to send message');
  }

  // Update conversation timestamp
  await supabaseAdmin
    .from('conversations')
    .update({ updated_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

/**
 * Mark a message as read.
 */
export async function markMessageRead(messageId, userId) {
  // Only the recipient can mark as read
  const { data: msg } = await supabaseAdmin
    .from('messages')
    .select('sender_id, conversation_id')
    .eq('id', messageId)
    .single();

  if (!msg) {
    throw ApiError.notFound('Message not found');
  }

  // The sender cannot mark their own message as read
  if (msg.sender_id === userId) {
    throw ApiError.badRequest('Cannot mark your own message as read');
  }

  const { data, error } = await supabaseAdmin
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('id', messageId)
    .select()
    .single();

  if (error) {
    throw ApiError.internal('Failed to mark message as read');
  }

  return data;
}
