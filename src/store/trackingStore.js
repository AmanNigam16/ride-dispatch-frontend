import { create } from "zustand";

export const useTrackingStore = create((set, get) => ({
  driverLocation: null,
  previousLocation: null,
  lastUpdatedAt: null,
  sharingState: "idle",
  sharingError: "",
  setDriverLocation: ({ lat, lng }) =>
    set((state) => {
      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return state;
      }

      const nextLocation = { lat, lng };
      const currentLocation = state.driverLocation;

      return {
        driverLocation: nextLocation,
        previousLocation:
          currentLocation &&
          currentLocation.lat === nextLocation.lat &&
          currentLocation.lng === nextLocation.lng
            ? state.previousLocation
            : currentLocation,
        lastUpdatedAt: Date.now()
      };
    }),
  clearDriverLocation: () =>
    set((state) => ({
      driverLocation: null,
      previousLocation: state.driverLocation,
      lastUpdatedAt: null
    })),
  isLocationStale: () => {
    const { lastUpdatedAt } = get();

    return Boolean(lastUpdatedAt && Date.now() - lastUpdatedAt > 10000);
  },
  setSharingState: (sharingState) => set({ sharingState }),
  setSharingError: (sharingError) => set({ sharingError })
}));
