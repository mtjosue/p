import React, {
  useMemo,
  type Dispatch,
  type SetStateAction,
  useState,
  useEffect,
} from "react";
import classNames from "~/lib/classNames";
import { api } from "~/utils/api";
import first from "../../public/icons8-first-place-ribbon-64.png";
import second from "../../public/icons8-second-place-ribbon-64.png";
import third from "../../public/icons8-third-place-ribbon-64.png";
import likesBg from "../../public/likesBg.jpg";
import heartsBg from "../../public/heartsBg1.jpg";
import laughsBg from "../../public/laughsBg3.jpg";
import woahsBg from "../../public/woahsBg.jpg";
import firesBg from "../../public/firesBg.jpg";
import clapsBg from "../../public/clapsBg.jpg";
import Image from "next/image";

const Leaderboard = ({
  select,
  selected,
}: {
  select: Dispatch<SetStateAction<string>>;
  selected: string;
}) => {
  const emojis = useMemo(() => {
    return [
      { moji: "👍", color: "#147bd1" },
      { moji: "heart", color: "#d1156b" },
      //   { moji: "🤣", color: "#f7ea48" },
      { moji: "🤣", color: "#c5bd50" },
      { moji: "😯", color: "#ff7f41" },
      { moji: "🔥", color: "#e03c31" },
      { moji: "👏", color: "#753bbd" },
    ];
  }, []);
  const [likes, setLikes] = useState(false);
  const [hearts, setHearts] = useState(false);
  const [laughs, setLaughs] = useState(false);
  const [woahs, setWoahs] = useState(false);
  const [fires, setFires] = useState(false);
  const [claps, setClaps] = useState(false);

  useEffect(() => {
    if (selected === "👍") {
      setLikes(true);
    }
    if (selected === "heart") {
      setHearts(true);
    }
    if (selected === "🤣") {
      setLaughs(true);
    }
    if (selected === "😯") {
      setWoahs(true);
    }
    if (selected === "🔥") {
      setFires(true);
    }
    if (selected === "👏") {
      setClaps(true);
    }
  }, [selected]);

  const { data: likesBoard } = api.user.queryLikesBoard.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retryOnMount: false,
    enabled: likes,
    refetchInterval: 0,
    cacheTime: 0,
    staleTime: 0,
  });
  const { data: heartsBoard } = api.user.queryHeartsBoard.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retryOnMount: false,
    enabled: hearts,
    refetchInterval: 0,
    cacheTime: 0,
    staleTime: 0,
  });
  const { data: laughsBoard } = api.user.queryLaughsBoard.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retryOnMount: false,
    enabled: laughs,
    refetchInterval: 0,
    cacheTime: 0,
    staleTime: 0,
  });
  const { data: woahsBoard } = api.user.queryWoahsBoard.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retryOnMount: false,
    enabled: woahs,
    refetchInterval: 0,
    cacheTime: 0,
    staleTime: 0,
  });
  const { data: firesBoard } = api.user.queryFiresBoard.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retryOnMount: false,
    enabled: fires,
    refetchInterval: 0,
    cacheTime: 0,
    staleTime: 0,
  });
  const { data: clapsBoard } = api.user.queryClapsBoard.useQuery(undefined, {
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retryOnMount: false,
    enabled: claps,
    refetchInterval: 0,
    cacheTime: 0,
    staleTime: 0,
  });

  const imgs = [first, second, third];

  type UserWithReactions = {
    userId: string;
    name: string;
    hypeLikes?: number;
    hypeHearts?: number;
    hypeLaughs?: number;
    hypeWoahs?: number;
    hypeFires?: number;
    hypeClaps?: number;
  };

  const makeBoard = ({
    inputIdx,
    userArr,
  }: {
    inputIdx: number;
    userArr: (UserWithReactions | undefined)[] | undefined;
  }) => {
    return (
      <div className="board flex max-h-[15rem] w-full flex-col overflow-auto px-4">
        {userArr?.map((user, idx) => {
          if (idx < 3) {
            return (
              <div
                key={`user-${idx}`}
                className={classNames(
                  "flex w-full items-center gap-x-3 rounded-xl",
                )}
              >
                <Image
                  src={imgs[idx]?.src as unknown as string}
                  alt=""
                  width={50}
                  height={50}
                  className="relative z-20"
                />
                <span
                  className={classNames(
                    "text-base",
                    "flex w-full justify-between",
                  )}
                >
                  <span className="z-10 -ml-7 flex w-full items-center rounded-lg bg-[#1d1d1d] px-6 font-mono ring-2 ring-zinc-700">
                    {user?.name}
                  </span>
                  <span
                    className={classNames(
                      "-ml-3 flex w-3/5 justify-center rounded-lg px-6 font-mono text-lg font-bold",
                      inputIdx === 0 ? "ring-2 ring-[#147bd1]/60" : "",
                      inputIdx === 1 ? "ring-2 ring-[#d1156b]/60" : "",
                      inputIdx === 2 ? "ring-2 ring-[#c5bd50]/60" : "",
                      inputIdx === 3 ? "ring-2 ring-[#ff7f41]/60" : "",
                      inputIdx === 4 ? "ring-2 ring-[#e03c31]/60" : "",
                      inputIdx === 5 ? "ring-2 ring-[#753bbd]/60" : "",
                    )}
                    style={{
                      backgroundImage: `${
                        inputIdx === 0
                          ? `url(${likesBg.src})`
                          : inputIdx === 1
                          ? `url(${heartsBg.src})`
                          : inputIdx === 2
                          ? `url(${laughsBg.src})`
                          : inputIdx === 3
                          ? `url(${woahsBg.src})`
                          : inputIdx === 4
                          ? `url(${firesBg.src})`
                          : inputIdx === 5
                          ? `url(${clapsBg.src})`
                          : ""
                      }`,
                      backgroundSize: "cover",
                    }}
                  >
                    {user?.hypeLikes}
                    {user?.hypeHearts}
                    {user?.hypeLaughs}
                    {user?.hypeWoahs}
                    {user?.hypeFires}
                    {user?.hypeClaps}
                  </span>
                </span>
              </div>
            );
          } else {
            return (
              <div
                key={`user-${idx}`}
                className={classNames(
                  "my-1 flex w-full items-center gap-x-3 rounded-xl",
                )}
              >
                <div className="z-20 ml-[0.45rem] flex h-[35px] min-w-fit items-center justify-center rounded-lg border-2 border-zinc-600 bg-zinc-700 px-2 font-mono lg:ml-2.5">
                  {idx + 1}
                </div>
                <span
                  className={classNames(
                    "text-base",
                    "flex w-full justify-between",
                  )}
                >
                  <span className="z-10 -ml-7 flex w-full items-center rounded-lg bg-[#1d1d1d] pl-8 pr-6 font-mono ring-2 ring-zinc-700">
                    {user?.name}
                  </span>
                  <span
                    className={classNames(
                      "-ml-3 flex w-3/5 justify-center rounded-lg px-6 font-mono text-lg font-bold",
                      inputIdx === 0 ? "ring-2 ring-[#147bd1]/60" : "",
                      inputIdx === 1 ? "ring-2 ring-[#d1156b]/60" : "",
                      inputIdx === 2 ? "ring-2 ring-[#c5bd50]/60" : "",
                      inputIdx === 3 ? "ring-2 ring-[#ff7f41]/60" : "",
                      inputIdx === 4 ? "ring-2 ring-[#e03c31]/60" : "",
                      inputIdx === 5 ? "ring-2 ring-[#753bbd]/60" : "",
                    )}
                    style={{
                      backgroundImage: `${
                        inputIdx === 0
                          ? `url(${likesBg.src})`
                          : inputIdx === 1
                          ? `url(${heartsBg.src})`
                          : inputIdx === 2
                          ? `url(${laughsBg.src})`
                          : inputIdx === 3
                          ? `url(${woahsBg.src})`
                          : inputIdx === 4
                          ? `url(${firesBg.src})`
                          : inputIdx === 5
                          ? `url(${clapsBg.src})`
                          : ""
                      }`,
                      backgroundSize: "cover",
                    }}
                  >
                    {user?.hypeLikes}
                    {user?.hypeHearts}
                    {user?.hypeLaughs}
                    {user?.hypeWoahs}
                    {user?.hypeFires}
                    {user?.hypeClaps}
                  </span>
                </span>
              </div>
            );
          }
        })}
      </div>
    );
  };

  return (
    <div className="min-h-[5rem] min-w-[75%] space-y-3 rounded-xl bg-[#1d1d1d] py-3 text-white lg:min-w-[35%]">
      <div id="leaderNav" className="flex justify-evenly text-3xl">
        {emojis.map((moji) => {
          return (
            <div
              key={moji.moji}
              onClick={() => {
                select(moji.moji);
              }}
              className={classNames(
                "rounded-xl p-2",
                moji.moji === "👍"
                  ? selected === "👍"
                    ? "ring-2 ring-[#147bd1]"
                    : "hover:ring-2 hover:ring-[#147bd1]"
                  : "",
                moji.moji === "heart"
                  ? selected === "heart"
                    ? "ring-2 ring-[#d1156b]"
                    : "hover:ring-2 hover:ring-[#d1156b]"
                  : "",
                moji.moji === "🤣"
                  ? selected === "🤣"
                    ? "ring-2 ring-[#f7ea48]"
                    : "hover:ring-2 hover:ring-[#f7ea48]"
                  : "",
                moji.moji === "😯"
                  ? selected === "😯"
                    ? "ring-2 ring-[#ff7f41]"
                    : "hover:ring-2 hover:ring-[#ff7f41]"
                  : "",
                moji.moji === "🔥"
                  ? selected === "🔥"
                    ? "ring-2 ring-[#e03c31]"
                    : "hover:ring-2 hover:ring-[#e03c31]"
                  : "",
                moji.moji === "👏"
                  ? selected === "👏"
                    ? "ring-2 ring-[#753bbd]"
                    : "hover:ring-2 hover:ring-[#753bbd]"
                  : "",
              )}
            >
              {moji.moji === "heart" ? "\u2764\uFE0F" : moji.moji}
            </div>
          );
        })}
      </div>
      {selected === "👍" && makeBoard({ inputIdx: 0, userArr: likesBoard })}
      {selected === "heart" && makeBoard({ inputIdx: 1, userArr: heartsBoard })}
      {selected === "🤣" && makeBoard({ inputIdx: 2, userArr: laughsBoard })}
      {selected === "😯" && makeBoard({ inputIdx: 3, userArr: woahsBoard })}
      {selected === "🔥" && makeBoard({ inputIdx: 4, userArr: firesBoard })}
      {selected === "👏" && makeBoard({ inputIdx: 5, userArr: clapsBoard })}
    </div>
  );
};

export default Leaderboard;
