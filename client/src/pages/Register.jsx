import { useState, useContext } from "react";

import { useNavigate, Link } from "react-router-dom";

import { AuthContext } from "../context/AuthContext";

import API from "../services/api";

function Register() {

  const navigate = useNavigate();

  const { setUser } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    try {

      setLoading(true);

      const res = await API.post(
        "/auth/register",
        formData
      );

      localStorage.setItem(
        "token",
        res.data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(res.data.user)
      );

      setUser(res.data.user);

      navigate("/chat");

    } catch (error) {

      console.log(error);

      alert(
        error.response?.data?.message ||
        "Something went wrong"
      );

    } finally {

      setLoading(false);

    }

  };

  return (

    <div className="min-h-screen bg-[#111b21] flex items-center justify-center px-4">

      <div className="w-full max-w-md bg-[#202c33] rounded-3xl shadow-2xl overflow-hidden border border-gray-700">

        {/* TOP */}
        <div className="bg-[#00a884] p-8 flex flex-col items-center">

          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl">
            🚀
          </div>

          <h1 className="text-white text-3xl font-bold mt-4">
            Create Account
          </h1>

          <p className="text-white/80 mt-2 text-center">
            Join and start chatting instantly
          </p>

        </div>

        {/* FORM */}
        <div className="p-8">

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* NAME */}
            <div>

              <label className="text-gray-300 text-sm block mb-2">
                Full Name
              </label>

              <input
                type="text"
                name="name"
                placeholder="Enter your name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-[#2a3942] text-white border border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-[#00a884]"
                required
              />

            </div>

            {/* EMAIL */}
            <div>

              <label className="text-gray-300 text-sm block mb-2">
                Email
              </label>

              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[#2a3942] text-white border border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-[#00a884]"
                required
              />

            </div>

            {/* PASSWORD */}
            <div>

              <label className="text-gray-300 text-sm block mb-2">
                Password
              </label>

              <input
                type="password"
                name="password"
                placeholder="Create password"
                value={formData.password}
                onChange={handleChange}
                className="w-full bg-[#2a3942] text-white border border-gray-600 rounded-xl px-4 py-3 outline-none focus:border-[#00a884]"
                required
              />

            </div>

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#00a884] hover:bg-[#019874] transition-all text-white p-3 rounded-xl font-semibold text-lg"
            >

              {
                loading
                  ? "Creating Account..."
                  : "Register"
              }

            </button>

          </form>

          {/* LOGIN */}
          <div className="mt-6 text-center">

            <p className="text-gray-400">

              Already have an account?{" "}

              <Link
                to="/login"
                className="text-[#00a884] font-semibold hover:underline"
              >
                Login here
              </Link>

            </p>

          </div>

        </div>

      </div>

    </div>

  );

}

export default Register;