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

  // const userStatusUpdate = api.user.statusUpdate.useMutation();
  // useEffect(() => {
  //   if (userId) {
  //     userStatusUpdate.mutate({
  //       userId: userId,
  //       status: "chatting",
  //     });
  //   }
  //   console.log("WE CHATTINGGGGG");
  // }, [userId]);

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
        console.log("Incoming Call.....HELLO");

        if (!localMediaStream) return;
        // Answer the call with local stream

        console.log("WE HAVE LOCAL STREAM while getting a call...");

        call.answer(localMediaStream);

        call.on("stream", (remoteStream) => {
          if (remoteStream) {
            console.log("WE HAVE REMOTE STREAM while answering the call...");
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
      console.log("about to call");

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

      console.log("just tried to call");
    }
    return () => {
      cleanup();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, userId, localMediaStream, peer]);

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

// import React, { useEffect, useRef, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// // import type Peer from "peerjs";
// import { useRouter } from "next/router";
// import { api } from "~/utils/api";
// import { useLocalMediaStream, usePeer } from "~/stores/useLocalUser";
// import Link from "next/link";

// const MatchPage = () => {
//   const userId = useUser().user?.id;
//   const localVideoRef = useRef<null | HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<null | HTMLVideoElement>(null);
//   const peer = usePeer();
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
//   const router = useRouter();
//   const matchId = router.query.matchId as string;
//   const localMediaStream = useLocalMediaStream();

//   const { data } = api.user.getMatchForPage.useQuery({
//     matchId: matchId,
//   });
//   const endMatch = api.user.endMatch.useMutation();

//   const cleanup = () => {
//     if (peer) {
//       peer.destroy();
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//     }
//     if (remoteStream) {
//       remoteStream.getTracks().forEach((track) => track.stop());
//     }
//   };

//   useEffect(() => {
//     if (peer) {
//       peer.on("call", (call) => {
//         console.log("Incoming Call.....HELLO");
//         const localVideoCur = localVideoRef.current;
//         const remoteVideoCur = remoteVideoRef.current;

//         if (!localMediaStream || !localVideoCur || !remoteVideoCur) return;
//         console.log("AYEEEE WE GOT ALL 3!");

//         // Set the local video stream

//         setLocalStream(localMediaStream);
//         localVideoCur.srcObject = localMediaStream;
//         localVideoCur
//           .play()
//           .catch((e: Error) => console.log("Error in local play", e));
//         // Start playing the local video stream

//         console.log("HOT DIGGITY DANG");

//         call.answer(localMediaStream);

//         // Set the remote video stream
//         if (call.remoteStream) {
//           setRemoteStream(call.remoteStream);
//           remoteVideoCur.srcObject = call.remoteStream;
//           remoteVideoCur
//             .play()
//             .catch(() => console.log("Error in remote play"));
//           // Start playing the remote video stream
//         }
//       });
//     }
//   }, [localMediaStream, peer]);
//   // eslint-disable-next-line react-hooks/exhaustive-deps

//   const call = (remotePeerId: string) => {
//     setLocalStream(localMediaStream);

//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = localMediaStream;
//       localVideoRef.current
//         .play()
//         .catch(() => console.log("ERROR IN LOCALVIDEOREF PLAY"));
//     }
//     if (peer && remotePeerId && localMediaStream) {
//       const call = peer.call(remotePeerId, localMediaStream);
//       call?.on("stream", (remoteStream) => {
//         setRemoteStream(remoteStream);
//         if (remoteVideoRef.current) {
//           remoteVideoRef.current.srcObject = remoteStream;
//           remoteVideoRef.current
//             .play()
//             .catch(() => console.log("ERROR in remoteVideoRef : ")); // Start playing the remote video stream
//         }
//       });
//     }
//   };

//   useEffect(() => {
//     if (!data) return;
//     if (data.tempPeerId && data.sourceUserId !== userId) {
//       console.log("about to call");
//       call(data.tempPeerId);
//       console.log("just tried to call");
//     }
//     return cleanup;
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [data, userId]);

//   return (
//     <div className="flex h-full w-screen flex-col items-center justify-center p-8">
//       <h1>HELLO FROM MATCH PAGE</h1>
//       <div></div>
//       <Link
//         href={"/"}
//         onClick={() => {
//           endMatch.mutate({ matchid: matchId });
//         }}
//       >
//         Return Home
//       </Link>
//       <div className="min-h-60 min-w-60 flex">
//         <video ref={localVideoRef} className="h-[200px] w-[200px]"></video>
//         <video ref={remoteVideoRef} className="h-[200px] w-[200px]"></video>
//       </div>
//     </div>
//   );
// };

