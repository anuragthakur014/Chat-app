function Profile({ user, logout }) {
  return (
    <div className="flex-1 bg-[#111b21] text-white overflow-y-auto">

      {/* HEADER */}

      <div className="bg-[#202c33] px-5 py-5 border-b border-gray-700">

        <h1 className="text-xl font-semibold">
          Profile
        </h1>

        <p className="text-xs text-gray-400 mt-1">
          Your account and settings
        </p>

      </div>


      {/* PROFILE */}

      <div className="flex flex-col items-center py-8">

        {user?.profilePic ? (
          <img
            src={user.profilePic}
            alt="profile"
            className="w-28 h-28 rounded-full object-cover"
          />
        ) : (
          <div className="
            w-28
            h-28
            rounded-full
            bg-green-500
            flex
            items-center
            justify-center
            text-white
            text-4xl
            font-bold
          ">
            {user?.name?.charAt(0)?.toUpperCase()}
          </div>
        )}

        <h2 className="text-xl font-semibold mt-4">
          {user?.name}
        </h2>

        <p className="text-green-400 text-sm mt-1">
          Online
        </p>

      </div>


      {/* ACCOUNT */}

      <div className="px-4">

        <div className="bg-[#202c33] rounded-xl overflow-hidden">

          <div className="px-4 py-4 border-b border-gray-700">
            <p className="text-xs text-gray-400">
              Name
            </p>

            <p className="mt-1">
              {user?.name || "Not available"}
            </p>
          </div>


          <div className="px-4 py-4 border-b border-gray-700">

            <p className="text-xs text-gray-400">
              Email
            </p>

            <p className="mt-1 break-all">
              {user?.email || "Not available"}
            </p>

          </div>


          <div className="px-4 py-4">

            <p className="text-xs text-gray-400">
              Account
            </p>

            <p className="mt-1 text-green-400">
              Active
            </p>

          </div>

        </div>


        {/* LOGOUT */}

        <button
          onClick={logout}
          className="
            w-full
            mt-6
            bg-red-500
            hover:bg-red-600
            py-3
            rounded-xl
            font-medium
          "
        >
          Logout
        </button>

      </div>

    </div>
  );
}

export default Profile;