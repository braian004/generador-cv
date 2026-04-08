import React from 'react';
import { Check, Circle } from 'lucide-react';
import { cn } from '../lib/utils';

interface StepIndicatorProps {
  currentStep: number;
  steps: string[];
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, steps }) => {
  return (
    <div className="flex items-center justify-between w-full max-w-3xl mx-auto mb-12 px-4">
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isCompleted = currentStep > stepNumber;
        const isActive = currentStep === stepNumber;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center relative group">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-500",
                  isCompleted ? "bg-indigo-600 border-indigo-600 text-white" : 
                  isActive ? "bg-white border-indigo-600 text-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.4)]" : 
                  "bg-white border-slate-200 text-slate-400"
                )}
              >
                {isCompleted ? <Check size={20} /> : <span className="text-sm font-bold">{stepNumber}</span>}
              </div>
              <span 
                className={cn(
                  "absolute -bottom-7 whitespace-nowrap text-[10px] font-bold uppercase tracking-widest transition-colors duration-500",
                  isActive ? "text-indigo-600" : "text-slate-400"
                )}
              >
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="flex-1 h-0.5 mx-4 bg-slate-200 relative overflow-hidden">
                <div 
                  className={cn(
                    "absolute inset-0 bg-indigo-600 transition-all duration-700 ease-in-out",
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
