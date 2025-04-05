import { LogOut } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import { socketClient } from "../socket";
import { useEffect } from "react";

const AdminDashboard = () => {
  const token = sessionStorage.getItem("__adminToken__");
  const navigate = useNavigate();
  if (!token) {
    return <Navigate to={"/admin/login"} replace />;
  }

  const handleLogout = () => {
    sessionStorage.removeItem("__adminName__");
    sessionStorage.removeItem("__adminToken__");
    socketClient.disconnect();
    navigate("/admin/login");
  };

  useEffect(() => {
    socketClient.auth = { token };
    socketClient.connect();
    alert("Socket connected");
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">
              Admin Dashboard
            </h1>
            <button
              className="flex space-x-2 justify-center items-center hover:text-red-400 cursor-pointer transition-colors duration-150"
              onClick={handleLogout}
            >
              <span>Logout</span>
              <LogOut size={20} />
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {/* Stats Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-indigo-500 rounded-md p-3">
                      {/* Add an icon here */}
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Total Users
                      </dt>
                      <dd className="text-lg font-semibold text-gray-900">
                        1,234
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Card */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Recent Activity
                </h3>
                <div className="mt-5">
                  <div className="flow-root">
                    <ul className="-mb-8">
                      <li className="pb-4">
                        <div className="relative">
                          <span
                            className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                            aria-hidden="true"
                          ></span>
                          <div className="relative flex space-x-3">
                            <div>
                              <span className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center ring-8 ring-white">
                                {/* Add an icon here */}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                              <div>
                                <p className="text-sm text-gray-500">
                                  New user registered
                                </p>
                              </div>
                              <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                <time dateTime="2024-03-13">1 hour ago</time>
                              </div>
                            </div>
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
      </div>
    </div>
  );
};

export default AdminDashboard;