// export default MatchPage;

///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////

// const appendSourceUserPeerId = api.user.appendPeerId.useMutation();

// useEffect(() => {
//   // console.log("Hello from first useEffect");
//   import("peerjs")
//     .then(({ Peer }) => {
//       const peer = new Peer();
//       peer.on("open", (id) => {
//         console.log("My peer ID is : ", id);
//       });
//       peer.on("call", (call) => {
//         console.log("Incoming Call.....");
//         // const getUserMedia = navigator.mediaDevices.getUserMedia({
//         //   video: true,
//         //   // audio: true,
//         // });
//         // console.log("getUserMedia", getUserMedia);
//       });
//       setPeer(peer);
//     })
//     .catch((error) => {
//       console.error("Error loading peerjs:", error);
//     });

//   if (localVideoRef) {
//     const trackAssign = async () => {
//       if (localVideoRef.current) {
//         await localVideoRef.current.play();
//       }
//     };
//     trackAssign().catch(() => console.log("HELP!"));
//   }

//   return () => {
//     if (peer) {
//       peer.destroy(); // Safely disconnect from the Peer server
//     }
//     if (localStream) {
//       localStream.getTracks().forEach((track) => track.stop());
//     }
//   };
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [localStream]);

// useEffect(() => {
//   const data = getMatchForPage.data;
//   if (data?.sourceUserId === user.user?.id && peer?.id) {
//     appendSourceUserPeerId.mutate({ matchId: matchId, peerId: peer.id });
//   }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [
//   // appendSourceUserPeerId,
//   getMatchForPage.data,
//   matchId,
//   peer?.id,
//   user.user?.id,
// ]);

// const call = async (remotePeerId: string) => {
//   const getUserMedia = await navigator.mediaDevices.getUserMedia({
//     video: true,
//     // audio: true,
//   });

//   setLocalStream(getUserMedia);

//   if (peer && remotePeerId && getUserMedia) {
//     peer.call(remotePeerId, getUserMedia);
//   }

//   if (localVideoRef.current) {
//     localVideoRef.current.srcObject = getUserMedia;
//   }
// };

// useEffect(() => {
//   const data = getMatchForPage.data;
//   if (data?.tempPeerId) {
//     console.log("Match has a tempPeerId!!!");
//     call(data.tempPeerId).catch(() => console.log("ERROR IN CALL"));
//   }
//   // eslint-disable-next-line react-hooks/exhaustive-deps
// }, [getMatchForPage.data]);

// console.log("Current Peer : ", peer);

// import React, { useEffect, useRef, useState } from "react";
// import { useUser } from "@clerk/nextjs";
// import type Peer from "peerjs";
// import { useRouter } from "next/router";
// import { api } from "~/utils/api";
// import { useUserStore } from "~/stores/useLocalUser";
// import Link from "next/link";

// const MatchPage = () => {
//   const user = useUser();
//   const localVideoRef = useRef<null | HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<null | HTMLVideoElement>(null);
//   //   const [localPeerId, setLocalPeerId] = useState<null | string>(null);

//   const [peer, setPeer] = useState<Peer | null>(null);
//   const [localStream, setLocalStream] = useState<MediaStream | null>(null);
//   const router = useRouter();
//   const matchId = router.query.matchId as string;

//   const getMatchForPage = api.user.getMatchForPage.useQuery({
//     matchId: matchId,
//   });

//   const endMatch = api.user.endMatch.useMutation();

//   const appendSourceUserPeerId = api.user.appendPeerId.useMutation();

//   useEffect(() => {
//     // console.log("Hello from first useEffect");
//     import("peerjs")
//       .then(({ Peer }) => {
//         const peer = new Peer();
//         peer.on("open", (id) => {
//           console.log("My peer ID is : ", id);
//         });
//         peer.on("call", (call) => {
//           console.log("Incoming Call.....");
//           // const getUserMedia = navigator.mediaDevices.getUserMedia({
//           //   video: true,
//           //   // audio: true,
//           // });
//           // console.log("getUserMedia", getUserMedia);
//         });
//         setPeer(peer);
//       })
//       .catch((error) => {
//         console.error("Error loading peerjs:", error);
//       });

