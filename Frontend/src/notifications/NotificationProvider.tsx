import React, { createContext, useContext, useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";
import { type AppNotification } from "./notification.types";

type NotificationContextType = {
  notifications: AppNotification[];
  clearNotifications: () => void;
};

const NotificationContext = createContext<NotificationContextType>({
  notifications: [],
  clearNotifications: () => {},
});

export const useAppNotifications = () => useContext(NotificationContext);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  const clearNotifications = () => setNotifications([]);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl("http://localhost:5049/hubs/notifications", {
        accessTokenFactory: () => localStorage.getItem("accessToken") || "",
      })
      .withAutomaticReconnect()
      .build();

    conn.start().catch(console.error);

    conn.on("ReceiveNotification", (data: Omit<AppNotification, "id">) => {
      setNotifications((prev) =>
        [
          {
            id: crypto.randomUUID(),
            ...data,
          },
          ...prev,
        ].slice(0, 20)
      );
    });

    return () => {
      conn.stop();
    };
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, clearNotifications }}>
      {children}
    </NotificationContext.Provider>
  );
};