export enum Role {
  USER = 'user',
  MODEL = 'model',
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: number;
  isThinking?: boolean;
}

export interface PromptState {
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}