import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
import type { Car } from '../types';
import { Heart, X, LoaderCircle, Send } from 'lucide-react';

interface TinderCardProps {
  car: Car;
  onSwipe: (direction: 'right' | 'left') => void;
  onCarSelect: (car: Car) => void;
  onInquiryClick: (car: Car) => void;
  active: boolean;
}

const TinderCard: React.FC<TinderCardProps> = ({ car, onSwipe, onCarSelect, onInquiryClick, active }) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-150, -100, 0, 100, 150], [0, 1, 1, 1, 0]);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const swipeThreshold = 80;
    if (info.offset.x > swipeThreshold) {
      onSwipe('right');
    } else if (info.offset.x < -swipeThreshold) {
      onSwipe('left');
    }
  };

  const handleTap = (event: MouseEvent | TouchEvent | PointerEvent) => {
    // Prevent detail view from opening when the inquiry button is clicked.
    if ((event.target as HTMLElement).closest('button')) {
      return;
    }
    onCarSelect(car);
  };

  const handleInquiryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onInquiryClick(car);
  };

  return (
    <motion.div
      className="absolute w-full h-full cursor-grab"
      style={{ x, rotate, opacity }}
      drag="x"
      dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
      onDragEnd={handleDragEnd}
      onTap={handleTap}
      whileTap={{ cursor: 'grabbing' }}
      initial={{ scale: 0.95, y: 20, opacity: 0 }}
      animate={{ scale: 1, y: 0, opacity: 1 }}
      exit={{ scale: 0.9, y: 40, opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-base-dark rounded-card overflow-hidden shadow-custom w-full h-full flex flex-col">
        <img src={car.imageUrl} alt={car.name} className="w-full h-[55%] object-cover" />
        <div className="p-4 flex flex-col justify-between flex-1 glass-effect border-t border-accent/10">
          <div>
            <h3 className="font-display text-xl font-bold text-accent truncate">{car.name}</h3>
            <p className="font-mono text-sm text-accent/80">{car.year}年 / {car.mileage.toLocaleString()} km</p>
            <p className="font-display text-3xl font-bold text-primary mt-1">{car.price.toLocaleString()}万円</p>
          </div>
           <button 
              onClick={handleInquiryClick}
              className="w-full mt-2 py-3 rounded-small bg-primary text-base font-bold transition hover:bg-primary/90 active:scale-95 flex items-center justify-center gap-2"
            >
                <Send size={18} />
                今すぐ問い合わせる
            </button>
        </div>
      </div>
    </motion.div>
  );
};

interface RecommendPageProps {
  cars: Car[];
  onSwipe: (car: Car, direction: 'right' | 'left') => void;
  onCarSelect: (car: Car) => void;
  onInquiryClick: (car: Car) => void;
  isLoading: boolean;
}

const RecommendPage: React.FC<RecommendPageProps> = ({ cars, onSwipe, onCarSelect, onInquiryClick, isLoading }) => {
  const [stack, setStack] = useState(cars);
  
  React.useEffect(() => {
    setStack(cars)
  }, [cars]);
  
  const handleSwipe = (direction: 'right' | 'left') => {
    if (stack.length > 0) {
      const swipedCar = stack[0];
      setStack(prev => prev.slice(1));
      onSwipe(swipedCar, direction);
    }
  };

  return (
    <motion.div
      key="recommend"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6 flex flex-col items-center justify-center h-full"
    >
        <h2 className="text-3xl font-display font-bold mb-8 self-start">おすすめ</h2>
      <div className="w-full max-w-sm h-[60vh] relative mb-8 flex items-center justify-center">
        <AnimatePresence>
          {isLoading && cars.length === 0 ? (
            <LoaderCircle size={40} className="text-primary animate-spin" />
          ) : stack.length > 0 ? (
            stack.map((car, index) => (
              index === 0 &&
              <TinderCard
                key={car.name}
                car={car}
                active={index === 0}
                onSwipe={handleSwipe}
                onCarSelect={onCarSelect}
                onInquiryClick={onInquiryClick}
              />
            ))
          ) : (
             <motion.div initial={{opacity:0}} animate={{opacity:1}} className="text-center text-accent/60">
                <p className="text-lg">おすすめは以上です。</p>
                <p className="text-sm mt-2">時間をおいて再度お試しください。</p>
             </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isLoading && stack.length > 0 && (
          <div className="flex gap-8">
              <button 
                  onClick={() => handleSwipe('left')}
                  className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-error shadow-custom hover:scale-105 active:scale-95 transition-transform"
              >
                  <X size={40} strokeWidth={2.5}/>
              </button>
              <button 
                  onClick={() => handleSwipe('right')}
                  className="w-20 h-20 rounded-full bg-success/20 flex items-center justify-center text-success shadow-custom hover:scale-105 active:scale-95 transition-transform"
              >
                  <Heart size={40} fill="currentColor" />
              </button>
          </div>
      )}
    </motion.div>
  );
};

export default RecommendPage;