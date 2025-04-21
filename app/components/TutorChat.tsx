import React, { useState, useRef, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import aiTutorChatService from '../services/aiTutorChatService';
import { useAiTutor } from '../hooks/useAiTutor';
import ReactMarkdown from 'react-markdown';

// Message type for the chat
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

const TutorChat: React.FC = () => {
  const { studentProfile } = useAiTutor();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conversationId, setConversationId] = useState(() => uuidv4());
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Initial welcome message
  useEffect(() => {
    const welcomeMessage: Message = {
      id: uuidv4(),
      text: "Hello! I'm your KidsMentor AI Tutor. What would you like to learn about today?",
      sender: 'ai',
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, []);

  // Handle sending a new message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim()) return;
    
    // Add user message to chat
    const userMessage: Message = {
      id: uuidv4(),
      text: newMessage,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setNewMessage('');
    setError(null);
    setIsLoading(true);
    
    try {
      // Send message to AI service
      const response = await aiTutorChatService.sendChat(
        userMessage.text,
        conversationId,
        studentProfile
      );
      
      // Add AI response to chat
      const aiMessage: Message = {
        id: uuidv4(),
        text: response,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response from AI tutor');
    } finally {
      setIsLoading(false);
    }
  };

  // Start a new conversation
  const handleNewConversation = () => {
    const newId = uuidv4();
    setConversationId(newId);
    setMessages([{
      id: uuidv4(),
      text: "Let's start a new conversation! What would you like to learn today?",
      sender: 'ai',
      timestamp: new Date()
    }]);
    setError(null);
  };

  // Render markdown content with images
  const renderMessageContent = (text: string) => {
    return (
      <ReactMarkdown
        components={{
          img: ({node, ...props}) => (
            <img 
              {...props} 
              className="max-w-full rounded-lg my-2"
              loading="lazy"
              style={{maxHeight: '200px'}}
            />
          )
        }}
      >
        {text}
      </ReactMarkdown>
    );
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 rounded-lg shadow-md">
      {/* Chat header */}
      <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex justify-between items-center">
        <h2 className="text-xl font-semibold">KidsMentor AI Tutor</h2>
        <button 
          onClick={handleNewConversation}
          className="text-sm bg-blue-700 hover:bg-blue-800 px-3 py-1 rounded"
        >
          New Chat
        </button>
      </div>

      {/* Chat messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`mb-4 ${
              message.sender === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div 
              className={`inline-block px-4 py-2 rounded-lg max-w-[80%] ${
                message.sender === 'user' 
                  ? 'bg-blue-500 text-white rounded-br-none' 
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.sender === 'ai' ? renderMessageContent(message.text) : message.text}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {message.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex items-center text-left mb-4">
            <div className="inline-block px-4 py-2 rounded-lg bg-gray-200 text-gray-800">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full mr-1 animate-pulse delay-75"></div>
                <div className="w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150"></div>
              </div>
            </div>
          </div>
        )}
        
        {error && (
          <div className="text-center mb-4">
            <div className="inline-block px-4 py-2 rounded-lg bg-red-100 text-red-800">
              Error: {error}
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Ask your tutor a question..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-r-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading || !newMessage.trim()}
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};

export default TutorChat; 