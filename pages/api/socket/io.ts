import { RECEIVE_MSG_EVENT, TYPING_EVENT } from '@/lib/socket-events';
import { db } from '@/server/db';
import { Server as HttpServer } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { Server as ServerIO } from 'socket.io';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: HttpServer & {
      io?: ServerIO;
    };
  };
};

export const config = {
  api: {
    bodyParser: false,
  },
};

const socketToUserId = new Map();
const userIdToSocket = new Map();

const SocketHandler = (
  req: NextApiRequest,
  res: NextApiResponseServerIO
): void => {
  if (res.socket.server.io) {
    console.log('Socket is already running...');
  } else {
    console.log('Socket is initializing...');

    const io = new ServerIO(res.socket.server, {
      path: '/api/socket/io',
      pingTimeout: 60000,
    });
    res.socket.server.io = io;

    io.on('connection', (socket) => {
      socket.on('REGISTER', ({ userId }) => {
        if (userIdToSocket.has(userId)) {
          socketToUserId.delete(userIdToSocket.get(userId));
        }

        socketToUserId.set(socket.id, userId);
        userIdToSocket.set(userId, socket.id);

        console.log('REGISTERED_USER: ', socketToUserId);
        console.log('USERIDTOSOCKETMAP: ', userIdToSocket);

        console.log('SENDING_ACTIVE_USERS: ', socketToUserId);
        io.emit('ACTIVE_USERS', Array.from(userIdToSocket.keys()));
      });

      socket.on('JOIN', ({ chatId }) => {
        socket.rooms.forEach((room) => {
          if (room !== socket.id && room !== chatId) {
            socket.leave(room);
          }
        });

        socket.join(chatId);
      });

      socket.on(
        'SEND_MESSAGE',
        async ({ chatId, content, type = 'TEXT' }, returnMsg) => {
          try {
            const senderId = socketToUserId.get(socket.id);
            if (!senderId) {
              return returnMsg({ error: 'User not registered' });
            }

            const message = await db.message.create({
              data: {
                content,
                type,
                chatId,
                senderId,
              },
              include: {
                sender: {
                  select: {
                    id: true,
                    username: true,
                    fullName: true,
                    image: true,
                  },
                },
              },
            });

            const updatedChat = await db.chat.update({
              where: { id: chatId },
              data: { lastMessageAt: new Date() },
              include: {
                user1: {
                  select: {
                    id: true,
                    username: true,
                    fullName: true,
                    image: true,
                  },
                },
                user2: {
                  select: {
                    id: true,
                    username: true,
                    fullName: true,
                    image: true,
                  },
                },
                messages: {
                  orderBy: { createdAt: 'desc' },
                  take: 1,
                  include: {
                    sender: {
                      select: {
                        id: true,
                        username: true,
                        fullName: true,
                        image: true,
                      },
                    },
                  },
                },
                _count: {
                  select: {
                    messages: {
                      where: {
                        senderId: { not: senderId },
                        status: { not: 'SEEN' },
                      },
                    },
                  },
                },
              },
            });

            returnMsg(message);

            const receiverId =
              updatedChat.user1.id === senderId
                ? updatedChat.user2.id
                : updatedChat.user1.id;

            const senderSocketId = userIdToSocket.get(senderId);
            if (senderSocketId && senderSocketId !== socket.id) {
              io.to(senderSocketId).emit('chat-list-update');
            }

            const receiverSocketId = userIdToSocket.get(receiverId);
            if (receiverSocketId) {
              io.to(receiverSocketId).emit(RECEIVE_MSG_EVENT, message);
              io.to(receiverSocketId).emit('chat-list-update');
            }
          } catch (error) {
            console.error('Error sending message:', error);
            returnMsg({ error: 'Failed to send message' });
          }
        }
      );

      socket.on(TYPING_EVENT, ({ chatId, isTyping }) => {
        socket.broadcast.to(chatId).emit(TYPING_EVENT, { isTyping });
      });

      socket.on('SEEN_MESSAGE', async ({ messageId, chatId }) => {
        try {
          const updatedMsg = await db.message.update({
            where: { id: messageId },
            data: {
              status: 'SEEN',
              readAt: new Date(),
            },
            include: {
              sender: {
                select: {
                  id: true,
                  username: true,
                  fullName: true,
                  image: true,
                },
              },
            },
          });

          const senderId = updatedMsg.senderId;
          const senderSocketId = userIdToSocket.get(senderId);

          if (senderSocketId) {
            io.to(senderSocketId).emit('SEEN_MESSAGE_UPDATE', { updatedMsg });
            io.to(senderSocketId).emit('chat-list-update');
          }

          socket.emit('chat-list-update');
        } catch (error) {
          console.error('Error updating message status:', error);
        }
      });

      socket.on('chat-list-update', ({ userId }) => {
        const socketId = userIdToSocket.get(userId);
        if (socketId) {
          io.to(socketId).emit('chat-list-update');
        }
      });

      socket.on('disconnect', () => {
        console.log('a client disconnected');

        const userId = socketToUserId.get(socket.id);

        socketToUserId.delete(socket.id);
        userIdToSocket.delete(userId);

        io.emit('ACTIVE_USERS:REMOVE', userId);
      });
    });
  }

  res.end();
};

export default SocketHandler;
