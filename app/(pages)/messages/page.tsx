// 'use client';

// import { Icons } from '@/components/icons';
// import { ScrollArea } from '@/components/ui/scroll-area';
// import { cn } from '@/lib/utils';
// import { User, Clock, Check, CheckCheck } from 'lucide-react';
// import { Fragment, useEffect, useState, useCallback } from 'react';
// import { useUser } from '@clerk/nextjs';
// import { api } from '@/trpc/react';
// import Image from 'next/image';
// import useMessageStore from '@/store/messageStore';
// import MessageInput from './components/MessageInput';
// import { useSocket } from '@/contexts/SocketContext';

// interface User {
//   id: string;
//   username: string;
//   fullName?: string;
//   image?: string;
// }

// interface Message {
//   id: string;
//   content: string;
//   createdAt: Date;
//   readAt?: Date;
//   senderId: string;
//   sender: User;
//   optimistic?: boolean;
// }

// interface Chat {
//   id: string;
//   user1: User;
//   user2: User;
//   lastMessageAt?: Date;
//   messages: Message[];
//   isActive: boolean;
// }

// const MessagesPage = () => {
//   const { user } = useUser();
//   const [searchQuery, setSearchQuery] = useState('');
//   const { socket, isConnected } = useSocket();

//   const {
//     chats,
//     selectedChat,
//     selectedChatMessages,
//     targetUsername,
//     loading,
//     typingUsers,
//     setChats,
//     setSelectedChat,
//     setSelectedChatMessages,
//     addNewChat,
//     clearTargetUser,
//     getOtherUser,
//     setLoading,
//   } = useMessageStore();

//   // tRPC queries
//   const {
//     data: userChats,
//     isLoading: chatsLoading,
//     refetch: refetchChats,
//   } = api.message.getUserChats.useQuery();

//   const { data: chatMessages, isLoading: messagesLoading } =
//     api.message.getChatMessages.useQuery(
//       { chatId: selectedChat?.id || '' },
//       { enabled: !!selectedChat?.id }
//     );

//   const getOrCreateChatMutation = api.message.getOrCreateChat.useMutation();
//   const getUserByUsernameMutation = api.message.getUserByUsername.useQuery(
//     { username: targetUsername || '' },
//     { enabled: !!targetUsername }
//   );

//   // Set loading state
//   useEffect(() => {
//     setLoading(chatsLoading || messagesLoading);
//   }, [chatsLoading, messagesLoading, setLoading]);

//   // Load chats from API
//   useEffect(() => {
//     if (userChats) {
//       const formattedChats = userChats.map((chat) => ({
//         id: chat.id,
//         user1: chat.user1,
//         user2: chat.user2,
//         lastMessageAt: chat.lastMessageAt
//           ? new Date(chat.lastMessageAt)
//           : undefined,
//         messages:
//           chat.messages?.map((msg) => ({
//             id: msg.id,
//             content: msg.content,
//             createdAt: new Date(msg.createdAt),
//             readAt: msg.readAt ? new Date(msg.readAt) : undefined,
//             senderId: msg.senderId,
//             sender: msg.sender,
//           })) || [],
//         isActive: chat.isActive,
//       }));

//       setChats(formattedChats);
//     }
//   }, [userChats, setChats]);

//   // Load messages when chat is selected
//   useEffect(() => {
//     if (chatMessages) {
//       const formattedMessages = chatMessages.messages.map((msg) => ({
//         id: msg.id,
//         content: msg.content,
//         createdAt: new Date(msg.createdAt),
//         readAt: msg.readAt ? new Date(msg.readAt) : undefined,
//         senderId: msg.senderId,
//         sender: msg.sender,
//       }));

//       setSelectedChatMessages(formattedMessages);
//     }
//   }, [chatMessages, setSelectedChatMessages]);

//   // Handle target username (for starting new chats)
//   useEffect(() => {
//     if (targetUsername && user?.id && getUserByUsernameMutation.data) {
//       const targetUser = getUserByUsernameMutation.data;

//       // Check if chat already exists
//       const existingChat = chats.find(
//         (chat) => getOtherUser(chat, user.id).id === targetUser.id
//       );

