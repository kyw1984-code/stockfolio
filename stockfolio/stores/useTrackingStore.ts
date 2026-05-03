import { create } from 'zustand';

interface TrackingState {
  isInitialized: boolean;
  isAuthorized: boolean;
  setInitialized: (authorized: boolean) => void;
}

export const useTrackingStore = create<TrackingState>((set) => ({
  isInitialized: false,
  isAuthorized: false,
  setInitialized: (authorized) => set({ isInitialized: true, isAuthorized: authorized }),
}));
