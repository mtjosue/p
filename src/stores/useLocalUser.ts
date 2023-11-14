import { create } from "zustand";
import type { Peer } from "peerjs";

type UserStore = {
  refreshed: boolean;
  status: string | null;
  skips: number;
  termsAgreed: boolean | null;
  noSkips: boolean;
  peer: Peer | null;
  token: string;
  firstLoad: boolean;
  firstName: string;
  userId: string;
  localMediaStream: MediaStream | null;
  actions: {
    setFirstName: (str: string) => void;
    setStatus: (str: string) => void;
    setUserId: (str: string) => void;
    setFirstLoad: (bol: boolean) => void;
    setTermsAgreed: (bol: boolean) => void;
    setToken: (token: string) => void;
    setPeer: (peer: Peer) => void;
    setSkips: (skips: number) => void;
    setNoSkips: (noSkips: boolean) => void;
    setRefreshed: (refreshed: boolean) => void;
    setLocalMediaStream: (localMediaStream: MediaStream) => void;
  };
};

export const useUserStore = create<UserStore>((set) => ({
  refreshed: false,
  status: null,
  skips: 20,
  termsAgreed: null,
  noSkips: false,
  peer: null,
  token: "",
  firstLoad: true,
  firstName: "",
  userId: "",
  localMediaStream: null,
  actions: {
    setFirstName: (firstName) => set(() => ({ firstName })),
    setStatus: (status) => set(() => ({ status })),
    setUserId: (userId) => set(() => ({ userId })),
    setFirstLoad: (firstLoad) => set(() => ({ firstLoad })),
    setTermsAgreed: (termsAgreed) => set(() => ({ termsAgreed })),
    setNoSkips: (noSkips) => set(() => ({ noSkips })),
    setToken: (token) => set(() => ({ token })),
    setPeer: (peer) => set(() => ({ peer })),
    setSkips: (skips) => set(() => ({ skips })),
    setRefreshed: (refreshed) => set(() => ({ refreshed })),
    setLocalMediaStream: (localMediaStream) =>
      set(() => ({ localMediaStream })),
  },
}));

export const usePeer = () => useUserStore((state) => state.peer);
export const useSetPeer = () => useUserStore((state) => state.actions.setPeer);
export const useStatus = () => useUserStore((state) => state.status);
export const useSetStatus = () =>
  useUserStore((state) => state.actions.setStatus);
export const useSkips = () => useUserStore((state) => state.skips);
export const useSetSkips = () =>
  useUserStore((state) => state.actions.setSkips);
export const useRefreshed = () => useUserStore((state) => state.refreshed);
export const useSetRefreshed = () =>
  useUserStore((state) => state.actions.setRefreshed);
export const useNoSkips = () => useUserStore((state) => state.noSkips);
export const useSetNoSkips = () =>
  useUserStore((state) => state.actions.setNoSkips);
export const useUserId = () => useUserStore((state) => state.userId);
export const useSetUserId = () =>
  useUserStore((state) => state.actions.setUserId);
export const useFirstLoad = () => useUserStore((state) => state.firstLoad);
export const useSetFirstLoad = () =>
  useUserStore((state) => state.actions.setFirstLoad);
export const useLocalMediaStream = () =>
  useUserStore((state) => state.localMediaStream);
export const useSetLocalMediaStream = () =>
  useUserStore((state) => state.actions.setLocalMediaStream);