//       if (existingChat) {
//         setSelectedChat(existingChat);
//       } else {
//         // Create new chat
//         getOrCreateChatMutation.mutate(
//           { receiverId: targetUser.id },
//           {
//             onSuccess: (newChat) => {
//               const formattedChat: Chat = {
//                 id: newChat.id,
//                 user1: newChat.user1,
//                 user2: newChat.user2,
//                 lastMessageAt: newChat.lastMessageAt
//                   ? new Date(newChat.lastMessageAt)
//                   : undefined,
//                 messages:
//                   newChat.messages?.map((msg) => ({
//                     id: msg.id,
//                     content: msg.content,
//                     createdAt: new Date(msg.createdAt),
//                     readAt: msg.readAt ? new Date(msg.readAt) : undefined,
//                     senderId: msg.senderId,
//                     sender: msg.sender,
//                   })) || [],
//                 isActive: newChat.isActive,
//               };

//               addNewChat(formattedChat);
//               setSelectedChat(formattedChat);
//             },
//             onError: (error) => {
//               console.error('Error creating chat:', error);
//             },
//           }
//         );
//       }

//       clearTargetUser();
//     }
//   }, [
//     targetUsername,
//     user?.id,
//     getUserByUsernameMutation.data,
//     chats,
//     getOtherUser,
//     setSelectedChat,
//     getOrCreateChatMutation,
//     addNewChat,
//     clearTargetUser,
//   ]);

//   const formatMessageTime = (date: Date) => {
//     const now = new Date();
//     const diffInDays = Math.floor(
//       (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
//     );

//     if (diffInDays === 0) {
//       return date.toLocaleTimeString('en-US', {
//         hour: 'numeric',
//         minute: '2-digit',
//         hour12: false,
//       });
//     } else if (diffInDays < 7) {
//       return `${diffInDays}d`;
//     } else {
//       return date.toLocaleDateString('en-US', {
//         month: 'numeric',
//         day: 'numeric',
//       });
//     }
//   };

//   // Filter chats based on search query
//   const filteredChats = chats.filter((chat) => {
//     if (!searchQuery) return true;
//     const otherUser = getOtherUser(chat, user?.id || '');
//     const searchLower = searchQuery.toLowerCase();
//     return (
//       otherUser.fullName?.toLowerCase().includes(searchLower) ||
//       otherUser.username.toLowerCase().includes(searchLower)
//     );
//   });

//   // Show typing indicator
//   const currentTypingUsers = typingUsers.filter((tu) => tu.userId !== user?.id);
//   const typingText =
//     currentTypingUsers.length > 0
//       ? `${currentTypingUsers.map((tu) => tu.username).join(', ')} ${
//           currentTypingUsers.length === 1 ? 'is' : 'are'
//         } typing...`
//       : null;

//   if (loading && !userChats) {
//     return (
//       <Fragment>
//         <div
//           className={cn(
//             'fixed start-[76px] w-[20rem] h-screen z-[100]',
//             'border-x border-x-white-12 overscroll-contain'
//           )}
//         >
//           <div className='w-full h-full flex flex-col items-start'>
//             <header className='h-18 w-full flex flex-shrink-0 ms-4 pt-6 pb-4'>
//               <h2 className='text-[20px] leading-[25px] font-bold tracking-[0.3px] text-white/90 antialiased'>
//                 Messages
//               </h2>
//             </header>
//             <div className='flex items-center justify-center h-96 w-full'>
//               <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-white'></div>
//             </div>
//           </div>
//         </div>
//         <div
//           className='fixed left-[396px] top-0 right-0 h-screen'
//           style={{ width: 'calc(100vw - 396px)' }}
//         >
//           <div className='w-full h-full flex-center'>
//             <Icons.comments width={92} height={92} className='text-white/20' />
//           </div>
//         </div>
//       </Fragment>
//     );
//   }

