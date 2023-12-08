import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Leaderboard from "~/components/leaderboard";
import Modal from "~/components/modal";
import classNames from "~/lib/classNames";
import {
  useAddReport,
  useBanned,
  useFirstLoad,
  useLocalMediaStream,
  useNoSkips,
  useReports,
  useSetBanned,
  useSetFirstLoad,
  useSetLastReport,
  useSetLocalMediaStream,
  useSetNoSkips,
  useSetSkips,
  useSetUserId,
  useUserId,
} from "~/stores/useLocalUser";
import { api } from "~/utils/api";

export default function Home() {
  const router = useRouter();
  const firstLoad = useFirstLoad();
  const setFirstLoad = useSetFirstLoad();
  const user = useUser();
  const userId = useUserId();
  const setUserId = useSetUserId();
  const setSkips = useSetSkips();
  const setNoSkips = useSetNoSkips();
  const noSkips = useNoSkips();
  const localMediaStream = useLocalMediaStream();
  const setLocalMediaStream = useSetLocalMediaStream();
  const [termsAgreed, setTermsAgreed] = useState(true);
  const banned = useBanned();
  const setBanned = useSetBanned();
  const reports = useReports();
  const addReport = useAddReport();
  const setLastReport = useSetLastReport();

  useEffect(() => {
    if (reports >= 7) {
      setBanned(true);
    }
  }, [reports, setBanned]);

  const replenish = api.user.replenish.useMutation();
  const userStatusUpdate = api.user.statusUpdate.useMutation();
  const searchUser = api.user.userCheck.useQuery(
    {
      userId: user.user?.id ?? "",
      firstLoad: firstLoad,
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchOnMount: false,
      retryOnMount: false,
      //
      // enabled: false,
      refetchInterval: 0,
      cacheTime: 0,
      staleTime: 0,
    },
  );

  //Replenish
  useEffect(() => {
    if (!searchUser.data) return;
    const then = searchUser.data
      ? new Date(searchUser.data.lastReplenish as unknown as Date)
      : null;
    const now = new Date();

    if (
      then &&
      (now.getDate() !== then.getDate() ||
        now.getMonth() !== then.getMonth() ||
        now.getFullYear() !== then.getFullYear())
    ) {
      replenish.mutate({ userId: userId });
    }
  }, [replenish, searchUser.data, userId]);

  //Getting local media stream.
  const getLocalMediaStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    setLocalMediaStream(mediaStream);
  };

  //RETRYING Getting local media stream if you dont have it yet
  useEffect(() => {
    if (!localMediaStream) {
      getLocalMediaStream().catch(() =>
        console.log(
          "ERROR IN... useEffect in Waiting executing getLocalMediaStream",
        ),
      );
    }
    // getLocalMediaStream is sort of a query like a promise so it triggers endlessly
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMediaStream]);

  //Searchfor yourself as User and set User properties locally
  useEffect(() => {
    if (searchUser.data) {
      setUserId(searchUser.data.userId);
      if (searchUser.data.skips < 2) {
        setNoSkips(true);
        setSkips(0);
      } else if (searchUser.data.skips > 1) {
        setSkips(searchUser.data.skips);
      }
      if (typeof searchUser.data.reports === "number") {
        const num = searchUser.data.reports as unknown as number;
        addReport(num);
      }
      if (searchUser.data.lastReport) {
        const lastOne = searchUser.data.lastReport;
        setLastReport(lastOne);
      }
      setFirstLoad(false);
    }
  }, [
    addReport,
    searchUser.data,
    setFirstLoad,
    setLastReport,
    setNoSkips,
    setSkips,
    setUserId,
  ]);

  //If we're not actively searching and we have gotten back nothing
  //Open Terms of agreement to create new user
  useEffect(() => {
    if (!user.isSignedIn) return;
    if (
      !searchUser.isFetching &&
      !searchUser.isLoading &&
      !searchUser.isRefetching &&
      !searchUser.error &&
      !searchUser.data
    ) {
      if (termsAgreed && firstLoad) {
        setTermsAgreed(false);
      }
    }
  }, [
    firstLoad,
    searchUser.data,
    searchUser.error,
    searchUser.isFetching,
    searchUser.isLoading,
    searchUser.isRefetching,
    termsAgreed,
    user.isSignedIn,
  ]);

  //if somehow we get to the home page and the user status is not waiting
  //Set it to 'waiting' in the db
  useEffect(() => {
    if (!searchUser.data) return;
    if (searchUser.data.status !== "waiting") {
      userStatusUpdate.mutate({
        userId: searchUser.data.userId,
        status: false,
        skips: null,
        hypeLikes: null,
        hypeHearts: null,
        hypeLaughs: null,
        hypeWoahs: null,
        hypeFires: null,
        hypeClaps: null,
      });
    }
  }, [searchUser.data, userStatusUpdate]);

  //On button click Set user status to 'looking'
  const onBtnClick = async () => {
    if (user.user?.id) {
      userStatusUpdate.mutate({
        userId: user.user.id,
        status: true,
        skips: null,
        hypeLikes: null,
        hypeHearts: null,
        hypeLaughs: null,
        hypeWoahs: null,
        hypeFires: null,
        hypeClaps: null,
      });
    }
    await router.push("/waiting");
  };

  const [selected, select] = useState("");
  const [height, setHeight] = useState<number>(1);

  useEffect(() => {
    const handleResize = () => {
      setHeight(window.innerHeight);
      console.log("window.innerHeight", window.innerHeight);
    };

    // Initial adjustment
    handleResize();

    // Add event listener for window resize
    window.addEventListener("resize", handleResize);

    // Clean up the event listener on component unmount
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Pixelmate</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main
        className={classNames(
          `flex w-full flex-col items-center justify-center gap-y-3 bg-[#121212]`,
        )}
        style={{
          minHeight: `${height}px`,
        }}
      >
        <div className="flex min-w-[92%] justify-between rounded-xl bg-[#1d1d1d] py-3 pl-3 font-mono text-xl text-white lg:min-w-[35%]">
          Leaderboards :
        </div>
        <Leaderboard select={select} selected={selected} />
        <div className="flex min-h-[5rem] min-w-[92%] justify-between rounded-xl bg-[#1d1d1d] py-3 pl-3 pr-3 text-sm text-white md:text-xl lg:min-w-[35%]">
          {user.isSignedIn && !termsAgreed && <Modal />}
          <div className="flex items-center">
            <h2 className="font-mono">
              Hey <br />
              {user.user?.firstName}!
            </h2>
            <span className="font-mono">
              {!user.isSignedIn && <SignInButton />}
            </span>
          </div>
          {user.isSignedIn && (
            <button
              disabled={noSkips || banned}
              onClick={onBtnClick}
              className={`${
                noSkips
                  ? "bg-slate-500"
                  : "bg-[#147bd1]/60 ring-2 ring-[#147bd1]"
              } max-w-[13rem] rounded-lg py-2 font-mono text-base md:max-w-[16rem]`}
            >
              {noSkips || banned ? (
                <span>Done for today :3 come back tomorrow!</span>
              ) : (
                <span className="px-9 text-2xl">Ready</span>
              )}
            </button>
          )}
        </div>
        <div className="flex min-w-[92%] justify-between rounded-xl text-white lg:min-w-[35%]">
          {!!user.isSignedIn && (
            <div className="rounded-lg border-2 border-zinc-800 px-3 font-mono text-zinc-700">
              <SignOutButton />
            </div>
          )}
        </div>
      </main>
    </>
  );
}
