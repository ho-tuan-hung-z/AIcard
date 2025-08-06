import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Send, Plus, User, Search, MessageSquare, RefreshCw, Sparkles, Heart } from 'lucide-react';
import type { Message, Car, ApiResponse, Tab } from './types';
import { getAiResponse } from './services/geminiService';
import { getSampleCars } from './utils/dataTransform';
import ChatBubble from './components/ChatBubble';
import TypingIndicator from './components/TypingIndicator';
import CarCarousel from './components/CarCarousel';
import VehicleDetailModal from './components/VehicleDetailModal';
import InquiryModal from './components/InquiryModal';
import SearchPage from './components/SearchPage';
import MyPage from './components/MyPage';
import RecommendPage from './components/RecommendPage';
import TutorialModal from './components/TutorialModal';


const tabs: { id: Tab; icon: React.ElementType; label: string }[] = [
  { id: 'recommend', icon: Sparkles, label: 'おすすめ' },
  { id: 'chat', icon: MessageSquare, label: 'AIチャット' },
  { id: 'search', icon: Search, label: '検索' },
  { id: 'my-page', icon: User, label: 'マイページ' },
];

interface TabBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-base border-t border-accent/10 z-30">
      <div className="flex justify-around items-center h-full max-w-3xl mx-auto px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative flex flex-col items-center justify-center gap-1 w-20 h-full text-center transition-colors duration-300 ease-in-out focus:outline-none focus:bg-primary/10 rounded-lg"
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                animate={{ scale: isActive ? 1.05 : 1, y: isActive ? -2 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                  <tab.icon
                    size={24}
                    className={`transition-colors ${isActive ? 'text-primary' : 'text-accent/70'}`}
                  />
              </motion.div>
              <span className={`text-xs font-medium transition-colors ${isActive ? 'text-primary' : 'text-accent/70'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

const FavoritesTutorialTooltip: React.FC<{ onClose: () => void }> = ({ onClose }) => (
    <motion.div
        className="fixed bottom-24 right-4 z-[100] w-72"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
        <div className="bg-primary text-base p-4 rounded-lg shadow-lg relative">
            <div className="absolute -bottom-2 right-6 w-4 h-4 bg-primary transform rotate-45" />
            <div className="flex items-start gap-3">
                <Heart className="w-10 h-10 flex-shrink-0 text-base" fill="currentColor" />
                <div>
                    <p className="font-bold">お気に入りに追加しました！</p>
                    <p className="text-sm mt-1">
                        追加した車両は「マイページ」タブからいつでも確認できます。
                    </p>
                </div>
            </div>
            <button onClick={onClose} className="text-xs underline mt-2 float-right font-bold">
                閉じる
            </button>
        </div>
    </motion.div>
);


const initialMessages: Message[] = [
  { id: 'initial-1', text: "AIチャットへようこそ！", sender: 'bot' },
  { 
    id: 'initial-2', 
    text: "どのような方法でお探ししますか？", 
    sender: 'bot',
    quickReplies: ['人気のプリセットから探す', '条件を詳しく指定して探す']
  },
];

const presetSearchMessage: Message = {
    id: 'preset-1',
    text: 'どのプリセットで検索しますか？',
    sender: 'bot',
    quickReplies: ['ファミリー向け', '燃費の良い車', '初心者におすすめ', 'アウトドア向け']
};

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [inquiryCar, setInquiryCar] = useState<Car | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('recommend');
  const [showTutorial, setShowTutorial] = useState(false);
  const [showFavoritesTutorial, setShowFavoritesTutorial] = useState(false);
  
  // New state for Super App features
  const [chatHistory, setChatHistory] = useState<Message[][]>([]);
  const [favorites, setFavorites] = useState<Car[]>([]);
  const [browsingHistory, setBrowsingHistory] = useState<Car[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recommendedCars, setRecommendedCars] = useState<Car[]>([]);
  const [notificationSettings, setNotificationSettings] = useState({
      priceDrop: true,
      newArrivals: false,
      offers: true,
  });

  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const hasViewed = localStorage.getItem('hasViewedTutorial');
    if (!hasViewed) {
      setShowTutorial(true);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'chat') {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, activeTab]);

   useEffect(() => {
    // Load initial recommendations using real data instead of AI
    const loadRecommendations = () => {
      if(recommendedCars.length > 0) return;
      
      try {
        // Get sample cars from real data
        const sampleCars = getSampleCars(8);
        setRecommendedCars(sampleCars);
      } catch (error) {
        console.error('Error loading recommendations:', error);
        // Fallback: still use AI if local data fails
        const fetchAIRecommendations = async () => {
          setIsLoading(true);
          const prompt = "日本の市場で人気のあるおすすめの中古車を5台教えてください。";
          try {
            const apiResponse = await getAiResponse(prompt, []);
            if (apiResponse.responseType === 'CAR_RESULTS') {
              setRecommendedCars(apiResponse.cars);
            }
          } catch (aiError) {
            console.error('AI recommendations also failed:', aiError);
          }
          setIsLoading(false);
        };
        fetchAIRecommendations();
      }
    };
    
    loadRecommendations();
  }, []);

  const handleResetChat = () => {
    if (messages.length > initialMessages.length) {
      setChatHistory(prevHistory => [messages, ...prevHistory]);
    }
    setMessages(initialMessages);
    setCars([]);
    setIsLoading(false);
  };
  
  const handleCloseTutorial = () => {
    setShowTutorial(false);
    localStorage.setItem('hasViewedTutorial', 'true');
  };

  const sendMessageToAi = async (text: string, currentMessages: Message[]) => {
      setIsLoading(true);

      if (!searchHistory.includes(text)) {
          setSearchHistory(prev => [text, ...prev]);
      }

      try {
        const history = currentMessages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        }));

        const apiResponse: ApiResponse = await getAiResponse(text, history);
        
        const botMessage: Message = { 
          id: `${Date.now()}-bot`,
          text: apiResponse.message,
          sender: 'bot',
          quickReplies: apiResponse.quickReplies
        };
        setMessages(prev => [...prev, botMessage]);

        if (apiResponse.responseType === 'CAR_RESULTS' && apiResponse.cars.length > 0) {
          setCars(apiResponse.cars.map(c => ({...c, isFavorite: favorites.some(fav => fav.name === c.name)})));
        } else if (apiResponse.cars?.length > 0) {
          setCars(apiResponse.cars);
        }

      } catch (error) {
        console.error("Failed to get AI response:", error);
        const errorMessage: Message = {
          id: `${Date.now()}-error`,
          text: "申し訳ありません、エラーが発生しました。もう一度お試しください。",
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userInput.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), text: userInput, sender: 'user' };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    const textToSend = userInput;
    setUserInput('');
    await sendMessageToAi(textToSend, newMessages);
  };
  
  const handleQuickReplyClick = async (replyText: string, messageId: string) => {
    // Disable quick replies on the message that was clicked
    setMessages(prevMessages => 
        prevMessages.map(msg => 
            msg.id === messageId ? { ...msg, quickReplies: [] } : msg
        )
    );

    const userMessage: Message = { id: Date.now().toString(), text: replyText, sender: 'user' };
    setMessages(prev => [...prev, userMessage]);

    // Handle initial setup flow without calling AI
    if (messageId === 'initial-2' && replyText === '人気のプリセットから探す') {
        setMessages(prev => [...prev, presetSearchMessage]);
        return;
    }
    if (messageId === 'initial-2' && replyText === '条件を詳しく指定して探す') {
        const botReply: Message = { id: 'detail-prompt', text: 'ご希望の予算と都道府県を教えてください。(例: 300万円以内、東京)', sender: 'bot' };
        setMessages(prev => [...prev, botReply]);
        return;
    }

    // For presets, construct a more detailed prompt for the AI
    let aiPrompt = replyText;
    if (messageId === 'preset-1') {
        aiPrompt = `${replyText}の条件でおすすめの車を探してください。`;
    }

    // All other quick replies go to the AI
    await sendMessageToAi(aiPrompt, [...messages, userMessage]);
  };

  const handleToggleFavorite = (carToToggle: Car) => {
      const isFavorited = favorites.some(c => c.name === carToToggle.name);
       // If adding a new favorite, check if the tutorial should be shown
      if (!isFavorited) {
        const hasViewed = localStorage.getItem('hasViewedFavoritesTutorial');
        if (!hasViewed) {
          setShowFavoritesTutorial(true);
          localStorage.setItem('hasViewedFavoritesTutorial', 'true');
        }
      }

      setFavorites(prev => {
          if (isFavorited) {
              return prev.filter(c => c.name !== carToToggle.name);
          } else {
              return [...prev, { ...carToToggle, isFavorite: true }];
          }
      });
      setCars(prev => prev.map(c => c.name === carToToggle.name ? {...c, isFavorite: !c.isFavorite} : c));
      if (selectedCar?.name === carToToggle.name) {
          setSelectedCar(prev => prev ? {...prev, isFavorite: !prev.isFavorite} : null);
      }
  };

  const handleTogglePriceDropNotification = (carToToggle: Car) => {
    const updatedCar = { ...carToToggle, priceDropNotification: !carToToggle.priceDropNotification };
    // In a real app, you would persist this preference
    if (selectedCar?.name === carToToggle.name) {
      setSelectedCar(updatedCar);
    }
  };

  const handleCarSelect = (car: Car) => {
    setSelectedCar({...car, isFavorite: favorites.some(fav => fav.name === car.name)});
    if (!browsingHistory.some(bh => bh.name === car.name)) {
        setBrowsingHistory(prev => [car, ...prev]);
    }
  };

  const handleOpenInquiry = (car: Car) => {
    setInquiryCar(car);
    setSelectedCar(null);
  };
  
  const handleSwipe = (car: Car, direction: 'right' | 'left') => {
      setRecommendedCars(prev => prev.slice(1));
      if(direction === 'right' && !favorites.some(fav => fav.name === car.name)) {
          handleToggleFavorite(car);
      }
  };

  const renderActiveTabContent = () => {
    switch (activeTab) {
      case 'chat':
        return (
          <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{duration: 0.2}} className="flex flex-col h-full">
             <div className="p-4 flex justify-between items-center border-b border-accent/10">
                <h2 className="font-display font-bold text-xl">チャット検索</h2>
                <button onClick={handleResetChat} title="チャットをリセット" className="p-2 rounded-full text-accent/70 hover:bg-accent/10 hover:text-accent transition-colors">
                    <RefreshCw size={20} />
                </button>
             </div>
            <div className="flex-1 overflow-y-auto px-4 space-y-4 pt-4">
              {messages.map((msg) => <ChatBubble key={msg.id} message={msg} onQuickReplyClick={handleQuickReplyClick} />)}
              {isLoading && <TypingIndicator />}
              <AnimatePresence>
                {cars.length > 0 && !isLoading && (
                  <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -50 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }} className="mt-6">
                    <CarCarousel cars={cars} onCarSelect={handleCarSelect} />
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={chatEndRef} />
            </div>
            <div className="p-4 bg-base border-t border-accent/10">
              <form onSubmit={handleSendMessage} className="flex items-center gap-3 max-w-3xl mx-auto glass-effect rounded-small p-2">
                <button type="button" className="p-2 text-accent/70 hover:text-accent transition-colors"><Plus size={24} /></button>
                <input type="text" value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="追加の条件を入力..." className="flex-1 bg-transparent focus:outline-none placeholder:text-accent/50" disabled={isLoading} />
                <button type="submit" disabled={!userInput.trim() || isLoading} className="bg-primary text-base rounded-small p-3 flex items-center justify-center transition-all duration-300 disabled:bg-primary/50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95"><Send size={20} /></button>
              </form>
            </div>
          </motion.div>
        );
      case 'search':
        return <SearchPage onCarSelect={handleCarSelect} />;
      case 'my-page':
          return <MyPage 
            favorites={favorites}
            chatHistory={chatHistory}
            browsingHistory={browsingHistory}
            searchHistory={searchHistory}
            notificationSettings={notificationSettings}
            onNotificationChange={setNotificationSettings}
            onCarSelect={handleCarSelect}
            />;
      case 'recommend':
          return <RecommendPage cars={recommendedCars} onSwipe={handleSwipe} isLoading={isLoading} onCarSelect={handleCarSelect} onInquiryClick={handleOpenInquiry} />;
      default:
        return null;
    }
  };

  return (
    <div className="bg-base min-h-dvh h-dvh text-accent font-sans flex flex-col overflow-hidden">
      <main className="flex-1 overflow-y-auto pb-20 pt-safe-top">
        <AnimatePresence mode="wait">
          {renderActiveTabContent()}
        </AnimatePresence>
      </main>

      <TabBar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <AnimatePresence>
        {selectedCar && (
            <VehicleDetailModal
              car={selectedCar}
              onClose={() => setSelectedCar(null)}
              onInquiryClick={handleOpenInquiry}
              onToggleFavorite={handleToggleFavorite}
              onTogglePriceDropNotification={handleTogglePriceDropNotification}
            />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {inquiryCar && (
            <InquiryModal car={inquiryCar} onClose={() => setInquiryCar(null)} />
        )}
      </AnimatePresence>

       <AnimatePresence>
        {showFavoritesTutorial && <FavoritesTutorialTooltip onClose={() => setShowFavoritesTutorial(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showTutorial && <TutorialModal onClose={handleCloseTutorial} />}
      </AnimatePresence>
    </div>
  );
};

export default App;