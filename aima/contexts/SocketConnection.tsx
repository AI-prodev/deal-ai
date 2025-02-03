import { baseUrl } from "@/utils/baseUrl";
import {
  PropsWithChildren,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";

const SocketContext = createContext<Socket | undefined>(undefined);

interface SocketConnectionArgs extends PropsWithChildren {
  namespace: string;
  userId: string;
}

const SocketConnection = ({
  children,
  namespace,
  userId,
}: SocketConnectionArgs) => {
  const [socket, setSocket] = useState<Socket>();

  useEffect(() => {
    const newSocket = io(`${baseUrl}/${namespace}`, {
      query: { userId },
      path: "/socket-io",
      withCredentials: true,
      transports: ["websocket", "polling"],
    });

    newSocket.connect();

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [namespace, userId]);

  useEffect(() => {
    if (!socket) return;

    // eslint-disable-next-line no-console
    const handleConnect = () => console.log("connected to socket");
    // eslint-disable-next-line no-console
    const handleDisconnect = () => console.log("disconnected from socket");

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};

export const useSocketContext = () => useContext(SocketContext);

export default SocketConnection;
