import { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { sampleResponse } from '@/utils/sampleResponse';
import { markdownComponents } from '@/components/ui/markdown-components';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface LoadingStep {
  heading: string;
  text: string;
}

const TypewriterEffect = ({ text }: { text: string }) => {
  const [displayText, setDisplayText] = useState('');

  useEffect(() => {
    setDisplayText(''); // Reset text when input text changes
    let currentIndex = 0;
    
    const intervalId = setInterval(() => {
      if (currentIndex <= text.length) {
        setDisplayText(text.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(intervalId);
      }
    }, 10); // Adjust speed of typing here

    return () => clearInterval(intervalId);
  }, [text]);

  return <span className="ml-2 text-gray-600">{displayText}</span>;
};

export const ChatBot = ({ onMessageSelect }: { onMessageSelect: (message: string) => void }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [displayedSteps, setDisplayedSteps] = useState<LoadingStep[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedSteps]);

  const loadingSteps = {
    makingStrategy: [
      'Analysing the query...',
      'Searching for relevant docs...'
    ],
    generatingAnswer: [
      'Navigating the directory...',
      'Fetching answer...'
    ]
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setDisplayedSteps([]);

    // Helper function to get random delay between 0.5 and 1.5 seconds
    const getRandomDelay = () => Math.random() * 1000 + 500; // Random between 500ms and 1500ms

    // Show making strategy steps
    for (let step of loadingSteps.makingStrategy) {
      setDisplayedSteps(prev => [...prev, { heading: 'Making Strategy', text: step }]);
      await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    }

    // Show generating answer steps
    for (let step of loadingSteps.generatingAnswer) {
      setDisplayedSteps(prev => [...prev, { heading: 'Generating Answer', text: step }]);
      await new Promise(resolve => setTimeout(resolve, getRandomDelay()));
    }

    const assistantMessage = { role: 'assistant', content: sampleResponse };
    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
    setDisplayedSteps([]);
    
    // Pass the sources to the parent component (MRMBot)
    return assistantMessage.content;
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50">
      {messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center">
          <h1 className="text-6xl font-bold mb-2">MRM Research Bot</h1>
          <p className="text-m text-gray-500 mb-12">developed by Eigenfrequency Technologies pvt. ltd.</p>
          <form onSubmit={handleSendMessage} className="w-2/3 max-w-2xl">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 border rounded shadow-sm"
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button 
                type="submit"
                className={`px-4 py-2 text-white rounded shadow-sm ${
                  isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={isLoading}
              >
                Send
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div className="flex-1 p-4 overflow-auto flex flex-col">
            {messages.map((message, index) => (
              <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
                <div
                  onClick={() => {
                    if (message.role === 'assistant') {
                      setSelectedMessage(index);
                      onMessageSelect(message.content);
                    }
                  }}
                  className={`inline-block p-3 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-100 text-white'
                      : selectedMessage === index 
                        ? 'bg-blue-100 shadow cursor-pointer' 
                        : 'bg-white shadow cursor-pointer'
                  }`}
                >
                  <ReactMarkdown components={markdownComponents}>{message.content}</ReactMarkdown>
                </div>
              </div>
            ))}
  {isLoading && (
    <div className="mb-4 text-left">
      <div className="inline-block p-3 rounded-lg bg-white shadow w-96 animate-pulse-border">
        <div className="flex flex-col gap-2">
          {displayedSteps.map((step, index) => (
            <div key={index}>
              {(index === 0 || displayedSteps[index - 1].heading !== step.heading) && (
                <div className="font-semibold text-gray-700 mb-2">{step.heading}</div>
              )}
              <div className="flex items-center gap-2 ml-2">
                {index > 0 && <div className="w-0.5 h-4 bg-gray-300 ml-1"></div>}
                <div className="flex items-center">
                  <TypewriterEffect text={step.text}/>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder="Type your message..."
                disabled={isLoading}
              />
              <button 
                type="submit"
                className={`px-4 py-2 text-white rounded ${
                  isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'
                }`}
                disabled={isLoading}
              >
                Send
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};