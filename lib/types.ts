import type { AppRouter } from '@/server/api/root';
import { IGif } from '@giphy/js-types';
import type { CollectionPrivacy, User } from '@prisma/client';
import { PostPrivacy, Privacy } from '@prisma/client';
import type { inferRouterOutputs } from '@trpc/server';
import { LucideIcon } from 'lucide-react';

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

export type MediaType = 'image' | 'video' | 'gif';

export type PostMedia = {
  fileType: MediaType;
  fileUrl?: string | IGif;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
} | null;

export type ParentPostInfo = Pick<
  PostProps,
  'id' | 'text' | 'media' | 'author' | 'linkPreview' | 'mentions'
> & { createdAt?: Date };

export type ReplyPostInfo = Pick<
  PostProps,
  | 'id'
  | 'text'
  | 'author'
  | 'media'
  | 'mentions'
  | 'privacy'
  | 'createdAt'
  | 'linkPreview'
>;

export type UserProfileInfoProps =
  RouterOutput['user']['userInfo']['userDetails'];

export type UserCardProps = ArrayElement<
  RouterOutput['user']['allUsers']['allUsers']
> & {
  isLastUser?: boolean;
  showDetails?: boolean;
};

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
  showMuted?: boolean;
}

export interface MenuLinkProps {
  route: string;
  isActive: boolean;
  addFill?: boolean;
  icon: (props: IconProps) => JSX.Element;
}

export interface MenuItemProps {
  icon?: LucideIcon | ((props: IconProps) => JSX.Element) | null;
  label: string | React.ReactNode;
  onClick?: () => void;
  onSelect?: (e: Event) => void;
  className?: string;
  isActionMenuItem?: boolean;
  disabled?: boolean;
}

export type ParentPostProps = {
  id: string;
  createdAt: Date;
  text: string | null;
  media: PostMedia;
  likes: {
    userId: string;
  }[];
  bookmarks: { userId: string; collection: { isDefault: boolean } }[];
  quoteId: string | null;
  reposts: { userId: string; postId: string }[];
  parentPostId: string | null;
  parentPost?: any;
  mentions: Array<{
    user: AuthorInfoProps;
    index: number;
  }>;
  linkPreview: LinkPreview | null;
  author: AuthorInfoProps;
  repostedBy?: AuthorInfoProps;
  postChildren?: ParentPostProps[];
  likesCount?: number;
  bookmarksCount?: number;
  repostsCount?: number;
  repostedAt?: Date;
  hideLikes: boolean;
  isHidden?: boolean;
  isMuted?: boolean;
  privacy: PostPrivacy;
  _count?: {
    likes: number;
    reposts: number;
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
  replyThreadInfo?: ReplyPostInfo | null;
  onTextareaChange: (textValue: string) => void;
  quoteInfo?: ParentPostInfo | null;
  placeholder?: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  setThreadData: React.Dispatch<React.SetStateAction<ThreadData>>;
  handleMentionSearch: (value: string, cursorPosition: number) => void;
  isReply?: boolean;
}

export interface ThreadsListProps {
  posts?: ParentPostProps[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  showMuted?: boolean;
  isLoading?: boolean;
  emptyStateMessage?: string;
}

export interface EditProfileProps {
  userBio: string;
  userLink: string;
  userImage: string;
  userPrivacy: Privacy;
}

export interface ThreadActionsProps {
  id: string;
  privacy: PostPrivacy;
  likesCount: number;
  likes: { userId: string }[];
  text: string | null;
  author: AuthorInfoProps;
  createdAt: Date;
  repliesCount: number;
  reposts: { userId: string; postId: string }[];
  repostsCount: number;
  bookmarks: { userId: string; collection: { isDefault: boolean } }[];
  bookmarksCount: number;
  media: PostMedia;
  linkPreview: LinkPreview | null;
  mentions: Array<{
    user: AuthorInfoProps;
    index: number;
  }>;
  hideLikes: boolean;
  isParentPost?: boolean;
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

export interface LinkPreview {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
}

export type ThreadData = {
  privacy: PostPrivacy;
  text: string;
  linkPreview: LinkPreview | null;
};

export interface RepostButtonProps {
  id: string;
  text: string | null;
  author: AuthorInfoProps;
  media: PostMedia | null;
  linkPreview: LinkPreview | null;
  mentions: Array<{
    user: AuthorInfoProps;
    index: number;
  }>;
  createdAt?: Date;
  reposts: {
    userId: string;
    postId: string;
  }[];
  repostsCount: number;
  isParentPost?: boolean;
  isCheckingPermissions: boolean;
  canInteract: boolean;
}

export type PostFilter = 'ALL' | 'TEXT' | 'REPLIES' | 'REPOSTS';

export type PostView = 'LIST' | 'GRID';

export type Collection = {
  id: string;
  name: string;
  description: string | null;
  privacy: CollectionPrivacy;
  bookmarks: {
    id: string;
    media: PostMedia | null;
    text: string | null;
    author: AuthorInfoProps;
  }[];
  postsCount: number;
  isDefault: boolean;
};
