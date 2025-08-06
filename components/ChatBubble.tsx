import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { Message, Car } from '../types';

interface ChatBubbleProps {
  message: Message;
  onQuickReplyClick: (replyText: string, messageId: string) => void;
}

const ComparisonCard: React.FC<{ car: Car }> = ({ car }) => (
  <div className="mt-2 w-full max-w-xs rounded-card border border-primary/30 bg-primary/10 p-3 flex gap-3">
    <img src={car.imageUrl} alt={car.name} className="w-20 h-20 object-cover rounded-small" />
    <div className="flex flex-col justify-center">
      <p className="text-xs text-accent/70">比較リクエスト</p>
      <p className="font-heading font-bold text-sm text-accent leading-tight">{car.name}</p>
      <p className="font-mono text-primary font-bold mt-1">{car.price.toLocaleString()}万円</p>
    </div>
  </div>
);

const QuickReplyButtons: React.FC<{ replies: string[], onClick: (reply: string) => void }> = ({ replies, onClick }) => (
    <motion.div 
        className="flex flex-wrap gap-2 mt-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { staggerChildren: 0.1, delayChildren: 0.2 } }}
    >
        {replies.map(reply => (
            <motion.button
                key={reply}
                onClick={() => onClick(reply)}
                className="px-4 py-2 text-sm rounded-full border-2 border-primary text-primary bg-transparent hover:bg-primary/20 transition-colors duration-200"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
            >
                {reply}
            </motion.button>
        ))}
    </motion.div>
);

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, onQuickReplyClick }) => {
  const isBot = message.sender === 'bot';

  const bubbleVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  };

  if (!isBot && message.carToCompare) {
    return (
      <motion.div
        variants={bubbleVariants}
        initial="hidden"
        animate="visible"
        className="flex items-end gap-2 max-w-lg self-end flex-row-reverse"
      >
        <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-primary">
          <User size={20} />
        </div>
        <div className="flex flex-col items-end">
          <div className="px-4 py-3 rounded-card text-accent/90 whitespace-pre-wrap bg-gradient-to-br from-primary to-secondary rounded-br-small">
            {message.text}
          </div>
          <ComparisonCard car={message.carToCompare} />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={bubbleVariants}
      initial="hidden"
      animate="visible"
      className={`flex flex-col gap-2 max-w-lg ${isBot ? 'self-start items-start' : 'self-end items-end'}`}
    >
        <div className={`flex items-end gap-2 w-full ${isBot ? 'flex-row' : 'flex-row-reverse'}`}>
            <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-secondary' : 'bg-primary'}`}>
                {isBot ? <Bot size={20} /> : <User size={20} />}
            </div>
            <div
                className={`px-4 py-3 rounded-card text-accent/90 whitespace-pre-wrap ${
                isBot
                    ? 'glass-effect rounded-bl-small'
                    : 'bg-gradient-to-br from-primary to-secondary rounded-br-small'
                }`}
            >
                {message.text}
            </div>
        </div>
        {isBot && message.quickReplies && message.quickReplies.length > 0 && (
            <div className="pl-10">
                <QuickReplyButtons 
                    replies={message.quickReplies} 
                    onClick={(reply) => onQuickReplyClick(reply, message.id)}
                />
            </div>
        )}
    </motion.div>
  );
};

export default ChatBubble;