import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useUserStore } from "~/stores/useLocalUser";
import { api } from "~/utils/api";

// type Props = {};

const WaitingPage = () =>
  // props: Props
  {
    const userId = useUserStore().userId;
    const searchMatch = api.user.searchMatch.useQuery({ userId: userId });
    const getMatch = api.user.getMatch.useQuery({ userId: userId });

    const router = useRouter();
    console.log("data.1", searchMatch.data);

    useEffect(() => {
      if (searchMatch.data) {
        router.push(`/chatting/${searchMatch.data.id}`).catch(() => {
          console.log("error");
        });
      }
    }, [router, searchMatch.data, userId]);

    useEffect(() => {
      if (getMatch.data) {
        router.push(`/chatting/${getMatch.data.id}`).catch(() => {
          console.log("error");
        });
      }
    }, [getMatch.data, router, userId]);

    useEffect(() => {
      const interval = setInterval(() => {
        getMatch.refetch().catch(() => {
          console.log("ERROR");
        });
      }, 7000);
      return () => {
        clearInterval(interval);
      };
    }, [getMatch]);

    return (
      <main
        onBlur={() => {
          console.log("HIYOOOOOOOOOOOOOOOOO");
        }}
        className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]"
      >
        <div className="text-white">
          <h2>Waiting for Users to Connect With...</h2>
        </div>
      </main>
    );
  };

export default WaitingPage;
