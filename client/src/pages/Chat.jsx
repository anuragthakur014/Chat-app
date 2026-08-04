import { useContext, useEffect, useRef, useState } from "react";

import socket from "../socket";

import API from "../services/api";

import EmojiPicker from "emoji-picker-react";

import { AuthContext } from "../context/AuthContext";

import VideoCall from "../components/VideoCall";

import WallpaperModal from "../components/WallpaperModal";

function Chat() {
  const { user, logout } = useContext(AuthContext);

  const [allUsers, setAllUsers] = useState([]);

  const [searchUsers, setSearchUsers] = useState([]);

  const [selectedUser, setSelectedUser] = useState(null);

  const [messages, setMessages] = useState([]);

  const [text, setText] = useState("");

  const [search, setSearch] = useState("");

  const [onlineUsers, setOnlineUsers] = useState([]);

  const [typingUser, setTypingUser] = useState(null);

  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const [mediaRecorder, setMediaRecorder] = useState(null);

  const [isRecording, setIsRecording] = useState(false);

  const [showCall, setShowCall] = useState(false);

  const [receivingCall, setReceivingCall] = useState(false);

  const [caller, setCaller] = useState("");

  const [callerName, setCallerName] = useState("");

  const [callerSignal, setCallerSignal] = useState(null);

  const [showSidebar, setShowSidebar] = useState(true);

  const [unreadCounts, setUnreadCounts] = useState({});
  //wallpaper
  const [showWallpaperModal, setShowWallpaperModal] = useState(false);

  const [wallpaper, setWallpaper] = useState("");

  const messagesEndRef = useRef(null);

  const displayUsers = search.trim().length > 0 ? searchUsers : allUsers;

  const token = localStorage.getItem("token");

  // PLAY SOUND
  const playNotificationSound = () => {
    const audio = new Audio(
      "https://notificationsounds.com/storage/sounds/file-sounds-1150-pristine.mp3",
    );

    audio.play();
  };

  // NOTIFICATION PERMISSION
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // AUTO SCROLL
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // SOCKET CONNECT
  useEffect(() => {
    if (!user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    socket.emit("join", String(user._id));

    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("onlineUsers");
    };
  }, [user]);

  // RECEIVE MESSAGE
  useEffect(() => {
    const handleReceiveMessage = async (newMessage) => {
      const senderId = newMessage.sender?._id || newMessage.sender;

      const receiverId = newMessage.receiver?._id || newMessage.receiver;

      // ONLY ADD MESSAGE IF CURRENT CHAT OPEN
      if (
        selectedUser &&
        (senderId === selectedUser._id || receiverId === selectedUser._id)
      ) {
        setMessages((prev) => {
          const exists = prev.some((msg) => msg._id === newMessage._id);

          if (exists) return prev;

          return [...prev, newMessage];
        });
      }

      playNotificationSound();

      // UNREAD COUNT
      if (!selectedUser || selectedUser._id !== senderId) {
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }

      const senderUser = allUsers.find((u) => u._id === senderId);

      const senderName = senderUser?.name || "Someone";

      // NOTIFICATION
      if (Notification.permission === "granted" && document.hidden) {
        new Notification(`${senderName} sent a message`, {
          body: newMessage.text
            ? newMessage.text
            : newMessage.image
              ? "📷 Sent an image"
              : "🎤 Sent a voice message",

          icon: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
        });
      }

      // MESSAGE SEEN
      if (selectedUser && senderId === selectedUser._id) {
        try {
          await API.put(
            `/messages/seen/${newMessage._id}`,
            {},
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          socket.emit("messageSeen", {
            senderId,
            messageId: newMessage._id,
          });
        } catch (error) {
          console.log(error);
        }
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
    };
  }, [selectedUser, token, allUsers]);
  // TYPING
  useEffect(() => {
    const handleTyping = (data) => {
      setTypingUser(data.senderId);
    };

    const handleStopTyping = () => {
      setTypingUser(null);
    };

    socket.on("typing", handleTyping);

    socket.on("stopTyping", handleStopTyping);

    return () => {
      socket.off("typing", handleTyping);

      socket.off("stopTyping", handleStopTyping);
    };
  }, []);

  // MESSAGE SEEN
  useEffect(() => {
    socket.on("messageSeen", (data) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === data.messageId
            ? {
                ...msg,
                seen: true,
              }
            : msg,
        ),
      );
    });

    return () => {
      socket.off("messageSeen");
    };
  }, []);

  // INCOMING CALL
  useEffect(() => {
    socket.on("incomingCall", (data) => {
      setReceivingCall(true);

      setCaller(data.from);

      setCallerName(data.name);

      setCallerSignal(data.signal);

      playNotificationSound();

      if (Notification.permission === "granted") {
        const notification = new Notification(`${data.name} is calling you`, {
          body: "📞 Incoming Video Call",

          requireInteraction: true,

          icon: "https://cdn-icons-png.flaticon.com/512/724/724664.png",
        });

        notification.onclick = () => {
          window.focus();
        };
      }
    });

    return () => {
      socket.off("incomingCall");
    };
  }, []);

  // CALL REJECTED
  useEffect(() => {
    socket.on("callRejected", () => {
      alert("Call Declined");

      setShowCall(false);
    });

    return () => {
      socket.off("callRejected");
    };
  }, []);

  // CALL ACCEPTED
  useEffect(() => {
    socket.on("callAccepted", () => {
      setShowCall(true);
    });

    return () => {
      socket.off("callAccepted");
    };
  }, []);

  // FETCH MESSAGES
  const fetchMessages = async (userId) => {
    try {
      const res = await API.get(`/messages/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessages(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // FETCH RECENT CHATS
  const fetchChats = async () => {
    try {
      const res = await API.get("/messages/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAllUsers(res.data);
    } catch (error) {
      console.log(error);
    }
  };

  // LOAD CHATS
  useEffect(() => {
    fetchChats();

    const interval = setInterval(() => {
      fetchChats();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // EMOJI
  const onEmojiClick = (emojiData) => {
    setText((prev) => prev + emojiData.emoji);
  };

  // SEND IMAGE
  const sendImage = async (e) => {
    try {
      const file = e.target.files[0];

      if (!file) return;

      const formData = new FormData();

      formData.append("image", file);

      formData.append("receiverId", selectedUser._id);

      const res = await API.post("/messages/send-image", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setMessages((prev) => [...prev, res.data]);

      socket.emit("sendMessage", {
        receiverId: selectedUser._id,
        message: res.data,
      });
    } catch (error) {
      console.log(error);
    }
  };

  // START RECORDING
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });

      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, {
          type: "audio/webm",
        });

        const formData = new FormData();

        formData.append("audio", audioBlob, "voice.webm");

        formData.append("receiverId", selectedUser._id);

        const res = await API.post("/messages/send-audio", formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });

        setMessages((prev) => [...prev, res.data]);

        socket.emit("sendMessage", {
          receiverId: selectedUser._id,
          message: res.data,
        });
      };

      recorder.start();

      setMediaRecorder(recorder);

      setIsRecording(true);
    } catch (error) {
      console.log(error);
    }
  };

  // STOP RECORDING
  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();

      mediaRecorder.stream.getTracks().forEach((track) => track.stop());
    }

    setIsRecording(false);
  };

  // SEND MESSAGE
  const sendMessage = async () => {
    try {
      if (!text.trim() || !selectedUser) return;

      const res = await API.post(
        "/messages/send",
        {
          receiverId: selectedUser._id,
          text,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      setMessages((prev) => [...prev, res.data]);

      socket.emit("sendMessage", {
        receiverId: selectedUser._id,
        message: res.data,
      });

      socket.emit("stopTyping", {
        senderId: user._id,
        receiverId: selectedUser._id,
      });

      const alreadyExists = allUsers.find((u) => u._id === selectedUser._id);

      if (!alreadyExists) {
        setAllUsers((prev) => [selectedUser, ...prev]);
      }

      setText("");
    } catch (error) {
      console.log(error);
    }
  };

  // ANSWER CALL
  const answerCall = () => {
    socket.emit("answerCall", {
      to: caller,
      signal: "accepted",
    });
  };

  //wallpaper
  const uploadWallpaper = async (file) => {
    try {
      const formData = new FormData();

      formData.append("wallpaper", file);
      formData.append("receiverId", selectedUser._id);

      const res = await API.post("/chat-wallpaper/upload", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setWallpaper(res.data.wallpaper.wallpaper);

      socket.emit("changeWallpaper", {
        senderId: user._id,
        receiverId: selectedUser._id,
        wallpaper: res.data.wallpaper.wallpaper,
      });

      

      setShowWallpaperModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  const removeWallpaper = async () => {
    try {
      await API.delete(`/chat-wallpaper/${selectedUser._id}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

      setWallpaper("");

      socket.emit("changeWallpaper", {
        senderId: user._id,
        receiverId: selectedUser._id,
        wallpaper: "",
      });

      setShowWallpaperModal(false);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const handleWallpaper = (data) => {

        const isCurrentChat =
            (data.senderId === selectedUser?._id &&
                data.receiverId === user._id) ||

            (data.receiverId === selectedUser?._id &&
                data.senderId === user._id);

        if (isCurrentChat) {
            setWallpaper(data.wallpaper);
        }
    };

    socket.on("wallpaperChanged", handleWallpaper);

    return () => {
        socket.off("wallpaperChanged", handleWallpaper);
    };
}, [selectedUser, user]);

  useEffect(() => {

    setWallpaper("");

    if (!selectedUser) return;

    const loadWallpaper = async () => {

        try {

            const res = await API.get(
                `/chat-wallpaper/${selectedUser._id}`,
                {
                    headers:{
                        Authorization:`Bearer ${token}`
                    }
                }
            );

            if(res.data && res.data.wallpaper){

                setWallpaper(res.data.wallpaper);

            }else{

                setWallpaper("");

            }

        }catch(err){

            console.log(err);

            setWallpaper("");

        }

    };

    loadWallpaper();

}, [selectedUser, token]);

  // DELETE CHAT
  const deleteChat = async (userId) => {
    try {
      await API.delete(`/messages/delete-chat/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setAllUsers((prev) => prev.filter((u) => u._id !== userId));

      if (selectedUser?._id === userId) {
        setSelectedUser(null);

        setMessages([]);
      }
    } catch (error) {
      console.log(error);
    }
  };

  // ENTER SEND
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      sendMessage();
    }
  };

  return (
    <div
      className="
    fixed
    inset-0
    flex
    bg-[#0b141a]
    overflow-hidden
  "
    >
      {/* SIDEBAR */}
      <div
        className={`
    ${selectedUser && !showSidebar ? "hidden md:flex" : "flex"}
    w-full md:w-[350px]
    bg-[#202c33]
    border-r border-gray-700
    flex-col
    absolute md:relative
    z-20
    overflow-hidden
    h-full
  `}
      >
        {/* PROFILE */}
        <div className="p-4 bg-[#202c33] border-b border-gray-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <label className="cursor-pointer">
              {user?.profilePic ? (
                <img
                  src={user.profilePic}
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg uppercase">
                  {user?.name?.charAt(0)}
                </div>
              )}

              <input
                type="file"
                hidden
                accept="image/*"
                onChange={async (e) => {
                  try {
                    const file = e.target.files[0];

                    if (!file) return;

                    const formData = new FormData();

                    formData.append("profile", file);

                    const res = await API.post(
                      "/auth/upload-profile",
                      formData,
                      {
                        headers: {
                          Authorization: `Bearer ${token}`,
                          "Content-Type": "multipart/form-data",
                        },
                      },
                    );

                    localStorage.setItem("user", JSON.stringify(res.data));

                    window.location.reload();
                  } catch (error) {
                    console.log(error);
                  }
                }}
              />
            </label>

            <div>
              <h2 className="text-white font-semibold text-lg">{user?.name}</h2>

              <p className="text-green-400 text-sm">Online</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white text-sm"
          >
            Logout
          </button>
        </div>

        {/* SEARCH */}
        <div className="p-3 border-b border-gray-700 bg-[#111b21]">
          <input
            type="text"
            placeholder="Search user..."
            value={search}
            onChange={async (e) => {
              const value = e.target.value;

              setSearch(value);

              try {
                if (!value.trim()) {
                  setSearchUsers([]);

                  return;
                }

                const res = await API.get(`/auth/search?keyword=${value}`, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                  },
                });

                setSearchUsers(res.data);
              } catch (error) {
                console.log(error);
              }
            }}
            className="w-full bg-[#202c33] text-white border border-gray-600 rounded-lg px-4 py-3 outline-none"
          />
        </div>

        {/* USERS */}
        <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden">
          {displayUsers.map((u) => (
            <div
              key={u._id}
              onClick={async () => {
                setSelectedUser(u);
                setUnreadCounts((prev) => ({
                  ...prev,
                  [u._id]: 0,
                }));
                setMessages([]);

                await fetchMessages(u._id);

                setSearch("");

                setSearchUsers([]);

                setShowSidebar(false);
              }}
              className={`flex items-center gap-3 p-4 border-b border-gray-700 cursor-pointer ${
                selectedUser?._id === u._id
                  ? "bg-[#2a3942]"
                  : "hover:bg-[#2a3942]"
              }`}
            >
              {u.profilePic ? (
                <img
                  src={u.profilePic}
                  alt="profile"
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold uppercase">
                  {u.name.charAt(0)}
                </div>
              )}

              <div className="flex-1 flex items-center justify-between">
                <div>
                  <h2 className="text-white font-medium">{u.name}</h2>

                  <p className="text-sm text-gray-400">
                    {onlineUsers.includes(String(u._id)) ? "Online" : "Offline"}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {unreadCounts[u._id] > 0 && (
                    <div className="min-w-[22px] h-[22px] px-1 rounded-full bg-[#00a884] flex items-center justify-center text-white text-xs font-bold">
                      {unreadCounts[u._id]}
                    </div>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();

                      deleteChat(u._id);
                    }}
                    className="text-red-500 text-lg"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CHAT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden min-h-0">
        {selectedUser ? (
          <>
            {/* HEADER */}
            <div className="h-[70px] shrink-0 bg-[#202c33] border-b border-gray-700 flex items-center justify-between px-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebar(true)}
                  className="md:hidden text-white text-2xl"
                >
                  ←
                </button>

                {selectedUser?.profilePic ? (
                  <img
                    src={selectedUser.profilePic}
                    alt="profile"
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold uppercase">
                    {selectedUser?.name?.charAt(0)}
                  </div>
                )}

                <div>
                  <h2 className="text-white font-semibold">
                    {selectedUser?.name}
                  </h2>

                  <p className="text-sm text-green-400">
                    {typingUser === selectedUser?._id
                      ? "Typing..."
                      : onlineUsers.includes(String(selectedUser?._id))
                        ? "Online"
                        : selectedUser?.lastSeen
                          ? `Last seen ${new Date(
                              selectedUser.lastSeen,
                            ).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}`
                          : "Offline"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowWallpaperModal(true)}
                  className="text-white text-2xl hover:text-green-400"
                  title="Wallpaper"
                >
                  🖼️
                </button>

                <button
                  onClick={() => {
                    socket.emit("callUser", {
                      userToCall: selectedUser._id,
                      signalData: null,
                      from: user._id,
                      name: user.name,
                    });
                  }}
                  className="text-white text-xl md:text-2xl"
                >
                  📞
                </button>
              </div>
            </div>

            {/* MESSAGES */}
            <div
              className="
flex-1
min-h-0
overflow-y-auto
overflow-x-hidden
px-3
py-2
pb-4
transition-all
duration-300
"
              style={{
                backgroundImage: wallpaper ? `url(${wallpaper})` : "none",

                backgroundSize: "cover",

                backgroundPosition: "center",

                backgroundRepeat: "no-repeat",
              }}
            >
              {messages.map((msg) => {
                const isMe = (msg.sender?._id || msg.sender) === user._id;

                return (
                  <div
                    key={msg._id}
                    className={`flex mb-2 ${
                      isMe ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] md:max-w-[75%] px-4 py-2 rounded-2xl break-words ${
                        isMe
                          ? "bg-[#005c4b] text-white"
                          : "bg-[#202c33] text-white"
                      }`}
                    >
                      {msg.text && <p className="text-sm">{msg.text}</p>}

                      {msg.image && (
                        <img
                          src={msg.image}
                          alt="chat"
                          className="rounded-lg mt-2 max-w-full"
                        />
                      )}

                      {msg.audio && (
                        <audio controls className="mt-2 w-full">
                          <source src={msg.audio} type="audio/webm" />
                        </audio>
                      )}

                      <div className="text-[11px] text-gray-300 text-right mt-1 flex items-center justify-end gap-1">
                        <span>
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>

                        {isMe && (
                          <span
                            className={`text-xs ${
                              msg.seen
                                ? "text-blue-400"
                                : msg.delivered
                                  ? "text-gray-300"
                                  : "text-gray-500"
                            }`}
                          >
                            {msg.seen ? "✓✓" : msg.delivered ? "✓✓" : "✓"}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              <div ref={messagesEndRef}></div>
            </div>

            {/* INPUT */}
            <div className="p-2 md:p-3 bg-[#202c33] shrink-0 flex items-center gap-2 shrink-0 w-full">
              <button
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="text-2xl flex-shrink-0"
              >
                😊
              </button>

              {showEmojiPicker && (
                <div className="absolute bottom-20 left-2 z-50">
                  <EmojiPicker onEmojiClick={onEmojiClick} />
                </div>
              )}

              <input
                type="text"
                value={text}
                onChange={(e) => {
                  setText(e.target.value);

                  socket.emit("typing", {
                    senderId: user._id,
                    receiverId: selectedUser._id,
                  });
                }}
                onKeyDown={handleKeyPress}
                placeholder="Type a message"
                className="flex-1 w-full min-w-0 bg-[#2a3942] text-white rounded-full px-4 py-2 md:py-3 outline-none"
              />

              <label className="cursor-pointer text-xl md:text-2xl text-white flex-shrink-0">
                📎
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={sendImage}
                />
              </label>

              <button
                onClick={async () => {
                  if (!isRecording) {
                    await startRecording();
                  } else {
                    stopRecording();
                  }
                }}
                className={`text-xl md:text-2xl flex-shrink-0 ${
                  isRecording ? "text-red-500 animate-pulse" : "text-white"
                }`}
              >
                {isRecording ? "⏹️" : "🎤"}
              </button>

              <button
                onClick={sendMessage}
                className="bg-green-500 hover:bg-green-600 px-3 md:px-5 py-2 rounded-full text-white flex-shrink-0"
              >
                ➤
              </button>
            </div>

            {/* INCOMING CALL POPUP */}
            {receivingCall && !showCall && (
              <div className="absolute inset-0 bg-black/70 z-50 flex items-center justify-center">
                <div className="bg-[#202c33] p-6 rounded-2xl text-center w-[320px]">
                  <div className="w-20 h-20 rounded-full bg-green-500 flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                    {callerName?.charAt(0)}
                  </div>

                  <h2 className="text-white text-2xl font-bold">
                    {callerName}
                  </h2>

                  <p className="text-gray-300 mt-2">Incoming Video Call...</p>

                  <div className="flex items-center justify-center gap-6 mt-6">
                    <button
                      onClick={() => {
                        socket.emit("rejectCall", {
                          to: caller,
                        });

                        setReceivingCall(false);
                      }}
                      className="bg-red-500 w-16 h-16 rounded-full text-3xl"
                    >
                      ❌
                    </button>

                    <button
                      onClick={() => {
                        answerCall();

                        setShowCall(true);

                        setReceivingCall(false);
                      }}
                      className="bg-green-500 w-16 h-16 rounded-full text-3xl"
                    >
                      📞
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* VIDEO CALL */}
            {showCall && (
              <VideoCall
                socket={socket}
                user={user}
                selectedUser={selectedUser}
                receivingCall={receivingCall}
                caller={caller}
                callerName={callerName}
                callerSignal={callerSignal}
                setReceivingCall={setReceivingCall}
                setShowCall={setShowCall}
              />
            )}

            <WallpaperModal
              open={showWallpaperModal}
              onClose={() => {
                setShowWallpaperModal(false);
              }}
              onUpload={uploadWallpaper}
              onRemove={removeWallpaper}
            />
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-white text-3xl">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
}

export default Chat;
