import React from 'react';
import { X, ArrowRight, Sparkles } from 'lucide-react';

interface OnboardingTooltipProps {
  title: string;
  description: string;
  step: string;
  totalSteps: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  onNext?: () => void;
  onSkip?: () => void;
  targetSelector?: string; // CSS selector for element to highlight
}

export const OnboardingTooltip: React.FC<OnboardingTooltipProps> = ({
  title,
  description,
  step,
  totalSteps,
  position = 'bottom',
  onNext,
  onSkip,
  targetSelector,
}) => {
  const positionClasses = {
    top: 'bottom-full mb-4',
    bottom: 'top-full mt-4',
    left: 'right-full mr-4',
    right: 'left-full ml-4',
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40 pointer-events-none" />
      
      {/* Tooltip */}
      <div
        className={`absolute ${positionClasses[position]} z-50 bg-white border-4 border-grit-dark shadow-grit max-w-sm`}
        style={{ width: '320px' }}
      >
        {/* Header */}
        <div className="bg-grit-primary p-4 flex items-center justify-between border-b-4 border-grit-dark">
          <div className="flex items-center gap-2">
            <Sparkles className="text-grit-dark" size={20} />
            <span className="font-bold text-grit-dark text-sm">
              STEP {step} OF {totalSteps}
            </span>
          </div>
          {onSkip && (
            <button
              onClick={onSkip}
              className="text-grit-dark hover:bg-grit-dark hover:text-grit-primary p-1 transition-colors"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-3 text-grit-dark">{title}</h3>
          <p className="text-gray-700 mb-4 leading-relaxed">{description}</p>
          
          {onNext && (
            <button
              onClick={onNext}
              className="w-full bg-grit-dark text-grit-primary font-bold py-3 px-4 hover:brightness-110 transition-all flex items-center justify-center gap-2 border-2 border-grit-dark shadow-grit active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Got it! <ArrowRight size={18} />
            </button>
          )}
        </div>

        {/* Arrow pointer */}
        <div
          className={`absolute w-0 h-0 border-8 ${
            position === 'bottom'
              ? 'top-0 -translate-y-full border-l-transparent border-r-transparent border-b-grit-dark border-t-0 left-8'
              : position === 'top'
              ? 'bottom-0 translate-y-full border-l-transparent border-r-transparent border-t-grit-dark border-b-0 left-8'
              : position === 'right'
              ? 'left-0 -translate-x-full border-t-transparent border-b-transparent border-r-grit-dark border-l-0 top-8'
              : 'right-0 translate-x-full border-t-transparent border-b-transparent border-l-grit-dark border-r-0 top-8'
          }`}
        />
      </div>
    </>
  );
};

interface GuideSpotlightProps {
  selector: string;
  message: string;
  onClick?: () => void;
}

export const GuideSpotlight: React.FC<GuideSpotlightProps> = ({ selector, message, onClick }) => {
  const [rect, setRect] = React.useState<DOMRect | null>(null);

  React.useEffect(() => {
    const element = document.querySelector(selector);
    if (element) {
      const bounds = element.getBoundingClientRect();
      setRect(bounds);
      
      // Scroll element into view
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selector]);

  if (!rect) return null;

  return (
    <>
      {/* Backdrop with cutout */}
      <div className="fixed inset-0 z-40 pointer-events-none">
        <svg width="100%" height="100%" className="absolute inset-0">
          <defs>
            <mask id="spotlight-mask">
              <rect x="0" y="0" width="100%" height="100%" fill="white" />
              <rect
                x={rect.x - 8}
                y={rect.y - 8}
                width={rect.width + 16}
                height={rect.height + 16}
                rx="4"
                fill="black"
              />
            </mask>
          </defs>
          <rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgba(0, 0, 0, 0.7)"
            mask="url(#spotlight-mask)"
          />
        </svg>
      </div>

      {/* Highlight border with pulse animation */}
      <div
        className="fixed z-50 border-4 border-grit-primary rounded pointer-events-none animate-pulse"
        style={{
          left: `${rect.x - 8}px`,
          top: `${rect.y - 8}px`,
          width: `${rect.width + 16}px`,
          height: `${rect.height + 16}px`,
        }}
      />

      {/* Floating message */}
      <div
        className="fixed z-50 bg-grit-primary border-4 border-grit-dark shadow-grit p-4 max-w-xs"
        style={{
          left: `${rect.x}px`,
          top: `${rect.y + rect.height + 16}px`,
        }}
      >
        <div className="flex items-center gap-2">
          <ArrowRight className="text-grit-dark animate-bounce" size={20} />
          <p className="font-bold text-grit-dark text-sm">{message}</p>
        </div>
      </div>
    </>
  );
};
