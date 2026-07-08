import { useEffect, useState } from "react";
import API from "@/api/notifications-base-api";
import { io } from "socket.io-client";

export const useNotifications = () => {
  const [data, setData] = useState<any[]>([]);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const fetchNotifications = async () => {
      const res = await API.get("/notifications");
      setData(res.data?.data || []);
    };

    const fetchUnreadCount = async () => {
      const res = await API.get("/notifications/unread-count");
      setCount(res.data?.count || 0);
    };

    fetchNotifications();
    fetchUnreadCount();

    const token = localStorage.getItem("access_token");
    const userId = localStorage.getItem("userId");

    if (!token || !userId) return;

    const socket = io("https://rovex.click", {
      path: "/notification-socket",
      transports: ["websocket"],
      auth: {
        token: token,
        userId: userId,
      },
    });

    socket.on("notification", (notification) => {
      setData((prev) => [notification, ...prev]);
      setCount((prev) => prev + 1);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleRead = async (id: string) => {
    await API.patch(`/notifications/${id}/read`);
    setData((prev) =>
      prev.map((n) =>
        n._id === id ? { ...n, status: "read" } : n
      )
    );
    setCount((prev) => Math.max(prev - 1, 0));
  };

  const handleReadAll = async () => {
    await API.patch("/notifications/read-all");
    setData((prev) =>
      prev.map((n) => ({ ...n, status: "read" }))
    );
    setCount(0);
  };

  return {
    data,
    count,
    handleRead,
    handleReadAll,
  };
};