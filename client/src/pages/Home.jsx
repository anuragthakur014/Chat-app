import { useContext, useEffect } from "react";

import { Link, useNavigate } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

function Home() {

  const { user, loading } =
    useContext(AuthContext);

  const navigate = useNavigate();

  // AUTO REDIRECT
  useEffect(() => {

    if (!loading && user) {

      navigate("/chat");

    }

  }, [user, loading]);

  // LOADING
  if (loading) {

    return (

      <div className="h-screen bg-[#0b141a] flex items-center justify-center text-white text-2xl">

        Loading...

      </div>

    );

  }

  return (

    <div className="h-screen overflow-hidden bg-[#0b141a] flex items-center justify-center px-3">

      {/* MOBILE APP CONTAINER */}
      <div className="w-full max-w-[360px] h-[95vh] bg-[#202c33] rounded-[35px] overflow-hidden shadow-2xl border border-gray-700 flex flex-col">

        {/* TOP HEADER */}
        <div className="bg-[#00a884] px-5 pt-8 pb-5 relative">

          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-28 h-1.5 bg-white/40 rounded-full"></div>

          <div className="flex items-center justify-center">

            <div className="w-20 h-20 rounded-full bg-white flex items-center justify-center text-6xl shadow-lg">

              💬

            </div>

          </div>

          <h1 className="text-white text-3xl font-bold text-center mt-4">

            Chat App

          </h1>

          <p className="text-white/80 text-center mt-2 text-sm">

            Fast • Secure • Realtime

          </p>

        </div>

        {/* CHAT PREVIEW */}
        <div className="bg-[#0b141a] px-4 py-4 space-y-3 flex-1 overflow-hidden">

          {/* CHAT 1 */}
          <div className="flex items-center gap-4 bg-[#202c33] p-3 rounded-2xl">

            <div className="w-14 h-14 rounded-full bg-[#00a884] flex items-center justify-center text-white text-2xl font-bold">

              A

            </div>

            <div className="flex-1">

              <div className="flex items-center justify-between">

                <h2 className="text-white font-semibold text-lg">
                  Alex
                </h2>

                <span className="text-gray-400 text-sm">
                  10:30
                </span>

              </div>

              <p className="text-gray-400 text-sm mt-1">
                Hey 👋 How are you?
              </p>

            </div>

          </div>

          {/* CHAT 2 */}
          <div className="flex items-center gap-4 bg-[#202c33] p-3 rounded-2xl">

            <div className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white text-2xl font-bold">

              S

            </div>

            <div className="flex-1">

              <div className="flex items-center justify-between">

                <h2 className="text-white font-semibold text-lg">
                  Sarah
                </h2>

                <span className="text-gray-400 text-sm">
                  09:12
                </span>

              </div>

              <p className="text-gray-400 text-sm mt-1">
                📞 Missed video call
              </p>

            </div>

          </div>

          {/* CHAT 3 */}
          <div className="flex items-center gap-4 bg-[#202c33] p-3 rounded-2xl">

            <div className="w-14 h-14 rounded-full bg-pink-500 flex items-center justify-center text-white text-2xl font-bold">

              R

            </div>

            <div className="flex-1">

              <div className="flex items-center justify-between">

                <h2 className="text-white font-semibold text-lg">
                  Rachel
                </h2>

                <span className="text-gray-400 text-sm">
                  Yesterday
                </span>

              </div>

              <p className="text-gray-400 text-sm mt-1">
                🎤 Voice message
              </p>

            </div>

          </div>

        </div>

        {/* FEATURES */}
        <div className="px-4 py-3 bg-[#202c33] border-t border-gray-700">

          <div className="grid grid-cols-3 gap-3 text-center">

            <div className="bg-[#2a3942] rounded-2xl p-3">

              <div className="text-3xl">
                💬
              </div>

              <p className="text-white text-sm mt-2">
                Chat
              </p>

            </div>

            <div className="bg-[#2a3942] rounded-2xl p-3">

              <div className="text-3xl">
                📞
              </div>

              <p className="text-white text-sm mt-2">
                Calls
              </p>

            </div>

            <div className="bg-[#2a3942] rounded-2xl p-3">

              <div className="text-3xl">
                📸
              </div>

              <p className="text-white text-sm mt-2">
                Media
              </p>

            </div>

          </div>

        </div>

        {/* BUTTONS */}
        <div className="p-4 bg-[#202c33] space-y-3">

          <Link
            to="/login"
            className="block w-full bg-[#00a884] hover:bg-[#019874] transition-all text-white text-center py-4 rounded-2xl font-bold text-lg"
          >

            Login

          </Link>

          <Link
            to="/register"
            className="block w-full border border-[#00a884] text-[#00a884] hover:bg-[#00a884] hover:text-white transition-all text-center py-4 rounded-2xl font-bold text-lg"
          >

            Create Account

          </Link>

        </div>

      </div>

    </div>

  );

}

export default Home;