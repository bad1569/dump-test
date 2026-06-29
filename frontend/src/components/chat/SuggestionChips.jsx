import { SUGGESTIONS, CHAT_COPY } from '../../constants/chatConfig';

export default function SuggestionChips({
  onSuggestionClick,
  disabled,
  showSubtitle,
  compact,
  isWelcomeScreen = false,
  isPopup = false,
}) {
  return (
    <div
      className={`w-full ${isPopup ? 'popup-chips' : 'max-w-[900px]'} ${
        isWelcomeScreen ? 'welcome-chips' : compact ? 'mb-4' : isPopup ? '' : 'mb-9'
      }`}
    >
      {showSubtitle && (
        <p className={`text-center text-[var(--bitsy-text-primary)] font-medium mb-3 ${isPopup ? 'text-xs' : 'text-xl mb-6'}`}>
          {CHAT_COPY.welcomeSubtitle}
        </p>
      )}

      <div
        className={`grid grid-cols-2 w-full ${
          isWelcomeScreen ? 'welcome-chips-grid' : isPopup ? 'popup-chips-grid' : 'gap-3 sm:gap-[18px]'
        }`}
      >
        {SUGGESTIONS.map((label) => (
          <button
            key={label}
            type="button"
            disabled={disabled}
            onClick={() => onSuggestionClick(label)}
            className={`
              w-full min-w-0
              text-[var(--bitsy-text-primary)] font-medium
              bg-[var(--bitsy-surface)] rounded-full border-0
              bitsy-shadow-sm
              hover:shadow-[0_4px_16px_var(--bitsy-shadow)]
              active:scale-[0.98] transition-all duration-200
              disabled:opacity-50 disabled:cursor-not-allowed
              text-center truncate
              ${isPopup
                ? 'popup-chip-btn'
                : isWelcomeScreen
                  ? 'welcome-chip-btn px-6 text-[clamp(1rem,2.2vw,1.375rem)]'
                  : 'h-[56px] px-6 text-[clamp(1rem,2.2vw,1.375rem)]'
              }
            `}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
