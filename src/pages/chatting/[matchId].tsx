import React, { useEffect, useRef, useState } from "react";
import { useUser } from "@clerk/nextjs";
import type Peer from "peerjs";

const MatchPage = () => {
  const localVideoRef = useRef<null | HTMLVideoElement>(null);
  const remoteVideoRef = useRef<null | HTMLVideoElement>(null);
  //   const [localPeerId, setLocalPeerId] = useState<null | string>(null);
  const [remotePeerId, setRemotePeerId] = useState<null | string>(null);
  const [newPeer, setNewPeer] = useState<Peer | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);

  useEffect(() => {
    // console.log("Hello from first useEffect");
    import("peerjs")
      .then(({ Peer }) => {
        const peer = new Peer();
        peer.on("open", (id) => {
          console.log("My peer ID is : ", id);
        });
        peer.on("call", () => {
          console.log("Incoming Call.....");
        });
        setNewPeer(peer);
      })
      .catch((error) => {
        console.error("Error loading peerjs:", error);
      });

    if (localVideoRef) {
      const trackAssign = async () => {
        if (localVideoRef.current) {
          await localVideoRef.current.play();
        }
      };
      trackAssign().catch(() => console.log("HELP!"));
    }

    return () => {
      if (newPeer) {
        newPeer.destroy(); // Safely disconnect from the Peer server
      }
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localStream]);

  const call = async (remotePeerId: string) => {
    const getUserMedia = await navigator.mediaDevices.getUserMedia({
      video: true,
      // audio: true,
    });

    setLocalStream(getUserMedia);

    if (newPeer && remotePeerId && getUserMedia) {
      newPeer.call(remotePeerId, getUserMedia);
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = getUserMedia;
    }
  };

  console.log("Current Peer : ", newPeer);

  return (
    <div className="flex h-full w-screen flex-col items-center justify-center p-8">
      <h1>HELLO FROM MATCH PAGE</h1>
      <div>
        <input
          className="w-40 border p-1"
          type="text"
          onChange={(e) => setRemotePeerId(e.target.value)}
          placeholder="id"
        />
        <button
          className="h-fit w-fit border px-3 py-1"
          onClick={async () => {
            if (remotePeerId) {
              await call(remotePeerId);
            }
          }}
        >
          Call
        </button>
      </div>
      <div className="min-h-60 min-w-60 flex">
        <video ref={localVideoRef} className="h-[200px] w-[200px]"></video>
        <video ref={remoteVideoRef} className="h-[200px] w-[200px]"></video>
      </div>
    </div>
  );
};

export default MatchPage;

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

//   const call = async (remotePeerId: string) => {
// const getUserMedia = await navigator.mediaDevices.getUserMedia({
//   video: true,
//   // audio: true,
// });
// const call = newPeer?.call(remotePeerId, getUserMedia);
// Set the local video stream
// if (localVideoRef.current) {
//   localVideoRef.current.srcObject = getUserMedia;
//   localVideoRef.current
//     .play()
//     .catch(() => console.log("ERROR in localVideoRef.play()")); // Start playing the local video stream
// }
// Handle the remote stream
// call?.on("stream", (remoteStream) => {
//   if (remoteVideoRef.current) {
//     remoteVideoRef.current.srcObject = remoteStream;
//     remoteVideoRef.current
//       .play()
//       .catch(() => console.log("ERROR in remoteVideoRef : ")); // Start playing the remote video stream
//   }
// });
//   };
