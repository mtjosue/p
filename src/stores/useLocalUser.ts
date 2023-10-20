import { create } from "zustand";
// import { type Location } from "prisma/selects/location";

// type LocationStore = {
//   location: Location | null;
//   actions: {
//     selectLocation: (location: Location) => void;
//     deselectLocation: () => void;
//   };
// };

type UserStore = {
  firstName: string;
  userId: string;
  actions: {
    setFirstName: (str: string) => void;
    setUserId: (str: string) => void;
  };
};

// export const useLocationStore = create<LocationStore>((set) => ({
//   location: null,

//   actions: {
//     selectLocation: (location) => set(() => ({ location })),
//     deselectLocation: () => set(() => ({ location: null })),
//   },
// }));

export const useUserStore = create<UserStore>((set) => ({
  firstName: "",
  userId: "",
  actions: {
    setFirstName: (firstName) => set(() => ({ firstName })),
    setUserId: (userId) => set(() => ({ userId })),
  },
}));

// export const useSelectedLocation = () =>
//   useLocationStore((state) => state.location);

// export const useSelectedLocationActions = () =>
//   useLocationStore((state) => state.actions);
