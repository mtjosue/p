import { create } from "zustand";
import type { Peer } from "peerjs";

type UserStore = {
  peer: Peer | null;
  token: string;
  firstLoad: boolean;
  firstName: string;
  userId: string;
  localMediaStream: MediaStream | null;
  actions: {
    setFirstName: (str: string) => void;
    setUserId: (str: string) => void;
    setFirstLoad: (bol: boolean) => void;
    setToken: (token: string) => void;
    setPeer: (peer: Peer) => void;
    setLocalMediaStream: (localMediaStream: MediaStream) => void;
  };
};

export const useUserStore = create<UserStore>((set) => ({
  peer: null,
  token: "",
  firstLoad: false,
  firstName: "",
  userId: "",
  localMediaStream: null,
  actions: {
    setFirstName: (firstName) => set(() => ({ firstName })),
    setUserId: (userId) => set(() => ({ userId })),
    setFirstLoad: (firstLoad) => set(() => ({ firstLoad })),
    setToken: (token) => set(() => ({ token })),
    setPeer: (peer) => set(() => ({ peer })),
    setLocalMediaStream: (localMediaStream) =>
      set(() => ({ localMediaStream })),
  },
}));

export const usePeer = () => useUserStore((state) => state.peer);
export const useSetPeer = () => useUserStore((state) => state.actions.setPeer);
export const useLocalMediaStream = () =>
  useUserStore((state) => state.localMediaStream);
export const useSetLocalMediaStream = () =>
  useUserStore((state) => state.actions.setLocalMediaStream);

// export const useSelectedLocation = () =>
//   useLocationStore((state) => state.location);
