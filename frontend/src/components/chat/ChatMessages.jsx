import { useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { CHAT_COPY } from '../../constants/chatConfig';

function formatTimestamp(date) {
  const now = new Date();
  const diffMs = now - date;
  if (diffMs < 60000) return CHAT_COPY.timestampJustNow;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function toMarkdown(text) {
  if (!text) return '';
  return text
    .split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('• ')) {
        return '- ' + trimmed.slice(2);
      }
      return trimmed;
    })
    .join('\n');
}

export default function ChatMessages({ messages, isLoading, isPopup = false }) {
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className={`flex flex-col gap-3 ${isPopup ? 'py-1' : 'flex-1 overflow-y-auto px-4 py-2 min-h-0'}`}>
      {messages.map((msg) => (
        <div
          key={msg.id}
          className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div
            className={`max-w-[85%] px-4 py-2.5 rounded-2xl leading-relaxed bitsy-shadow-sm transition-all duration-200 animate-[slideUpFadeIn_0.25s_ease-out] text-[var(--bitsy-text-primary)] ${isPopup ? 'text-xs px-3 py-2' : 'text-sm'} ${
              msg.sender === 'user'
                ? 'bg-[var(--bitsy-user-bubble)] rounded-br-md'
                : 'bg-[var(--bitsy-bot-bubble)] rounded-bl-md'
            }`}
          >
            {msg.sender === 'user' ? (
              <span>{msg.text}</span>
            ) : (
              <div className="bitsy-prose">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => (
                      <p className="mb-1.5 last:mb-0 leading-relaxed">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="mt-1 mb-1.5 last:mb-0 pl-4 space-y-0.5 list-disc">{children}</ul>
                    ),
                    li: ({ children }) => (
                      <li className="leading-relaxed">{children}</li>
                    ),
                    a: ({ href, children }) => (
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--bitsy-purple)] underline underline-offset-2 hover:opacity-75 transition-opacity break-all"
                      >
                        {children}
                      </a>
                    ),
                    strong: ({ children }) => (
                      <strong className="font-semibold">{children}</strong>
                    ),
                  }}
                >
                  {toMarkdown(msg.text)}
                </ReactMarkdown>
              </div>
            )}
          </div>
          <span className="text-[10px] text-[var(--bitsy-text-muted)] mt-1 px-1">
            {formatTimestamp(msg.timestamp)}
          </span>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-[var(--bitsy-bot-bubble)] px-4 py-3 rounded-2xl rounded-bl-md bitsy-shadow-sm flex gap-1.5 items-center">
            <span className="typing-dot w-2 h-2 rounded-full bg-[var(--bitsy-text-primary)]" />
            <span className="typing-dot w-2 h-2 rounded-full bg-[var(--bitsy-text-primary)]" />
            <span className="typing-dot w-2 h-2 rounded-full bg-[var(--bitsy-text-primary)]" />
          </div>
        </div>
      )}

      <div ref={chatEndRef} />
    </div>
  );
}