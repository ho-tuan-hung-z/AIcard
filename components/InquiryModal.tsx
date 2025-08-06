import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, AlertCircle } from 'lucide-react';
import type { Car } from '../types';

interface InquiryModalProps {
  car: Car;
  onClose: () => void;
}

type FormStatus = 'idle' | 'submitting' | 'success' | 'error';

const ConfettiPiece: React.FC<{ i: number }> = ({ i }) => {
  const colors = ['#00D1FF', '#A958FF', '#10E0A4', '#FFFFFF'];
  const randomColor = colors[i % colors.length];
  const randomX = Math.random() * 100;
  const randomDelay = Math.random() * 1;
  const randomDuration = 2 + Math.random() * 2;
  const randomRotation = -500 + Math.random() * 1000;

  return (
    <motion.div
      className="absolute top-0 w-2 h-4"
      style={{ left: `${randomX}%`, background: randomColor }}
      initial={{ y: '-10vh', opacity: 1, rotate: 0 }}
      animate={{
        y: '120vh',
        opacity: [1, 1, 0],
        rotate: randomRotation,
      }}
      transition={{
        duration: randomDuration,
        delay: randomDelay,
        ease: 'linear',
      }}
    />
  );
};

const InquiryModal: React.FC<InquiryModalProps> = ({ car, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [status, setStatus] = useState<FormStatus>('idle');
    const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

    const validate = () => {
        const newErrors: { name?: string; email?: string } = {};
        if (!formData.name) newErrors.name = 'お名前を入力してください';
        if (!formData.email) {
            newErrors.email = 'メールアドレスを入力してください';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = '有効なメールアドレスを入力してください';
        }
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        
        setStatus('submitting');
        // Simulate API call
        await new Promise(res => setTimeout(res, 1500));
        setStatus('success');
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/80 z-[60]"
      />
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: '0%' }}
        exit={{ y: '100%' }}
        transition={{ duration: 0.5, ease: [0.25, 1, 0.5, 1] }}
        className="fixed bottom-0 left-0 right-0 h-[95vh] bg-base rounded-t-modal shadow-lg z-[70] flex flex-col"
      >
        <div className="p-4 flex justify-between items-center border-b border-accent/10 flex-shrink-0">
          <h2 className="font-heading text-xl font-bold">車両へのお問い合わせ</h2>
           <button onClick={onClose} className="p-2 rounded-full hover:bg-accent/10 transition-colors">
            <X size={24} />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            {status !== 'success' ? (
                <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-6 space-y-6"
                >
                    <div>
                        <p className="text-accent/70">お問い合わせ車両:</p>
                        <p className="font-heading font-bold text-lg">{car.name}</p>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-accent/80 mb-1">お名前</label>
                            <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} className={`w-full p-3 rounded-small glass-effect focus:outline-none focus:ring-2 ${errors.name ? 'ring-error' : 'focus:ring-secondary'}`} />
                            {errors.name && <p className="text-error text-sm mt-1 flex items-center gap-1"><AlertCircle size={14}/>{errors.name}</p>}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-accent/80 mb-1">メールアドレス</label>
                            <input type="email" name="email" id="email" value={formData.email} onChange={handleChange} className={`w-full p-3 rounded-small glass-effect focus:outline-none focus:ring-2 ${errors.email ? 'ring-error' : 'focus:ring-secondary'}`} />
                             {errors.email && <p className="text-error text-sm mt-1 flex items-center gap-1"><AlertCircle size={14}/>{errors.email}</p>}
                        </div>
                        <div>
                            <label htmlFor="message" className="block text-sm font-medium text-accent/80 mb-1">お問い合わせ内容 (任意)</label>
                            <textarea name="message" id="message" rows={4} value={formData.message} onChange={handleChange} className="w-full p-3 rounded-small glass-effect focus:outline-none focus:ring-2 focus:ring-secondary"></textarea>
                        </div>
                        <div className="pt-4">
                            <button type="submit" disabled={status === 'submitting'} className="w-full py-4 rounded-small bg-primary text-base font-bold transition hover:bg-primary/90 active:scale-95 disabled:bg-primary/50 disabled:cursor-wait">
                                {status === 'submitting' ? '送信中...' : 'この内容で送信する'}
                            </button>
                        </div>
                    </form>
                </motion.div>
            ) : (
                <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 flex flex-col justify-center items-center text-center p-6 overflow-hidden"
                >
                    {Array.from({ length: 50 }).map((_, i) => <ConfettiPiece key={i} i={i} />)}
                    <motion.div
                        className="w-24 h-24 rounded-full glass-effect flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1, transition: { delay: 0.2, type: 'spring' } }}
                    >
                         <div className="w-24 h-24 rounded-full flex items-center justify-center" style={{'boxShadow': '0 0 30px #10E0A4, inset 0 0 20px #10E0A4'}}>
                            <Check size={60} className="text-success" />
                        </div>
                    </motion.div>
                    <h3 className="font-heading text-2xl font-bold mt-6">送信完了</h3>
                    <p className="text-accent/70 mt-2 max-w-sm">
                        お問い合わせありがとうございます。AI Car Navigatorが次のステップをご案内します。
                    </p>
                    <button onClick={onClose} className="mt-8 py-3 px-8 rounded-small bg-primary text-base font-bold transition hover:bg-primary/90 active:scale-95">
                        閉じる
                    </button>
                </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </>
  );
};

export default InquiryModal;
