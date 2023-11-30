import { create } from "zustand";

type GeneralStore = {
  phone: boolean | null;
  sentLike: number;
  sentHeart: number;
  sentLaugh: number;
  sentWoah: number;
  sentFire: number;
  sentClap: number;
  resLike: number;
  resHeart: number;
  resLaugh: number;
  resWoah: number;
  resFire: number;
  resClap: number;
  actions: {
    setPhone: (phone: boolean) => void;
    addSentLike: () => void;
    addSentHeart: () => void;
    addSentLaugh: () => void;
    addSentWoah: () => void;
    addSentFire: () => void;
    addSentClap: () => void;
    addResLike: () => void;
    addResHeart: () => void;
    addResLaugh: () => void;
    addResWoah: () => void;
    addResFire: () => void;
    addResClap: () => void;
    reset: () => void;
  };
};

export const useUserStore = create<GeneralStore>((set) => ({
  phone: null,
  sentLike: 0,
  sentHeart: 0,
  sentLaugh: 0,
  sentWoah: 0,
  sentFire: 0,
  sentClap: 0,
  resLike: 0,
  resHeart: 0,
  resLaugh: 0,
  resWoah: 0,
  resFire: 0,
  resClap: 0,
  actions: {
    setPhone: (phone) => set(() => ({ phone })),
    addSentLike: () => set((prev) => ({ sentLike: prev.sentLike + 1 })),
    addSentHeart: () => set((prev) => ({ sentHeart: prev.sentHeart + 1 })),
    addSentLaugh: () => set((prev) => ({ sentLaugh: prev.sentLaugh + 1 })),
    addSentWoah: () => set((prev) => ({ sentWoah: prev.sentWoah + 1 })),
    addSentFire: () => set((prev) => ({ sentFire: prev.sentFire + 1 })),
    addSentClap: () => set((prev) => ({ sentClap: prev.sentClap + 1 })),
    addResLike: () => set((prev) => ({ resLike: prev.resLike + 1 })),
    addResHeart: () => set((prev) => ({ resHeart: prev.resHeart + 1 })),
    addResLaugh: () => set((prev) => ({ resLaugh: prev.resLaugh + 1 })),
    addResWoah: () => set((prev) => ({ resWoah: prev.resWoah + 1 })),
    addResFire: () => set((prev) => ({ resFire: prev.resFire + 1 })),
    addResClap: () => set((prev) => ({ resClap: prev.resClap + 1 })),
    reset: () =>
      set(() => ({
        sentLike: 0,
        sentHeart: 0,
        sentLaugh: 0,
        sentWoah: 0,
        sentFire: 0,
        sentClap: 0,
        resLike: 0,
        resHeart: 0,
        resLaugh: 0,
        resWoah: 0,
        resFire: 0,
        resClap: 0,
      })),
  },
}));

export const usePhone = () => useUserStore((state) => state.phone);
export const useSetPhone = () =>
  useUserStore((state) => state.actions.setPhone);
export const useResetReactions = () =>
  useUserStore((state) => state.actions.reset);
export const useSentLike = () => useUserStore((state) => state.sentLike);
export const useAddSentLike = () =>
  useUserStore((state) => state.actions.addSentLike);
export const useSentHeart = () => useUserStore((state) => state.sentHeart);
export const useAddSentHeart = () =>
  useUserStore((state) => state.actions.addSentHeart);
export const useSentLaugh = () => useUserStore((state) => state.sentLaugh);
export const useAddSentLaugh = () =>
  useUserStore((state) => state.actions.addSentLaugh);
export const useSentWoah = () => useUserStore((state) => state.sentWoah);
export const useAddSentWoah = () =>
  useUserStore((state) => state.actions.addSentWoah);
export const useSentFire = () => useUserStore((state) => state.sentFire);
export const useAddSentFire = () =>
  useUserStore((state) => state.actions.addSentFire);
export const useSentClap = () => useUserStore((state) => state.sentClap);
export const useAddSentClap = () =>
  useUserStore((state) => state.actions.addSentClap);
export const useResLike = () => useUserStore((state) => state.resLike);
export const useAddResLike = () =>
  useUserStore((state) => state.actions.addResLike);
export const useResHeart = () => useUserStore((state) => state.resHeart);
export const useAddResHeart = () =>
  useUserStore((state) => state.actions.addResHeart);
export const useResLaugh = () => useUserStore((state) => state.resLaugh);
export const useAddResLaugh = () =>
  useUserStore((state) => state.actions.addResLaugh);
export const useResWoah = () => useUserStore((state) => state.resWoah);
export const useAddResWoah = () =>
  useUserStore((state) => state.actions.addResWoah);
export const useResFire = () => useUserStore((state) => state.resFire);
export const useAddResFire = () =>
  useUserStore((state) => state.actions.addResFire);
export const useResClap = () => useUserStore((state) => state.resClap);
export const useAddResClap = () =>
  useUserStore((state) => state.actions.addResClap);
