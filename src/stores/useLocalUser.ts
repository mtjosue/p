import { create } from "zustand";
import type { Peer } from "peerjs";

type UserStore = {
  refreshed: boolean;
  status: string | null;
  skips: number;
  noSkips: boolean;
  peer: Peer | null;
  firstLoad: boolean;
  userId: string;
  localMediaStream: MediaStream | null;
  actions: {
    setRefreshed: (refreshed: boolean) => void;
    setStatus: (str: string) => void;
    setSkips: (skips: number) => void;
    setNoSkips: (noSkips: boolean) => void;
    setPeer: (peer: Peer) => void;
    setFirstLoad: (bol: boolean) => void;
    setUserId: (str: string) => void;
    setLocalMediaStream: (localMediaStream: MediaStream) => void;
  };
};

export const useUserStore = create<UserStore>((set) => ({
  refreshed: false,
  status: null,
  skips: 20,
  noSkips: false,
  peer: null,
  firstLoad: true,
  userId: "",
  localMediaStream: null,
  actions: {
    setRefreshed: (refreshed) => set(() => ({ refreshed })),
    setStatus: (status) => set(() => ({ status })),
    setSkips: (skips) => set(() => ({ skips })),
    setNoSkips: (noSkips) => set(() => ({ noSkips })),
    setPeer: (peer) => set(() => ({ peer })),
    setFirstLoad: (firstLoad) => set(() => ({ firstLoad })),
    setUserId: (userId) => set(() => ({ userId })),
    setLocalMediaStream: (localMediaStream) =>
      set(() => ({ localMediaStream })),
  },
}));

export const useRefreshed = () => useUserStore((state) => state.refreshed);
export const useSetRefreshed = () =>
  useUserStore((state) => state.actions.setRefreshed);
export const useStatus = () => useUserStore((state) => state.status);
export const useSetStatus = () =>
  useUserStore((state) => state.actions.setStatus);
export const useSkips = () => useUserStore((state) => state.skips);
export const useSetSkips = () =>
  useUserStore((state) => state.actions.setSkips);
export const useNoSkips = () => useUserStore((state) => state.noSkips);
export const useSetNoSkips = () =>
  useUserStore((state) => state.actions.setNoSkips);
export const usePeer = () => useUserStore((state) => state.peer);
export const useSetPeer = () => useUserStore((state) => state.actions.setPeer);
export const useFirstLoad = () => useUserStore((state) => state.firstLoad);
export const useSetFirstLoad = () =>
  useUserStore((state) => state.actions.setFirstLoad);
export const useUserId = () => useUserStore((state) => state.userId);
export const useSetUserId = () =>
  useUserStore((state) => state.actions.setUserId);
export const useLocalMediaStream = () =>
  useUserStore((state) => state.localMediaStream);
export const useSetLocalMediaStream = () =>
  useUserStore((state) => state.actions.setLocalMediaStream);
