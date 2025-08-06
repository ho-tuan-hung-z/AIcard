import type { Content } from '@google/genai';
export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  carToCompare?: Car;
  quickReplies?: string[];
}

export interface Car {
  name: string;
  year: number;
  mileage: number;
  price: number;
  imageUrl: string;
  specs: {
    engine: string;
    size: string;
    safety: string;
  };
  isFavorite?: boolean;
  priceDropNotification?: boolean;
}

export interface ApiResponse {
  responseType: 'CONVERSATION' | 'CAR_RESULTS';
  message: string;
  cars: Car[];
  quickReplies?: string[];
}

export type GeminiHistory = Content[];

export type Tab = 'recommend' | 'chat' | 'search' | 'my-page';