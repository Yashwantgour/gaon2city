import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
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
  markMessageRead,
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

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Auto-scroll to bottom of messages container
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load conversation list and handle deep linking from query params (?seller=...&product=...)
  useEffect(() => {
    async function initChat() {
      if (!isAuthenticated) return;
      setIsLoading(true);

      const sellerParam = searchParams.get('seller');
      const productParam = searchParams.get('product');

      // If productParam exists but no activeProduct state, fetch product info
      if (productParam && !activeProduct) {
        getProductById(productParam)
          .then((prod) => setActiveProduct(prod))
          .catch(() => {});
      }

      try {
        let convList = await listConversations();
        convList = convList || [];
        setConversations(convList);

        if (sellerParam) {
          // Check if conversation already exists
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
            if (existing.product) {
              setActiveProduct(existing.product);
            }
          } else {
            // Create a new conversation thread with seller and product context
            try {
              const newConv = await createConversation({
                seller_id: sellerParam,
                product_id: productParam || null,
              });

              // Merge route state seller/product info if backend did not join them
              const enrichedConv = {
                ...newConv,
                seller: newConv.seller || routeState.seller || (activeProduct ? activeProduct.seller : null),
                product: newConv.product || routeState.product || activeProduct,
              };

              setConversations((prev) => [
                enrichedConv,
                ...prev.filter((c) => c.id !== enrichedConv.id),
              ]);
              setSelectedConv(enrichedConv);
            } catch (err) {
              console.error('Failed to auto-create conversation:', err);
            }
          }
        } else if (convList.length > 0 && !selectedConv && window.innerWidth >= 640) {
          setSelectedConv(convList[0]);
          if (convList[0].product) {
            setActiveProduct(convList[0].product);
          }
        }
      } catch (err) {
        console.error('Error loading conversations:', err);
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    }

    initChat();
  }, [isAuthenticated, searchParams]);

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConv?.id) return;

    // Update active product if available in selected conversation
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

        // Mark unread messages as read
        if (msgList && user?.id) {
          msgList.forEach((msg) => {
            if (msg.sender_id !== user.id && !msg.read_at) {
              markMessageRead(msg.id).catch(() => {});
            }
          });
        }
      } catch (err) {
        console.error('Error fetching messages:', err);
        setMessages([]);
      }
    }

    fetchMsgs();

    // Supabase Realtime Subscription for instant message delivery
    const channel = supabase
      .channel(`chat:${selectedConv.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${selectedConv.id}`,
        },
        (payload) => {
          const incomingMsg = payload.new;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incomingMsg.id)) return prev;
            return [...prev, incomingMsg];
          });

          // Mark incoming message as read if active
          if (incomingMsg.sender_id !== user?.id) {
            markMessageRead(incomingMsg.id).catch(() => {});
          }

          // Update conversation list timestamp and preview
          setConversations((prev) =>
            prev.map((c) =>
              c.id === selectedConv.id
                ? {
                    ...c,
                    last_message: incomingMsg.message || 'Photo',
                    last_message_at: incomingMsg.created_at,
                  }
                : c
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConv?.id, user?.id]);

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

      // Update sidebar conversation item
      setConversations((prev) =>
        prev.map((c) =>
          c.id === selectedConv.id
            ? {
                ...c,
                last_message: sent.message || 'Photo',
                last_message_at: sent.created_at,
              }
            : c
        )
      );
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

                  return (
                    <button
                      key={conv.id}
                      onClick={() => {
                        setSelectedConv(conv);
                        if (conv.product) setActiveProduct(conv.product);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors text-left ${
                        isSelected ? 'bg-primary-50/60 border-r-2 border-primary-500' : ''
                      }`}
                    >
                      <div className="w-11 h-11 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 shrink-0 overflow-hidden">
                        {other?.avatar_url ? (
                          <img
                            src={other.avatar_url}
                            alt={otherName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          otherName.charAt(0).toUpperCase()
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="text-sm font-semibold text-neutral-800 truncate">
                            {otherName}
                          </h4>
                          <span className="text-[10px] text-neutral-400 shrink-0">
                            {formatRelativeTime(conv.last_message_at)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {conv.last_message || 'No messages yet'}
                        </p>
                      </div>

                      {conv.unread_count > 0 && (
                        <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold shrink-0">
                          {conv.unread_count}
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
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50/20">
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-center text-xs text-neutral-400">
                      Send a message to begin the conversation
                    </div>
                  ) : (
                    messages.map((msg) => {
                      const isMe = msg.sender_id === user?.id;
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
                              className={`flex items-center justify-end gap-1 text-[10px] mt-1 ${
                                isMe ? 'text-primary-100' : 'text-neutral-400'
                              }`}
                            >
                              <span>{formatRelativeTime(msg.created_at)}</span>
                              {isMe && (
                                <HiCheck
                                  className={`w-3.5 h-3.5 ${
                                    msg.read_at ? 'text-white font-bold' : 'opacity-70'
                                  }`}
                                />
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
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