//     if (localVideoRef) {
//       const trackAssign = async () => {
//         if (localVideoRef.current) {
//           await localVideoRef.current.play();
//         }
//       };
//       trackAssign().catch(() => console.log("HELP!"));
//     }

//     return () => {
//       if (peer) {
//         peer.destroy(); // Safely disconnect from the Peer server
//       }
//       if (localStream) {
//         localStream.getTracks().forEach((track) => track.stop());
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [localStream]);

//   useEffect(() => {
//     const data = getMatchForPage.data;
//     if (data?.sourceUserId === user.user?.id && peer?.id) {
//       appendSourceUserPeerId.mutate({ matchId: matchId, peerId: peer.id });
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [
//     // appendSourceUserPeerId,
//     getMatchForPage.data,
//     matchId,
//     peer?.id,
//     user.user?.id,
//   ]);

//   const call = async (remotePeerId: string) => {
//     const getUserMedia = await navigator.mediaDevices.getUserMedia({
//       video: true,
//       // audio: true,
//     });

//     setLocalStream(getUserMedia);

//     if (peer && remotePeerId && getUserMedia) {
//       peer.call(remotePeerId, getUserMedia);
//     }

//     if (localVideoRef.current) {
//       localVideoRef.current.srcObject = getUserMedia;
//     }
//   };

//   useEffect(() => {
//     const data = getMatchForPage.data;
//     if (data?.tempPeerId) {
//       console.log("Match has a tempPeerId!!!");
//       call(data.tempPeerId).catch(() => console.log("ERROR IN CALL"));
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [getMatchForPage.data]);

//   console.log("Current Peer : ", peer);

//   return (
//     <div className="flex h-full w-screen flex-col items-center justify-center p-8">
//       <h1>HELLO FROM MATCH PAGE</h1>
//       <div></div>
//       <Link
//         href={"/"}
//         onClick={() => {
//           endMatch.mutate({ matchid: matchId });
//         }}
//       >
//         Return Home
//       </Link>
//       <div className="min-h-60 min-w-60 flex">
//         <video ref={localVideoRef} className="h-[200px] w-[200px]"></video>
//         <video ref={remoteVideoRef} className="h-[200px] w-[200px]"></video>
//       </div>
//     </div>
//   );
// };

// export default MatchPage;

//   useEffect(() => {
//     if (typeof window !== "undefined" && !newPeer) {
//       import("peerjs")
//         .then(({ Peer }) => {
//           const peer = new Peer();
//           peer.on("open", (id) => {
//             setLocalPeerId(id);
//             // console.log("My peer ID is : ", id);
//           });
//           peer.on("call", (call) => {
//             const testFunc = async () => {
//               const getUserMedia = await navigator.mediaDevices.getUserMedia({
//                 video: true,
//                 // audio: true,
//               });

//               call.answer(getUserMedia);

//               // Set the local video stream
//               if (localVideoRef.current) {
//                 localVideoRef.current.srcObject = getUserMedia;
//                 localVideoRef.current.play().catch(() => console.log("???")); // Start playing the local video stream
//               }
//             };
//           });
//           setNewPeer(peer); // Set the Peer object in the state
//           console.log("newPeer from useEffect : ", peer);
//         })
//         .catch(() => console.log("ERROR in peerjs !"));
//     }
//   }, [newPeer]);

//   console.log(localPeerId);

// const call = async (remotePeerId: string) => {
//   const getUserMedia = await navigator.mediaDevices.getUserMedia({
//     video: true,
//     // audio: true,
//   });
//   const call = newPeer?.call(remotePeerId, getUserMedia);
//   // Set the local video stream
//   if (localVideoRef.current) {
//   localVideoRef.current.srcObject = getUserMedia;
//   localVideoRef.current
//     .play()
//     .catch(() => console.log("ERROR in localVideoRef.play()")); // Start playing the local video stream
//   }
//   // Handle the remote stream
//   call?.on("stream", (remoteStream) => {
//     if (remoteVideoRef.current) {
//       remoteVideoRef.current.srcObject = remoteStream;
//       remoteVideoRef.current
//         .play()
//         .catch(() => console.log("ERROR in remoteVideoRef : ")); // Start playing the remote video stream
//     }
//   });
// };
