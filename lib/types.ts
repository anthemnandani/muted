import type { AppRouter } from '@/server/api/root';
import type { User } from '@prisma/client';
import { Privacy } from '@prisma/client';
import type { inferRouterOutputs } from '@trpc/server';
import { LucideIcon } from 'lucide-react';
import { PostPrivacy as ThreadPrivacy } from '@prisma/client';

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
type RouterOutput = inferRouterOutputs<AppRouter>;

export type ParentThreadCardProps = Pick<
  RouterOutput['post']['getNestedPosts'],
  'postInfo'
>;

export type PostProps = ArrayElement<
  RouterOutput['post']['getInfinitePosts']['posts']
> & {
  isLastThread?: boolean;
  showSeparator?: boolean;
  showLine?: boolean;
};

export type PostMedia = {
  fileType?: string;
  fileUrl?: string;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
} | null;

export type ParentPostInfo = Pick<
  PostProps,
  'id' | 'text' | 'media' | 'author' | 'createdAt'
>;

export type UserProfileInfoProps =
  RouterOutput['user']['userInfo']['userDetails'];

export type UserCardProps = ArrayElement<
  RouterOutput['user']['allUsers']['allUsers']
>;

export type UserSetupProps = Pick<User, 'bio' | 'link' | 'privacy'>;

export type IconProps =
  | React.HTMLAttributes<SVGElement>
  | React.SVGProps<SVGSVGElement>;

export type AuthorInfoProps = PostProps['author'];

export interface AppearanceMenuProps {
  theme: string;
  setTheme: (theme: string) => void;
}

export interface ThreadDisplayProps {
  isLastThread?: boolean;
  showSeparator?: boolean;
  showLine?: boolean;
  isReply?: boolean;
  showUsername?: boolean;
  isTopLevel?: boolean;
  isLastChild?: boolean;
  toggleReplies?: () => void;
  variant?: 'default' | 'reply';
  isChild?: boolean;
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
  onSelect?: (e: Event) => void;
  className?: string;
  isActionMenuItem?: boolean;
}

export type ParentPostProps = {
  id: string;
  createdAt: Date;
  text: string | null;
  media: PostMedia;
  likes: {
    userId: string;
  }[];
  bookmarks: { userId: string }[];
  quoteId: string | null;
  reposts: { userId: string; postId: string }[];
  parentPostId: string | null;
  parentPost?: any;
  mentions: Array<{
    user: AuthorInfoProps;
    index: number;
  }>;
  author: AuthorInfoProps;
  repostedBy?: AuthorInfoProps;
  postChildren?: ParentPostProps[];
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
  parentRepliesCount?: number;
};

export interface ThreadCardProps extends ParentPostProps, ThreadDisplayProps {}

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
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  setThreadData: React.Dispatch<
    React.SetStateAction<{
      privacy: ThreadPrivacy;
      text: string;
    }>
  >;
  handleMentionSearch: (value: string, cursorPosition: number) => void;
}

export interface ThreadsListProps {
  posts?: ParentPostProps[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
}

export interface EditProfileProps {
  userBio: string;
  userLink: string;
  userImage: string;
  userPrivacy: Privacy;
}

export interface ThreadActionsProps {
  id: string;
  likesCount: number;
  likes: { userId: string }[];
  text: string | null;
  author: AuthorInfoProps;
  createdAt: Date;
  repliesCount: number;
  reposts: { userId: string; postId: string }[];
  repostsCount: number;
  bookmarks: { userId: string }[];
  bookmarksCount: number;
  isParentPost?: boolean;
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

export type MentionSuggestion = Pick<
  User,
  'id' | 'username' | 'fullName' | 'image'
>;
