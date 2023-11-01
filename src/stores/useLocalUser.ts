import { create } from "zustand";
import type { Peer } from "peerjs";

type UserStore = {
  peer: Peer | null;
  token: string;
  firstLoad: boolean;
  firstName: string;
  userId: string;
  actions: {
    setFirstName: (str: string) => void;
    setUserId: (str: string) => void;
    setFirstLoad: (bol: boolean) => void;
    setToken: (token: string) => void;
    setPeer: (peer: Peer) => void;
  };
};

export const useUserStore = create<UserStore>((set) => ({
  peer: null,
  token: "",
  firstLoad: false,
  firstName: "",
  userId: "",
  actions: {
    setFirstName: (firstName) => set(() => ({ firstName })),
    setUserId: (userId) => set(() => ({ userId })),
    setFirstLoad: (firstLoad) => set(() => ({ firstLoad })),
    setToken: (token) => set(() => ({ token })),
    setPeer: (peer) => set(() => ({ peer })),
  },
}));

export const usePeer = () => useUserStore((state) => state.peer);
export const useSetPeer = () => useUserStore((state) => state.actions.setPeer);

// export const useSelectedLocation = () =>
//   useLocationStore((state) => state.location);
