import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePaperAirplane,
  HiOutlinePhoto,
  HiOutlineArrowLeft,
} from 'react-icons/hi2';
import EmptyState from '../components/common/EmptyState';
import { formatRelativeTime } from '../utils/helpers';
import { listConversations, getMessages, sendMessage, markMessageRead } from '../services/conversationsApi';

export default function Chat() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [conversations, setConversations] = useState([]);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchConvs() {
      if (!isAuthenticated) return;
      setIsLoading(true);
      try {
        const convList = await listConversations();
        setConversations(convList || []);
      } catch {
        setConversations([]);
      } finally {
        setIsLoading(false);
      }
    }
    fetchConvs();
  }, [isAuthenticated]);

  useEffect(() => {
    async function fetchMsgs() {
      if (!selectedConv) return;
      try {
        const msgList = await getMessages(selectedConv.id);
        setMessages(msgList || []);
      } catch {
        setMessages([]);
      }
    }
    fetchMsgs();
  }, [selectedConv]);

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

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConv) return;
    const text = messageInput.trim();
    setMessageInput('');
    try {
      const sent = await sendMessage(selectedConv.id, { message: text });
      setMessages((prev) => [...prev, sent]);
    } catch {
      // Revert if send fails
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">Messages</h1>

        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden h-[65vh] flex">
          <div className={`w-full sm:w-80 border-r border-neutral-100 flex flex-col shrink-0 ${selectedConv ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-3 border-b border-neutral-100">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {isLoading ? (
                <div className="p-4 text-center text-xs text-neutral-400">Loading chats...</div>
              ) : conversations.length === 0 ? (
                <div className="p-6 text-center text-xs text-neutral-400">No conversations yet</div>
              ) : (
                conversations.map((conv) => {
                  const other = conv.buyer?.id === user?.id ? conv.seller : conv.buyer;
                  return (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConv(conv)}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors text-left ${
                        selectedConv?.id === conv.id ? 'bg-primary-50' : ''
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600 shrink-0">
                        {other?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-semibold text-neutral-800 truncate">{other?.name || 'User'}</h4>
                          <span className="text-[10px] text-neutral-400 shrink-0">
                            {formatRelativeTime(conv.last_message_at)}
                          </span>
                        </div>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">{conv.last_message || 'No messages yet'}</p>
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

          <div className={`flex-1 flex flex-col ${selectedConv ? 'flex' : 'hidden sm:flex'}`}>
            {selectedConv ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="sm:hidden p-1 rounded-lg hover:bg-neutral-100"
                  >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center font-bold text-primary-600">
                    {(selectedConv.buyer?.id === user?.id ? selectedConv.seller : selectedConv.buyer)?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-800">
                      {(selectedConv.buyer?.id === user?.id ? selectedConv.seller : selectedConv.buyer)?.name || 'User'}
                    </h4>
                    {selectedConv.product && (
                      <p className="text-xs text-neutral-500">
                        Re: {selectedConv.product.title}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.map((msg) => {
                    const isMe = msg.sender_id === user?.id;
                    return (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${
                            isMe
                              ? 'bg-primary-500 text-white rounded-br-md'
                              : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                          }`}
                        >
                          <p>{msg.message}</p>
                          <p
                            className={`text-[10px] mt-1 ${
                              isMe ? 'text-primary-200' : 'text-neutral-400'
                            }`}
                          >
                            {formatRelativeTime(msg.created_at)}
                          </p>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                <div className="p-3 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <button className="p-2 rounded-lg text-neutral-400 hover:text-neutral-600 hover:bg-neutral-50">
                      <HiOutlinePhoto className="w-5 h-5" />
                    </button>
                    <input
                      type="text"
                      placeholder="Type a message..."
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      className="flex-1 px-4 py-2.5 rounded-xl bg-neutral-50 text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary-500"
                    />
                    <button
                      onClick={handleSend}
                      disabled={!messageInput.trim()}
                      className="p-2.5 rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 transition-colors"
                    >
                      <HiOutlinePaperAirplane className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm text-neutral-400">Select a conversation to start chatting</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
