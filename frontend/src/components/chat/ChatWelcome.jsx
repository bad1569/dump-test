import { CHAT_COPY } from '../../constants/chatConfig';

export default function ChatWelcome({ isWelcomeScreen = false, isPopup = false }) {
  if (isPopup) {
    return (
      <div className="flex flex-col items-center text-center w-full">
        <h1 className="popup-welcome-heading">
          {CHAT_COPY.welcomeTitleLine1} {CHAT_COPY.welcomeTitleLine2}
        </h1>
        <img
          src="/bitsy-mascot.png"
          alt="Bitsy"
          className="popup-welcome-logo object-contain drop-shadow-[0_4px_12px_rgba(79,23,84,0.15)]"
          draggable={false}
        />
        <p className="popup-welcome-subtitle">{CHAT_COPY.welcomeSubtitle}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center w-full">
      <h1
        className={`text-[var(--bitsy-text-primary)] font-extrabold leading-[1.05] tracking-tight ${
          isWelcomeScreen ? 'welcome-heading' : 'mb-5'
        }`}
      >
        <span className={`block ${isWelcomeScreen ? 'welcome-heading-line' : 'text-[clamp(2.75rem,8vw,5.5rem)]'}`}>
          {CHAT_COPY.welcomeTitleLine1}
        </span>
        <span className={`block ${isWelcomeScreen ? 'welcome-heading-line' : 'text-[clamp(2.75rem,8vw,5.5rem)]'}`}>
          {CHAT_COPY.welcomeTitleLine2}
        </span>
      </h1>

      <img
        src="/bitsy-mascot.png"
        alt="Bitsy"
        className={`object-contain drop-shadow-[0_8px_24px_rgba(79,23,84,0.18)] ${
          isWelcomeScreen
            ? 'welcome-logo'
            : 'w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] mb-[30px]'
        }`}
        draggable={false}
      />

      <p
        className={`text-[var(--bitsy-text-primary)] font-medium ${
          isWelcomeScreen
            ? 'welcome-subtitle'
            : 'text-[clamp(1.25rem,3vw,1.75rem)] mb-[50px]'
        }`}
      >
        {CHAT_COPY.welcomeSubtitle}
      </p>
    </div>
  );
}
