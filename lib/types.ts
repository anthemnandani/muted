import type { AppRouter } from '@/server/api/root';
import { Privacy } from '@prisma/client';
import type { inferRouterOutputs } from '@trpc/server';
import { LucideIcon } from 'lucide-react';

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
type RouterOutput = inferRouterOutputs<AppRouter>;

export type PostProps = ArrayElement<
  RouterOutput['post']['getInfinitePosts']['posts']
> & {
  isLastThread?: boolean;
};

export type ParentPostInfo = Pick<
  PostProps,
  'id' | 'text' | 'images' | 'author'
>;

export type UserProfileInfoProps =
  RouterOutput['user']['userInfo']['userDetails'];

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

export type ParentPostProps = {
  id: string;
  createdAt: string;
  text: string;
  images: string[];
  likes: {
    userId: string;
  }[];
  quoteId: string | null;
  reposts: {
    userId: string;
    postId: string;
  }[];
  parentPostId: string | null;
  replies: {
    author: {
      username: string;
      id: string;
      image: string;
    };
  }[];
  author: {
    id: string;
    image: string;
    fullname: string;
    username: string;
    bio: string;
    link: string;
    createdAt: Date;
    isAdmin: boolean;
    followers: {
      id: string;
      image: string;
    }[];
  };
  like_count: number;
  reply_count: number;
  isLastThread?: boolean;
};

export interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string | null | undefined;
  username: string;
  fullname: string | null | undefined;
}

export interface CreateThreadInputProps {
  isOpen: boolean;
  replyThreadInfo?: ParentPostInfo | null;
  onTextareaChange: (textValue: string) => void;
  quoteInfo?:
    | (Pick<ParentPostInfo, 'id' | 'text' | 'author'> & { createdAt?: Date })
    | null;
}

export interface EditProfileProps {
  userBio: string;
  userLink: string;
  userImage: string;
  userPrivacy: Privacy;
}

export enum PostPrivacy {
  ANYONE = 'ANYONE',
  FOLLOWED = 'FOLLOWED',
  MENTIONED = 'MENTIONED',
}
