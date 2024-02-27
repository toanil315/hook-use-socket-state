import React, { useContext, useEffect } from "react";
import { Socket, io } from "socket.io-client";

interface SocketContextValue {
  socket: Socket | null;
  handleChangeSocket: (socket: Socket) => void;
}

interface SocketProviderProps {
  children: React.ReactNode;
  url: string;
}

const SocketContext = React.createContext<SocketContextValue>({
  socket: null,
  handleChangeSocket: () => {},
});

const sockets: Record<
  string /* url */,
  { socket: Socket; observers: Function[] }
> = {};

const SocketProvider = ({ children, url }: SocketProviderProps) => {
  const [socket, setSocket] = React.useState<Socket | null>(null);

  useEffect(() => {
    if (sockets[url].socket) {
      setSocket(sockets[url].socket);
      sockets[url].observers.push(setSocket);
    }

    const newSocket = io(url);
    sockets[url] = {
      socket: newSocket,
      observers: [setSocket],
    };
    setSocket(newSocket);

    return () => {
      sockets[url].observers.filter((fn) => fn != setSocket);
    };
  }, [url, setSocket]);

  const handleChangeSocket = (socket: Socket) => {
    sockets[url].observers.forEach((fn) => fn(socket));
  };

  return (
    <SocketContext.Provider value={{ socket, handleChangeSocket }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketProvider;

export const useSocketContext = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("useSocketContext must be used within a SocketProvider");
  }

  if (!context.socket) {
    throw new Error("Socket is not initialized");
  }

  return context;
};
