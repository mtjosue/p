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

  // useEffect(() => {
  //   if (!localMediaStream) return;

  //   // Set the local stream
  //   setLocalStream(localMediaStream);

  //   // Display local stream
  //   if (localVideoRef.current) {
  //     localVideoRef.current.srcObject = localMediaStream;
  //     localVideoRef.current
  //       .play()
  //       .catch((e: Error) => console.log("Error in local play", e));
  //   }
  // }, [localMediaStream]);

  // useEffect(() => {
  //   if (peer) {
  //     peer.on("call", (call) => {
  //       console.log("Incoming Call.....HELLO");

  //       if (!localMediaStream) return;
  //       // Answer the call with local stream

  //       console.log("WE HAVE LOCAL STREAM while getting a call...");

  //       call.answer(localMediaStream);

  //       call.on("stream", (remoteStream) => {
  //         if (remoteStream) {
  //           console.log("WE HAVE REMOTE STREAM while answering the call...");
  //         }
  //         setRemoteStream(remoteStream);
  //         const remoteVideo = remoteVideoRef.current;
  //         if (remoteVideo) {
  //           remoteVideo.srcObject = remoteStream;
  //           remoteVideo
  //             ?.play()
  //             .catch(() => console.log("Error in remote play"));
  //         }
  //       });
  //     });
  //   }
  // }, [localMediaStream, localStream, peer, remoteStream]);

  // useEffect(() => {
  //   if (!data || !peer) return;
  //   if (data.tempPeerId && data.sourceUserId !== userId) {
  //     console.log("about to call");

  //     // Call with local stream
  //     if (!localMediaStream) return;
  //     const call = peer.call(data.tempPeerId, localMediaStream);

  //     call.on("stream", (remoteStream) => {
  //       setRemoteStream(remoteStream);

  //       // Set the remote video stream
  //       if (remoteVideoRef.current) {
  //         remoteVideoRef.current.srcObject = remoteStream;
  //         remoteVideoRef.current
  //           .play()
  //           .catch(() => console.log("Error in remote play"));
  //       }
  //     });

  //     console.log("just tried to call");
  //   }
  //   return () => {
  //     cleanup();
  //   };
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [data, userId, localMediaStream, peer]);

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
          className="h-[200px] w-[200px]"
          autoPlay={true}
          playsInline={true}
          muted={true}
        ></video>
      </div>
    </div>
  );
};

export default MatchPage;
