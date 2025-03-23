import { create } from 'zustand';
import { User } from '@supabase/supabase-js';

interface Message {
  id: string;
  content: string;
  category: string;
  timestamp: number;
}

interface Subscription {
  status: 'active' | 'inactive';
  plan: 'free' | 'premium';
  validUntil: Date | null;
}

interface AuthState {
  user: User | null;
  subscription: Subscription | null;
  dailyQuestionsCount: number;
  messages: Message[];
  setUser: (user: User | null) => void;
  setSubscription: (subscription: Subscription | null) => void;
  setDailyQuestionsCount: (count: number) => void;
  addMessage: (message: Message) => void;
  incrementQuestionCount: () => void;

interface AuthState {
  user: User | null;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  subscription: null,
  dailyQuestionsCount: 0,
  messages: [],
  setUser: (user) => set({ user }),
  setSubscription: (subscription) => set({ subscription }),
  setDailyQuestionsCount: (count) => set({ dailyQuestionsCount: count }),
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  incrementQuestionCount: () => set((state) => ({
    dailyQuestionsCount: state.dailyQuestionsCount + 1
  }))
  setUser: (user) => set({ user }),
}));