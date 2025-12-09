import React, { useEffect, useState } from 'react';
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
  highlightTarget?: string; // CSS selector for element to highlight and position relative to
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
  highlightTarget,
}) => {
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const selector = highlightTarget || targetSelector;
    if (selector) {
      const element = document.querySelector(selector);
      if (element) {
        const bounds = element.getBoundingClientRect();
        setTargetRect(bounds);
        
        // Calculate tooltip position relative to target
        const padding = 24;
        let top = 0;
        let left = 0;

        if (position === 'bottom') {
          top = bounds.bottom + padding;
          left = bounds.left + bounds.width / 2 - 160; // Center tooltip (320px width)
        } else if (position === 'top') {
          top = bounds.top - padding - 200; // Approximate tooltip height
          left = bounds.left + bounds.width / 2 - 160;
        } else if (position === 'right') {
          top = bounds.top + bounds.height / 2 - 100;
          left = bounds.right + padding;
        } else if (position === 'left') {
          top = bounds.top + bounds.height / 2 - 100;
          left = bounds.left - padding - 320;
        }

        // Keep within viewport
        left = Math.max(12, Math.min(left, window.innerWidth - 332));
        top = Math.max(12, Math.min(top, window.innerHeight - 300));

        setTooltipPos({ top, left });
      }
    }
  }, [highlightTarget, targetSelector, position]);

  const positionClasses = {
    top: 'bottom-full mb-4',
    bottom: 'top-full mt-4',
    left: 'right-full mr-4',
    right: 'left-full ml-4',
  };

  return (
    <>
      {/* Backdrop with highlight cutout */}
      {targetRect && (
        <div className="fixed inset-0 z-40 pointer-events-none">
          <svg width="100%" height="100%" className="absolute inset-0">
            <defs>
              <mask id="tooltip-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <rect
                  x={targetRect.x - 16}
                  y={targetRect.y - 16}
                  width={targetRect.width + 32}
                  height={targetRect.height + 32}
                  rx="8"
                  fill="black"
                />
              </mask>
            </defs>
            <rect
              x="0"
              y="0"
              width="100%"
              height="100%"
              fill="rgba(0, 0, 0, 0.6)"
              mask="url(#tooltip-mask)"
            />
          </svg>
        </div>
      )}
      
      {/* Highlighted component with glow and bounce */}
      {targetRect && (
        <>
          <div
            className="fixed z-45 pointer-events-none animate-bounce-grit"
            style={{
              left: `${targetRect.x - 16}px`,
              top: `${targetRect.y - 16}px`,
              width: `${targetRect.width + 32}px`,
              height: `${targetRect.height + 32}px`,
              border: '4px solid rgb(236, 72, 153)',
              borderRadius: '8px',
              boxShadow: '0 0 20px 4px rgba(236, 72, 153, 0.6), 0 0 40px 8px rgba(236, 72, 153, 0.3)',
            }}
          />
          {/* Extra highlight glow */}
          <div
            className="fixed z-44 pointer-events-none"
            style={{
              left: `${targetRect.x - 20}px`,
              top: `${targetRect.y - 20}px`,
              width: `${targetRect.width + 40}px`,
              height: `${targetRect.height + 40}px`,
              border: '2px solid rgb(236, 72, 153)',
              borderRadius: '8px',
              opacity: 0.4,
              boxShadow: '0 0 30px 6px rgba(236, 72, 153, 0.4)',
            }}
          />
        </>
      )}
      
      {/* Tooltip */}
      <div
        className={`fixed z-50 bg-white border-4 border-grit-dark shadow-2xl max-w-sm transform transition-all`}
        style={{ width: '320px', top: `${tooltipPos.top}px`, left: `${tooltipPos.left}px` }}
      >
        {/* Header */}
        <div className="bg-grit-primary p-4 flex items-center justify-between border-b-4 border-grit-dark">
          <div className="flex items-center gap-2">
            <div className="animate-spin">
              <Sparkles className="text-grit-dark" size={20} />
            </div>
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
