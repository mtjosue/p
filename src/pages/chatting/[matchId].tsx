import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import {
  useAddReport,
  useLocalMediaStream,
  usePeer,
  useRemoteUserId,
  useReports,
  useSetBanned,
  useSetLastReport,
  useSetNoSkips,
  useSetRefreshed,
  useSetRemoteUserId,
  useSetSkips,
  useSetSolo,
  useSkips,
  useSolo,
  useUserId,
} from "~/stores/useLocalUser";
import type { DataConnection } from "peerjs";
import {
  useAddSentClap,
  useAddSentFire,
  useAddSentHeart,
  useAddSentLaugh,
  useAddSentLike,
  useAddSentWoah,
  useSentClap,
  useSentFire,
  useSentHeart,
  useSentLaugh,
  useSentLike,
  useSentWoah,
  usePhone,
  useResetReactions,
  useSetPhone,
  useResLike,
  useAddResLike,
  useResHeart,
  useAddResHeart,
  useResLaugh,
  useAddResLaugh,
  useResWoah,
  useAddResWoah,
  useResFire,
  useAddResFire,
  useResClap,
  useAddResClap,
} from "~/stores/useGeneral";
import classNames from "~/lib/classNames";
import ParticleCanvas from "~/components/particle";
import MyParticle from "~/components/myParticle";
import MobileProgressCanvasButton from "~/components/mobileParticle";
import ReportModal from "~/components/reportModal";

