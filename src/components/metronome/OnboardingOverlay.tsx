'use client';

import { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

// PR2-053 AT-19, AT-20: Onboarding overlay with spotlight and step-by-step guide

export interface OnboardingStep {
  targetSelector: string;
  title: string;
  description: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface OnboardingOverlayProps {
  steps: OnboardingStep[];
  onComplete: () => void;
  onSkip: () => void;
}

// Default onboarding steps for the Metronome Sync module
export const ONBOARDING_STEPS: OnboardingStep[] = [
  {
    targetSelector: '[data-onboarding="pulse-bar"]',
    title: 'Your Pulse at a Glance',
    description: 'See active initiatives, open decisions, overdue items, and when your next sync meeting is scheduled.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-onboarding="tab-decide-track"]',
    title: 'Decide & Track',
    description: 'Your working view — open decisions that need attention and all initiative cards with their action items.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-onboarding="initiative-card"]',
    title: 'Initiative Cards',
    description: 'Each card shows a strategic initiative with its function tag, priority level, progress bar, and action items.',
    position: 'right',
  },
  {
    targetSelector: '[data-onboarding="action-items"]',
    title: 'Action Items',
    description: 'Add, edit, and track tasks. Click the status icon to cycle through pending → in progress → done. Set deadlines and priorities.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-onboarding="decisions-panel"]',
    title: 'Decisions',
    description: 'Open decisions that need resolution. During sync meetings, decide or defer each one.',
    position: 'left',
  },
  {
    targetSelector: '[data-onboarding="tab-calendar-plan"]',
    title: 'Calendar & Plan',
    description: 'Switch to the planning view to see your calendar, key dates, and upcoming deadlines.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-onboarding="next-sync"]',
    title: 'Next Sync',
    description: 'Click to edit the next sync meeting date and focus topics. Keep your team aligned.',
    position: 'bottom',
  },
];

function calculateTooltipPosition(rect: DOMRect, position: string = 'bottom') {
  const OFFSET = 16;
  const style: React.CSSProperties = { position: 'fixed' };

  switch (position) {
    case 'bottom':
      style.top = rect.bottom + OFFSET;
      style.left = rect.left;
      break;
    case 'top':
      style.top = rect.top - OFFSET;
      style.left = rect.left;
      style.transform = 'translateY(-100%)';
      break;
    case 'right':
      style.top = rect.top;
      style.left = rect.right + OFFSET;
      break;
    case 'left':
      style.top = rect.top;
      style.left = rect.left - OFFSET;
      style.transform = 'translateX(-100%)';
      break;
  }

  return style;
}

export default function OnboardingOverlay({ steps, onComplete, onSkip }: OnboardingOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlightRect, setSpotlightRect] = useState<DOMRect | null>(null);

  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;

  // Update spotlight position when step changes or window resizes
  const updateSpotlight = useCallback(() => {
    if (!step) return;
    const target = document.querySelector(step.targetSelector);
    if (target) {
      const rect = target.getBoundingClientRect();
      setSpotlightRect(rect);
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setSpotlightRect(null);
    }
  }, [step]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener('resize', updateSpotlight);
    return () => window.removeEventListener('resize', updateSpotlight);
  }, [updateSpotlight]);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onSkip();
      if (e.key === 'ArrowRight' && currentStep < steps.length - 1) setCurrentStep(c => c + 1);
      if (e.key === 'ArrowLeft' && currentStep > 0) setCurrentStep(c => c - 1);
      if (e.key === 'Enter' && isLastStep) onComplete();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [currentStep, steps.length, isLastStep, onSkip, onComplete]);

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      setCurrentStep(c => c + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(c => c - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Spotlight cutout using box-shadow */}
      {spotlightRect && (
        <div
          className="fixed z-[60] rounded-lg pointer-events-none"
          style={{
            top: spotlightRect.top - 4,
            left: spotlightRect.left - 4,
            width: spotlightRect.width + 8,
            height: spotlightRect.height + 8,
            boxShadow: '0 0 0 9999px rgba(0,0,0,0.6), 0 0 0 4px rgba(124,58,237,0.5)',
          }}
        />
      )}

      {/* Tooltip */}
      {spotlightRect && step && (
        <div
          className="fixed z-[61] bg-white rounded-xl shadow-2xl p-4 max-w-xs"
          style={calculateTooltipPosition(spotlightRect, step.position)}
        >
          {/* Step indicator */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] text-purple-600 font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <h3 className="text-sm font-semibold text-gray-800 mb-1">{step.title}</h3>
          <p className="text-xs text-gray-600 leading-relaxed mb-3">{step.description}</p>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-3 w-3" />
              Back
            </button>

            {/* Progress dots */}
            <div className="flex gap-1">
              {steps.map((_, i) => (
                <span
                  key={i}
                  className={`w-1.5 h-1.5 rounded-full ${
                    i === currentStep ? 'bg-purple-600' : i < currentStep ? 'bg-purple-300' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 text-xs font-medium text-purple-600 hover:text-purple-700"
            >
              {isLastStep ? 'Done' : 'Next'}
              {!isLastStep && <ChevronRight className="h-3 w-3" />}
            </button>
          </div>
        </div>
      )}

      {/* If no target found, show centered message */}
      {!spotlightRect && step && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm text-center">
            <span className="text-[10px] text-purple-600 font-medium">
              Step {currentStep + 1} of {steps.length}
            </span>
            <h3 className="text-sm font-semibold text-gray-800 mt-2 mb-1">{step.title}</h3>
            <p className="text-xs text-gray-600 leading-relaxed mb-4">{step.description}</p>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handlePrev}
                disabled={currentStep === 0}
                className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-30"
              >
                Back
              </button>
              <button
                onClick={handleNext}
                className="text-xs font-medium text-purple-600 hover:text-purple-700"
              >
                {isLastStep ? 'Done' : 'Next'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skip button */}
      <button
        onClick={onSkip}
        className="fixed bottom-6 right-6 z-[62] px-4 py-2 text-xs text-white bg-black/50 rounded-full hover:bg-black/70 transition-colors"
      >
        Skip tour
      </button>
    </div>
  );
}
