import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  AlertCircle,
  Copy,
  Check,
  ChevronRight,
  Database,
  ArrowRight,
} from 'lucide-react';
import { ChatMessage } from '../types/farmer';
import { askAI } from '../services/api';
import { formatTime } from '../utils/formatters';

interface AIAssistantPanelProps {
  initialQuestion?: string;
  onQuestionConsumed?: () => void;
}

export const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({
  initialQuestion,
  onQuestionConsumed,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text: "Namaste! I am **Sanjivani AI**, connected live to the factory's Model Context Protocol (MCP) server and PostgreSQL database.\n\nAsk me anything regarding cane deliveries, pending payments, farmer accounts, or village breakdowns.",
      timestamp: formatTime(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const suggestedQuestions = [
    'Which farmers have pending payments?',
    'Who supplied the most sugarcane?',
    'What is the total pending payment?',
    'Show farmers from Kopargaon.',
    'Compare payments across villages.',
    'Summarize the overall farmer payment status.',
  ];

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Handle external prefilled question (e.g. from table or modal)
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      handleSendMessage(initialQuestion.trim());
      if (onQuestionConsumed) {
        onQuestionConsumed();
      }
    }
  }, [initialQuestion]);

  const handleSendMessage = async (queryText?: string) => {
    const questionToSend = (queryText || input).trim();
    if (!questionToSend || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: questionToSend,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Call actual backend HTTP API -> MCP Client -> OpenAI -> PostgreSQL -> Output
      const response = await askAI(questionToSend);

      if (response.success && response.answer) {
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: response.answer,
          timestamp: formatTime(),
        };
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        throw new Error(response.error || 'No answer returned from AI.');
      }
    } catch (err: any) {
      const errorMessage: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'ai',
        text: `Error contacting MCP Server: ${err.message || 'Please check that the backend API bridge is running on port 5000.'}`,
        timestamp: formatTime(),
        isError: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-cleared',
        sender: 'ai',
        text: 'Chat history cleared. How may I assist you with Sanjivani Factory records today?',
        timestamp: formatTime(),
      },
    ]);
  };

  // Helper to render bold text and inline code cleanly
  const renderInlineMarkdown = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*|`.*?`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        return (
          <strong key={pIdx} className="font-semibold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code key={pIdx} className="bg-slate-100 text-forest-800 font-mono text-xs px-1.5 py-0.5 rounded border border-slate-200">
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  // Robust markdown renderer for AI assistant responses
  const renderFormattedText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, idx) => {
      // 1. Numbered list item: e.g. "1. Rahul Shinde from Kopargaon..."
      const matchNum = line.match(/^(\s*\d+\.)\s*(.*)$/);
      if (matchNum) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="font-bold text-forest-800 min-w-[22px] shrink-0 text-xs sm:text-sm">
              {matchNum[1]}
            </span>
            <div className="flex-1 text-slate-800 leading-relaxed">
              {renderInlineMarkdown(matchNum[2])}
            </div>
          </div>
        );
      }

      // 2. Bullet list item: e.g. "- Total Cane..." or "• Total Cane..." or "* Total Cane..."
      const matchBullet = line.match(/^(\s*[-*•])\s*(.*)$/);
      if (matchBullet) {
        return (
          <div key={idx} className="flex items-start gap-2 my-1 pl-1">
            <span className="text-forest-700 font-bold text-base leading-none mt-0.5 select-none shrink-0">
              •
            </span>
            <div className="flex-1 text-slate-800 leading-relaxed">
              {renderInlineMarkdown(matchBullet[2])}
            </div>
          </div>
        );
      }

      // 3. Heading: e.g. "### Summary" or "## Summary"
      const matchHeading = line.match(/^(#{1,4})\s*(.*)$/);
      if (matchHeading) {
        return (
          <h4 key={idx} className="font-bold text-slate-900 text-sm mt-3 mb-1">
            {renderInlineMarkdown(matchHeading[2])}
          </h4>
        );
      }

      // 4. Empty line spacing
      if (line.trim() === '') {
        return <div key={idx} className="h-2" />;
      }

      // 5. Standard paragraph line
      return (
        <p key={idx} className="my-1 leading-relaxed">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-card flex flex-col h-[700px] overflow-hidden">
      {/* Top Header */}
      <div className="p-4 px-5 border-b border-slate-100 bg-[#0F3822] text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-forest-800 border border-lime-400/30 flex items-center justify-center text-lime-400 shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm tracking-tight text-white">
                Sanjivani Factory AI Assistant
              </h3>
              <span className="flex items-center gap-1 text-[10px] bg-lime-500/20 text-lime-300 font-semibold px-2 py-0.5 rounded-full border border-lime-400/30">
                <Database className="w-3 h-3" />
                PostgreSQL MCP Tool
              </span>
            </div>
            <p className="text-[11px] text-forest-200/80">
              Direct tool retrieval via Model Context Protocol stdio
            </p>
          </div>
        </div>

        <button
          onClick={clearChat}
          className="text-forest-200 hover:text-white p-1.5 rounded-xl hover:bg-forest-800 transition-colors flex items-center gap-1 text-xs"
          title="Clear chat history"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>

      {/* Suggested Questions Bar */}
      <div className="p-3 bg-cream-50/80 border-b border-slate-100 overflow-x-auto">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-forest-700" />
            Quick Prompts:
          </span>
          <div className="flex items-center gap-1.5 flex-nowrap">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-xs bg-white hover:bg-forest-50 hover:text-forest-900 hover:border-forest-300 text-slate-700 font-medium px-3 py-1 rounded-full border border-slate-200 shadow-2xs whitespace-nowrap transition-all disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4 bg-slate-50/40">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-[85%] sm:max-w-[78%] ${
                isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'
              }`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center text-xs font-bold shadow-2xs ${
                  isUser
                    ? 'bg-forest-800 text-lime-300'
                    : msg.isError
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-forest-900 text-lime-400 border border-lime-400/20'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Content Bubble */}
              <div
                className={`rounded-2xl p-4 text-xs sm:text-sm shadow-subtle relative group ${
                  isUser
                    ? 'bg-forest-900 text-white rounded-tr-none'
                    : msg.isError
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 rounded-tl-none'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none'
                }`}
              >
                {msg.isError ? (
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <p>{msg.text}</p>
                  </div>
                ) : isUser ? (
                  <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                ) : (
                  <div className="space-y-1">{renderFormattedText(msg.text)}</div>
                )}

                <div
                  className={`mt-2 flex items-center justify-between gap-3 text-[10px] ${
                    isUser ? 'text-forest-200/70' : 'text-slate-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>

                  {!isUser && !msg.isError && (
                    <button
                      onClick={() => handleCopyText(msg.id, msg.text)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity hover:text-slate-700 flex items-center gap-1"
                      title="Copy response"
                    >
                      {copiedId === msg.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span className="text-emerald-600">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="flex gap-3 max-w-[80%] mr-auto items-start animate-in fade-in duration-200">
            <div className="w-8 h-8 rounded-xl bg-forest-900 text-lime-400 shrink-0 flex items-center justify-center shadow-2xs">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-slate-200/90 rounded-2xl rounded-tl-none p-4 text-xs text-slate-600 shadow-subtle">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="inline-block w-2 h-2 rounded-full bg-forest-600 animate-ping"></span>
                <span className="font-semibold text-forest-800">
                  Executing MCP Tool &amp; Querying PostgreSQL...
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Retrieving live farmer payment metrics and synthesizing answer.
              </p>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form Bar */}
      <div className="p-3.5 bg-white border-t border-slate-200">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="Ask about farmer records, cane supplied, or pending payments..."
            className="flex-1 py-2.5 px-4 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-forest-600 focus:ring-2 focus:ring-forest-600/10 transition-all placeholder:text-slate-400 disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="py-2.5 px-4 bg-forest-900 hover:bg-forest-800 text-white rounded-xl font-medium text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed group"
          >
            <span>Ask</span>
            <Send className="w-4 h-4 text-lime-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>
        <p className="text-[10px] text-slate-400 text-center mt-2">
          Responses are generated from real PostgreSQL records via the official Model Context Protocol (MCP) server.
        </p>
      </div>
    </div>
  );
};