//   return (
//     <Fragment>
//       {/* Messages Sidebar */}
//       <div
//         className={cn(
//           'fixed start-[76px] w-[20rem] h-screen z-[100]',
//           'border-x border-x-white-12 overscroll-contain'
//         )}
//       >
//         <div className='w-full h-full flex flex-col items-start'>
//           <div className='relative flex flex-col flex-shrink-0 shadow-sm rounded-lg w-full'>
//             <header className='h-18 w-full flex flex-shrink-0 ms-4 pt-6 pb-4 items-center'>
//               <h2 className='text-[20px] leading-[25px] font-bold tracking-[0.3px] text-white/90 antialiased'>
//                 Messages
//               </h2>
//               {/* Connection status indicator */}
//               <div
//                 className={cn(
//                   'ml-2 w-2 h-2 rounded-full',
//                   isConnected ? 'bg-green-500' : 'bg-red-500'
//                 )}
//                 title={isConnected ? 'Connected' : 'Disconnected'}
//               />
//             </header>

//             {/* Search */}
//             <div className='px-4 pb-4'>
//               <div className='relative'>
//                 <Icons.search className='absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
//                 <input
//                   type='text'
//                   placeholder='Search'
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                   className='w-full pl-10 pr-4 py-2 bg-white-13 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500 text-white'
//                 />
//               </div>
//             </div>

//             <ScrollArea className='h-full flex flex-col'>
//               {filteredChats.length === 0 ? (
//                 <div className='flex items-center gap-[0.675rem] bg-white-13 w-full p-2 justify-start'>
//                   <div className='flex-center size-12 border border-white/20 rounded-[50%]'>
//                     <User className='size-6 text-white/20' />
//                   </div>
//                   <p className='text-sm font-medium text-white/90'>
//                     {searchQuery ? 'No chats found' : 'No messages yet'}
//                   </p>
//                 </div>
//               ) : (
//                 filteredChats.map((chat) => {
//                   const otherUser = getOtherUser(chat, user?.id || '');
//                   const lastMessage = chat.messages[chat.messages.length - 1];

//                   return (
//                     <div
//                       key={chat.id}
//                       onClick={() => setSelectedChat(chat)}
//                       className={cn(
//                         'flex items-center p-4 hover:bg-white-13 cursor-pointer transition-colors',
//                         selectedChat?.id === chat.id && 'bg-white/10'
//                       )}
//                     >
//                       <div className='relative'>
//                         <Image
//                           src={otherUser.image || '/assets/default-avatar.png'}
//                           alt={otherUser.fullName || otherUser.username}
//                           width={48}
//                           height={48}
//                           className='rounded-full object-cover'
//                         />
//                       </div>
//                       <div className='ml-3 flex-1 min-w-0'>
//                         <div className='flex items-center justify-between'>
//                           <h3 className='font-semibold text-white truncate'>
//                             {otherUser.fullName || otherUser.username}
//                           </h3>
//                           <span className='text-xs text-gray-400'>
//                             {lastMessage &&
//                               formatMessageTime(lastMessage.createdAt)}
//                           </span>
//                         </div>
//                         <p className='text-sm text-gray-400 truncate'>
//                           {lastMessage?.content || 'Start a conversation'}
//                         </p>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}
//             </ScrollArea>
//           </div>
//         </div>
//       </div>

//       {/* Chat Area */}
//       <div
//         className='fixed left-[396px] top-0 right-0 h-screen'
//         style={{ width: 'calc(100vw - 396px)' }}
//       >
//         {selectedChat ? (
//           <div className='w-full h-full flex flex-col'>
//             {/* Chat Header */}
//             <div className='p-4 border-b border-gray-800 flex items-center'>
//               <Image
//                 src={
//                   getOtherUser(selectedChat, user?.id || '').image ||
//                   '/assets/default-avatar.png'
//                 }
//                 alt={
//                   getOtherUser(selectedChat, user?.id || '').fullName ||
//                   getOtherUser(selectedChat, user?.id || '').username
//                 }
//                 width={32}
//                 height={32}
//                 className='rounded-full object-cover'
//               />
//               <div className='ml-3'>
//                 <h2 className='font-semibold text-white'>
//                   {getOtherUser(selectedChat, user?.id || '').fullName ||
//                     getOtherUser(selectedChat, user?.id || '').username}
//                 </h2>
//                 <p className='text-xs text-gray-400'>
//                   @{getOtherUser(selectedChat, user?.id || '').username}
//                 </p>
//               </div>
//             </div>

