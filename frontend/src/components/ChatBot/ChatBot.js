import React, { useState, useRef, useEffect } from 'react';
import CIcon from '@coreui/icons-react';
import * as icon from '@coreui/icons';
import CloseIcon from '@mui/icons-material/Close';
import './ChatBot.css';
import SendIcon from '@mui/icons-material/Send';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chatWindowRef = useRef(null);
  const chatIconRef = useRef(null);

  const toggleChat = (e) => {
    e.stopPropagation();
    setIsOpen((prevState) => !prevState);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // If the chat window is open and the click target is outside the chat window, close the chat.
      if (isOpen && chatWindowRef.current && !chatWindowRef.current.contains(event.target) && chatIconRef.current && !chatIconRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    // Attach the event listener when the chat is open.
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    // Clean up the event listener on unmount or when isOpen changes.
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div ref={chatWindowRef} className="chatbot-window">
          <div className="chatbot-header">
            <h3>Chat with me</h3>
            <button className="close-button" onClick={toggleChat}>
              <CloseIcon />
            </button>
          </div>
          <div className="chatbot-body">
            {/* Your chat interface goes here */}
            <div className="chatbot-messages">
              <div className="bot-message">
                <p>👋 Hi there! How can I help you today?</p>
              </div>
              {/* More messages would appear here */}
            </div>
            <div className="chatbot-input">
              <input 
                type="text" 
                placeholder="Type your message..." 
                disabled={true} 
              />
              <button className="send-button">
                <SendIcon/>
              </button>
            </div>
          </div>
        </div>
        )}

        <button ref={chatIconRef} className={`chatbot-button ${isOpen ? 'active' : ''}`} onClick={toggleChat}>
          <CIcon 
          icon={icon.cilSpeech} 
          className='chatbot-icon'
          style={{ 
            width: '28px',
            height: '28px',
            marginTop: 4,
            background: 2
            }}
            />
        </button>
     
    </div>
  );
};

export default ChatBot;