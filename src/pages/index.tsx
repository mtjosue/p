import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Modal from "~/components/modal";
import {
  useAddReport,
  useBanned,
  useFirstLoad,
  useLocalMediaStream,
  useNoSkips,
  useReports,
  useSetBanned,
  useSetFirstLoad,
  useSetLocalMediaStream,
  useSetNoSkips,
  useSetSkips,
  useSetUserId,
} from "~/stores/useLocalUser";
import { api } from "~/utils/api";

export default function Home() {
  const router = useRouter();
  const firstLoad = useFirstLoad();
  const setFirstLoad = useSetFirstLoad();
  const user = useUser();
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

  useEffect(() => {
    if (reports >= 7) {
      setBanned(true);
    }
  }, [reports, setBanned]);

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
      console.log("searchUser.data.skips", searchUser.data.skips);

      if (searchUser.data.skips < 2) {
        setNoSkips(true);
        setSkips(0);
      } else if (searchUser.data.skips > 1) {
        setSkips(searchUser.data.skips);
      }
      addReport(searchUser.data.reports as number);
      setFirstLoad(false);
    }
  }, [
    addReport,
    searchUser.data,
    setFirstLoad,
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
        status: null,
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

  return (
    <>
      <Head>
        <title>Pixelmate</title>
        <meta name="description" content="Generated by create-t3-app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="text-white">
          <h1>Hello Welcome</h1>
          {!user.isSignedIn && <SignInButton />}
          {!!user.isSignedIn && <SignOutButton />}
        </div>
        {user.isSignedIn && !termsAgreed && <Modal />}
        {user.isSignedIn && (
          <button
            disabled={noSkips || banned}
            onClick={onBtnClick}
            className={`mt-10 rounded-sm ${
              noSkips ? "bg-slate-500" : "bg-sky-500"
            } px-3 py-2`}
          >
            {noSkips || banned
              ? "Done for today ^.^, come back tomorrow!"
              : "Ready"}
          </button>
        )}
        {/* <ParticleCanvas /> */}
      </main>
    </>
  );
}