//             {/* Messages */}
//             <div className='flex-1 overflow-y-auto p-4 space-y-4'>
//               {messagesLoading && selectedChatMessages.length === 0 ? (
//                 <div className='flex items-center justify-center h-32'>
//                   <div className='animate-spin rounded-full h-6 w-6 border-b-2 border-white'></div>
//                 </div>
//               ) : (
//                 selectedChatMessages.map((message) => {
//                   const isOwnMessage = message.senderId === user?.id;

//                   return (
//                     <div
//                       key={message.id}
//                       className={cn(
//                         'flex',
//                         isOwnMessage ? 'justify-end' : 'justify-start'
//                       )}
//                     >
//                       <div
//                         className={cn(
//                           'max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative',
//                           isOwnMessage
//                             ? 'bg-red-500 text-white'
//                             : 'bg-gray-800 text-white',
//                           message.optimistic && 'opacity-70'
//                         )}
//                       >
//                         <p className='text-sm'>{message.content}</p>
//                         <div className='flex items-center justify-between mt-1'>
//                           <p className='text-xs opacity-70'>
//                             {formatMessageTime(message.createdAt)}
//                           </p>
//                           {isOwnMessage && (
//                             <div className='flex items-center ml-2'>
//                               {message.optimistic ? (
//                                 <Clock className='w-3 h-3 opacity-70' />
//                               ) : message.readAt ? (
//                                 <CheckCheck className='w-3 h-3 opacity-70' />
//                               ) : (
//                                 <Check className='w-3 h-3 opacity-70' />
//                               )}
//                             </div>
//                           )}
//                         </div>
//                       </div>
//                     </div>
//                   );
//                 })
//               )}

//               {/* Typing indicator */}
//               {typingText && (
//                 <div className='flex justify-start'>
//                   <div className='bg-gray-800 text-white px-4 py-2 rounded-2xl'>
//                     <p className='text-sm italic opacity-70'>{typingText}</p>
//                   </div>
//                 </div>
//               )}
//             </div>

//             {/* Message Input */}
//             <MessageInput
//               disabled={!selectedChat}
//               placeholder='Send a message...'
//               maxLength={6000}
//             />
//           </div>
//         ) : (
//           <div className='w-full h-full flex-center'>
//             <div className='flex-col-center text-center'>
//               <Icons.comments
//                 width={92}
//                 height={92}
//                 className='text-white/20 mb-4'
//               />
//               <h2 className='text-xl font-semibold text-white/50 mb-2'>
//                 Your messages
//               </h2>
//               <p className='text-white/40'>Send private messages to a friend</p>
//             </div>
//           </div>
//         )}
//       </div>
//     </Fragment>
//   );
// };

// export default MessagesPage;

'use client';

import { cn } from '@/lib/utils';
import ChatContainer from './components/ChatContainer';
import ChatList from './components/ChatList';

const MessagesPage = () => {
  return (
    <div className='h-screen flex'>
      <div
        className={cn(
          'fixed start-[76px] w-[20rem] h-screen z-[100]',
          'border-x border-x-white-12 overscroll-contain'
        )}
      >
        <div className='w-full h-full flex flex-col items-start'>
          <div className='relative flex flex-col flex-shrink-0 shadow-sm rounded-lg w-full'>
            <header className='h-18 w-full flex flex-shrink-0 ms-4 pt-6 pb-4 items-center'>
              <h2 className='text-[20px] leading-[25px] font-bold tracking-[0.3px] text-white/90 antialiased'>
                Messages
              </h2>
            </header>
            <ChatList />
          </div>
        </div>
      </div>

      {/* Main chat area */}
      <div
        className='fixed left-[396px] top-0 right-0 h-screen'
        style={{ width: 'calc(100vw - 396px)' }}
      >
        <ChatContainer />
      </div>
    </div>
  );
};

export default MessagesPage;
