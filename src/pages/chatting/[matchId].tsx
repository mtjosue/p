import { useRouter } from "next/router";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUserStore } from "~/stores/useLocalUser";
import { api } from "~/utils/api";
import {
  type ICameraVideoTrack,
  type IAgoraRTCClient,
  type IAgoraRTCRemoteUser,
  type IRemoteVideoTrack,
  type IMicrophoneAudioTrack,
} from "agora-rtc-sdk-ng";
import { env } from "~/env.mjs";
import Link from "next/link";

const VideoPlayer = ({
  videoTrack,
}: {
  videoTrack: IRemoteVideoTrack | ICameraVideoTrack;
}) => {
  const ref = useRef(null);

  useEffect(() => {
    const playerRef = ref.current;
    if (!videoTrack) return;
    if (!playerRef) return;

    videoTrack.play(playerRef);

    return () => {
      videoTrack.stop();
      videoTrack.unpipe();
      videoTrack.removeAllListeners();
    };
  }, [videoTrack]);

  return (
    <div>
      <div ref={ref} className="h-[200px] w-[200px]"></div>
    </div>
  );
};

const MatchingPage = () => {
  const userId = useUserStore().userId;
  const router = useRouter();
  const token = useUserStore().token;
  const setToken = useUserStore().actions.setToken;
  const matchId = router.query.matchId as string;
  const firstName = useUserStore().firstName;
  const [otherUser, setOtherUser] = useState<IAgoraRTCRemoteUser>();
  const [videoTrack, setVideoTrack] = useState<ICameraVideoTrack>();

  useEffect(() => {
    if (!userId) {
      endMatch.mutate({
        matchid: matchId,
      });
      router.push("/").catch(() => console.log("MATCHING NO USERID PUSH"));
    }
    return () => {
      const disconnect = async () => {
        const client = await connectionPromiseRef.current;
        if (client) {
          client.client.removeAllListeners();

          await client.client.unpublish(client.tracks[1]);
          await client.client.leave();
        }
        if (videoTrack) {
          videoTrack.stop();
          videoTrack.close();
        }
      };
      connectionPromiseRef?.current?.then(disconnect).catch((e) => {
        console.log("ERROR FROM SWAY : ", e);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, router, userId, videoTrack]);

  const connectionPromiseRef = useRef<Promise<{
    tracks: [IMicrophoneAudioTrack, ICameraVideoTrack];
    client: IAgoraRTCClient;
  }> | null>(null);

  const matchQuery = api.user.getMatchForPage.useQuery(
    { matchId: matchId },
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
      staleTime: 0,
    },
  );

  const tokenQuery = api.user.generateToken.useQuery(
    {
      userId: userId,
      matchId: matchQuery.data?.id ?? "",
    },
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
      staleTime: 0,
    },
  );

  const endMatch = api.user.endMatch.useMutation();

  useEffect(() => {
    if (!tokenQuery.data) return;
    setToken(tokenQuery.data);
  }, [setToken, tokenQuery.data]);

  useEffect(() => {
    if (!token) return;

    const connect = async () => {
      const { default: AgoraRTC } = await import("agora-rtc-sdk-ng");

      const client = AgoraRTC.createClient({
        mode: "rtc",
        codec: "vp8",
      });

      await client.join(env.NEXT_PUBLIC_AGORA_APP_ID, matchId, token, userId);

      client?.on("user-published", (user, mediaType) => {
        client
          .subscribe(user, mediaType)
          .then(() => {
            if (mediaType === "video") {
              setOtherUser(user);
            }
            if (mediaType === "audio") {
              otherUser?.audioTrack?.play();
            }
          })
          .catch((e) => {
            console.log("error : ", e);
          });
      });

      const tracks = await AgoraRTC.createMicrophoneAndCameraTracks({
        encoderConfig: {
          sampleSize: 720,
          bitrate: 600,
          sampleRate: 15,
        },
      });

      setVideoTrack(tracks[1]);

      await client.publish(tracks[1]);

      connectionPromiseRef.current = Promise.resolve({ tracks, client });

      return { tracks, client };
    };

    connect().catch(() => {
      console.log("ERROR in CONNECT in [matchId].tsx");
    });

    return () => {
      const disconnect = async () => {
        const client = await connectionPromiseRef.current;
        if (client) {
          client.client.removeAllListeners();

          await client.client.unpublish(client.tracks[1]);
          await client.client.leave();
        }
        if (videoTrack) {
          videoTrack.stop();
          videoTrack.close();
        }
        endMatch.mutate({
          matchid: matchId,
        });
      };
      connectionPromiseRef?.current?.then(disconnect).catch((e) => {
        console.log("ERROR FROM SWAY : ", e);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [matchId, otherUser?.audioTrack, token, userId, videoTrack]);

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

  const otherUserMemo = useMemo(() => {
    if (otherUser) {
      return otherUser;
    }
  }, [otherUser]);

  return (
    <>
      <h1>Matching Page</h1>
      <h2>
        <Link href={"/"}>RETURN HOME</Link>
      </h2>
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <span className="min-w-40 text-2xl">{companionName}</span>
        <span>My Personal Token Generated : {token.slice(0, 10)}</span>

        <div className="grid h-full w-full grid-cols-2 bg-sky-800">
          {videoTrack && (
            <div>
              <span>{firstName}</span>
              <VideoPlayer videoTrack={videoTrack} />
            </div>
          )}
          {otherUserMemo && (
            <div>
              <span>{companionName}</span>

              {otherUserMemo.videoTrack && (
                <VideoPlayer videoTrack={otherUserMemo.videoTrack} />
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default MatchingPage;
