import React from 'react';
import { motion } from 'framer-motion';
import type { Message, Car } from '../types';

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void }> = ({ checked, onChange }) => (
    <div 
        className={`w-14 h-8 flex items-center rounded-full p-1 cursor-pointer transition-colors ${checked ? 'bg-primary' : 'bg-accent/20'}`}
        onClick={() => onChange(!checked)}
    >
        <motion.div
            className="w-6 h-6 bg-white rounded-full"
            layout
            transition={{ type: "spring", stiffness: 700, damping: 30 }}
        />
    </div>
);


interface MyPageProps {
    favorites: Car[];
    chatHistory: Message[][];
    browsingHistory: Car[];
    searchHistory: string[];
    notificationSettings: { priceDrop: boolean; newArrivals: boolean; offers: boolean };
    onNotificationChange: (settings: any) => void;
    onCarSelect: (car: Car) => void;
}

const MyPage: React.FC<MyPageProps> = ({
    favorites,
    chatHistory,
    browsingHistory,
    searchHistory,
    notificationSettings,
    onNotificationChange,
    onCarSelect
}) => {
    
  const Section: React.FC<{title: string, children: React.ReactNode}> = ({title, children}) => (
    <div className="mb-8">
      <h3 className="font-display text-2xl font-bold mb-4 border-b-2 border-primary/30 pb-2">{title}</h3>
      {children}
    </div>
  );

  return (
    <motion.div
      key="my-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6"
    >
      <h2 className="text-3xl font-display font-bold mb-8">マイページ</h2>
      
      <Section title="通知設定">
        <div className="space-y-4">
          <div className="flex justify-between items-center glass-effect p-4 rounded-card">
            <div>
              <p className="font-bold">値下げ通知</p>
              <p className="text-sm text-accent/60">お気に入り車両の価格が下がった際にお知らせします。</p>
            </div>
            <ToggleSwitch checked={notificationSettings.priceDrop} onChange={(c) => onNotificationChange({...notificationSettings, priceDrop: c})} />
          </div>
          <div className="flex justify-between items-center glass-effect p-4 rounded-card">
            <div>
              <p className="font-bold">条件指定の新着車両通知</p>
              <p className="text-sm text-accent/60">保存した検索条件に合う新着車両をお知らせします。</p>
            </div>
            <ToggleSwitch checked={notificationSettings.newArrivals} onChange={(c) => onNotificationChange({...notificationSettings, newArrivals: c})} />
          </div>
          <div className="flex justify-between items-center glass-effect p-4 rounded-card">
            <div>
              <p className="font-bold">その他お得情報</p>
              <p className="text-sm text-accent/60">キャンペーンなどのお得な情報をお知らせします。</p>
            </div>
            <ToggleSwitch checked={notificationSettings.offers} onChange={(c) => onNotificationChange({...notificationSettings, offers: c})} />
          </div>
        </div>
      </Section>

      <Section title="お気に入り">
       {favorites.length === 0 ? (
          <p className="text-accent/60">お気に入りに登録した車両はありません。</p>
        ) : (
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {favorites.map((car, index) => (
              <div 
                key={index} 
                className="glass-effect rounded-lg p-3 cursor-pointer hover:bg-accent/10 transition-all active:scale-95"
                onClick={() => onCarSelect(car)}
              >
                <div className="flex justify-between items-center">
                    <p className="font-bold text-accent">{car.name}</p>
                    <p className="font-mono text-primary text-sm">{car.price.toLocaleString()}万円</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>
      
      <Section title="チャット履歴">
         {chatHistory.length === 0 ? (
            <p className="text-accent/60">チャット履歴はありません。</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {chatHistory.map((history, index) => {
                const firstUserMessage = history.find(msg => msg.sender === 'user');
                return (
                  <div key={index} className="glass-effect rounded-lg p-3 cursor-pointer hover:bg-accent/10 transition-all active:scale-95">
                    <p className="font-bold text-accent truncate">{firstUserMessage ? `Q: ${firstUserMessage.text}` : '無題のチャット'}</p>
                  </div>
                );
              })}
            </div>
          )}
      </Section>

      <Section title="閲覧履歴">
         {browsingHistory.length === 0 ? (
            <p className="text-accent/60">閲覧履歴はありません。</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {browsingHistory.map((car, index) => (
                <div key={index} className="glass-effect rounded-lg p-3 cursor-pointer hover:bg-accent/10 transition-all active:scale-95" onClick={() => onCarSelect(car)}>
                  <p className="font-bold text-accent">{car.name}</p>
                </div>
              ))}
            </div>
          )}
      </Section>

      <Section title="検索履歴">
         {searchHistory.length === 0 ? (
            <p className="text-accent/60">検索履歴はありません。</p>
          ) : (
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {searchHistory.map((query, index) => (
                <div key={index} className="glass-effect rounded-lg p-3">
                  <p className="text-accent/80 italic">"{query}"</p>
                </div>
              ))}
            </div>
          )}
      </Section>

    </motion.div>
  );
};

export default MyPage;