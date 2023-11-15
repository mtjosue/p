import { create } from "zustand";

type RemoteUserStore = {
  caller: boolean;
  tempPeerId: string | null;
  actions: {
    setCaller: (caller: boolean) => void;
    setTempPeerId: (tempPeerId: string) => void;
    clearRemoteUserStore: () => void;
  };
};

export const useUserStore = create<RemoteUserStore>((set) => ({
  caller: false,
  tempPeerId: null,
  actions: {
    setCaller: (caller) => set(() => ({ caller })),
    setTempPeerId: (tempPeerId) => set(() => ({ tempPeerId })),
    clearRemoteUserStore: () =>
      set(() => ({ tempPeerId: null, matchId: null, remoteUserId: null })),
  },
}));

export const useCaller = () => useUserStore((state) => state.caller);
export const useSetCaller = () =>
  useUserStore((state) => state.actions.setCaller);
export const useTempPeerId = () => useUserStore((state) => state.tempPeerId);
export const useSetTempPeerId = () =>
  useUserStore((state) => state.actions.setTempPeerId);
export const useClearRemoteUserStore = () =>
  useUserStore((state) => state.actions.clearRemoteUserStore);
