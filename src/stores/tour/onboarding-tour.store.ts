import { create } from "zustand";

type OnboardingTourState = {
  run: boolean;
  stepIndex: number;
  start: () => void;
  stop: () => void;
  setStepIndex: (index: number) => void;
};

export const useOnboardingTourStore = create<OnboardingTourState>((set) => ({
  run: false,
  stepIndex: 0,
  start: () => set({ run: true, stepIndex: 0 }),
  stop: () => set({ run: false, stepIndex: 0 }),
  setStepIndex: (index) => set({ stepIndex: index }),
}));
