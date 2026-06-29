import { ArrowLeft, Maximize2, Minimize2, X } from 'lucide-react';
import { CHAT_COPY } from '../../constants/chatConfig';

export default function ChatHeader({
  hasStartedChat,
  isFullScreen,
  isWelcomeScreen = false,
  isPopup = false,
  onClose,
  onToggleFullscreen,
}) {
  const CloseIcon = isPopup ? X : ArrowLeft;

  return (
    <div
      className={`
        flex items-center justify-between shrink-0
        ${isPopup
          ? 'popup-header'
          : isWelcomeScreen
            ? 'welcome-header px-6 sm:px-10'
            : `px-6 sm:px-10 pt-6 sm:pt-10 ${hasStartedChat ? 'pb-2' : 'pb-10'}`
        }
      `}
    >
      <div className="flex items-center gap-3 min-w-0">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close chat"
          className="p-1 text-[var(--bitsy-text-primary)] hover:opacity-70 transition-opacity shrink-0"
        >
          <CloseIcon size={isPopup ? 20 : 28} strokeWidth={2.5} />
        </button>

        {hasStartedChat && (
          <div className="min-w-0">
            <h2 className={`font-bold text-[var(--bitsy-text-primary)] leading-tight truncate ${isPopup ? 'text-sm' : 'text-lg'}`}>
              {CHAT_COPY.chatTitle}
            </h2>
            <p className={`text-[var(--bitsy-text-muted)] ${isPopup ? 'text-xs' : 'text-sm'}`}>
              {CHAT_COPY.onlineStatus}
            </p>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={isFullScreen ? 'Exit fullscreen' : 'Expand to fullscreen'}
        className="p-1 text-[var(--bitsy-text-primary)] hover:opacity-70 transition-opacity shrink-0"
      >
        {isFullScreen
          ? <Minimize2 size={isPopup ? 20 : 28} strokeWidth={2.5} />
          : <Maximize2 size={isPopup ? 20 : 28} strokeWidth={2.5} />}
      </button>
    </div>
  );
}
