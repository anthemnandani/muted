import { LucideIcon } from 'lucide-react';

export type IconProps =
  | React.HTMLAttributes<SVGElement>
  | React.SVGProps<SVGSVGElement>;

export interface AppearanceMenuProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export interface MenuLinkProps {
  route: string;
  isActive: boolean;
  addFill?: boolean;
  icon: (props: IconProps) => JSX.Element;
}

export interface MenuItemProps {
  icon: LucideIcon | ((props: IconProps) => JSX.Element);
  label: string;
  onClick?: () => void;
  className?: string;
  isActionMenuItem?: boolean;
}

export interface ThreadCardProps {
  id: string;
  content: string;
  author: {
    id: string;
    image: string;
    name: string;
  };
  community: { id: string; name: string; image: string } | null;
  comments: any[];
  parentId: string;
  createdAt: Date;
  currentUserId: string;
  isComment?: boolean;
  isLastThread?: boolean;
}

export interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string | null | undefined;
  username: string;
  fullname: string | null | undefined;
}

export interface CreateThreadInputProps {
  isOpen: boolean;
  replyThreadInfo?: any | null;
  onTextareaChange: (textValue: string) => void;
  // Todo: change type
  quoteInfo?:
    | (Pick<any, 'id' | 'text' | 'author'> & { createdAt?: Date })
    | null;
}

export enum PostPrivacy {
  ANYONE = 'ANYONE',
  FOLLOWED = 'FOLLOWED',
  MENTIONED = 'MENTIONED',
}
