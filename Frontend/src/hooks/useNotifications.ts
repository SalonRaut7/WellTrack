import { useEffect, useState } from "react";
import * as signalR from "@microsoft/signalr";

export interface Notification {
  id: string; // unique id for rendering
  date: string;
  message: string;
}

export const useNotifications = (hubUrl: string) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);

  useEffect(() => {
    const conn = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => localStorage.getItem("accessToken") || "",
      })
      .withAutomaticReconnect()
      .build();

    conn.start()
      .then(() => console.log("SignalR connected"))
      .catch(console.error);

    conn.on("ReceiveMotivation", (data: { date: string; message: string }) => {
      setNotifications((prev) => [
        { id: crypto.randomUUID(), ...data }, // create unique id
        ...prev,
      ]);
    });

    setConnection(conn);

    return () => {
      conn.stop();
    };
  }, [hubUrl]);

  const clearNotifications = () => setNotifications([]);

  return { notifications, clearNotifications };
};
