'use client';

import { Icons } from '@/components/icons';
import MenuItem from '@/components/shared/MenuItem';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import useChatStore from '@/store/chatStore';
import { api } from '@/trpc/react';
import { Ban, Bell, BellOff, MoreHorizontal } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ChatMenu = ({
  chatId,
  isMuted,
}: {
  chatId: string;
  isMuted: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { chats, setCurrentChat, setChats, currentChat } = useChatStore();
  const utils = api.useUtils();
  const { mutate: deleteChat } = api.chat.deleteChat.useMutation({
    onMutate: () => {
      const previousChats = chats;

      setChats(previousChats.filter((chat) => chat.id !== chatId));

      setCurrentChat(null);

      return { previousChats };
    },
    onSuccess: () => toast.success('Chat deleted successfully'),
    onError: (error, _variables, context) => {
      if (context?.previousChats) {
        setChats(context.previousChats);
      }
      toast.error(error.message || 'Failed to delete chat');
    },
    onSettled: async () => await utils.chat.getChats.invalidate(),
  });

  const { mutate: toggleMute, isLoading: toggleMuteLoading } =
    api.chat.toggleMute.useMutation({
      onMutate: () => {
        const previousChats = chats;
        const currentMuteState = currentChat?.isMuted || false;

        setChats(
          previousChats.map((chat) =>
            chat.id === chatId
              ? {
                  ...chat,
                  isMuted: !currentMuteState,
                  unreadCount: !currentMuteState ? 0 : chat.unreadCount,
                }
              : chat
          )
        );

        if (currentChat?.id === chatId) {
          setCurrentChat({
            ...currentChat,
            isMuted: !currentMuteState,
            unreadCount: !currentMuteState ? 0 : currentChat.unreadCount,
          });
        }

        setIsOpen(false);

        return { previousChats };
      },
      onError: (error, _variables, context) => {
        if (context?.previousChats) {
          setChats(context.previousChats);
        }
        toast.error(error.message || 'Failed to toggle mute');
      },
      onSettled: async () => await utils.chat.getChats.invalidate(),
    });

  const handleMuteToggle = () => {
    toggleMute({ chatId });
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button size='icon' className='bg-transparent'>
          <MoreHorizontal className='size-5 text-neutral-50' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='min-w-[190px] p-0 bg-[#383838] rounded-xl !z-[9999] shadow-lg'
      >
        <MenuItem
          icon={isMuted ? Bell : BellOff}
          label={isMuted ? 'Unmute' : 'Mute'}
          onClick={handleMuteToggle}
          disabled={toggleMuteLoading}
        />

        <Separator />

        <MenuItem
          icon={Icons.report}
          label='Report'
          //   onClick={() => {
          //     openUserReport(userId);
          //     setIsOpen(false);
          //   }}
        />
        <Separator />

        <MenuItem
          icon={Ban}
          label='Block'
          //   onClick={handleCopyLink}
        />

        <Separator />

        <MenuItem
          icon={Icons.delete}
          label='Delete'
          className='text-primary-red focus:text-primary-red'
          onClick={() => {
            setIsOpen(false);
            deleteChat({ chatId });
          }}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ChatMenu;
