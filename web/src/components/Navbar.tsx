import { Bell, CloudLightningIcon, Menu, Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { socketClient } from "../socket";
import api from "../axios";

interface NavbarProps {
  darkMode: boolean;
  setDarkMode: (value: boolean) => void;
}

interface Notify {
  id: number;
  message: string;
  timestamp: string;
}

const Navbar = ({ darkMode, setDarkMode }: NavbarProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [adminNotifications, setAdminNotifications] = useState<Notify[]>([]);
  const [userNotifications, setUserNotifications] = useState<any[]>([]);
  const [isNotification, setIsNotification] = useState(false);
  const [userNotificationRead, setUserNotificationRead] = useState(false);
  const [adminNotificationRead, setAdminNotificationRead] = useState(false);
  const location = useLocation();

  const isAuthenticated = location.pathname.includes("/dashboard");
  const adminToken = sessionStorage.getItem("__adminToken__");
  const role = adminToken ? "admin" : "user";

  console.log(role);
  useEffect(() => {
    if (role === "admin") {
      socketClient.on("admin:notifications", (data) => {
        console.log(data);
        setIsNotification(true);
        setAdminNotifications((prev) => [JSON.parse(data), ...prev]);
      });
    } else {
      socketClient.on("user:notifications", (data) => {
        console.log(data);
        setIsNotification(true);
        setUserNotifications((prev) => [...prev, data]);
        // const storedNotifications =
        //   sessionStorage.getItem("user_notifications");
        // const prevNotfications = storedNotifications
        //   ? JSON.parse(storedNotifications)
        //   : [];
        // sessionStorage.setItem(
        //   "user_notifications",
        //   JSON.stringify([...prevNotfications, data]),
        // );
      });
    }

    return () => {
      socketClient.off("admin:notifications");
      socketClient.off("user:notifications");
    };
  }, []);

  useEffect(() => {
    const fetchAdminNotifications = async () => {
      try {
        const response = await api.get("/admin-notifications", {
          headers: {
            "x-access-token": adminToken,
          },
        });
        if (response.status === 200) {
          setAdminNotifications(response.data?.data);
        }
      } catch (error: any) {
        console.log(error.message);
      }
    };

    if (role === "admin") {
      fetchAdminNotifications();
    } else {
      // const userNotifys = sessionStorage.getItem("user_notifications")
      //   ? JSON.parse(sessionStorage.getItem("user_notifications") as string)
      //   : [];
      setUserNotifications([]);
    }
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold text-indigo-600 dark:text-indigo-400 flex justify-center items-center gap-2">
                <CloudLightningIcon />
                socket-notify
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden sm:flex sm:items-center sm:space-x-8">
            {!isAuthenticated ? (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin/login"
                  className="text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400"
                >
                  Admin
                </Link>
              </>
            ) : (
              <div className="relative">
                <button
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    role === "admin"
                      ? setAdminNotificationRead(true)
                      : setUserNotificationRead(true);
                  }}
                  className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                >
                  <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                  {isNotification &&
                    (role === "admin"
                      ? !adminNotificationRead && (
                          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                        )
                      : !userNotificationRead && (
                          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
                        ))}
                </button>
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700 max-h-48">
                      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200">
                        Notifications
                      </h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {role === "admin" ? (
                        adminNotifications.length > 0 &&
                        adminNotifications.map((item, index) => (
                          <div
                            key={item.id}
                            className="max-h-48 overflow-y-auto"
                          >
                            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <p
                                className={`text-sm ${index === 0 && isNotification ? "text-red-700" : "text-gray-700"} dark:text-gray-200`}
                              >
                                {item.message}
                              </p>
                              {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(
                                  item.timestamp,
                                ).toLocaleTimeString() ||
                                  Date.now().toLocaleString()}
                              </p> */}
                            </div>
                          </div>
                        ))
                      ) : userNotifications.length === 0 ? (
                        <div>
                          <p className="text-sm ml-2">No notification...</p>
                        </div>
                      ) : (
                        userNotifications.map((item, index) => (
                          <div key={index} className="max-h-48 overflow-y-auto">
                            <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700">
                              <p className="text-sm text-gray-700 dark:text-gray-200">
                                {item}
                              </p>
                              {/* <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {new Date(
                                  item.timestamp,
                                ).toLocaleTimeString() ||
                                  new Date().toLocaleTimeString()}
                              </p> */}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center space-x-4">
            {isAuthenticated && (
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 relative"
              >
                <Bell className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500"></span>
              </button>
            )}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {darkMode ? (
                <Sun className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              ) : (
                <Moon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            {!isAuthenticated && (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Sign Up
                </Link>
                <Link
                  to="/admin/login"
                  className="block px-3 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Admin
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile Notifications */}
      {/* {showNotifications && isAuthenticated && (
        <div className="sm:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-200 mb-2">
                Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Bell className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-200">
                      Welcome to our platform!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      2 minutes ago
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )} */}
    </nav>
  );
};

export default Navbar;
