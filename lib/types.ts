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
  showSeparator?: boolean;
  showLine?: boolean;
  isNested?: boolean;
};

export type PostReplyCardProps = RouterOutput['post']['getNestedPosts'];

export type ParentPostInfo = Pick<
  PostProps,
  'id' | 'text' | 'images' | 'author' | 'createdAt'
>;

export type UserProfileInfoProps =
  RouterOutput['user']['userInfo']['userDetails'];

export type IconProps =
  | React.HTMLAttributes<SVGElement>
  | React.SVGProps<SVGSVGElement>;

export type AuthorInfoProps = PostProps['author'];

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
  createdAt: Date;
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
    id: string;
    createdAt: Date;
    text: string;
    images: string[];
    parentPostId: string | null;
    quoteId: string | null;

    author: {
      id: string;
      username: string;
      image: string | null;
    };
    replies: {
      id: string;
      createdAt: Date;
      text: string;
      images: string[];
      parentPostId: string | null;
      quoteId: string | null;
      author: {
        id: string;
        username: string;
        image: string | null;
      };
    };
  }[];
  author: {
    id: string;
    image: string;
    fullName: string;
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
  isLastThread?: boolean;
  showSeparator?: boolean;
  showLine?: boolean;
  isNested?: boolean;
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
  placeholder?: string;
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
