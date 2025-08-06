import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronDown, Heart, Bell, CheckCircle2 } from 'lucide-react';
import type { Car } from '../types';
import { getCarSellingPoints } from '../services/geminiService';


interface VehicleDetailModalProps {
  car: Car;
  onClose: () => void;
  onInquiryClick: (car: Car) => void;
  onToggleFavorite: (car: Car) => void;
  onTogglePriceDropNotification: (car: Car) => void;
}

const RecommendedPoints: React.FC<{car: Car}> = ({ car }) => {
    const [points, setPoints] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchPoints = async () => {
            setIsLoading(true);
            const fetchedPoints = await getCarSellingPoints(car);
            setPoints(fetchedPoints);
            setIsLoading(false);
        };
        fetchPoints();
    }, [car]);

    return (
        <div className="my-6">
            <h3 className="font-heading font-bold text-lg mb-3">この車両のおすすめポイント3選</h3>
            <div className="space-y-3">
            {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse flex items-center gap-3 bg-accent/5 p-3 rounded-lg">
                        <div className="w-5 h-5 bg-accent/20 rounded-full"></div>
                        <div className="w-full h-4 bg-accent/20 rounded"></div>
                    </div>
                ))
            ) : (
                points.map((point, index) => (
                    <motion.div 
                        key={index} 
                        className="flex items-start gap-3"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <CheckCircle2 size={20} className="text-primary mt-0.5 flex-shrink-0" />
                        <p className="text-accent/90">{point}</p>
                    </motion.div>
                ))
            )}
            </div>
        </div>
    );
};

const AccordionItem: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-accent/10">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center py-4 text-left"
            >
                <span className="font-heading font-bold text-lg">{title}</span>
                <motion.div animate={{ rotate: isOpen ? 180 : 0 }}>
                    <ChevronDown size={24} />
                </motion.div>
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="pb-4 text-accent/80">{children}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

const VehicleDetailModal: React.FC<VehicleDetailModalProps> = ({ car, onClose, onInquiryClick, onToggleFavorite, onTogglePriceDropNotification }) => {
  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-40"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="fixed bottom-0 left-0 right-0 h-[90vh] bg-base rounded-t-modal shadow-lg z-50 flex flex-col"
      >
        <div className="absolute top-4 right-4 z-10">
          <button onClick={onClose} className="p-2 rounded-full glass-effect">
            <X size={24} />
          </button>
        </div>

        <div className="flex-shrink-0 h-1/2 w-full">
          <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover" />
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          <p className="font-mono text-sm text-accent/70">{car.year}年 / {car.mileage.toLocaleString()} km</p>
          <h2 className="font-heading text-3xl font-bold mt-1">{car.name}</h2>
          <p className="font-heading text-4xl font-bold text-primary mt-2 mb-4">{car.price.toLocaleString()}万円</p>
          
          <RecommendedPoints car={car} />

          <AccordionItem title="エンジン">
            <p>{car.specs.engine}</p>
          </AccordionItem>
          <AccordionItem title="サイズ">
             <p>{car.specs.size}</p>
          </AccordionItem>
          <AccordionItem title="安全装備">
             <p>{car.specs.safety}</p>
          </AccordionItem>
        </div>

        <div className="flex-shrink-0 p-4 bg-base/80 backdrop-blur-sm border-t border-accent/10 flex gap-4">
            <button 
              onClick={() => onToggleFavorite(car)}
              title={car.isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
              className={`p-4 rounded-small border-2 transition-colors active:scale-95 ${car.isFavorite ? 'bg-error/20 border-error text-error' : 'border-accent/30 text-accent/80 hover:bg-accent/10'}`}
            >
                <Heart fill={car.isFavorite ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={() => onTogglePriceDropNotification(car)}
              title={car.priceDropNotification ? '値下げ通知をオフ' : '値下げ通知をオン'}
               className={`p-4 rounded-small border-2 transition-colors active:scale-95 ${car.priceDropNotification ? 'bg-secondary/20 border-secondary text-secondary' : 'border-accent/30 text-accent/80 hover:bg-accent/10'}`}
            >
                <Bell fill={car.priceDropNotification ? 'currentColor' : 'none'} />
            </button>
            <button 
              onClick={() => onInquiryClick(car)}
              className="flex-1 py-4 rounded-small bg-primary text-base font-bold transition hover:bg-primary/90 active:scale-95"
            >
                今すぐ問い合わせる
            </button>
        </div>
      </motion.div>
    </>
  );
};

export default VehicleDetailModal;