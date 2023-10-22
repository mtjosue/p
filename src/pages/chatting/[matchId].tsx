import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { useUserStore } from "~/stores/useLocalUser";
import { api } from "~/utils/api";

// type Props = {};
// props: Props

const MatchingPage = () => {
  const userId = useUserStore().userId;
  console.log("userId", userId);

  const router = useRouter();
  const matchId = router.query.matchId as string;
  const matchQuery = api.user.getMatchForPage.useQuery({ matchId: matchId });
  const tokenQuery = api.user.generateToken.useQuery({
    userId: userId,
    matchId: matchId,
  });
  const [value, setValue] = useState("");

  useEffect(() => {
    if (!tokenQuery.data) return;
    if (tokenQuery.data) {
      setValue(tokenQuery.data);
    }
  }, [tokenQuery.data]);

  const companionName = useMemo(() => {
    if (userId === matchQuery.data?.sinkUser.userId) {
      return matchQuery.data?.sourceUser.name;
    } else if (userId === matchQuery.data?.sourceUser.userId) {
      return matchQuery.data?.sinkUser.name;
    }
  }, [
    matchQuery.data?.sinkUser.name,
    matchQuery.data?.sinkUser.userId,
    matchQuery.data?.sourceUser.name,
    matchQuery.data?.sourceUser.userId,
    userId,
  ]);

  return (
    <>
      <h1>Matching Page</h1>
      <body className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <span className="min-w-40 text-2xl">{companionName}</span>
        <span>My Personal Token Generated : {value}</span>
      </body>
    </>
  );
};

export default MatchingPage;