const MatchPage = () => {
  const router = useRouter();
  const matchId = router.query.matchId as string;
  const userId = useUserId();
  const remoteUserId = useRemoteUserId();
  const setRemoteUserId = useSetRemoteUserId();
  const localVideoRef = useRef<null | HTMLVideoElement>(null);
  const remoteVideoRef = useRef<null | HTMLVideoElement>(null);
  const localMediaStream = useLocalMediaStream();
  const remoteAudioRef = useRef<null | HTMLAudioElement>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const peer = usePeer();
  const skips = useSkips();
  const setSkips = useSetSkips();
  const setNoSkips = useSetNoSkips();
  const [countdown, setCountdown] = useState(90);
  const [countdown2, setCountdown2] = useState(7);
  const setRefreshed = useSetRefreshed();
  const setSolo = useSetSolo();
  const solo = useSolo();
  const [dolo, setDolo] = useState(false);
  const resetReactions = useResetReactions();
  const [reportModal, toggleReport] = useState(false);
  const reports = useReports();
  const addReport = useAddReport();
  const setBanned = useSetBanned();
  const setLastReport = useSetLastReport();

  //Reports? Banned.
  useEffect(() => {
    if (reports >= 7) {
      setBanned(true);
      router
        .push("/")
        .catch(() => console.log("Error in pushing because banned"));
    }
  }, [reports, router, setBanned]);

  //Cleanup up peer stores in zustand && RemoteUserId
  const cleanup = () => {
    if (peer) {
      peer.destroy();
    }
    if (remoteUserId) {
      setRemoteUserId(null);
    }
    resetReactions();
  };

  //Match data which decides who calls and who answers
  const { data } = api.user.getMatchForPage.useQuery(
    {
      matchId: matchId,
    },
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
      staleTime: 0,
    },
  );

  //Mutation to update status and everything else
  const statusUpdate = api.user.statusUpdate.useMutation();

  const [end, setEnd] = useState(false);
  const [ended, setEnded] = useState(false);
  //Mutation to end match
  const endMatch = api.user.endMatch.useMutation();

  //Saving remoteUserId in case we need to report
  useEffect(() => {
    if (remoteUserId) return;
    if (data) {
      if (data.localUserId === userId && !remoteUserId) {
        setRemoteUserId(data.remoteUserId);
      }
      if (data.remoteUserId === userId && !remoteUserId) {
        setRemoteUserId(data.localUserId);
      }
    }
  }, [remoteUserId, data, userId, setRemoteUserId]);

  //If refreshed there wont be a userId, push to home / setRefreshed(true).
  useEffect(() => {
    if (!userId) {
      setRefreshed(true);
      router
        .push("/")
        .catch(() => console.log("ERROR in router.puush of SKIP"));
    }
  }, [router, setRefreshed, userId]);

  //If remote user never joins after 6 seconds turn solo on.
  useEffect(() => {
    if (countdown2 === 1 && !remoteStream?.active) {
      setSolo(true);
    }
  }, [countdown2, remoteStream?.active, setSolo]);

  //If solo is on turn dolo on, I know I know should be refactored
  useEffect(() => {
    if (solo) {
      setSolo(false);
      setDolo(true);
      setEnd(true);
    }
  }, [setSolo, solo]);

  //When local video play does not work the first time
  const [repeatLocal, setRepeatLocal] = useState(true);
  const [repeatRemote, setRepeatRemote] = useState(false);

  //Defining the ANSWERING if peer
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
            setRepeatRemote(true);
          }
        });
      });
      peer.on("connection", (connection) => {
        setPeerConnection(connection);
      });
    }
  }, [localMediaStream, peer]);

  //Defining the CALLING if localUserId from getMatchForPage is not the userId
  useEffect(() => {
    if (!data || !peer) return;
    if (data.tempPeerId && data.localUserId !== userId) {
      console.log("about to call");
      setEnd(true);
      // Call with local stream
      if (!localMediaStream) return;
      const call = peer.call(data.tempPeerId, localMediaStream);
      // Data connection with peer
      const conn = peer.connect(data.tempPeerId);
      //Setting Peer Data Connection as the Caller
      setPeerConnection(conn);

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

  const [peerConnection, setPeerConnection] = useState<null | DataConnection>(
    null,
  );

  const sentLike = useSentLike();
  const addSentLike = useAddSentLike();
  const sentHeart = useSentHeart();
  const addSentHeart = useAddSentHeart();
  const sentLaugh = useSentLaugh();
  const addSentLaugh = useAddSentLaugh();
  const sentWoah = useSentWoah();
  const addSentWoah = useAddSentWoah();
  const sentFire = useSentFire();
  const addSentFire = useAddSentFire();
  const sentClap = useSentClap();
  const addSentClap = useAddSentClap();
  const resLike = useResLike();
  const addResLike = useAddResLike();
  const resHeart = useResHeart();
  const addResHeart = useAddResHeart();
  const resLaugh = useResLaugh();
  const addResLaugh = useAddResLaugh();
  const resWoah = useResWoah();
  const addResWoah = useAddResWoah();
  const resFire = useResFire();
  const addResFire = useAddResFire();
  const resClap = useResClap();
  const addResClap = useAddResClap();
  const [emojiArr] = useState<string[]>([]);
  const [sentEmojiArr] = useState<string[]>([]);

  //if you have not called then there is no data connection
  //and we must establish one
  useEffect(() => {
    if (peerConnection) {
      peerConnection.on("data", (data) => {
        const data2 = data as { cat: boolean; type: number };
        if (data2.cat) {
          if (data2.type === 1) {
            addResLike();
            emojiArr.push("👍");
          }
          if (data2.type === 2) {
            addResHeart();
            emojiArr.push("heart");
          }
          if (data2.type === 3) {
            addResLaugh();
            emojiArr.push("🤣");
          }
          if (data2.type === 4) {
            addResWoah();
            emojiArr.push("😯");
          }
          if (data2.type === 5) {
            addResFire();
            emojiArr.push("🔥");
          }
          if (data2.type === 6) {
            addResClap();
            emojiArr.push("👏");
          }
        }
        if (!data2.cat) {
          if (data2.type === 1) {
            addReport(1);
            setLastReport(new Date());
          }
          if (data2.type === 2) {
            addReport(2);
            setLastReport(new Date());
          }
          if (data2.type === 3) {
            addReport(3);
            setLastReport(new Date());
          }
          if (data2.type === 4) {
            setEnded(true);
          }
        }
      });
    }
  }, [
    addReport,
    addResClap,
    addResFire,
    addResHeart,
    addResLaugh,
    addResLike,
    addResWoah,
    emojiArr,
    peerConnection,
    setLastReport,
  ]);

  //if end is true
  useEffect(() => {
    if (end && !ended) {
      setEnd(false);
      setEnded(true);
      endMatch.mutate({
        matchId: matchId,
      });
    }
  }, [end, endMatch, ended, matchId]);

  useEffect(() => {
    if (end) {
      if (peerConnection) {
        const a = async () => {
          await peerConnection.send({
            cat: false,
            type: 4,
          });
        };
        a().catch(() => console.log("Error in ending match"));
      }
    }
  }, [end, peerConnection]);

  useEffect(() => {
    if (emojiArr.length > 1) {
      emojiArr.shift();
    }
    if (sentEmojiArr.length > 1) {
      sentEmojiArr.shift();
    }
  }, [emojiArr, sentEmojiArr]);

  const sendEmoji = async (num: number) => {
    if (peerConnection) {
      await peerConnection.send({
        cat: true,
        type: num,
      });
    }
  };

  const sendReport = async (num: number) => {
    if (peerConnection) {
      await peerConnection.send({
        cat: false,
        type: num,
      });
    }
  };

  const phone = usePhone();
  const setPhone = useSetPhone();

  //Check window size
  useEffect(() => {
    const checkWindowSize = () => {
      if (window.innerWidth <= 435) {
        setPhone(true);
      } else {
        setPhone(false);
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
  }, [setPhone]);

  //If localMediaStream ? set and play video stream
  useEffect(() => {
    if (!localMediaStream) return;

    if (repeatLocal) {
      setRepeatLocal(false);
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localMediaStream;
        localVideoRef.current.play().catch((e: Error) => {
          console.log("Error in local playAHHHH", e);
          setTimeout(() => {
            setRepeatLocal(true);
          }, 1);
        });
      }
    }
  }, [localMediaStream, phone, repeatLocal]);

  //If remoteStream ? set and play video stream
  useEffect(() => {
    if (!remoteStream) return;

    if (repeatRemote && !remoteStream.active) {
      setRepeatRemote(false);
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
        remoteVideoRef.current.play().catch((e: Error) => {
          console.log("Error in local playAHHHH", e);
          setTimeout(() => {
            setRepeatRemote(true);
          }, 1);
          if (remoteAudioRef.current) {
            remoteAudioRef.current.srcObject = remoteStream;
            remoteAudioRef.current
              .play()
              .catch(() => console.log("HELLO from AUDIO PLAYBACK"));
          }
        });
      }
    }
  }, [remoteStream, repeatRemote]);

  const makeDataObject = (skipa?: boolean | null, stats?: boolean | null) => {
    return {
      userId: userId ?? null,
      skips: skipa ?? null,
      status: stats ?? null,
      hypeLikes: resLike < 1 ? null : resLike,
      hypeHearts: resHeart < 1 ? null : resHeart,
      hypeLaughs: resLaugh < 1 ? null : resLaugh,
      hypeWoahs: resWoah < 1 ? null : resWoah,
      hypeFires: resFire < 1 ? null : resFire,
      hypeClaps: resClap < 1 ? null : resClap,
    };
  };

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
    <div
      id="parent"
      className="w-full overflow-hidden bg-[#121212]"
      style={{
        minHeight: `${height}px`,
      }}
    >
      {reportModal && (
        <ReportModal
          toggle={reportModal}
          toggler={toggleReport}
          dataObject={makeDataObject(null, true)}
          sendReport={sendReport}
        />
      )}

      {!phone ? (
        <div
          className="relative flex w-auto flex-col"
          style={{
            minHeight: `${height}px`,
          }}
        >
          <button
            onClick={() => {
              console.log("hello");
              toggleReport(true);
            }}
            className="absolute right-0 top-0 z-10 m-1 rounded-full border-4 border-red-600/30 bg-[#1d1d1d]/40 px-[1.15rem] py-1.5 text-2xl font-bold text-red-600"
          >
            !
          </button>
          {emojiArr?.map((emoji, idx) => {
            return (
              <span
                key={idx}
                className={`animate-floatDown lg:animate-floatDown2 absolute left-0 top-0 z-20 text-6xl`}
              >
                {emoji === "heart" ? "\u2764\uFE0F" : emoji}
              </span>
            );
          })}

          <div className="relative flex max-h-[70vh] justify-center overflow-hidden">
            <video
              ref={localVideoRef}
              className="w-[50vw] object-cover"
              autoPlay={true}
              playsInline={true}
              muted={true}
            />
            {dolo && (
              <div className="flex w-full items-center justify-center font-mono text-white">
                Your Pixelmate was lost to the wind...
              </div>
            )}
            <video
              ref={remoteVideoRef}
              className={classNames(
                dolo ? "hidden" : "",
                "max-h-min w-[50vw] object-cover",
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
                  : "blur-none",
              )}
              autoPlay={true}
              playsInline={true}
            >
              <audio ref={remoteAudioRef} autoPlay playsInline />
            </video>
            {sentEmojiArr?.map((emoji, idx) => {
              return (
                <span
                  key={idx}
                  className={`animate-floatUp lg:animate-floatUp absolute bottom-0 left-[50vw] z-20 text-6xl`}
                >
                  {emoji === "heart" ? "\u2764\uFE0F" : emoji}
                </span>
              );
            })}
          </div>
          <div className="flex w-full flex-grow gap-x-3 bg-[#121212] p-3">
            <div
              id="reactions"
              className="flex w-1/2 flex-grow flex-col gap-y-3 rounded-xl bg-[#1d1d1d] p-3 lg:flex-row"
            >
              <div
                id="topRow"
                className="flex w-full flex-grow justify-around gap-x-1 gap-y-3"
              >
                <div className="grid grid-cols-1 gap-y-2">
                  <ParticleCanvas
                    emote="👍"
                    color="147bd1"
                    curCount={sentLike}
                    addToCurCount={addSentLike}
                    sendEmoji={sendEmoji}
                    sentEmojiArr={sentEmojiArr}
                  />
                  <MyParticle color="147bd1" curCount={resLike} />
                </div>
                <div className="grid grid-cols-1 gap-y-2">
                  <ParticleCanvas
                    emote="heart"
                    color="d1156b"
                    curCount={sentHeart}
                    addToCurCount={addSentHeart}
                    sendEmoji={sendEmoji}
                    sentEmojiArr={sentEmojiArr}
                  />
                  <MyParticle color="d1156b" curCount={resHeart} />
                </div>
                <div className="grid grid-cols-1 gap-y-2">
                  <ParticleCanvas
                    emote="🤣"
                    color="f7ea48"
                    curCount={sentLaugh}
                    addToCurCount={addSentLaugh}
                    sendEmoji={sendEmoji}
                    sentEmojiArr={sentEmojiArr}
                  />
                  <MyParticle color="f7ea48" curCount={resLaugh} />
                </div>
              </div>
              <div
                id="botRow"
                className="flex w-full flex-grow justify-around gap-x-1 gap-y-3"
              >
                <div className="grid grid-cols-1 gap-y-2">
                  <ParticleCanvas
                    emote="😯"
                    color="ff7f41"
                    curCount={sentWoah}
                    addToCurCount={addSentWoah}
                    sendEmoji={sendEmoji}
                    sentEmojiArr={sentEmojiArr}
                  />
                  <MyParticle color="ff7f41" curCount={resWoah} />
                </div>
                <div className="grid grid-cols-1 gap-y-2">
                  <ParticleCanvas
                    emote="🔥"
                    color="e03c31"
                    curCount={sentFire}
                    addToCurCount={addSentFire}
                    sendEmoji={sendEmoji}
                    sentEmojiArr={sentEmojiArr}
                  />
                  <MyParticle color="e03c31" curCount={resFire} />
                </div>
                <div className="grid grid-cols-1 gap-y-2">
                  <ParticleCanvas
                    emote="👏"
                    color="753bbd"
                    curCount={sentClap}
                    addToCurCount={addSentClap}
                    sendEmoji={sendEmoji}
                    sentEmojiArr={sentEmojiArr}
                  />
                  <MyParticle color="753bbd" curCount={resClap} />
                </div>
              </div>
            </div>
            <div
              id="homeAndSkip"
              className="flex flex-grow flex-col gap-x-3 gap-y-3 sm:w-1/2 sm:flex-row"
            >
              <div
                className="flex w-full flex-grow sm:w-1/3"
                onClick={() => {
                  if (!ended) {
                    endMatch.mutate({
                      matchId: matchId,
                    });
                    setEnded(true);
                  }
                  if (
                    !remoteStream?.active ||
                    (remoteStream.active && countdown < 1)
                  ) {
                    statusUpdate.mutate(makeDataObject(null, null));
                    cleanup();
                    resetReactions();
                    router
                      .push("/")
                      .catch(() => console.log("ERROR in GO HOME button"));
                  }

                  if (remoteStream?.active && countdown > 0) {
                    if (skips < 2) {
                      statusUpdate.mutate(makeDataObject(null, null));
                      setNoSkips(true);
                      cleanup();
                      resetReactions();
                    }
                    if (skips >= 2) {
                      statusUpdate.mutate(makeDataObject(true, null));
                      setSkips(skips - 1);
                      cleanup();
                      resetReactions();
                    }
                  }
                  router
                    .push("/")
                    .catch(() => console.log("ERROR in GO HOME button"));
                }}
              >
                <button className="flex flex-grow items-center justify-center rounded-xl bg-[#1d1d1d] p-5 text-5xl text-[#e1e1e1] shadow-md">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="h-12 w-12"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                </button>
              </div>
              <div className="flex w-full flex-grow sm:w-2/3">
                <button
                  className="flex-grow rounded-xl bg-[#1d1d1d] p-3 font-mono text-5xl text-[#e1e1e1] shadow-md"
                  onClick={() => {
                    if (!ended) {
                      endMatch.mutate({
                        matchId: matchId,
                      });
                      setEnded(true);
                    }
                    if (
                      !remoteStream?.active ||
                      (remoteStream?.active && countdown < 1)
                    ) {
                      statusUpdate.mutate(makeDataObject(null, true));
                      cleanup();
                      resetReactions();
                    }

                    if (remoteStream?.active && countdown > 0) {
                      if (skips < 2) {
                        statusUpdate.mutate(makeDataObject(null, null));
                        setNoSkips(true);
                        cleanup();
                        resetReactions();
                        router
                          .push("/")
                          .catch(() =>
                            console.log("ERROR in router.puush of SKIP"),
                          );
                      }
                      if (skips >= 2) {
                        statusUpdate.mutate(makeDataObject(true, true));
                        setSkips(skips - 1);
                        cleanup();
                        resetReactions();
                      }
                    }

                    router
                      .push("/waiting")
                      .catch(() =>
                        console.log("ERROR in router.puush of SKIP"),
                      );
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
      {phone ? (
        <div className="w-auto">
          <video
            ref={remoteVideoRef}
            style={{
              minHeight: `${height}px`,
            }}
            className={classNames(
              "w-[100vw] object-cover",
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
                : "blur-none",
            )}
            autoPlay={true}
            playsInline={true}
          >
            <audio ref={remoteAudioRef} autoPlay playsInline />
          </video>

          {emojiArr?.map((emoji, idx) => {
            return (
              <span
                key={idx}
                className={`animate-floatDown lg:animate-floatDown2 absolute left-0 top-[1vh] z-20 text-6xl`}
              >
                {emoji === "heart" ? "\u2764\uFE0F" : emoji}
              </span>
            );
          })}

          {sentEmojiArr?.map((emoji, idx) => {
            return (
              <span
                key={idx}
                className={`animate-floatUp lg:animate-floatUp absolute bottom-24 left-0 z-30 text-6xl`}
              >
                {emoji === "heart" ? "\u2764\uFE0F" : emoji}
              </span>
            );
          })}

          <button
            onClick={() => {
              console.log("hello");
              toggleReport(true);
            }}
            className="absolute right-0 top-0 m-1 rounded-full border-2 border-red-600/30 bg-[#1d1d1d]/40 px-[1.15rem] py-1.5 text-2xl font-bold text-red-600"
          >
            !
          </button>

          <div className="absolute bottom-0 flex w-full flex-grow flex-col">
            <div className="flex flex-grow flex-col items-end justify-end">
              <div className="flex flex-col items-center justify-around gap-y-3 rounded-xl">
                <button
                  className="flex flex-col items-center rounded-bl-xl rounded-tl-xl border-b-2 border-l-2 border-t-2 border-white/20 bg-[#1d1d1d]/40 p-3 font-mono text-3xl font-semibold text-white/30"
                  onClick={() => {
                    if (!ended) {
                      endMatch.mutate({
                        matchId: matchId,
                      });
                      setEnded(true);
                    }
                    if (
                      !remoteStream?.active ||
                      (remoteStream?.active && countdown < 1)
                    ) {
                      statusUpdate.mutate(makeDataObject(null, true));
                      cleanup();
                      resetReactions();
                    }

                    if (remoteStream?.active && countdown > 0) {
                      if (skips < 2) {
                        statusUpdate.mutate(makeDataObject(null, true));
                        setNoSkips(true);
                        cleanup();
                        resetReactions();
                        router
                          .push("/")
                          .catch(() =>
                            console.log("ERROR in router.puush of SKIP"),
                          );
                      }
                      if (skips >= 2) {
                        statusUpdate.mutate(makeDataObject(true, true));
                        setSkips(skips - 1);
                        cleanup();
                        resetReactions();
                      }
                    }

                    router
                      .push("/waiting")
                      .catch(() =>
                        console.log("ERROR in router.puush of SKIP"),
                      );
                  }}
                >
                  <span>S</span>
                  <span>K</span>
                  <span>I</span>
                  <span>P</span>
                </button>
                <button
                  className="rounded-bl-xl rounded-tl-xl border-b-2 border-l-2 border-t-2 border-white/20 bg-[#1d1d1d]/40 p-[9px] font-semibold text-white/30"
                  onClick={() => {
                    if (!ended) {
                      endMatch.mutate({
                        matchId: matchId,
                      });
                      setEnded(true);
                    }
                    if (
                      !remoteStream?.active ||
                      (remoteStream.active && countdown < 1)
                    ) {
                      statusUpdate.mutate(makeDataObject(null, null));
                      cleanup();
                      resetReactions();
                      router
                        .push("/")
                        .catch(() => console.log("ERROR in GO HOME button"));
                    }

                    if (remoteStream?.active && countdown > 0) {
                      if (skips < 2) {
                        statusUpdate.mutate(makeDataObject(null, null));
                        setNoSkips(true);
                        cleanup();
                        resetReactions();
                      }
                      if (skips >= 2) {
                        statusUpdate.mutate(makeDataObject(true, null));
                        setSkips(skips - 1);
                        cleanup();
                        resetReactions();
                      }
                    }
                    router
                      .push("/")
                      .catch(() => console.log("ERROR in GO HOME button"));
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={3}
                    stroke="currentColor"
                    className="h-[30px] w-[30px]"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                    />
                  </svg>
                </button>
              </div>
              <div className="mt-1 flex justify-end rounded-xl">
                <video
                  ref={localVideoRef}
                  className="w-[100px] rounded-xl"
                  autoPlay={true}
                  playsInline={true}
                  muted={true}
                ></video>
              </div>
            </div>
            <div className="flex p-1">
              <div className="grid grid-cols-1">
                <MobileProgressCanvasButton
                  emote="👍"
                  color="20, 123, 209"
                  curCount={sentLike}
                  resCount={resLike}
                  addToCurCount={addSentLike}
                  sendEmoji={sendEmoji}
                  sentEmojiArr={sentEmojiArr}
                />
              </div>
              <div className="grid grid-cols-1">
                <MobileProgressCanvasButton
                  emote="heart"
                  color="209, 21, 107"
                  curCount={sentHeart}
                  resCount={resHeart}
                  addToCurCount={addSentHeart}
                  sendEmoji={sendEmoji}
                  sentEmojiArr={sentEmojiArr}
                />
              </div>
              <div className="grid grid-cols-1">
                <MobileProgressCanvasButton
                  emote="🤣"
                  color="247, 234, 72"
                  curCount={sentLaugh}
                  resCount={resLaugh}
                  addToCurCount={addSentLaugh}
                  sendEmoji={sendEmoji}
                  sentEmojiArr={sentEmojiArr}
                />
              </div>
              <div className="grid grid-cols-1">
                <MobileProgressCanvasButton
                  emote="😯"
                  color="255, 127, 65"
                  curCount={sentWoah}
                  resCount={resWoah}
                  addToCurCount={addSentWoah}
                  sendEmoji={sendEmoji}
                  sentEmojiArr={sentEmojiArr}
                />
              </div>
              <div className="grid grid-cols-1">
                <MobileProgressCanvasButton
                  emote="🔥"
                  color="224, 60, 49"
                  curCount={sentFire}
                  resCount={resFire}
                  addToCurCount={addSentFire}
                  sendEmoji={sendEmoji}
                  sentEmojiArr={sentEmojiArr}
                />
              </div>
              <div className="grid grid-cols-1">
                <MobileProgressCanvasButton
                  emote="👏"
                  color="117, 59, 189"
                  curCount={sentClap}
                  resCount={resClap}
                  addToCurCount={addSentClap}
                  sendEmoji={sendEmoji}
                  sentEmojiArr={sentEmojiArr}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        ""
      )}
    </div>
  );
};

export default MatchPage;
