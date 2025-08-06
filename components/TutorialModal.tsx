import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { Heart, X, Sparkles } from 'lucide-react';

interface TutorialModalProps {
  onClose: () => void;
}

const AnimatedSwipeCard = () => {
    const cardControls = useAnimation();
    const leftIndicatorControls = useAnimation();
    const rightIndicatorControls = useAnimation();

    useEffect(() => {
        const sequence = async () => {
            while (true) {
                // Initial state
                await cardControls.start({ x: 0, rotate: 0, opacity: 1, transition: { duration: 0.5 }});
                await new Promise(resolve => setTimeout(resolve, 1200));

                // Animate swipe left
                await leftIndicatorControls.start({ opacity: 1, scale: 1.1, transition: { duration: 0.2 }});
                await cardControls.start({ x: -150, rotate: -20, opacity: 0, transition: { duration: 0.4 }});
                await leftIndicatorControls.start({ opacity: 0, scale: 1, transition: { duration: 0.2 }});

                // Reset
                cardControls.set({ x: 0, rotate: 0 });
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Animate in
                await cardControls.start({ opacity: 1, transition: { duration: 0.4 } });
                await new Promise(resolve => setTimeout(resolve, 1200));

                // Animate swipe right
                await rightIndicatorControls.start({ opacity: 1, scale: 1.1, transition: { duration: 0.2 }});
                await cardControls.start({ x: 150, rotate: 20, opacity: 0, transition: { duration: 0.4 }});
                await rightIndicatorControls.start({ opacity: 0, scale: 1, transition: { duration: 0.2 }});
                
                // Reset
                cardControls.set({ x: 0, rotate: 0 });
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        };
        sequence();
    }, [cardControls, leftIndicatorControls, rightIndicatorControls]);


    return (
        <div className="w-48 h-64 relative">
            <div className="w-full h-full bg-accent/10 rounded-lg absolute top-0 left-0"></div>
            <motion.div
                className="w-full h-full bg-base border border-accent/20 rounded-lg shadow-lg absolute top-0 left-0 cursor-grab flex flex-col items-center justify-center p-4 text-center"
                animate={cardControls}
            >
                <p className="text-sm font-bold">気になる車を...</p>
                <p className="text-xs text-accent/60 mt-2">スワイプで<br/>サクサク探そう！</p>
                <div className="text-primary mt-4 font-display font-bold text-lg">TOYOTA PRIUS</div>
            </motion.div>

            {/* Swipe indicators */}
            <motion.div
                 animate={leftIndicatorControls}
                 initial={{ opacity: 0 }}
                 className="absolute -left-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            >
                <X size={24} className="text-error" />
                <span className="text-xs text-error">興味なし</span>
            </motion.div>
            <motion.div
                 animate={rightIndicatorControls}
                 initial={{ opacity: 0 }}
                 className="absolute -right-16 top-1/2 -translate-y-1/2 flex flex-col items-center gap-1"
            >
                <Heart size={24} className="text-success" fill="currentColor"/>
                <span className="text-xs text-success">お気に入り</span>
            </motion.div>
        </div>
    );
};

const TutorialModal: React.FC<TutorialModalProps> = ({ onClose }) => {

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ duration: 0.4, ease: [0.25, 1, 0.5, 1] }}
                className="w-full max-w-sm rounded-modal bg-base border border-accent/20 p-8 text-center flex flex-col items-center shadow-lg"
            >
                <div className="w-16 h-16 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center mb-4">
                    <Sparkles size={32} className="text-primary" />
                </div>
                <h2 className="font-display text-2xl font-bold mb-2">AI Car Navigatorへようこそ！</h2>
                <p className="text-accent/70 leading-relaxed mb-6">
                    スワイプ操作で、あなたにぴったりの一台を直感的に見つけましょう。
                </p>
                
                <AnimatedSwipeCard />

                <button
                    onClick={onClose}
                    className="w-full mt-8 py-3 rounded-small bg-primary text-base font-bold transition hover:bg-primary/90 active:scale-95"
                >
                    始める
                </button>
            </motion.div>
        </motion.div>
    );
};

export default TutorialModal;