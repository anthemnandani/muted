'use client';

import { cn } from '@/lib/utils';
import useChatStore from '@/store/chatStore';
import { ArrowLeft } from 'lucide-react';
import ChatContainer from './components/ChatContainer';
import ChatList from './components/ChatList';
import MessageRequests from './components/MessageRequests';

const MessagesClient = () => {
  const { setViewMode, viewMode } = useChatStore();

  const handleMessageRequestsClick = () => {
    setViewMode('requests');
  };

  const handleBackToChats = () => {
    setViewMode('chats');
  };

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
              {viewMode === 'requests' && (
                <button
                  type='button'
                  title='Back Arrow'
                  onClick={handleBackToChats}
                  className='p-2 hover:bg-white/10 rounded-lg transition-colors mr-2 -ml-2'
                >
                  <ArrowLeft className='size-5 text-white/70' />
                </button>
              )}
              <h2 className='text-[20px] leading-[25px] font-bold tracking-[0.3px] text-white/90 antialiased'>
                {viewMode === 'requests' ? 'Message Requests' : 'Messages'}
              </h2>
            </header>

            {viewMode === 'chats' ? (
              <ChatList onMessageRequestsClick={handleMessageRequestsClick} />
            ) : (
              <MessageRequests />
            )}
          </div>
        </div>
      </div>

      <div className='fixed left-[396px] top-0 right-0 h-screen w-[calc(100vw_-_396px)]'>
        <ChatContainer />
      </div>
    </div>
  );
};

export default MessagesClient;
