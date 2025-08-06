import React from 'react';
import { motion, Variants } from 'framer-motion';
import { Bot } from 'lucide-react';

const TypingIndicator: React.FC = () => {
  const dotVariants: Variants = {
    hidden: { y: 0, opacity: 0 },
    visible: (i: number) => ({
      y: -6,
      opacity: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      },
    }),
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-end gap-2 self-start"
    >
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
            <Bot size={20} />
        </div>
        <div className="glass-effect px-4 py-3 rounded-card rounded-bl-small flex items-center gap-1.5 h-[46px]">
            <motion.div custom={0} initial="hidden" animate="visible" variants={dotVariants} className="w-2 h-2 bg-accent/50 rounded-full" />
            <motion.div custom={1} initial="hidden" animate="visible" variants={dotVariants} className="w-2 h-2 bg-accent/50 rounded-full" />
            <motion.div custom={2} initial="hidden" animate="visible" variants={dotVariants} className="w-2 h-2 bg-accent/50 rounded-full" />
        </div>
    </motion.div>
  );
};

export default TypingIndicator;
