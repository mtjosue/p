import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs";
import Head from "next/head";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import Modal from "~/components/modal";
import { useUserStore } from "~/stores/useLocalUser";
import { api } from "~/utils/api";

export default function Home() {
  const user = useUser();
  const router = useRouter();
  const firstName = useUserStore().firstName;
  const setFirstName = useUserStore().actions.setFirstName;
  const setUserId = useUserStore().actions.setUserId;
  const [termsAgreed, setTermsAgreed] = useState(false);

  useEffect(() => {
    if (user.user?.id) {
      setUserId(user.user.id);
    }
  }, [setUserId, user.user?.id]);

  const userStatusUpdate = api.user.statusUpdate.useMutation();
  const searchUser = api.user.userCheck.useQuery(
    {
      userId: user.user?.id ?? "",
    },
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
      staleTime: 0,
    },
  );

  useEffect(() => {
    if (!user.isSignedIn) return;
    if (
      !searchUser.isFetching &&
      !searchUser.isLoading &&
      !searchUser.error &&
      !searchUser.isRefetching &&
      !searchUser.data
    ) {
      if (!termsAgreed) {
        setTermsAgreed(true);
      }
    }
  }, [
    searchUser.data,
    searchUser.error,
    searchUser.isFetching,
    searchUser.isLoading,
    searchUser.isRefetching,
    termsAgreed,
    user.isSignedIn,
  ]);

  useEffect(() => {
    if (!searchUser.data) return;

    if (searchUser.data.status !== "waiting") {
      userStatusUpdate.mutate({
        userId: searchUser.data.userId,
        status: "waiting",
      });
    }
    if (searchUser.data && firstName !== searchUser.data.name) {
      setFirstName(searchUser.data.name);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstName, searchUser.data]);

  const onBtnClick = async () => {
    if (user.user?.id) {
      userStatusUpdate.mutate({
        userId: user.user.id,
        status: "looking",
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
        {user.isSignedIn && termsAgreed && <Modal />}
        {user.isSignedIn && (
          <button
            onClick={onBtnClick}
            className="mt-10 rounded-sm bg-sky-400 px-3 py-2"
          >
            Ready
          </button>
        )}
      </main>
    </>
  );
}
