import { CHAT_COPY } from '../../constants/chatConfig';

export default function ChatLauncher({ onClick, isOpen }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isOpen}
      aria-label={CHAT_COPY.launcherLabel}
      aria-expanded={isOpen}
      aria-hidden={isOpen}
      tabIndex={isOpen ? -1 : 0}
      className={`
        fixed z-[60] flex items-center justify-center
        bg-transparent border-0 p-0 m-0 appearance-none
        outline-none focus-visible:ring-2 focus-visible:ring-[var(--bitsy-stroke)] focus-visible:ring-offset-2 rounded-full
        transition-all duration-300 ease-out
        ${isOpen
          ? 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-20 h-20 sm:w-24 sm:h-24 pointer-events-none'
          : 'bottom-6 right-6 w-28 h-28 sm:w-32 sm:h-32 hover:scale-110 active:scale-95 cursor-pointer'
        }
      `}
    >
      <img
        src="/bitsy-mascot.png"
        alt="Bitsy mascot"
        className={`w-full h-full object-contain pointer-events-none select-none ${
          isOpen ? 'drop-shadow-lg' : 'chat-launcher-pulse'
        }`}
        draggable={false}
      />
    </button>
  );
}
