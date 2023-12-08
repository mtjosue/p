import { create } from "zustand";
import type { Peer } from "peerjs";

type UserStore = {
  // height: number;
  solo: boolean;
  refreshed: boolean;
  status: string | null;
  skips: number;
  noSkips: boolean;
  peer: Peer | null;
  firstLoad: boolean;
  userId: string;
  remoteUserId: string | null;
  localMediaStream: MediaStream | null;
  reports: number;
  lastReport: Date | null;
  banned: boolean;
  actions: {
    // setHeight: (num: number) => void;
    setLastReport: (time: null | Date) => void;
    addReport: (report: number) => void;
    decReport: () => void;
    setBanned: (bol: boolean) => void;
    setSolo: (solo: boolean) => void;
    setRefreshed: (refreshed: boolean) => void;
    setStatus: (str: string) => void;
    setSkips: (skips: number) => void;
    setNoSkips: (noSkips: boolean) => void;
    setPeer: (peer: Peer) => void;
    setFirstLoad: (bol: boolean) => void;
    setUserId: (str: string) => void;
    setRemoteUserId: (str: null | string) => void;
    setLocalMediaStream: (localMediaStream: MediaStream) => void;
  };
};

export const useUserStore = create<UserStore>((set) => ({
  // height: 1,
  banned: false,
  reports: 0,
  lastReport: null,
  solo: false,
  refreshed: false,
  status: null,
  skips: 20,
  noSkips: false,
  peer: null,
  firstLoad: true,
  userId: "",
  remoteUserId: null,
  localMediaStream: null,
  actions: {
    // setHeight: (height) => set(() => ({ height })),
    setLastReport: (time) => set(() => ({ lastReport: time })),
    addReport: (report) => set((prev) => ({ reports: prev.reports + report })),
    decReport: () => set((prev) => ({ reports: prev.reports - 1 })),
    setBanned: (banned) => set(() => ({ banned })),
    setSolo: (solo) => set(() => ({ solo })),
    setRefreshed: (refreshed) => set(() => ({ refreshed })),
    setStatus: (status) => set(() => ({ status })),
    setSkips: (skips) => set(() => ({ skips })),
    setNoSkips: (noSkips) => set(() => ({ noSkips })),
    setPeer: (peer) => set(() => ({ peer })),
    setFirstLoad: (firstLoad) => set(() => ({ firstLoad })),
    setUserId: (userId) => set(() => ({ userId })),
    setRemoteUserId: (strOrNull) => set(() => ({ remoteUserId: strOrNull })),
    setLocalMediaStream: (localMediaStream) =>
      set(() => ({ localMediaStream })),
  },
}));

// export const useHeight = () => useUserStore((state) => state.height);
// export const useSetHeight = () =>
//   useUserStore((state) => state.actions.setHeight);
export const useLastReport = () => useUserStore((state) => state.lastReport);
export const useSetLastReport = () =>
  useUserStore((state) => state.actions.setLastReport);
export const useReports = () => useUserStore((state) => state.reports);
export const useAddReport = () =>
  useUserStore((state) => state.actions.addReport);
export const useDecReport = () =>
  useUserStore((state) => state.actions.decReport);
export const useSolo = () => useUserStore((state) => state.solo);
export const useSetSolo = () => useUserStore((state) => state.actions.setSolo);
export const useRefreshed = () => useUserStore((state) => state.refreshed);
export const useSetRefreshed = () =>
  useUserStore((state) => state.actions.setRefreshed);
export const useBanned = () => useUserStore((state) => state.banned);
export const useSetBanned = () =>
  useUserStore((state) => state.actions.setBanned);
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
export const useRemoteUserId = () =>
  useUserStore((state) => state.remoteUserId);
export const useSetRemoteUserId = () =>
  useUserStore((state) => state.actions.setRemoteUserId);
export const useLocalMediaStream = () =>
  useUserStore((state) => state.localMediaStream);
export const useSetLocalMediaStream = () =>
  useUserStore((state) => state.actions.setLocalMediaStream);
