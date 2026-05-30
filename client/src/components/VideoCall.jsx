import { useEffect, useRef, useState } from "react";

import socket from "../socket";

import Peer from "peerjs";

function VideoCall({ user, selectedUser, setShowCall }) {
  const myVideo = useRef(null);

  const userVideo = useRef(null);

  const peerRef = useRef(null);

  const currentCall = useRef(null);

  const [stream, setStream] = useState(null);

  const [callConnected, setCallConnected] = useState(false);

  // START EVERYTHING
  useEffect(() => {
    let localStream;

    const init = async () => {
      try {
        // CAMERA
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setStream(localStream);

        // MY VIDEO
        if (myVideo.current) {
          myVideo.current.srcObject = localStream;
        }

        // CREATE PEER
        const peer = new Peer(String(user._id), {
          host: "chat-app-gtzp.onrender.com",

          path: "/peerjs",

          secure: true,
        });

        // PEER READY
        peer.on("open", (id) => {
          console.log("PEER READY:", id);
        });

        // RECEIVE CALL
        peer.on("call", (call) => {
          console.log("INCOMING PEER CALL");

          call.answer(localStream);

          currentCall.current = call;

          // RECEIVE REMOTE VIDEO
          call.on("stream", (remoteStream) => {
            console.log("REMOTE VIDEO RECEIVED");

            setCallConnected(true);

            if (userVideo.current) {
              userVideo.current.srcObject = remoteStream;
            }
          });

          call.on("close", () => {
            endCallCleanup();
          });
        });

        peerRef.current = peer;

        socket.on("callEnded", () => {
          console.log("CALL ENDED");

          endCallCleanup();
        });
      } catch (error) {
        console.log("VIDEO ERROR:", error);
      }
    };

    init();

    // CLEANUP
    return () => {
      socket.off("callEnded");

      endCallCleanup();
    };
  }, []);

  // START CALL
  const startCall = () => {
    try {
      if (!peerRef.current) {
        console.log("PEER NOT READY");

        return;
      }

      if (!stream) {
        console.log("NO STREAM");

        return;
      }

      console.log("CALLING:", selectedUser._id);

      const call = peerRef.current.call(String(selectedUser._id), stream);

      if (!call) {
        console.log("CALL FAILED");

        return;
      }

      currentCall.current = call;

      // REMOTE STREAM
      call.on("stream", (remoteStream) => {
        console.log("REMOTE STREAM CONNECTED");

        setCallConnected(true);

        if (userVideo.current) {
          userVideo.current.srcObject = remoteStream;
        }
      });

      call.on("close", () => {
        endCallCleanup();
      });

      call.on("error", (err) => {
        console.log("CALL ERROR:", err);
      });
    } catch (error) {
      console.log(error);
    }
  };

  // CLEANUP FUNCTION
  const endCallCleanup = () => {
    setCallConnected(false);

    if (currentCall.current) {
      currentCall.current.close();
    }

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    if (peerRef.current) {
      peerRef.current.destroy();
    }

    setShowCall(false);
  };

  // END CALL
  const endCall = () => {
    socket.emit("endCall", {
      to: selectedUser._id,
    });

    endCallCleanup();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="h-[70px] shrink-0 bg-[#202c33] border-b border-gray-700 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-4 text-white text-2xl">
            <button onClick={startCall}>📹</button>
          </div>

          <div>
            <h1 className="text-white text-lg font-semibold">Video Call</h1>

            <p className="text-gray-400 text-sm">{selectedUser?.name}</p>
          </div>
        </div>

        <button
          onClick={endCall}
          className="bg-red-500 hover:bg-red-600 transition px-5 py-2 rounded-xl text-white font-semibold"
        >
          End
        </button>
      </div>

      {/* VIDEO AREA */}
      <div className="flex-1 relative bg-black overflow-hidden">
        {/* REMOTE VIDEO */}
        <video
          ref={userVideo}
          autoPlay
          playsInline
          className="w-full h-full object-cover bg-[#111]"
        />

        {/* MY VIDEO FLOATING */}
        <div
          className="
            absolute
            top-4
            right-4
            w-[110px]
            h-[170px]
            md:w-[180px]
            md:h-[250px]
            rounded-2xl
            overflow-hidden
            border-2
            border-white
            shadow-2xl
            bg-black
            z-50
          "
        >
          <video
            ref={myVideo}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />

          <div className="absolute bottom-2 left-2 bg-black/60 px-2 py-1 rounded text-white text-xs">
            You
          </div>
        </div>

        {/* WAITING MESSAGE */}
        {!callConnected && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="bg-black/70 px-6 py-3 rounded-2xl text-white text-lg">
              Waiting for call connection...
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="h-[90px] shrink-0 bg-[#202c33] border-t border-gray-700 flex items-center justify-center gap-4">
        <button
          onClick={startCall}
          className="
            bg-green-500
            hover:bg-green-600
            transition
            px-6
            py-3
            rounded-full
            text-white
            font-semibold
            flex
            items-center
            gap-2
          "
        >
          📞 Start
        </button>

        <button
          onClick={endCall}
          className="
            bg-red-500
            hover:bg-red-600
            transition
            px-6
            py-3
            rounded-full
            text-white
            font-semibold
            flex
            items-center
            gap-2
          "
        >
          ❌ End
        </button>
      </div>
    </div>
  );
}

export default VideoCall;
