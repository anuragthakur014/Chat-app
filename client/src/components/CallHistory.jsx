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

      setCalls(res.data || []);
    } catch (error) {
      console.error("Call history error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCalls();
    }
  }, [token]);

  // ==========================================
  // FORMAT TIME
  // ==========================================

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ==========================================
  // FORMAT DATE
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
  // CALL USER
  // ==========================================

  const getOtherUser = (call) => {
    if (!user) return null;

    const callerId =
      typeof call.caller === "object"
        ? call.caller?._id
        : call.caller;

    if (String(callerId) === String(user._id)) {
      return call.receiver;
    }

    return call.caller;
  };

  // ==========================================
  // CALL TYPE ICON
  // ==========================================

  const getCallIcon = (call) => {
    const isVideo = call.type === "video";

    return isVideo ? "📹" : "📞";
  };

  // ==========================================
  // CALL DIRECTION
  // ==========================================

  const getDirection = (call) => {
    if (!user) return "";

    const callerId =
      typeof call.caller === "object"
        ? call.caller?._id
        : call.caller;

    const isOutgoing =
      String(callerId) === String(user._id);

    if (call.status === "missed") {
      return "Missed";
    }

    if (call.status === "rejected") {
      return isOutgoing ? "Declined" : "Rejected";
    }

    if (call.status === "cancelled") {
      return "Cancelled";
    }

    return isOutgoing ? "Outgoing" : "Incoming";
  };

  // ==========================================
  // STATUS CLASS
  // ==========================================

  const getStatusClass = (call) => {
    if (call.status === "missed") {
      return "text-red-400";
    }

    if (call.status === "rejected") {
      return "text-red-400";
    }

    return "text-gray-400";
  };

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#111b21] text-gray-400">
        Loading calls...
      </div>
    );
  }

  return (
    <div className="flex-1 bg-[#111b21] text-white overflow-y-auto">

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="sticky top-0 z-10 bg-[#202c33] px-4 py-4 border-b border-gray-700">

        <div className="flex items-center justify-between">

          <div>
            <h1 className="text-xl font-semibold">
              Calls
            </h1>

            <p className="text-xs text-gray-400 mt-1">
              Your recent calls
            </p>
          </div>

          <button
            onClick={loadCalls}
            className="text-gray-300 hover:text-white text-xl"
            title="Refresh"
          >
            ↻
          </button>

        </div>

      </div>

      {/* ======================================
          CALL LIST
      ====================================== */}

      {calls.length === 0 ? (

        <div className="flex flex-col items-center justify-center h-[70vh] text-center px-6">

          <div className="text-6xl mb-5">
            📞
          </div>

          <h2 className="text-lg font-medium text-gray-200">
            No calls yet
          </h2>

          <p className="text-sm text-gray-500 mt-2">
            Your recent calls will appear here.
          </p>

        </div>

      ) : (

        <div>

          {calls.map((call) => {

            const otherUser = getOtherUser(call);

            if (!otherUser) return null;

            const name =
              otherUser.name || "Unknown User";

            const profilePic =
              otherUser.profilePic || "";

            const direction =
              getDirection(call);

            const statusClass =
              getStatusClass(call);

            return (

              <div
                key={call._id}
                className="
                  flex
                  items-center
                  px-4
                  py-3
                  hover:bg-[#202c33]
                  transition
                  cursor-pointer
                "
              >

                {/* PROFILE */}

                <div className="relative flex-shrink-0">

                  {profilePic ? (

                    <img
                      src={profilePic}
                      alt={name}
                      className="
                        w-12
                        h-12
                        rounded-full
                        object-cover
                      "
                    />

                  ) : (

                    <div
                      className="
                        w-12
                        h-12
                        rounded-full
                        bg-blue-600
                        flex
                        items-center
                        justify-center
                        text-lg
                        font-semibold
                      "
                    >
                      {name
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                  )}

                </div>

                {/* CALL DETAILS */}

                <div className="flex-1 ml-3 min-w-0">

                  <div className="flex items-center justify-between">

                    <h3 className="text-[16px] truncate">
                      {name}
                    </h3>

                    <span className="text-xs text-gray-400 ml-3">
                      {formatTime(call.createdAt)}
                    </span>

                  </div>

                  <div className="flex items-center gap-2 mt-1">

                    <span className={statusClass}>
                      {direction}
                    </span>

                    <span className="text-gray-500">
                      •
                    </span>

                    <span className="text-gray-500 text-sm">
                      {formatDate(call.createdAt)}
                    </span>

                  </div>

                </div>

                {/* CALL TYPE */}

                <div className="ml-3 text-xl">
                  {getCallIcon(call)}
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