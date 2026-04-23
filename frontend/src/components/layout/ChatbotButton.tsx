import { useState } from "react";
const css = `
.chatbot-fab {
  position: fixed;
  bottom: 28px;
  right: 28px;
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

.chatbot-btn {
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: linear-gradient(135deg, #27A869, #1A7A52);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 16px rgba(27,122,82,.35);
  transition: transform .2s, box-shadow .2s;
  position: relative;
}

.chatbot-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 6px 22px rgba(27,122,82,.45);
}

.chatbot-btn:active {
  transform: scale(0.96);
}

.chatbot-pulse {
  position: absolute;
  top: 0;
  left: 0;
  width: 58px;
  height: 58px;
  border-radius: 50%;
  background: rgba(39,168,105,.3);
  animation: chatpulse 2.2s ease-out infinite;
  pointer-events: none;
}

@keyframes chatpulse {
  0%   { transform: scale(1);    opacity: .7; }
  70%  { transform: scale(1.55); opacity: 0;  }
  100% { transform: scale(1.55); opacity: 0;  }
}

.chatbot-tooltip {
  background: #1e1e1e;
  color: #fff;
  font-size: 13px;
  font-weight: 500;
  padding: 8px 14px;
  border-radius: 10px;
  white-space: nowrap;
  position: relative;
}

.chatbot-tooltip::after {
  content: '';
  position: absolute;
  bottom: -6px;
  right: 22px;
  border-left: 6px solid transparent;
  border-right: 6px solid transparent;
  border-top: 6px solid #1e1e1e;
}

.chatbot-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,.45);
  z-index: 10000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chatbot-modal {
  background: #fff;
  border-radius: 18px;
  padding: 40px 36px 32px;
  max-width: 360px;
  width: 90%;
  text-align: center;
  position: relative;
}

.chatbot-modal-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #27A869, #1A7A52);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
}

.chatbot-modal h3 {
  font-size: 1.15rem;
  font-weight: 700;
  color: #1A7A52;
  margin: 0 0 10px;
}

.chatbot-modal p {
  font-size: 0.9rem;
  color: #666;
  margin: 0 0 24px;
  line-height: 1.55;
}

.chatbot-modal-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #FFF8E1;
  color: #B8860B;
  font-size: 0.78rem;
  font-weight: 600;
  padding: 5px 12px;
  border-radius: 20px;
  margin-bottom: 24px;
  border: 1px solid #FFE082;
}

.chatbot-modal-close {
  background: linear-gradient(135deg, #27A869, #1A7A52);
  color: #fff;
  border: none;
  border-radius: 50px;
  padding: 10px 28px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity .18s;
}

.chatbot-modal-close:hover {
  opacity: .88;
}

.chatbot-modal-x {
  position: absolute;
  top: 14px;
  right: 16px;
  background: none;
  border: none;
  font-size: 1.3rem;
  color: #aaa;
  cursor: pointer;
  line-height: 1;
  padding: 4px;
}

.chatbot-modal-x:hover {
  color: #555;
}
`;

function ChatbotButton() {
  const [open, setOpen] = useState(false);
  const [hovered, setHovered] = useState(false);

  return (
    <>
      <style>{css}</style>

      <div className="chatbot-fab">
        {hovered && !open && (
          <div className="chatbot-tooltip">Assistant Meditrack</div>
        )}
        <button
          className="chatbot-btn"
          onClick={() => setOpen(true)}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
          aria-label="Ouvrir le chatbot"
        >
          <span className="chatbot-pulse" />
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            <line x1="9" y1="10" x2="15" y2="10"/>
            <line x1="9" y1="14" x2="13" y2="14"/>
          </svg>
        </button>
      </div>

      {open && (
        <div
          className="chatbot-modal-overlay"
          onClick={() => setOpen(false)}
        >
          <div
            className="chatbot-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="chatbot-modal-x"
              onClick={() => setOpen(false)}
            >
              ×
            </button>

            <div className="chatbot-modal-icon">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
                <line x1="9" y1="10" x2="15" y2="10"/>
                <line x1="9" y1="14" x2="13" y2="14"/>
              </svg>
            </div>

            <h3>Assistant Meditrack</h3>

            <div className="chatbot-modal-badge">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              En cours de développement
            </div>

            
            <button
              className="chatbot-modal-close"
              onClick={() => setOpen(false)}
            >
              Compris !
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ChatbotButton;