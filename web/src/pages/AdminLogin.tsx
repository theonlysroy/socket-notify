import { useState } from "react";
import api from "../axios";
import { useNavigate } from "react-router-dom";
import { Loader } from "lucide-react";
import { socketClient } from "../socket";

const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError("");
      if (!email) {
        setError("Please provide email to login");
        setLoading(false);
        return;
      }
      const response = await api.post("/login", {
        email,
        role: "admin",
      });
      if (response.status === 200) {
        const { token, user } = response.data?.data;
        socketClient.auth = { token };
        socketClient.connect();
        setLoading(false);
        sessionStorage.setItem("__adminToken__", token);
        sessionStorage.setItem("__adminName__", user);
        navigate("/admin/dashboard");
      }
    } catch (error: any) {
      setError(error?.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Admin Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please enter your administrator credentials
          </p>
        </div>
        <form className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="admin-email" className="sr-only">
                Email address
              </label>
              <input
                id="admin-email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Admin email"
                value={email}
                onChange={(e) => {
                  setError("");
                  setEmail(e.target.value);
                }}
              />
            </div>
          </div>

          <div className="text-center">
            <span className="text-red-500 text-sm transition-all duration-150">
              {error}
            </span>
          </div>

          <div>
            <button
              type="submit"
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${loading ? "opacity-20" : ""}`}
              onClick={handleAdminLogin}
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in as Admin"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
