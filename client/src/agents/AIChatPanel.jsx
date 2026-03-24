import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, X, Bot, User, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { api } from '../lib/api';

const AGENT_CONFIG = {
  wms: { name: 'WMS Agent', color: '#3b82f6', greeting: 'I can help with inventory optimization, zone management, and warehouse analytics. What would you like to know?' },
  tms: { name: 'TMS Agent', color: '#8b5cf6', greeting: 'I specialize in route optimization, carrier analysis, and shipment tracking. How can I assist?' },
  oms: { name: 'OMS Agent', color: '#f59e0b', greeting: 'I handle order prioritization, fulfillment strategy, and demand insights. What do you need?' },
  analytics: { name: 'Analytics Agent', color: '#14b8a6', greeting: 'I provide cross-module insights and trend analysis. Ask me anything about your supply chain performance.' }
};

export default function AIChatPanel({ module, isOpen, onClose }) {
  const config = AGENT_CONFIG[module] || AGENT_CONFIG.analytics;
  const [messages, setMessages] = useState([{ role: 'assistant', content: config.greeting }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (isOpen) inputRef.current?.focus(); }, [isOpen]);
  useEffect(() => { const cfg = AGENT_CONFIG[module] || AGENT_CONFIG.analytics; setMessages([{ role: 'assistant', content: cfg.greeting }]); }, [module]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    const userMessage = { role: 'user', content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    try {
      const apiMessages = newMessages.filter((_, i) => i > 0).map(m => ({ role: m.role, content: m.content }));
      const result = await api.aiChat(module, apiMessages);
      setMessages(prev => [...prev, { role: 'assistant', content: result.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, I encountered an error: ${err.message}. Please try again.` }]);
    } finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-[420px] z-50 flex flex-col animate-slide-right"
      style={{ background: 'var(--bg-primary)', borderLeft: '1px solid var(--border)' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: `${config.color}20` }}>
            <Bot size={18} style={{ color: config.color }} />
          </div>
          <div>
            <h3 className="theme-text text-sm font-semibold">{config.name}</h3>
            <p className="theme-text-dim text-xs">AI-powered assistant</p>
          </div>
        </div>
        <button onClick={onClose} className="p-2 rounded-lg theme-text-dim transition-all" style={{ background: 'var(--bg-secondary)' }}>
          <X size={18} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: msg.role === 'assistant' ? `${config.color}15` : 'var(--border)' }}>
              {msg.role === 'user'
                ? <User size={14} className="theme-text-muted" />
                : <Bot size={14} style={{ color: config.color }} />}
            </div>
            <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed"
              style={{
                background: msg.role === 'user' ? `${config.color}15` : 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                border: `1px solid ${msg.role === 'user' ? config.color + '25' : 'var(--border)'}`
              }}>
              {msg.role === 'assistant' ? (
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
                    strong: ({ children }) => <strong className="theme-text font-semibold">{children}</strong>,
                    code: ({ children }) => <code className="px-1.5 py-0.5 rounded text-xs font-mono text-blue-600" style={{ background: 'var(--border)' }}>{children}</code>
                  }}
                >{msg.content}</ReactMarkdown>
              ) : msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: `${config.color}15` }}>
              <Bot size={14} style={{ color: config.color }} />
            </div>
            <div className="rounded-2xl px-4 py-3" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
              <Loader2 size={16} className="animate-spin theme-text-dim" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick prompts */}
      <div className="px-4 py-2 flex gap-2 overflow-x-auto">
        {getQuickPrompts(module).map((prompt, i) => (
          <button key={i} onClick={() => { setInput(prompt); inputRef.current?.focus(); }}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs transition-all"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
            {prompt}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="p-4" style={{ borderTop: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          <input ref={inputRef} value={input} onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && sendMessage()}
            placeholder={`Ask ${config.name}...`} className="input-field flex-1" disabled={loading} />
          <button onClick={sendMessage} disabled={!input.trim() || loading}
            className="p-2.5 rounded-xl transition-all disabled:opacity-30 text-white"
            style={{ background: config.color }}>
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function getQuickPrompts(module) {
  const prompts = {
    wms: ['Show low stock alerts', 'Analyze warehouse utilization', 'Reorder recommendations', 'Zone optimization tips'],
    tms: ['Delayed shipments', 'Best carrier this month', 'Cost per mile trend', 'Route optimization'],
    oms: ['Pending high-priority orders', 'Fulfillment bottlenecks', 'Customer tier analysis', 'Demand forecast'],
    analytics: ['Weekly KPI summary', 'Cross-module insights', 'Revenue trend', 'Top issues this week']
  };
  return prompts[module] || prompts.analytics;
}

export function AIChatTrigger({ onClick, module }) {
  const config = AGENT_CONFIG[module] || AGENT_CONFIG.analytics;
  return (
    <button onClick={onClick}
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-all hover:scale-105 text-white"
      style={{ background: `linear-gradient(135deg, ${config.color}, ${config.color}cc)` }}>
      <MessageSquare size={22} />
    </button>
  );
}
