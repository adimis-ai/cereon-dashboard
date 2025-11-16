"use client";

import { Check } from "lucide-react";
import React, { useState } from "react";
import { cn } from "../lib/index";
import { Button, ButtonProps } from "./button";

type Step<T = any> = {
  title: string;
  content: React.ReactNode;
  isSkippable?: boolean;
  extraData?: T;
};

type StepPanelProps<T = any> = {
  steps: Step<T>[];
  className?: string;
  onNext?: (currentStep: number) => void | Promise<void>;
  onPrev?: (currentStep: number) => void | Promise<void>;
  onStepChange?: (currentStep: number) => void | Promise<void>;
  onSubmit?: () => void | Promise<void>;
  onStepComplete?: (completedStep: number) => void | Promise<void>;
  renderActionButtons?: (props: {
    steps: Step<T>[];
    currentStep: number;
    handleNext: () => void;
    handlePrevious: () => void;
    handleSubmit: () => void;
    loading: { next: boolean; prev: boolean; submit: boolean };
  }) => React.ReactNode;
  buttonProps?: {
    next?: Partial<ButtonProps>;
    prev?: Partial<ButtonProps>;
    submit?: Partial<ButtonProps>;
  };
};

export function StepPanel<T>({
  steps,
  onNext,
  onPrev,
  onStepChange,
  onSubmit,
  onStepComplete,
  renderActionButtons,
  className,
  buttonProps = {
    next: { label: "Next", size: "sm", variant: "default" },
    prev: { label: "Previous", size: "sm", variant: "outline" },
    submit: { label: "Submit", size: "sm", variant: "default" },
  },
}: StepPanelProps<T>) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [loading, setLoading] = useState({
    next: false,
    prev: false,
    submit: false,
  });

  const isStepCompleted = (stepIndex: number) =>
    completedSteps.includes(stepIndex);

  const handleStepChange = async (newStep: number) => {
    if (onStepChange) await onStepChange(newStep);
    setCurrentStep(newStep);
  };

  const handleNext = async () => {
    setLoading((prev) => ({ ...prev, next: true }));
    try {
      if (onNext) await onNext(currentStep);
      if (currentStep < steps.length - 1) {
        await handleStepChange(currentStep + 1);
        if (onStepComplete) await onStepComplete(currentStep);
        setCompletedSteps((prev) => [...prev, currentStep]);
      }
    } finally {
      setLoading((prev) => ({ ...prev, next: false }));
    }
  };

  const handlePrevious = async () => {
    setLoading((prev) => ({ ...prev, prev: true }));
    try {
      if (onPrev) await onPrev(currentStep);
      if (currentStep > 0) {
        await handleStepChange(currentStep - 1);
        setCompletedSteps((prev) =>
          prev.filter((step) => step !== currentStep - 1)
        );
      }
    } finally {
      setLoading((prev) => ({ ...prev, prev: false }));
    }
  };

  const handleSubmit = async () => {
    setLoading((prev) => ({ ...prev, submit: true }));
    try {
      if (onSubmit) await onSubmit();
      setCompletedSteps((prev) => [...prev, currentStep]);
    } finally {
      setLoading((prev) => ({ ...prev, submit: false }));
    }
  };

  const handleStepClick = async (clickedStep: number) => {
    setLoading((prev) => ({ ...prev, next: true }));
    try {
      // If moving forward
      if (clickedStep > currentStep) {
        if (onNext) await onNext(currentStep);
        const newCompletedSteps = [...completedSteps];
        for (let i = currentStep; i < clickedStep; i++) {
          if (!newCompletedSteps.includes(i)) {
            newCompletedSteps.push(i);
          }
        }
        setCompletedSteps(newCompletedSteps);
      }
      // If moving backward
      else if (clickedStep < currentStep) {
        if (onPrev) await onPrev(currentStep);
        setCompletedSteps((prev) => prev.filter((step) => step < clickedStep));
      }
      await handleStepChange(clickedStep);
    } finally {
      setLoading((prev) => ({ ...prev, next: false }));
    }
  };

  return (
    <div
      className={cn(
        "w-full grid grid-col-1 h-full mx-auto rounded-lg shadow-lg p-3",
        className
      )}
    >
      <div className="flex justify-between items-center mb-4">
        {steps.map((step, index) => (
          <React.Fragment key={index}>
            <div className="flex justify-start items-center">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-lg border border-border ${
                  isStepCompleted(index) ||
                  (index === currentStep &&
                    index === steps.length - 1 &&
                    completedSteps.includes(index))
                    ? "bg-primary"
                    : index === currentStep
                      ? "bg-background"
                      : "bg-card"
                } cursor-pointer hover:opacity-80`}
                onClick={() => handleStepClick(index)}
                role="button"
                tabIndex={0}
                aria-label={`Go to step ${index + 1}: ${step.title}`}
              >
                {isStepCompleted(index) ? <Check size={16} /> : index + 1}
              </div>
              <span className="ml-2 text-md font-bold">{step.title}</span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-3 ${
                  isStepCompleted(index) ? "bg-primary" : "bg-background"
                }`}
              ></div>
            )}
          </React.Fragment>
        ))}
      </div>

      {renderActionButtons ? (
        renderActionButtons({
          steps,
          currentStep,
          handleNext,
          handlePrevious,
          handleSubmit,
          loading,
        })
      ) : (
        <div className="flex justify-between">
          <Button
            onClick={handlePrevious}
            disabled={currentStep === 0 || loading.prev}
            label={
              loading.prev
                ? "Loading..."
                : buttonProps.prev?.label || "Previous"
            }
            loading={loading.prev}
            {...buttonProps.prev}
          />
          {currentStep < steps.length - 1 ? (
            <Button
              onClick={handleNext}
              label={
                loading.next ? "Loading..." : buttonProps.next?.label || "Next"
              }
              loading={loading.next}
              {...buttonProps.next}
            />
          ) : (
            <Button
              onClick={handleSubmit}
              label={
                loading.submit
                  ? "Loading..."
                  : buttonProps.submit?.label || "Submit"
              }
              loading={loading.submit}
              {...buttonProps.submit}
            />
          )}
        </div>
      )}

      <div className="mt-2 flex flex-col flex-1">
        {steps[currentStep]?.content}
      </div>
    </div>
  );
}
