import { create } from "zustand";

export type Message = {
  _id: string;
  text: string;
  senderId: string;
  chatId: string;
  createdAt: number;
  updatedAt: number;
  senderEmail: string;
  senderFullName: string;
  senderUserId: string;
};

type MessageStore = {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
};

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  setMessages: (messages) => set({ messages }),
  addMessage: (message) =>
    set((state) => ({ messages: [...state.messages, message] })),
}));
