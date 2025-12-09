import React, { useEffect, useState } from 'react';
import { Check, ArrowRight, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface MilestoneCelebrationProps {
  milestone: string;
  onNext: () => void;
  onSkip: () => void;
}

export const MilestoneCelebration: React.FC<MilestoneCelebrationProps> = ({
  milestone,
  onNext,
  onSkip,
}) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    // Trigger confetti
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min;
    }

    const interval: any = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    // Fade in the modal
    setTimeout(() => setShow(true), 100);

    return () => clearInterval(interval);
  }, []);

  const getMilestoneInfo = () => {
    switch(milestone) {
      case 'profile':
        return {
          title: '🎉 Profile Complete!',
          message: 'Great job! Your professional profile is all set up.',
          next: 'Add Your First Client',
        };
      case 'client':
        return {
          title: '🎊 First Client Saved!',
          message: 'Awesome! You can now create documents for this client.',
          next: 'Create Templates',
        };
      case 'templates':
        return {
          title: '✨ Templates Created!',
          message: 'Perfect! Your templates will save you tons of time.',
          next: 'Create Your First Document',
        };
      case 'document':
        return {
          title: '🚀 First Document Created!',
          message: 'Congratulations! You\'re all set up and ready to go!',
          next: 'Go to Dashboard',
        };
      default:
        return {
          title: '✅ Milestone Complete!',
          message: 'Great work!',
          next: 'Continue',
        };
    }
  };

  const info = getMilestoneInfo();

  return (
    <div 
      className={`fixed inset-0 bg-black/50 flex items-center justify-center z-[100] transition-opacity duration-500 ${
        show ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <div 
        className={`bg-white border-4 border-grit-dark shadow-grit max-w-md w-full mx-4 transform transition-all duration-500 ${
          show ? 'scale-100 translate-y-0' : 'scale-75 translate-y-10'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-grit-primary to-yellow-300 p-8 border-b-4 border-grit-dark relative overflow-hidden">
          <div className="absolute inset-0 bg-grit-dark opacity-10 animate-pulse" />
          <div className="relative text-center">
            <div className="inline-block bg-white rounded-full p-4 mb-4 border-4 border-grit-dark shadow-lg">
              <Check className="text-green-600" size={48} strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold text-grit-dark mb-2">{info.title}</h2>
            <p className="text-grit-dark font-medium">{info.message}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          <div className="bg-blue-50 border-2 border-blue-200 p-4 rounded-lg mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="text-blue-600" size={18} />
              <p className="font-bold text-blue-900 text-sm">NEXT STEP:</p>
            </div>
            <p className="text-blue-800 font-medium">{info.next}</p>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onNext}
              className="w-full bg-grit-dark text-grit-primary font-bold py-4 px-6 hover:brightness-110 transition-all flex items-center justify-center gap-3 border-4 border-grit-dark shadow-grit active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              Continue <ArrowRight size={20} />
            </button>
            
            <button
              onClick={onSkip}
              className="w-full bg-white text-gray-700 font-bold py-3 px-6 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 border-2 border-gray-300"
            >
              <X size={18} />
              Skip Tutorial
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
