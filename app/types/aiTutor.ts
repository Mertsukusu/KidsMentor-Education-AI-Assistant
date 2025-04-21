/**
 * Student profile for AI tutor personalization
 */
export interface StudentProfile {
  /** Student's interests as an array of strings */
  interests: string[];
  /** Preferred difficulty level (beginner, intermediate, advanced) */
  preferredDifficulty: 'beginner' | 'intermediate' | 'advanced';
  /** Learning style preference (visual, auditory, kinesthetic) */
  learningStyle?: 'visual' | 'auditory' | 'kinesthetic';
  /** Age of the student */
  age?: number;
  /** Grade level of the student */
  gradeLevel?: string;
}

/**
 * Message in a chat conversation
 */
export interface ChatMessage {
  /** Unique message identifier */
  id: string;
  /** Message content */
  text: string;
  /** Sender of the message (user or ai) */
  sender: 'user' | 'ai';
  /** Timestamp when the message was sent */
  timestamp: Date;
}

/**
 * Chat conversation containing messages and metadata
 */
export interface ChatConversation {
  /** Unique conversation identifier */
  id: string;
  /** Array of messages in the conversation */
  messages: ChatMessage[];
  /** When the conversation was created */
  createdAt: Date;
  /** When the conversation was last updated */
  updatedAt: Date;
} 