import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import {
  useLocalMediaStream,
  usePeer,
  useSetNoSkips,
  useSetRefreshed,
  useSetSkips,
  useSetSolo,
  useSetStatus,
  useSkips,
  useSolo,
  useUserId,
} from "~/stores/useLocalUser";
import Link from "next/link";

const MatchPage = () => {
  const router = useRouter();
  const matchId = router.query.matchId as string;
  const userId = useUserId();
  const localVideoRef = useRef<null | HTMLVideoElement>(null);
  const remoteVideoRef = useRef<null | HTMLVideoElement>(null);
  const localMediaStream = useLocalMediaStream();
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peer = usePeer();
  const skips = useSkips();
  const setStatus = useSetStatus();
  const setSkips = useSetSkips();
  const setNoSkips = useSetNoSkips();
  const [matchIsRunning, setMatchIsRunning] = useState(true);
  const [countdown, setCountdown] = useState(90);
  const [countdown2, setCountdown2] = useState(8);
  const setRefreshed = useSetRefreshed();
  const setSolo = useSetSolo();
  const solo = useSolo();

  //Cleanup up peer stores in zustand
  const cleanup = () => {
    if (peer) {
      peer.destroy();
    }
  };
  //Match data which decides who calls and who answers
  const { data } = api.user.getMatchForPage.useQuery({
    matchId: matchId,
  });
  //Mutation to end Match so that users are unable to join the same match id session
  const endMatch = api.user.endMatch.useMutation();
  //Mutation to update status and skips
  const userStatusUpdate = api.user.statusUpdate.useMutation();
  //Mutation Skips update
  const skipsUpdate = api.user.skipsUpdate.useMutation();

  //EMP = Element Manipulation Prevention.
  useEffect(() => {
    const checkWindowSize = () => {
      // console.log("window.innerHeight", window.innerHeight);
      // console.log("window.outerHeight", window.outerHeight);
      // console.log("window.innerWidth", window.innerWidth);
      // console.log("window.outerWidth", window.outerWidth);

      // You can perform additional actions here based on the window dimensions
      // For example, redirecting the user or logging the event
      if (
        window.outerHeight - window.innerHeight > 100 ||
        window.outerWidth - window.innerWidth > 10
      ) {
        console.log("DEVELOPER TOOLS OPEN");
        // Execute your code here, e.g., redirect to the home screen
        // router.push("/").catch(() => console.log("failed to push to home"));
      } else {
        console.log("DEVELOPER TOOLS CLOSED");
        // Developer tools are closed, you can decide what action to take
      }
    };

    // Attach the event listener to the resize event
    window.addEventListener("resize", checkWindowSize);

    // Execute the check once on component mount
    checkWindowSize();

    // Clean up the event listener when the component unmounts
    return () => {
      window.removeEventListener("resize", checkWindowSize);
    };
  }, [router]);

  //Pay your skip if you refresh the conversation.
  useEffect(() => {
    if (!userId) {
      setRefreshed(true);
      router
        .push("/")
        .catch(() => console.log("ERROR in router.puush of SKIP"));
    }
  }, [router, setRefreshed, userId]);

  //ending the match as soon as connection is made so no chance
  //of reconnecting to same session once you leave
  useEffect(() => {
    if (
      remoteStream?.active &&
      matchIsRunning &&
      data?.remoteUserId === userId
    ) {
      endMatch.mutate({
        matchid: matchId,
      });
      setMatchIsRunning(false);
      setStatus("waiting");
    }
  }, [
    data?.remoteUserId,
    endMatch,
    matchId,
    matchIsRunning,
    remoteStream?.active,
    setStatus,
    userId,
  ]);

  //If remote user never joins after 7 seconds turn solo on.
  useEffect(() => {
    if (countdown2 === 1 && !remoteStream?.active) {
      setSolo(true);
    }
  }, [countdown2, remoteStream?.active, setSolo]);

  //If solo is on turn end match return to "looking" in "waiting" page
  useEffect(() => {
    if (solo) {
      setSolo(false);
      setStatus("looking");
      cleanup();
      endMatch.mutate({
        matchid: matchId,
      });
      userStatusUpdate.mutate({
        userId: userId,
        status: true,
      });

      router.push(`/waiting`).catch(() => console.log("ERROR IN ROUTER.PUSH"));
    }
    //cleanup
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endMatch, matchId, router, solo, userId, userStatusUpdate]);

  //If localMediaStream ? set and play video stream
  useEffect(() => {
    if (!localMediaStream) return;

    // Display local stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localMediaStream;
      localVideoRef.current
        .play()
        .catch((e: Error) => console.log("Error in local play", e));
    }
  }, [localMediaStream]);

  //Defining peer.on("call", ...) the ANSWERING
  useEffect(() => {
    if (peer) {
      peer.on("call", (call) => {
        if (!localMediaStream) return;

        // Answer the call with local stream
        call.answer(localMediaStream);

        // Once stream begins Set remoteStream to your local "remote video element"
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);
          const remoteVideo = remoteVideoRef.current;
          if (remoteVideo) {
            remoteVideo.srcObject = remoteStream;
            remoteVideo
              ?.play()
              .catch(() => console.log("Error in remote play"));
          }
        });
      });
    }
  }, [localMediaStream, peer]);

  //if localUserId from getMatchForPage is not the userId, the CALL
  useEffect(() => {
    if (!data || !peer) return;
    if (data.tempPeerId && data.localUserId !== userId) {
      console.log("about to call");

      // Call with local stream
      if (!localMediaStream) return;
      const call = peer.call(data.tempPeerId, localMediaStream);

      //Only added to test
      if (call) {
        call.on("stream", (remoteStream) => {
          setRemoteStream(remoteStream);

          // Set the remote video stream
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = remoteStream;
            remoteVideoRef.current
              .play()
              .catch(() => console.log("Error in remote play"));
          }
        });
      }

      // console.log("just tried to call");
    }
    return () => {
      cleanup();
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, userId, localMediaStream, peer]);

  //CountDown
  useEffect(() => {
    if (!remoteStream?.getTracks()[0]) return;
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev > 0) {
          // Your countdown logic
          return prev - 1;
        } else {
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remoteStream]);

  //CountDown2
  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown2((prev) => {
        if (prev > 0) {
          // Your countdown logic
          return prev - 1;
        } else {
          clearInterval(timer);
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // In case users want to auto match with the next person,
  // instead of having to click "Next"
  // useEffect(() => {
  //   const timeOut = setTimeout(() => {
  //     if (!remoteStream?.active) {
  //       endMatch.mutate({
  //         matchid: matchId,
  //         userId: userId,
  //         status: "looking",
  //       });
  //       router
  //         .push("/waiting")
  //         .catch(() => console.log("ERROR in router.puush of SKIP"));
  //     }
  //   }, 4000);
  //   return () => {
  //     clearTimeout(timeOut);
  //   };
  // }, [endMatch, matchId, remoteStream?.active, router, userId]);

  return (
    <div className="flex h-full w-screen flex-col items-center justify-center p-8">
      <h1>HELLO FROM MATCH PAGE</h1>
      <div></div>
      <Link
        href={"/"}
        onClick={() => {
          cleanup();
          if (!remoteStream?.active) {
            router
              .push("/")
              .catch(() => console.log("ERROR in router.puush of SKIP"));
          }
          if (remoteStream?.active && countdown < 1) {
            router
              .push("/")
              .catch(() => console.log("ERROR in router.puush of SKIP"));
          }
          if (remoteStream?.active && countdown > 0) {
            skipsUpdate.mutate({
              userId: userId,
            });
            if (skips < 2) {
              setNoSkips(true);
              router
                .push("/")
                .catch(() => console.log("ERROR in router.puush of SKIP"));
            } else if (skips > 1) {
              setSkips(skips - 1);
              router
                .push("/")
                .catch(() => console.log("ERROR in router.puush of SKIP"));
            }
          }
        }}
      >
        Return Home
      </Link>
      <div className="min-h-60 min-w-60 flex">
        <video
          ref={localVideoRef}
          className="h-[200px] w-[200px]"
          autoPlay={true}
          playsInline={true}
          muted={true}
        ></video>
        {remoteStream?.active ? (
          ""
        ) : (
          <div className="flex h-[100px] w-[100px] items-center justify-center">
            Loading...
          </div>
        )}
        <video
          ref={remoteVideoRef}
          className={`h-[200px] w-[200px] ${
            countdown > 90
              ? "blur-[7px]"
              : countdown > 85
              ? "blur-[6.8px]"
              : countdown > 80
              ? "blur-[6.6px]"
              : countdown > 75
              ? "blur-[6.4px]"
              : countdown > 70
              ? "blur-[6.2px]"
              : countdown > 65
              ? "blur-[6px]"
              : countdown > 60
              ? "blur-[5.8px]"
              : countdown > 55
              ? "blur-[5.6px]"
              : countdown > 50
              ? "blur-[5.4px]"
              : countdown > 45
              ? "blur-[5.2px]"
              : countdown > 40
              ? "blur-[5px]"
              : countdown > 38
              ? "blur-[4.8px]"
              : countdown > 36
              ? "blur-[4.6px]"
              : countdown > 34
              ? "blur-[4.4px]"
              : countdown > 32
              ? "blur-[4.2px]"
              : countdown > 30
              ? "blur-[4px]"
              : countdown > 28
              ? "blur-[3.8px]"
              : countdown > 26
              ? "blur-[3.6px]"
              : countdown > 24
              ? "blur-[3.4px]"
              : countdown > 22
              ? "blur-[3.2px]"
              : countdown > 20
              ? "blur-[3px]"
              : countdown > 18
              ? "blur-[2.6px]"
              : countdown > 16
              ? "blur-[2.2px]"
              : countdown > 14
              ? "blur-[1.8px]"
              : countdown > 12
              ? "blur-[1.4px]"
              : countdown > 10
              ? "blur-[1px]"
              : countdown > 8
              ? "blur-[0.6px]"
              : countdown > 0
              ? "blur-[0.3px]"
              : "blur-none"
          }`}
          autoPlay={true}
          playsInline={true}
          muted={true}
        ></video>
      </div>

      <div>{countdown}</div>
      <div>
        <button
          className="border p-2 font-semibold"
          onClick={() => {
            cleanup();
            setStatus("looking");
            if (!remoteStream?.active) {
              userStatusUpdate.mutate({
                userId: userId,
                status: true,
              });
              router
                .push("/waiting")
                .catch(() => console.log("ERROR in router.puush of SKIP"));
            }
            if (remoteStream?.active && countdown < 1) {
              userStatusUpdate.mutate({
                userId: userId,
                status: true,
              });
              router
                .push("/waiting")
                .catch(() => console.log("ERROR in router.puush of SKIP"));
            }
            if (remoteStream?.active && countdown > 0) {
              if (skips < 2) {
                setNoSkips(true);
                router
                  .push("/")
                  .catch(() => console.log("ERROR in router.puush of SKIP"));
              } else if (skips > 1) {
                skipsUpdate.mutate({
                  userId: userId,
                  status: true,
                });
                setSkips(skips - 1);
                router
                  .push("/waiting")
                  .catch(() => console.log("ERROR in router.puush of SKIP"));
              }
            }
          }}
        >
          Skip
        </button>
      </div>
    </div>
  );
};

export default MatchPage;
