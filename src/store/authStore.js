import { create } from "zustand";
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken
} from "../lib/api/tokenStorage";

const initialToken = getStoredToken();

export const useAuthStore = create((set) => ({
  token: initialToken,
  user: null,
  bootstrapped: false,
  setSession: ({ token, user }) =>
    set((state) => {
      const nextToken = token || state.token;

      if (nextToken) {
        setStoredToken(nextToken);
      }

      return {
        token: nextToken,
        user,
        bootstrapped: true
      };
    }),
  clearSession: () => {
    clearStoredToken();
    set({
      token: null,
      user: null,
      bootstrapped: true
    });
  },
  finishBootstrap: () =>
    set((state) => ({
      bootstrapped: true,
      token: state.token
    }))
}));
