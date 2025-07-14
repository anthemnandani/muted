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
import { Ban, MoreVertical } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

const ChatMenu = ({ chatId }: { chatId: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { chats, setCurrentChat, setChats } = useChatStore();
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
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          size='icon'
          className='size-8 bg-white-13 hover:bg-white/20 rounded-md transition-colors duration-200'
        >
          <MoreVertical className='size-5 text-neutral-50' />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align='end'
        className='min-w-[190px] p-0 bg-neutral-900 rounded-xl'
      >
        <MenuItem
          icon={Icons.mute}
          label='Mute'
          //   onClick={handleCopyLink}
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
