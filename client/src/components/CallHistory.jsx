import { useEffect, useState } from "react";
import API from "../services/api";

function CallHistory({ token, user }) {
  const [calls, setCalls] = useState([]);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // LOAD CALL HISTORY
  // ==========================================

  const loadCalls = async () => {
    try {
      setLoading(true);

      const res = await API.get("/calls", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setCalls(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Call history error:", error);
      setCalls([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!token) return;

    loadCalls();
  }, [token]);

  // ==========================================
  // GET OTHER USER
  // ==========================================

  const getOtherUser = (call) => {
    if (!user) return null;

    const caller = typeof call.caller === "object" ? call.caller : null;

    const receiver = typeof call.receiver === "object" ? call.receiver : null;

    const callerId = caller?._id || call.caller;

    if (String(callerId) === String(user._id)) {
      return receiver;
    }

    return caller;
  };

  // ==========================================
  // DATE
  // ==========================================

  const formatDate = (date) => {
    if (!date) return "";

    const callDate = new Date(date);

    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (callDate.toDateString() === today.toDateString()) {
      return "Today";
    }

    if (callDate.toDateString() === yesterday.toDateString()) {
      return "Yesterday";
    }

    return callDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // ==========================================
  // TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };


// ==========================================
// CALL DURATION
// ==========================================

const formatDuration = (seconds) => {
  if (!seconds || seconds <= 0) return "";

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

  // ==========================================
  // CALL DIRECTION
  // ==========================================

  const getDirection = (call) => {
    if (!user) return "";

    const callerId =
      typeof call.caller === "object" ? call.caller?._id : call.caller;

    const isOutgoing = String(callerId) === String(user._id);

    if (call.status === "missed") {
      return "Missed call";
    }

    if (call.status === "rejected") {
      return isOutgoing ? "Call declined" : "Call rejected";
    }

    if (call.status === "cancelled") {
      return "Call cancelled";
    }

    if (call.status === "ended") {
      return isOutgoing ? "Outgoing call" : "Incoming call";
    }

    if (call.status === "answered") {
      return isOutgoing ? "Outgoing call" : "Incoming call";
    }

    if (call.status === "ringing") {
      return isOutgoing ? "Outgoing call" : "Incoming call";
    }

    return isOutgoing ? "Outgoing call" : "Incoming call";
  };

  // ==========================================
  // DIRECTION ICON
  // ==========================================

  const getDirectionIcon = (call) => {
    const callerId =
      typeof call.caller === "object" ? call.caller?._id : call.caller;

    const isOutgoing = String(callerId) === String(user?._id);

    if (call.status === "missed") {
      return "↙";
    }

    if (isOutgoing) {
      return "↗";
    }

    return "↙";
  };

  // ==========================================
  // STATUS COLOR
  // ==========================================

  const getStatusColor = (call) => {
    if (call.status === "missed" || call.status === "rejected") {
      return "text-red-400";
    }

    return "text-gray-400";
  };

  // ==========================================
  // CALL TYPE ICON
  // ==========================================

  const getCallTypeIcon = (call) => {
    if (call.type === "video") {
      return "📹";
    }

    return "📞";
  };

  // ==========================================
  // PROFILE IMAGE
  // ==========================================

  const getProfilePic = (userData) => {
    if (!userData?.profilePic) {
      return "";
    }

    return userData.profilePic;
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex-1 bg-[#111b21] text-white">
        <div
          className="
          sticky
          top-0
          z-10
          bg-[#202c33]
          px-4
          py-4
          border-b
          border-gray-700
        "
        >
          <h1 className="text-xl font-semibold">Call History</h1>

          <p className="text-xs text-gray-400 mt-1">Your recent calls</p>
        </div>

        <div
          className="
          flex
          items-center
          justify-center
          h-[60vh]
          text-gray-400
        "
        >
          Loading call history...
        </div>
      </div>
    );
  }

  return (
    <div
      className="
      flex-1
      bg-[#111b21]
      text-white
      overflow-y-auto
      min-h-0
    "
    >
      {/* ======================================
          HEADER
      ====================================== */}

      <div
        className="
        sticky
        top-0
        z-20
        bg-[#202c33]
        px-4
        py-4
        border-b
        border-gray-700
      "
      >
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📞</span>

              <h1
                className="
                text-xl
                font-semibold
              "
              >
                Call History
              </h1>
            </div>

            <p
              className="
              text-xs
              text-gray-400
              mt-1
            "
            >
              Recent voice and video calls
            </p>
          </div>

          <button
            onClick={loadCalls}
            className="
              w-9
              h-9
              rounded-full
              flex
              items-center
              justify-center
              text-gray-300
              hover:bg-[#2a3942]
              hover:text-white
              transition
            "
            title="Refresh call history"
          >
            ↻
          </button>
        </div>
      </div>

      {/* ======================================
          EMPTY CALL HISTORY
      ====================================== */}

      {calls.length === 0 ? (
        <div
          className="
          min-h-[calc(100vh-145px)]
          flex
          flex-col
          items-center
          justify-center
          text-center
          px-6
        "
        >
          <div
            className="
            w-20
            h-20
            rounded-full
            bg-[#202c33]
            flex
            items-center
            justify-center
            text-4xl
            mb-5
          "
          >
            📞
          </div>

          <h2
            className="
            text-lg
            font-semibold
            text-gray-200
          "
          >
            Empty call history
          </h2>

          <p
            className="
            text-sm
            text-gray-500
            mt-2
            max-w-[280px]
            leading-relaxed
          "
          >
            Your voice and video calls will appear here after you make or
            receive a call.
          </p>
        </div>
      ) : (
        /* ======================================
           CALL LIST
        ====================================== */

        <div className="pb-24">
          {calls.map((call) => {
            const otherUser = getOtherUser(call);

            if (!otherUser) {
              return null;
            }

            const name = otherUser.name || "Unknown User";

            const profilePic = getProfilePic(otherUser);

            const statusColor = getStatusColor(call);

            const direction = getDirection(call);

            const directionIcon = getDirectionIcon(call);

            const callTypeIcon = getCallTypeIcon(call);

            return (
              <div
                key={call._id}
                className="
                  flex
                  items-center
                  px-4
                  py-3
                  hover:bg-[#202c33]
                  active:bg-[#2a3942]
                  transition
                  border-b
                  border-[#1d282e]
                "
              >
                {/* ==================================
                    PROFILE
                ================================== */}

                <div
                  className="
                  w-12
                  h-12
                  rounded-full
                  overflow-hidden
                  flex-shrink-0
                  bg-[#33434c]
                  flex
                  items-center
                  justify-center
                "
                >
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt={name}
                      className="
                        w-full
                        h-full
                        object-cover
                      "
                    />
                  ) : (
                    <span
                      className="
                      text-lg
                      font-semibold
                      text-white
                    "
                    >
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>

                {/* ==================================
                    DETAILS
                ================================== */}

                <div
                  className="
                  flex-1
                  min-w-0
                  ml-3
                "
                >
                  <div
                    className="
                    flex
                    items-center
                    justify-between
                    gap-3
                  "
                  >
                    <h3
                      className="
                      text-[16px]
                      font-medium
                      truncate
                    "
                    >
                      {name}
                    </h3>

                    <span
                      className="
                      text-xs
                      text-gray-500
                      flex-shrink-0
                    "
                    >
                      {formatTime(call.createdAt)}
                    </span>
                  </div>

                  <div
                    className="
                    flex
                    items-center
                    gap-1.5
                    mt-1
                  "
                  >
                    <span
                      className={`
                      text-sm
                      font-medium
                      ${statusColor}
                    `}
                    >
                      {directionIcon}
                    </span>

                    <span
                      className={`
                      text-sm
                      ${statusColor}
                    `}
                    >
                      {direction}
                    </span>

                    <span
                      className="
                      text-gray-600
                      text-xs
                    "
                    >
                      •
                    </span>

                    <span
                      className="
                      text-gray-500
                      text-xs
                    "
                    >
                      {formatDate(call.createdAt)}
                    </span>

                        {call.duration > 0 && (
  <>
    <span className="text-gray-600 text-xs">
      •
    </span>

    <span className="text-gray-500 text-xs">
      {formatDuration(call.duration)}
    </span>
  </>
)}
                   
                  </div>
                </div>

                {/* ==================================
                    CALL TYPE
                ================================== */}

                <div
                  className="
                  ml-3
                  w-9
                  h-9
                  rounded-full
                  flex
                  items-center
                  justify-center
                  text-lg
                "
                >
                  {callTypeIcon}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default CallHistory;
