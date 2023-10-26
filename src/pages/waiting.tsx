import { useUser } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useUserStore } from "~/stores/useLocalUser";
import { api } from "~/utils/api";

const WaitingPage = () => {
  const router = useRouter();
  const setToken = useUserStore().actions.setToken;
  const setUserId = useUserStore().actions.setUserId;
  const setFirstName = useUserStore().actions.setFirstName;
  const userId = useUserStore().userId;
  const user = useUser();
  console.log("userId!@#$%^&*()_+_)(*&^%$#@!", userId);

  useEffect(() => {
    if (!userId) {
      if (user.user) {
        if (user.user.id) {
          setUserId(user.user.id);
          setFirstName(user.user?.firstName ?? "");
        }
      }
    }
  }, [setFirstName, setUserId, user.user, userId]);

  const searchMatch = api.user.searchMatch.useQuery(
    { userId: userId },
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
      staleTime: 0,
    },
  );
  const getMatch = api.user.getMatch.useQuery(
    { userId: userId },
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
      staleTime: 0,
    },
  );

  useEffect(() => {
    if (searchMatch.data) {
      setToken(searchMatch.data.id);
      if (userId) {
        router.push(`/chatting/${searchMatch.data.id}`).catch(() => {
          console.log("error");
        });
      } else {
        router.push("/").catch(() => {
          console.log("error");
        });
      }
    }
  }, [router, searchMatch.data, setToken, userId]);

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
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [getMatch]);

  return (
    <main
      onBlur={() => {
        // console.log("HIYOOOOOOOOOOOOOOOOO");
      }}
      className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]"
    >
      <div className="text-white">
        <h2>Waiting for Users to Connect With...</h2>
        <Link href={"/"}>RETURN HOME</Link>
      </div>
    </main>
  );
};

export default WaitingPage;
