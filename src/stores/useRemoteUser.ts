import { create } from "zustand";

type RemoteUserStore = {
  phone: boolean | null;
  size: number;
  caller: boolean;
  tempPeerId: string | null;
  actions: {
    setCaller: (caller: boolean) => void;
    setPhone: (phone: boolean) => void;
    setSize: (size: number) => void;
    setTempPeerId: (tempPeerId: string) => void;
    clearRemoteUserStore: () => void;
  };
};

export const useUserStore = create<RemoteUserStore>((set) => ({
  phone: null,
  size: 430,
  caller: false,
  tempPeerId: null,
  actions: {
    setCaller: (caller) => set(() => ({ caller })),
    setPhone: (phone) => set(() => ({ phone })),
    setSize: (size) => set(() => ({ size })),
    setTempPeerId: (tempPeerId) => set(() => ({ tempPeerId })),
    clearRemoteUserStore: () =>
      set(() => ({ tempPeerId: null, matchId: null, remoteUserId: null })),
  },
}));

export const useCaller = () => useUserStore((state) => state.caller);
export const useSetCaller = () =>
  useUserStore((state) => state.actions.setCaller);
export const usePhone = () => useUserStore((state) => state.phone);
export const useSetPhone = () =>
  useUserStore((state) => state.actions.setPhone);
export const useSize = () => useUserStore((state) => state.size);
export const useSetSize = () => useUserStore((state) => state.actions.setSize);
export const useTempPeerId = () => useUserStore((state) => state.tempPeerId);
export const useSetTempPeerId = () =>
  useUserStore((state) => state.actions.setTempPeerId);
export const useClearRemoteUserStore = () =>
  useUserStore((state) => state.actions.clearRemoteUserStore);
