import { motion } from 'framer-motion';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import {
  HiOutlinePaperAirplane,
  HiOutlinePhoto,
  HiOutlineArrowLeft,
  HiCheck,
  HiOutlineXMark,
} from 'react-icons/hi2';
import EmptyState from '../components/common/EmptyState';
import { formatRelativeTime } from '../utils/helpers';
import {
  listConversations,
  createConversation,
  getMessages,
  sendMessage,
  markConversationRead,
} from '../services/conversationsApi';
import { getProductById } from '../services/productsApi';
import { uploadFile } from '../services/storageService';
import { supabase } from '../services/supabase';

export default function Chat() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, user } = useSelector((state) => state.auth);

  const routeState = location.state || {};
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [activeProduct, setActiveProduct] = useState(routeState.product || null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [selectedImagePreview, setSelectedImagePreview] = useState(null);

  const selectedConvRef = useRef(null);
  selectedConvRef.current = selectedConv;

  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll ONLY the chat messages container to the bottom (never scrolls the main window)
  const scrollToBottom = useCallback((smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      scrollToBottom(true);
    }, 50);
    return () => clearTimeout(timeoutId);
  }, [messages, scrollToBottom]);

  // Load conversation list and handle explicit deep linking from query params (?seller=...&product=...)
  useEffect(() => {
    async function initChat() {
      if (!isAuthenticated) return;
      setIsLoading(true);

      const sellerParam = searchParams.get('seller');
      const productParam = searchParams.get('product');

      if (productParam && !activeProduct) {
        getProductById(productParam)
          .then((prod) => setActiveProduct(prod))
          .catch(() => {});
      }

      try {
        let convList = await listConversations();
        convList = convList || [];
        setConversations(convList);

        // ONLY auto-select if seller query param was explicitly passed (e.g. from "Chat Seller" button)
        if (sellerParam) {
          const existing = convList.find(
            (c) =>
              (c.seller_id === sellerParam ||
                c.seller?.id === sellerParam ||
                c.buyer_id === sellerParam ||
                c.buyer?.id === sellerParam) &&
              (!productParam || String(c.product_id) === String(productParam))
          );

          if (existing) {
            setSelectedConv(existing);
            if (existing.product) setActiveProduct(existing.product);
            markConversationRead(existing.id).catch(() => {});
          } else {
            try {
              const newConv = await createConversation({
                seller_id: sellerParam,
                product_id: productParam || null,
              });

              const enrichedConv = {
                ...newConv,
                seller: newConv.seller || routeState.seller || (activeProduct ? activeProduct.seller : null),
                product: newConv.product || routeState.product || activeProduct,
                unread_count: 0,
              };

              setConversations((prev) => [
                enrichedConv,
                ...prev.filter((c) => c.id !== enrichedConv.id),
              ]);
              setSelectedConv(enrichedConv);
              markConversationRead(enrichedConv.id).catch(() => {});
            } catch (err) {
              console.error('Failed to auto-create conversation:', err);
            }
          }
        }
        // Note: When no query parameter is provided, we intentionally do NOT auto-select
        // the first conversation so the user sees unread badges and explicitly clicks to open.
      } catch (err) {
        console.error('Error loading conversations:', err);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    }

    initChat();
  }, [isAuthenticated, searchParams]);

  // Fetch messages when a conversation is explicitly selected
  useEffect(() => {
    if (!selectedConv?.id) return;

    if (selectedConv.product) {
      setActiveProduct(selectedConv.product);
    } else if (selectedConv.product_id && !activeProduct) {
      getProductById(selectedConv.product_id)
        .then((prod) => setActiveProduct(prod))
        .catch(() => {});
    }

    async function fetchMsgs() {
      try {
        const msgList = await getMessages(selectedConv.id);
        setMessages(msgList || []);

        // Mark all unread messages as read in this conversation
        markConversationRead(selectedConv.id).catch(() => {});

        // Reset unread count for this active conversation in sidebar
        setConversations((prev) =>
          prev.map((c) => (c.id === selectedConv.id ? { ...c, unread_count: 0 } : c))
        );
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessages([]);
      }
    }

    fetchMsgs();
  }, [selectedConv?.id]);

  // Listen to window focus to mark open conversation as read when returning to tab
  useEffect(() => {
    function handleWindowFocus() {
      if (selectedConvRef.current?.id && user?.id) {
        markConversationRead(selectedConvRef.current.id).catch(() => {});
      }
    }

    window.addEventListener('focus', handleWindowFocus);
    const handleVisibility = () => {
      if (!document.hidden) handleWindowFocus();
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('focus', handleWindowFocus);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [user?.id]);

  // Global Realtime Subscription for all messages (INSERT and UPDATE)
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const channel = supabase
      .channel('realtime-messages-global')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const incomingMsg = payload.new;
          const currentSelected = selectedConvRef.current;

          // Check if message belongs to the conversation currently active on screen
          if (currentSelected && incomingMsg.conversation_id === currentSelected.id) {
            setMessages((prev) => {
              if (prev.some((m) => m.id === incomingMsg.id)) return prev;
              return [...prev, incomingMsg];
            });

            // If incoming from another user and window has active focus, mark as read
            if (incomingMsg.sender_id !== user.id) {
              if (document.hasFocus() && !document.hidden) {
                markConversationRead(currentSelected.id).catch(() => {});
              }
            }

            // Update active conversation in sidebar
            setConversations((prev) =>
              prev.map((c) =>
                c.id === currentSelected.id
                  ? {
                      ...c,
                      last_message: incomingMsg.message || 'Photo',
                      last_message_at: incomingMsg.created_at,
                      unread_count: 0,
                    }
                  : c
              )
            );
          } else {
            // Message belongs to an inactive conversation (or recipient has no conversation open)
            setConversations((prev) => {
              const exists = prev.some((c) => c.id === incomingMsg.conversation_id);
              if (!exists) {
                // Fetch full conversation list if this is a newly created conversation
                listConversations().then((list) => setConversations(list || [])).catch(() => {});
                return prev;
              }

              const isFromOther = incomingMsg.sender_id !== user.id;

              return prev
                .map((c) => {
                  if (c.id === incomingMsg.conversation_id) {
                    return {
                      ...c,
                      last_message: incomingMsg.message || 'Photo',
                      last_message_at: incomingMsg.created_at,
                      unread_count: isFromOther ? (c.unread_count || 0) + 1 : (c.unread_count || 0),
                    };
                  }
                  return c;
                })
                .sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
            });
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const updatedMsg = payload.new;

          // Realtime update of message state (e.g. read_at timestamp updated to show double checks in sender view)
          setMessages((prev) =>
            prev.map((m) => (m.id === updatedMsg.id ? { ...m, ...updatedMsg } : m))
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id]);

  if (!isAuthenticated) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <EmptyState
          title="Sign in to view messages"
          actionLabel="Sign In"
          onAction={() => navigate('/login')}
        />
      </div>
    );
  }

  // Resolve other participant info robustly
  const getOtherParticipant = (conv) => {
    if (!conv) return null;
    const isBuyer = conv.buyer_id === user?.id || conv.buyer?.id === user?.id;
    if (isBuyer) {
      return conv.seller || routeState.seller || (activeProduct?.seller ? activeProduct.seller : null);
    }
    return conv.buyer || routeState.buyer || null;
  };

  const currentOther = getOtherParticipant(selectedConv);
  const currentOtherName = currentOther?.name || (selectedConv?.seller?.name || selectedConv?.buyer?.name) || 'Seller';
  const currentProduct = selectedConv?.product || activeProduct || routeState.product;

  const handleSelectConversation = (conv) => {
    setSelectedConv(conv);
    if (conv.product) setActiveProduct(conv.product);

    // Reset unread count locally and in database
    setConversations((prev) =>
      prev.map((c) => (c.id === conv.id ? { ...c, unread_count: 0 } : c))
    );
    markConversationRead(conv.id).catch(() => {});
  };

  const handleSend = async () => {
    if ((!messageInput.trim() && !selectedImagePreview) || !selectedConv || isSending) return;

    const text = messageInput.trim();
    const imagePayload = selectedImagePreview;

    setMessageInput('');
    setSelectedImagePreview(null);
    setIsSending(true);

    try {
      const sent = await sendMessage(selectedConv.id, {
        message: text || (imagePayload ? 'Photo' : ''),
        image_path: imagePayload || null,
      });

      setMessages((prev) => {
        if (prev.some((m) => m.id === sent.id)) return prev;
        return [...prev, sent];
      });

      // Update sidebar conversation item & move to top
      setConversations((prev) => {
        const updated = prev.map((c) =>
          c.id === selectedConv.id
            ? {
                ...c,
                last_message: sent.message || 'Photo',
                last_message_at: sent.created_at,
                unread_count: 0,
              }
            : c
        );
        return updated.sort((a, b) => new Date(b.last_message_at) - new Date(a.last_message_at));
      });
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const uploadedUrl = await uploadFile(file);
      if (uploadedUrl) {
        setSelectedImagePreview(uploadedUrl);
      }
    } catch (err) {
      console.error('Failed to upload chat image:', err);
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">Messages</h1>

        <div className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden h-[70vh] flex">
          {/* Conversation Sidebar */}
          <div
            className={`w-full sm:w-80 border-r border-neutral-100 flex flex-col shrink-0 ${
              selectedConv ? 'hidden sm:flex' : 'flex'
            }`}
          >
            <div className="p-3 border-b border-neutral-100 bg-neutral-50/50">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-3 py-2 rounded-xl bg-white border border-neutral-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
              />
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
              {isLoading ? (
                <div className="p-8 text-center text-sm text-neutral-400">Loading chats...</div>
              ) : conversations.length === 0 ? (
                <div className="p-8 text-center text-sm text-neutral-400">No conversations yet</div>
              ) : (
                conversations.map((conv) => {
                  const other = getOtherParticipant(conv);
                  const otherName = other?.name || (conv.seller?.name || conv.buyer?.name) || 'User';
                  const isSelected = selectedConv?.id === conv.id;
                  const hasUnread = conv.unread_count > 0;

                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors text-left relative ${
                        isSelected
                          ? 'bg-primary-50/60 border-r-2 border-primary-500'
                          : hasUnread
                          ? 'bg-primary-50/20'
                          : ''
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 shrink-0 overflow-hidden relative">
                        {other?.avatar_url ? (
                          <img
                            src={other.avatar_url}
                            alt={otherName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          otherName.charAt(0).toUpperCase()
                        )}
                        {hasUnread && (
                          <span className="absolute top-0 right-0 w-3 h-3 bg-primary-500 border-2 border-white rounded-full" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4
                            className={`text-sm truncate ${
                              hasUnread ? 'font-bold text-neutral-900' : 'font-semibold text-neutral-800'
                            }`}
                          >
                            {otherName}
                          </h4>
                          <span
                            className={`text-[10px] shrink-0 ${
                              hasUnread ? 'text-primary-600 font-bold' : 'text-neutral-400'
                            }`}
                          >
                            {formatRelativeTime(conv.last_message_at)}
                          </span>
                        </div>
                        <p
                          className={`text-xs truncate mt-0.5 ${
                            hasUnread ? 'text-neutral-900 font-semibold' : 'text-neutral-500'
                          }`}
                        >
                          {conv.last_message || 'No messages yet'}
                        </p>
                      </div>

                      {hasUnread && (
                        <span className="min-w-5 h-5 px-1.5 bg-primary-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold shrink-0 shadow-xs">
                          {conv.unread_count > 99 ? '99+' : conv.unread_count}
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Active Chat Window */}
          <div className={`flex-1 flex flex-col ${selectedConv ? 'flex' : 'hidden sm:flex'}`}>
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100 bg-neutral-50/40">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedConv(null)}
                      className="sm:hidden p-1.5 rounded-lg hover:bg-neutral-100 text-neutral-600"
                    >
                      <HiOutlineArrowLeft className="w-5 h-5" />
                    </button>

                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 overflow-hidden">
                      {currentOther?.avatar_url ? (
                        <img
                          src={currentOther.avatar_url}
                          alt={currentOtherName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        currentOtherName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-neutral-800">
                        {currentOtherName}
                      </h4>
                      {currentProduct && (
                        <p className="text-xs text-primary-600 font-medium truncate max-w-xs sm:max-w-md">
                          Regarding: {currentProduct.title}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages List */}
                <div
                  ref={messagesContainerRef}
                  className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/20"
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-xs text-neutral-400">
                      Send a message to begin the conversation
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
                      const isRead = Boolean(msg.read_at);

                      return (
                        <motion.div
                          key={msg.id || msg.created_at}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[78%] px-4 py-2.5 rounded-2xl text-sm shadow-xs ${
                              isMe
                                ? 'bg-primary-500 text-white rounded-br-xs'
                                : 'bg-white text-neutral-800 rounded-bl-xs border border-neutral-100'
                            }`}
                          >
                            {msg.image_path && (
                              <div className="mb-2 rounded-lg overflow-hidden max-w-xs bg-black/5">
                                <img
                                  src={msg.image_path}
                                  alt="Attachment"
                                  className="w-full h-auto max-h-56 object-cover rounded-lg"
                                />
                              </div>
                            )}

                            {msg.message && msg.message !== '[Image]' && msg.message !== 'Photo' && (
                              <p className="whitespace-pre-wrap break-words">{msg.message}</p>
                            )}

                            <div
                              className={`flex items-center justify-end gap-1.5 text-[10px] mt-1 ${
                                isMe ? 'text-primary-100' : 'text-neutral-400'
                              }`}
                            >
                              <span>{formatRelativeTime(msg.created_at)}</span>
                              {isMe && (
                                <span
                                  className="inline-flex items-center ml-0.5"
                                  title={
                                    isRead
                                      ? `Read at ${new Date(msg.read_at).toLocaleTimeString()}`
                                      : 'Sent (Unread)'
                                  }
                                >
                                  {isRead ? (
                                    <span className="flex items-center text-sky-200 font-bold">
                                      <HiCheck className="w-3.5 h-3.5 stroke-[2.5]" />
                                      <HiCheck className="w-3.5 h-3.5 stroke-[2.5] -ml-2" />
                                    </span>
                                  ) : (
                                    <span className="flex items-center text-white/70">
                                      <HiCheck className="w-3.5 h-3.5 stroke-[2]" />
                                    </span>
                                  )}
                                </span>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>

                {/* Selected Image Thumbnail Preview before sending */}
                {selectedImagePreview && (
                  <div className="px-4 py-2 bg-neutral-50 border-t border-neutral-100 flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-neutral-200">
                      <img
                        src={selectedImagePreview}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() => setSelectedImagePreview(null)}
                        className="absolute top-0.5 right-0.5 bg-black/60 text-white rounded-full p-0.5"
                      >
                        <HiOutlineXMark className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-xs text-neutral-500">Image attached. Ready to send.</span>
                  </div>
                )}

                {/* Message Input Bar */}
                <div className="p-3 border-t border-neutral-100 bg-white">
                  <div className="flex items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleFileChange}
                    />

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="p-2.5 rounded-xl text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50 transition-colors disabled:opacity-50"
                      title="Attach photo"
                    >
                      <HiOutlinePhoto className="w-5 h-5" />
                    </button>

                    <input
                      type="text"
                      placeholder={isUploadingImage ? 'Uploading photo...' : 'Type a message...'}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      disabled={isUploadingImage}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-none focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                    />

                    <button
                      type="button"
                      onClick={handleSend}
                      disabled={(!messageInput.trim() && !selectedImagePreview) || isSending}
                      className="p-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 transition-colors shadow-xs"
                    >
                      <HiOutlinePaperAirplane className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-neutral-400">
                <p className="text-sm font-medium">Select a conversation to start chatting</p>
                <p className="text-xs text-neutral-400 mt-1">
                  Connect directly with local producers and buyers
                </p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
