import { Bell, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import api from "../axios";
import { socketClient } from "../socket";

const UserDashboard = () => {
  const token = sessionStorage.getItem("__token__");
  const name = sessionStorage.getItem("__userName__");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isUserVerified, setIsUserVerified] = useState(false);

  if (!token) {
    return <Navigate to={"/"} replace />;
  }

  const handleLogout = () => {
    sessionStorage.clear();
    socketClient.disconnect();
    navigate("/");
  };

  const handleVerify = async () => {
    try {
      setLoading(true);
      const response = await api.get("/verify-user", {
        headers: {
          "x-access-token": token,
        },
      });
      if (response.status === 200) {
        setLoading(false);
        alert("Veification successful");
        // setTimeout(() => {
        //   window.location.reload();
        // }, 1000);
        setIsUserVerified(true);
      }
    } catch (error: any) {
      alert("Verification failed. Try after sometime");
    }
  };

  useEffect(() => {
    socketClient.auth = { token };
    socketClient.connect();
    alert("Socket connected");
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/user-profile", {
          headers: {
            "x-access-token": token,
          },
        });
        if (response.status === 200) {
          setUser(response.data?.data);
          setIsUserVerified(response.data?.data?.isVerified === 1);
        }
      } catch (error: any) {
        alert("Error fetching profile");
      }
    };
    fetchProfile();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {name}!
            </h1>
            <button
              className="flex space-x-2 justify-center items-center hover:text-red-400 cursor-pointer transition-colors duration-150"
              onClick={handleLogout}
            >
              <span>Logout</span>
              <LogOut size={20} />
            </button>
          </div>

          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Your Activity
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <dl>
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">
                      Last login
                    </dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      March 13, 2024 10:30 AM
                    </dd>
                  </div>
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 items-center">
                    <dt className="text-sm font-medium text-gray-500">
                      Account status
                    </dt>
                    {isUserVerified ? (
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </dd>
                    ) : (
                      <button
                        className="cursor-pointer"
                        onClick={handleVerify}
                        disabled={loading}
                      >
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-indigo-500 text-white hover:bg-indigo-600 transition-colors duration-150">
                          {loading ? "Verifying..." : "Verify now"}
                        </span>
                      </button>
                    )}
                  </div>
                </dl>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Notifications
                </h3>
              </div>
              <div className="border-t border-gray-200">
                <ul className="divide-y divide-gray-200">
                  <li className="px-4 py-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Bell className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900">
                          Welcome to our platform!
                        </p>
                        <p className="text-sm text-gray-500">
                          We're glad to have you here.
                        </p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">2m ago</span>
                      </div>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
