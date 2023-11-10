import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/router";
import { api } from "~/utils/api";
import { useLocalMediaStream, usePeer } from "~/stores/useLocalUser";
import Link from "next/link";

const MatchPage = () => {
  const userId = useUser().user?.id;
  const localVideoRef = useRef<null | HTMLVideoElement>(null);
  const remoteVideoRef = useRef<null | HTMLVideoElement>(null);
  const peer = usePeer();
  const router = useRouter();
  const matchId = router.query.matchId as string;
  const localMediaStream = useLocalMediaStream();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const { data } = api.user.getMatchForPage.useQuery({
    matchId: matchId,
  });
  const endMatch = api.user.endMatch.useMutation();

  const cleanup = () => {
    if (peer) {
      peer.destroy();
    }
  };

  useEffect(() => {
    if (!localMediaStream) return;

    // Set the local stream
    setLocalStream(localMediaStream);

    // Display local stream
    if (localVideoRef.current) {
      localVideoRef.current.srcObject = localMediaStream;
      localVideoRef.current
        .play()
        .catch((e: Error) => console.log("Error in local play", e));
    }
  }, [localMediaStream]);

  useEffect(() => {
    if (peer) {
      peer.on("call", (call) => {
        // console.log("Incoming Call.....HELLO");

        if (!localMediaStream) return;
        // Answer the call with local stream

        // console.log("WE HAVE LOCAL STREAM while getting a call...");

        call.answer(localMediaStream);

        call.on("stream", (remoteStream) => {
          if (remoteStream) {
            // console.log("WE HAVE REMOTE STREAM while answering the call...");
          }
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
  }, [localMediaStream, localStream, peer, remoteStream]);

  useEffect(() => {
    if (!data || !peer) return;
    if (data.tempPeerId && data.sourceUserId !== userId) {
      // console.log("about to call");

      // Call with local stream
      if (!localMediaStream) return;
      const call = peer.call(data.tempPeerId, localMediaStream);

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

      // console.log("just tried to call");
    }
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, userId, localMediaStream, peer]);

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

  const [countdown, setCountdown] = useState(95);

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

  return (
    <div className="flex h-full w-screen flex-col items-center justify-center p-8">
      <h1>HELLO FROM MATCH PAGE</h1>
      <div></div>
      <Link
        href={"/"}
        onClick={() => {
          endMatch.mutate({ matchid: matchId });
          cleanup();
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
              ? "blur-[0.2px]"
              : "blur-none"
          }`}
          autoPlay={true}
          playsInline={true}
          muted={true}
        ></video>
      </div>

      <div>{countdown}</div>
    </div>
  );
};

export default MatchPage;
