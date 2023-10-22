import { useRouter } from "next/router";
import React, { useMemo } from "react";
import { useUserStore } from "~/stores/useLocalUser";
import { api } from "~/utils/api";

// type Props = {};

const MatchingPage = () =>
  // props: Props
  {
    const userId = useUserStore().userId;
    console.log("userId", userId);

    const router = useRouter();
    const matchId = router.query.matchId as string;
    const matchQuery = api.user.getMatchForPage.useQuery({ matchId: matchId });
    // console.log("matchQuery", matchQuery.data.);

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
      <div>
        <h1>Matching Page</h1>
        <body>
          <span className="min-w-40 text-2xl">{companionName}</span>
        </body>
      </div>
    );
  };

export default MatchingPage;
