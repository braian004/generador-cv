import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '../lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-3 w-full max-w-xl mx-auto py-1">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <React.Fragment key={step}>
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 shrink-0 text-xs sm:text-sm font-bold",
                  isCompleted ? "bg-indigo-600 border-indigo-500 text-white" : 
                  isActive ? "bg-indigo-500 border-indigo-400 text-white ring-2 ring-indigo-400/40 shadow-lg shadow-indigo-500/30" : 
                  "bg-slate-800 border-slate-700 text-slate-400"
                )}
              >
                {isCompleted ? <Check size={14} className="stroke-[3]" /> : <span>{stepNumber}</span>}
              </div>
              <span 
                className={cn(
                  "hidden md:inline text-[11px] font-bold uppercase tracking-wider transition-colors whitespace-nowrap",
                  isActive ? "text-indigo-300 font-extrabold" : isCompleted ? "text-slate-300" : "text-slate-500"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 min-w-[12px] sm:min-w-[24px] max-w-[40px] h-0.5 bg-slate-700 relative overflow-hidden shrink">
                <div 
                  className={cn(
                    "absolute inset-0 bg-indigo-500 transition-all duration-500 ease-in-out",
                    isCompleted ? "translate-x-0" : "-translate-x-full"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};
