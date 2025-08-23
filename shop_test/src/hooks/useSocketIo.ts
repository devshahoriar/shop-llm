import { env } from "@/env";
import { useEffect, useState } from "react";
import { io, type ManagerOptions, type Socket, type SocketOptions } from "socket.io-client";

let socket: Socket | null = null;

function getSocket(url: string, opts?: Partial<ManagerOptions & SocketOptions>) {
  socket ??= io(url, opts);
  return socket;
}

const url = env.NEXT_PUBLIC_API_URL;

export function useSocketIo() {
  const [isConnected, setIsConnected] = useState(false);
  const socket = getSocket(url, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 4,
    reconnectionDelay: 100,
  });

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [socket]);

  return {
    socket,
    isConnected,
    emit: socket.emit.bind(socket),
    on: socket.on.bind(socket),
    off: socket.off.bind(socket),
  };
}
