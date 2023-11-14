import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import {
  useLocalMediaStream,
  usePeer,
  useSetLocalMediaStream,
  useSetPeer,
  useSetStatus,
  useUserId,
} from "~/stores/useLocalUser";
import { api } from "~/utils/api";

const WaitingPage = () => {
  const router = useRouter();
  const [created, setCreated] = useState(false);
  const localMediaStream = useLocalMediaStream();
  const setLocalMediaStream = useSetLocalMediaStream();
  const userId = useUserId();
  const setStatus = useSetStatus();
  const peer = usePeer();
  const setPeer = useSetPeer();
  const peerId = useMemo(() => {
    if (peer) {
      if (peer.id) {
        return peer.id;
      }
    }
  }, [peer]);

  //Mutation to Search for a user available, if found create a match, if not = null
  const searchOrCreateMatch = api.user.searchMatchOrCreate.useMutation();
  //Mutation to Update user status and skips
  const userStatusUpdate = api.user.statusUpdate.useMutation();

  //Redirect to home if refreshed
  useEffect(() => {
    if (!userId) {
      router
        .push("/")
        .catch(() => console.log("ERROR in router.puush of SKIP"));
      return;
    }
  }, [router, userId]);

  //If no peer in zustand, create peer
  useEffect(() => {
    if (!peer?.id) {
      let unmount = false;
      import("peerjs")
        .then(({ Peer }) => {
          if (!unmount) {
            const newPeer = new Peer();
            newPeer.on("open", () => {
              // console.log("My peer ID is : ", id);
              setPeer(newPeer);
            });
          }
        })
        .catch((error) => {
          console.error("Error loading peerjs:", error);
        });

      return () => {
        unmount = true;
      };
    }
  }, [peer, setPeer]);

  //If first load then execute searchOrCreateMatch
  useEffect(() => {
    // console.log("peerId : ", peerId);
    // console.log("created : ", created);

    if (!peerId || created) return;
    if (userId && peerId) {
      searchOrCreateMatch.mutate({
        userId: userId,
        tempId: peerId,
      });
      setCreated(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [created, userId, peerId]);

  //If theres data in the searchOrCreateMatch push to chatting
  useEffect(() => {
    if (searchOrCreateMatch.data?.id) {
      const matchId = searchOrCreateMatch.data.id; // Access the ID from the mutation result.

      // Now you can use the matchId to navigate to the new page.
      router
        .push(`/chatting/${matchId}`)
        .catch(() => console.log("ERROR IN ROUTER.PUSH"));
    }
  }, [searchOrCreateMatch.data, router]);

  //Getting local media stream.
  const getLocalMediaStream = async () => {
    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    setLocalMediaStream(mediaStream);
  };

  //RETRYING Getting local media stream if you dont have it yet
  useEffect(() => {
    if (!localMediaStream) {
      getLocalMediaStream().catch(() =>
        console.log(
          "ERROR IN... useEffect in Waiting executing getLocalMediaStream",
        ),
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMediaStream]);

  //Looking for a match with your id as the remoteUserId
  const getMatch = api.user.getMatch.useQuery(
    { userId: userId ?? "", created: created },
    {
      refetchOnWindowFocus: false,
      cacheTime: 0,
      staleTime: 0,
    },
  );

  //If you find yourself in match right away
  useEffect(() => {
    if (getMatch.data) {
      router.push(`/chatting/${getMatch.data.id}`).catch(() => {
        console.log("error");
      });
    }
  }, [getMatch.data, router, userId]);

  //if you dont, Search 3 times with 5 seconds in between
  //after 15 seconds return to home and set status to "waiting"
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      console.log("REFETCHING");
      console.log("count :", count);

      if (count < 3) {
        getMatch.refetch().catch(() => {
          console.log("ERROR");
        });
        count++;
      } else {
        userStatusUpdate.mutate({
          userId: userId,
          status: "waiting",
        });
        router
          .push("/")
          .catch(() => console.log("ERROR in Refetch PUSH /waiting"));
      }
    }, 3000);
    return () => {
      clearInterval(interval);
    };
  }, [getMatch, router, userId, userStatusUpdate]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
      <div className="text-white">
        <h2>Waiting for Users to Connect With...</h2>
        <Link
          onClick={() => {
            setStatus("waiting");
            userStatusUpdate.mutate({
              userId: userId ?? "",
              status: "waiting",
            });
          }}
          href={"/"}
        >
          RETURN HOME
        </Link>
      </div>
    </main>
  );
};

export default WaitingPage;
