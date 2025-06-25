'use client';

import { useUser } from '@clerk/nextjs';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { io as ClientIO, Socket } from 'socket.io-client';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  activeUsers: string[];
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
  activeUsers: [],
});

export const useSocket = (): SocketContextType => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const { user } = useUser();

  useEffect(() => {
    if (!user?.id) return;

    const socketInstance = ClientIO(
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000',
      {
        transports: ['websocket', 'polling'],
        withCredentials: true,
        forceNew: true,
        timeout: 10000,
      }
    );

    socketInstance.on('connect', () => {
      socketInstance.emit('REGISTER', { userId: user.id });
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('ACTIVE_USERS', (activeUsersArr: string[]) => {
      setActiveUsers(activeUsersArr);
    });

    socketInstance.on('ACTIVE_USERS:REMOVE', (userId: string) => {
      setActiveUsers((prev) => prev.filter((id) => id !== userId));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [user?.id]);

  return (
    <SocketContext.Provider value={{ socket, isConnected, activeUsers }}>
      {children}
    </SocketContext.Provider>
  );
};
