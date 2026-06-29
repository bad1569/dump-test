import ChatHeader from './ChatHeader';
import ChatWelcome from './ChatWelcome';
import ChatMessages from './ChatMessages';
import SuggestionChips from './SuggestionChips';
import ChatInput from './ChatInput';

export default function ChatWindow({
  isFullScreen,
  hasStartedChat,
  messages,
  input,
  setInput,
  isLoading,
  onClose,
  onToggleFullscreen,
  onSubmit,
  onSuggestionClick,
}) {
  const isWelcomeScreen = !hasStartedChat;
  const isPopup = !isFullScreen;

  return (
    <div
      className={`
        fixed z-50 flex flex-col overflow-hidden
        transition-all duration-300 ease-out chat-window-enter
        ${isFullScreen ? 'bitsy-gradient-bg' : 'bitsy-gradient-bg-popup'}
        ${isFullScreen
          ? 'inset-0 w-full h-[100dvh] max-h-[100dvh]'
          : `
            bottom-[5.5rem] right-4 sm:bottom-[7rem] sm:right-6
            w-[min(400px,calc(100vw-2rem))]
            h-[min(620px,calc(100dvh-8rem))]
            max-h-[calc(100dvh-8rem)]
            rounded-3xl shadow-2xl border-2 border-[var(--bitsy-stroke)]
          `
        }
        ${isFullScreen && isWelcomeScreen ? 'welcome-screen' : ''}
        ${isPopup ? 'popup-screen' : ''}
      `}
      role="dialog"
      aria-label="Bitsy chat"
    >
      <ChatHeader
        hasStartedChat={hasStartedChat}
        isFullScreen={isFullScreen}
        isWelcomeScreen={isWelcomeScreen && isFullScreen}
        isPopup={isPopup}
        onClose={onClose}
        onToggleFullscreen={onToggleFullscreen}
      />

      {isWelcomeScreen ? (
        <div className={isPopup ? 'popup-content' : 'welcome-content'}>
          <div className={`w-full flex flex-col items-center min-h-0 ${isPopup ? '' : 'max-w-[1050px] mx-auto'}`}>
            <ChatWelcome isWelcomeScreen={isFullScreen} isPopup={isPopup} />
            <SuggestionChips
              onSuggestionClick={onSuggestionClick}
              disabled={isLoading}
              isWelcomeScreen={isFullScreen}
              isPopup={isPopup}
            />
            <ChatInput
              input={input}
              setInput={setInput}
              onSubmit={onSubmit}
              isLoading={isLoading}
              centered={isFullScreen}
              isWelcomeScreen={isFullScreen}
              isPopup={isPopup}
            />
          </div>
        </div>
      ) : (
        <>
          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {isPopup ? (
              <div className="popup-messages">
                <ChatMessages messages={messages} isLoading={isLoading} isPopup />
              </div>
            ) : (
              <ChatMessages messages={messages} isLoading={isLoading} />
            )}
            {isPopup && (
              <div className="px-4 shrink-0">
                <SuggestionChips
                  onSuggestionClick={onSuggestionClick}
                  disabled={isLoading}
                  showSubtitle
                  compact
                  isPopup
                />
              </div>
            )}
          </div>
          <ChatInput
            input={input}
            setInput={setInput}
            onSubmit={onSubmit}
            isLoading={isLoading}
            isPopup={isPopup}
            compact
          />
        </>
      )}
    </div>
  );
}
