import { motion } from 'framer-motion';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  HiOutlinePaperAirplane,
  HiOutlinePhoto,
  HiOutlineArrowLeft,
} from 'react-icons/hi2';
import EmptyState from '../components/common/EmptyState';
import { mockConversations, mockMessages } from '../services/mockData';
import { formatRelativeTime } from '../utils/helpers';

export default function Chat() {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useSelector((state) => state.auth);
  const [selectedConv, setSelectedConv] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState(mockMessages);

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

  const handleSend = () => {
    if (!messageInput.trim()) return;
    const newMsg = {
      id: Date.now().toString(),
      conversation_id: selectedConv.id,
      sender_id: user.id,
      message: messageInput,
      created_at: new Date().toISOString(),
      read_at: null,
    };
    setMessages([...messages, newMsg]);
    setMessageInput('');
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-2xl font-bold text-neutral-800 mb-6">Messages</h1>

        <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden h-[65vh] flex">
          {/* Conversation List */}
          <div className={`w-full sm:w-80 border-r border-neutral-100 flex flex-col shrink-0 ${selectedConv ? 'hidden sm:flex' : 'flex'}`}>
            <div className="p-3 border-b border-neutral-100">
              <input
                type="text"
                placeholder="Search conversations..."
                className="w-full px-3 py-2 rounded-lg bg-neutral-50 text-sm border-none focus:outline-none focus:ring-1 focus:ring-primary-500"
              />
            </div>
            <div className="flex-1 overflow-y-auto">
              {mockConversations.map((conv) => {
                const other = conv.buyer.id === user.id ? conv.seller : conv.buyer;
                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConv(conv)}
                    className={`w-full flex items-center gap-3 px-4 py-3.5 hover:bg-neutral-50 transition-colors text-left ${
                      selectedConv?.id === conv.id ? 'bg-primary-50' : ''
                    }`}
                  >
                    <img
                      src={other.avatar_url}
                      alt={other.name}
                      className="w-10 h-10 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-semibold text-neutral-800 truncate">{other.name}</h4>
                        <span className="text-[10px] text-neutral-400 shrink-0">
                          {formatRelativeTime(conv.last_message_at)}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-500 truncate mt-0.5">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="w-5 h-5 bg-primary-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold shrink-0">
                        {conv.unread_count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Chat Area */}
          <div className={`flex-1 flex flex-col ${selectedConv ? 'flex' : 'hidden sm:flex'}`}>
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-neutral-100">
                  <button
                    onClick={() => setSelectedConv(null)}
                    className="sm:hidden p-1 rounded-lg hover:bg-neutral-100"
                  >
                    <HiOutlineArrowLeft className="w-5 h-5" />
                  </button>
                  <img
                    src={(selectedConv.buyer.id === user.id ? selectedConv.seller : selectedConv.buyer).avatar_url}
                    alt=""
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-800">
                      {(selectedConv.buyer.id === user.id ? selectedConv.seller : selectedConv.buyer).name}
                    </h4>
                    {selectedConv.product && (
                      <p className="text-xs text-neutral-500">
                        Re: {selectedConv.product.title}
                      </p>
                    )}
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages
                    .filter((m) => m.conversation_id === selectedConv.id)
                    .map((msg) => {
                      const isMe = msg.sender_id === user.id;
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

                {/* Input */}
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
