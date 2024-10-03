import type { AppRouter } from '@/server/api/root';
import type { User } from '@prisma/client';
import { Privacy } from '@prisma/client';
import type { inferRouterOutputs } from '@trpc/server';
import { LucideIcon } from 'lucide-react';

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
type RouterOutput = inferRouterOutputs<AppRouter>;

export type ThreadReplyCardProps = Pick<
  RouterOutput['post']['getNestedPosts'],
  'parentPosts' | 'postInfo'
> & {
  showSeparator?: boolean;
};

export type PostProps = ArrayElement<
  RouterOutput['post']['getInfinitePosts']['posts']
> & {
  isLastThread?: boolean;
  showSeparator?: boolean;
  showLine?: boolean;
  isNested?: boolean;
};

export type ParentPostInfo = Pick<
  PostProps,
  'id' | 'text' | 'images' | 'author' | 'createdAt'
>;

export type UserProfileInfoProps =
  RouterOutput['user']['userInfo']['userDetails'];

export type UserSetupProps = Pick<User, 'bio' | 'link' | 'privacy'>;

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
  icon: LucideIcon | ((props: IconProps) => JSX.Element) | null;
  label: string;
  onClick?: () => void;
  className?: string;
  isActionMenuItem?: boolean;
}

export type Author = {
  id: string;
  image: string | null;
  fullName: string | null;
  username: string;
  bio: string | null;
  link: string | null;
  createdAt: Date;
  isAdmin: boolean | null;
  followers: {
    id: string;
    image: string | null;
  }[];
};

export type ParentPostProps = {
  id: string;
  createdAt: Date;
  text: string;
  images: string[];
  likes: {
    userId: string;
  }[];
  bookmarks: { userId: string }[];
  quoteId: string | null;
  reposts: { userId: string; postId: string }[];
  parentPostId: string | null;
  author: Author;
  repostedBy?: Author;
  children?: ParentPostProps[];
  likesCount?: number;
  bookmarksCount?: number;
  repostsCount?: number;
  repostedAt?: Date;
  _count?: {
    likes: number;
    reposts: number;
    bookmarks: number;
  };
  path: string | null;
  repliesCount: number;
  isLastThread?: boolean;
  showSeparator?: boolean;
  showLine?: boolean;
  isNested?: boolean;
  isReply?: boolean;
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

export enum ThreadFilter {
  FOR_YOU = 'For you',
  FOLLOWING = 'Following',
  LIKED = 'Liked',
  SAVED = 'Saved',
}
