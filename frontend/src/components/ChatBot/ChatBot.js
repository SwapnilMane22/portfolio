import React, { useState, useRef, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import * as icon from '@coreui/icons';
import CloseIcon from '@mui/icons-material/Close';
import './ChatBot.css';
import SendIcon from '@mui/icons-material/Send';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useChatOpen } from '../../contexts/ChatOpenContext';

const CHAT_API = process.env.REACT_APP_CHAT_API_URL || '';
const USE_STREAM = true; // SSE (streaming) is enabled and required

const ChatBot = () => {
  const { isOpen, setOpen, toggleChat: toggleChatFromContext } = useChatOpen();
  const [messages, setMessages] = useState([
    { role: 'bot', content: 'Hi there, ask me about Swapnil\'s experience, projects, or skills.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: 320, height: 400 });
  const [isDragging, setIsDragging] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const chatWindowRef = useRef(null);
  const chatIconRef = useRef(null);
  const messagesEndRef = useRef(null);
  const dragRef = useRef({ startX: 0, startY: 0, startPos: { x: 0, y: 0 } });
  const resizeRef = useRef({
    active: null,
    startX: 0,
    startY: 0,
    startSize: { width: 320, height: 400 },
    startPos: { x: 0, y: 0 },
  });

  useEffect(() => {
    // Align with ScrollToTop: same right offset (1.5em ≈ 24px)
    const rightOffsetPx = 24;
    const bottomOffsetPx = 20;
    const btnSize = 44;
    setPosition({
      x: window.innerWidth - btnSize - rightOffsetPx,
      y: window.innerHeight - btnSize - bottomOffsetPx,
    });
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  const toggleChat = (e) => {
    e.stopPropagation();
    toggleChatFromContext();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target) && chatIconRef.current && !chatIconRef.current.contains(event.target)) {
        setOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, setOpen]);

  const handleDragStart = (e) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPos: position,
    };
  };

  const handleResizeStart = (edge) => (e) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = {
      active: edge,
      startX: e.clientX,
      startY: e.clientY,
      startSize: size,
      startPos: position,
    };
  };

  const toggleSize = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setSize((prev) => {
      const expanded = prev.width > 340 || prev.height > 420;
      const next = expanded
        ? { width: 320, height: 400 }
        : {
            width: Math.min(window.innerWidth - 40, 520),
            height: Math.min(window.innerHeight - 80, 640),
          };
      setIsExpanded(!expanded);
      return next;
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isDragging) {
        const { startX, startY, startPos } = dragRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const maxX = window.innerWidth - 80;
        const maxY = window.innerHeight - 80;
        setPosition({
          x: Math.max(0, Math.min(maxX, startPos.x + dx)),
          y: Math.max(0, Math.min(maxY, startPos.y + dy)),
        });
      } else if (resizeRef.current.active) {
        const { active, startX, startY, startSize, startPos } = resizeRef.current;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        const minWidth = 260;
        const minHeight = 320;
        let newSize = { ...startSize };
        let newPos = { ...startPos };

        if (active.includes('right')) {
          newSize.width = Math.max(minWidth, startSize.width + dx);
        }
        if (active.includes('left')) {
          const proposedWidth = Math.max(minWidth, startSize.width - dx);
          const maxDx = startSize.width - minWidth;
          const clampedDx = Math.min(Math.max(dx, -maxDx), maxDx);
          newSize.width = Math.max(minWidth, startSize.width - clampedDx);
          newPos.x = startPos.x + clampedDx;
        }
        if (active.includes('bottom')) {
          newSize.height = Math.max(minHeight, startSize.height + dy);
        }
        if (active.includes('top')) {
          const proposedHeight = Math.max(minHeight, startSize.height - dy);
          const maxDy = startSize.height - minHeight;
          const clampedDy = Math.min(Math.max(dy, -maxDy), maxDy);
          newSize.height = Math.max(minHeight, startSize.height - clampedDy);
          newPos.y = startPos.y + clampedDy;
        }

        setSize(newSize);
        setPosition(newPos);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      if (resizeRef.current.active) {
        resizeRef.current.active = null;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, size]);

  const sendMessage = async () => {
    const text = (input || '').trim();
    if (!text || loading) return;

    if (!CHAT_API) {
      setMessages((prev) => [
        ...prev,
        { role: 'user', content: text },
        { role: 'bot', content: 'Chat API is not configured. Set REACT_APP_CHAT_API_URL to your backend URL (e.g. https://your-app.onrender.com).' }
      ]);
      setInput('');
      return;
    }

    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: text }]);
    setLoading(true);

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'bot')
      .map((m) => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));

    const apiUrl = `${CHAT_API.replace(/\/$/, '')}${USE_STREAM ? '/api/chat/stream' : '/api/chat'}`;

    if (USE_STREAM) {
      try {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: text, history })
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Request failed: ${res.status}`);
        }
        setMessages((prev) => [...prev, { role: 'bot', content: '' }]);
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() || '';
          for (const event of events) {
            const line = event.trim().split('\n').find((l) => l.startsWith('data: '));
            if (!line) continue;
            try {
              const data = JSON.parse(line.slice(6).trim());
              if (data.content) {
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last && last.role === 'bot') next[next.length - 1] = { ...last, content: last.content + data.content };
                  return next;
                });
              }
              if (data.error) {
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last && last.role === 'bot')
                    next[next.length - 1] = {
                      ...last,
                      content: "I'm having trouble answering right now. Please try again in a moment.",
                    };
                  return next;
                });
              }
            } catch (_) { /* skip non-JSON */ }
          }
        }
        if (buffer.trim()) {
          const line = buffer.trim().split('\n').find((l) => l.startsWith('data: '));
          if (line) {
            try {
              const data = JSON.parse(line.slice(6).trim());
              if (data.content) {
                setMessages((prev) => {
                  const next = [...prev];
                  const last = next[next.length - 1];
                  if (last && last.role === 'bot') next[next.length - 1] = { ...last, content: last.content + data.content };
                  return next;
                });
              }
            } catch (_) {}
          }
        }
      } catch (err) {
        // Log technical details to console, but show a friendly message in the UI
        // eslint-disable-next-line no-console
        console.error(err);
        setMessages((prev) => [
          ...prev,
          { role: 'bot', content: "I'm having trouble answering right now. Please try again in a moment." }
        ]);
      } finally {
        setLoading(false);
      }
      return;
    }

    try {
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history })
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || `Request failed: ${res.status}`);
      }
      setMessages((prev) => [...prev, { role: 'bot', content: data.reply || 'No response.' }]);
    } catch (err) {
      // Log technical details to console, but show a friendly message in the UI
      // eslint-disable-next-line no-console
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: "I'm having trouble answering right now. Please try again in a moment." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      className="chatbot-container"
      style={{ top: position.y, left: position.x, bottom: 'auto', right: 'auto' }}
    >
      {isOpen && (
        <div
          ref={chatWindowRef}
          className="chatbot-window"
          style={{ width: size.width, height: size.height }}
        >
          <div className="chatbot-header" onMouseDown={handleDragStart}>
            <h3>Chat</h3>
            <div className="chatbot-header-actions">
              <button
                className="resize-button"
                onClick={toggleSize}
                onMouseDown={(e) => e.stopPropagation()}
                aria-label="Resize"
              >
                {isExpanded ? '↙' : '↗'}
              </button>
              <button
                className="close-button"
                onClick={toggleChat}
                onMouseDown={(e) => e.stopPropagation()}
              >
                <CloseIcon />
              </button>
            </div>
          </div>
          <div className="chatbot-body">
            <div className="chatbot-messages">
              {messages.map((msg, i) => (
                <div key={i} className={msg.role === 'user' ? 'user-message' : 'bot-message'}>
                  {msg.role === 'bot' ? (
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {msg.content}
                    </ReactMarkdown>
                  ) : (
                    <p>{msg.content}</p>
                  )}
                </div>
              ))}
              {loading && (!messages.length || messages[messages.length - 1]?.role !== 'bot') && (
                <div className="bot-message">
                  <p>…</p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
            <div className="chatbot-input">
              <input
                type="text"
                placeholder="Ask about experience, projects, skills..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={loading}
              />
              <button className="send-button" onClick={sendMessage} disabled={loading} aria-label="Send">
                <SendIcon />
              </button>
            </div>
            <div
              className="chatbot-resize-edge chatbot-resize-edge-right"
              onMouseDown={handleResizeStart('right')}
              aria-hidden="true"
            />
            <div
              className="chatbot-resize-edge chatbot-resize-edge-left"
              onMouseDown={handleResizeStart('left')}
              aria-hidden="true"
            />
            <div
              className="chatbot-resize-edge chatbot-resize-edge-bottom"
              onMouseDown={handleResizeStart('bottom')}
              aria-hidden="true"
            />
            <div
              className="chatbot-resize-edge chatbot-resize-edge-top"
              onMouseDown={handleResizeStart('top')}
              aria-hidden="true"
            />
          </div>
        </div>
      )}

      <button ref={chatIconRef} className={`chatbot-button ${isOpen ? 'active' : ''}`} onClick={toggleChat}>
        <CIcon
          icon={icon.cilSpeech}
          className="chatbot-icon"
          style={{ width: '28px', height: '28px', marginTop: 4, background: 2 }}
        />
      </button>
    </div>
  );
};

export default ChatBot;
