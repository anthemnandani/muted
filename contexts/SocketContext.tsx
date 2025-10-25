'use client';

import { api } from '@/trpc/react';
import { useClerk, useUser } from '@clerk/nextjs';
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from 'react';
import { io as ClientIO, Socket } from 'socket.io-client';
import { toast } from 'sonner';

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
  const { signOut } = useClerk();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const { user } = useUser();
  const utils = api.useUtils();

  useEffect(() => {
    if (!user?.id) return;

    const socketURL =
      process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:8000';

    const socketInstance = ClientIO(socketURL, {
      transports: ['websocket', 'polling'],
      withCredentials: true,
      forceNew: true,
      timeout: 10000,
    });

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

    socketInstance.on('ACCOUNT_UPDATE', (data) => {
      if (data.type === 'WARNING') {
        utils.notification.getNotifications.invalidate();
        utils.notification.getUnreadCount.invalidate();
      } else if (data.type === 'UNSUSPENDED') {
        toast.info(data.message, {
          duration: 10000,
        });
      } else if (data.type === 'SUSPENDED' || data.type === 'BANNED') {
        toast.error(data.message, {
          description: 'You will be logged out automatically.',
          duration: 5000,
          richColors: true,
          className: 'p-2',
        });

        setTimeout(() => {
          signOut();
        }, 5000);
      }
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
