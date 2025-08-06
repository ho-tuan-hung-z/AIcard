import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, ChevronDown, LoaderCircle } from 'lucide-react';
import CarCard from './CarCard';
import type { Car } from '../types';
import { getAiResponse } from '../services/geminiService';
import { getUniqueMakers, getModelsByMaker, searchCars } from '../utils/dataTransform';

interface SearchPageProps {
  onCarSelect: (car: Car) => void;
}

// Get dynamic data from JSON instead of hardcoded
const makers = getUniqueMakers();
const years = ['2024', '2023', '2022', '2021', '2020', '2019', '2018', '2017', '2016', '2015'];
const prices = ['50', '100', '150', '200', '250', '300', '400', '500', '700', '1000'];

const StyledSelect: React.FC<{
    label: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
    children: React.ReactNode;
    disabled?: boolean;
}> = ({ label, value, onChange, children, disabled = false }) => (
    <div>
      <label className="block text-sm font-medium text-accent/80 mb-1">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className="w-full appearance-none p-3 rounded-small glass-effect focus:outline-none focus:ring-2 ring-primary transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-accent/70">
          <ChevronDown size={20} />
        </div>
      </div>
    </div>
);

const SearchPage: React.FC<SearchPageProps> = ({ onCarSelect }) => {
  const [searchMode, setSearchMode] = useState<'keyword' | 'master'>('keyword');

  const [keyword, setKeyword] = useState('');
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [minYear, setMinYear] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  
  const [results, setResults] = useState<Car[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  const executeLocalSearch = (criteria: {
    maker?: string;
    model?: string;
    minYear?: number;
    maxYear?: number;
    minPrice?: number;
    maxPrice?: number;
    maxMileage?: number;
  }) => {
    try {
      const results = searchCars(criteria);
      return results.slice(0, 20); // Limit to 20 results for performance
    } catch (error) {
      console.error('Local search error:', error);
      return [];
    }
  };

  const executeSearch = async (prompt: string) => {
    if (!prompt) {
      setError("検索条件を入力してください。");
      setSearched(true);
      setResults([]);
      return;
    }

    setIsSearching(true);
    setResults([]);
    setError(null);
    setSearched(true);

    try {
      // First try AI search for complex queries
      const response = await getAiResponse(prompt, []);

      if (response.responseType === 'CAR_RESULTS' && response.cars.length > 0) {
        setResults(response.cars);
      } else {
        setResults([]);
        setError(response.message || 'お探しの条件に合う車両が見つかりませんでした。');
      }
    } catch (error) {
      console.error('AI search error:', error);
      setError('検索中にエラーが発生しました。もう一度お試しください。');
    }
    
    setIsSearching(false);
  };
  
  const handleKeywordSearch = (e: React.FormEvent) => {
      e.preventDefault();
      executeSearch(keyword);
  };

  const handleMasterSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSearching(true);
    setResults([]);
    setError(null);
    setSearched(true);

    // Use local search for master search form
    const criteria: any = {};
    if (make) criteria.maker = make;
    if (model) criteria.model = model;
    if (minYear) criteria.minYear = parseInt(minYear);
    if (maxPrice) criteria.maxPrice = parseInt(maxPrice);

    if (Object.keys(criteria).length === 0) {
      setError("少なくとも1つの検索条件を指定してください。");
      setSearched(true);
      setResults([]);
      setIsSearching(false);
      return;
    }

    try {
      const localResults = executeLocalSearch(criteria);
      if (localResults.length > 0) {
        setResults(localResults);
      } else {
        setError('お探しの条件に合う車両が見つかりませんでした。');
      }
    } catch (error) {
      console.error('Search error:', error);
      setError('検索中にエラーが発生しました。');
    }

    setIsSearching(false);
  };

  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMake(e.target.value);
    setModel('');
  };

  const SearchModeSwitcher = () => (
    <div className="flex bg-accent/5 rounded-lg p-1 mb-6">
      <button
        onClick={() => setSearchMode('keyword')}
        className={`w-1/2 p-2 rounded-md text-sm font-bold transition-colors ${searchMode === 'keyword' ? 'bg-primary text-base' : 'text-accent/70 hover:bg-accent/10'}`}
      >
        フリーワード検索
      </button>
      <button
        onClick={() => setSearchMode('master')}
        className={`w-1/2 p-2 rounded-md text-sm font-bold transition-colors ${searchMode === 'master' ? 'bg-primary text-base' : 'text-accent/70 hover:bg-accent/10'}`}
      >
        詳細条件で検索
      </button>
    </div>
  );

  return (
    <motion.div
      key="search"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="p-6"
    >
      <h2 className="text-3xl font-display font-bold mb-6">車両検索</h2>
      
      <SearchModeSwitcher />

      <AnimatePresence mode="wait">
        <motion.div
            key={searchMode}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
        >
            {searchMode === 'keyword' ? (
                 <form onSubmit={handleKeywordSearch} className="space-y-4 mb-8">
                    <input
                        type="text"
                        value={keyword}
                        onChange={(e) => setKeyword(e.target.value)}
                        placeholder="例: 300万円以下の白いSUV"
                        className="w-full p-4 rounded-small glass-effect focus:outline-none focus:ring-2 ring-primary"
                    />
                    <button
                        type="submit"
                        disabled={isSearching || !keyword.trim()}
                        className="w-full bg-primary text-base font-bold rounded-small p-4 flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-primary/50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95"
                    >
                        {isSearching ? <motion.div animate={{rotate: 360}} transition={{repeat: Infinity, duration: 1, ease: 'linear'}}><LoaderCircle size={24} /></motion.div> : <Search size={24} />}
                        この条件で検索
                    </button>
                </form>
            ) : (
                <form onSubmit={handleMasterSearch} className="space-y-4 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <StyledSelect label="メーカー" value={make} onChange={handleMakeChange}>
                            <option value="">選択してください</option>
                            {makers.map(m => <option key={m} value={m}>{m}</option>)}
                        </StyledSelect>
                        
                        <StyledSelect label="車種" value={model} onChange={e => setModel(e.target.value)} disabled={!make}>
                            <option value="">選択してください</option>
                            {make && getModelsByMaker(make).map(m => <option key={m} value={m}>{m}</option>)}
                        </StyledSelect>

                        <StyledSelect label="年式（以降）" value={minYear} onChange={e => setMinYear(e.target.value)}>
                            <option value="">指定なし</option>
                            {years.map(y => <option key={y} value={y}>{y}年</option>)}
                        </StyledSelect>
                        
                        <StyledSelect label="価格（上限）" value={maxPrice} onChange={e => setMaxPrice(e.target.value)}>
                            <option value="">指定なし</option>
                            {prices.map(p => <option key={p} value={p}>{p}万円</option>)}
                        </StyledSelect>
                    </div>
                    <button
                        type="submit"
                        disabled={isSearching}
                        className="w-full bg-primary text-base font-bold rounded-small p-4 flex items-center justify-center gap-2 transition-all duration-300 disabled:bg-primary/50 disabled:cursor-not-allowed hover:bg-primary/90 active:scale-95"
                    >
                        {isSearching ? <motion.div animate={{rotate: 360}} transition={{repeat: Infinity, duration: 1, ease: 'linear'}}><LoaderCircle size={24} /></motion.div> : <Search size={24} />}
                        この条件で検索
                    </button>
                </form>
            )}
        </motion.div>
      </AnimatePresence>
      
      <div>
        {isSearching && (
          <div className="flex justify-center items-center py-10">
            <LoaderCircle size={32} className="text-primary animate-spin" />
            <p className="ml-4 text-lg">AIが検索中...</p>
          </div>
        )}

        {error && !isSearching && (
          <div className="text-center text-accent/60 py-10">
            <p>{error}</p>
          </div>
        )}

        {!searched && !isSearching && (
             <div className="text-center text-accent/60 py-10">
                <p>検索方法を選んで、<br/>理想の一台を見つけよう。</p>
             </div>
        )}

        {results.length > 0 && !isSearching && (
          <motion.div 
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h3 className="col-span-full text-xl font-bold font-display mb-2">検索結果: {results.length}件</h3>
            {results.map((car, index) => (
              <motion.div
                key={index}
                onClick={() => onCarSelect(car)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                  <CarCard car={car} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default SearchPage;