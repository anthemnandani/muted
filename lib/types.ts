import type { AppRouter } from '@/server/api/root';
import type { CollectionPrivacy, User } from '@prisma/client';
import { PostPrivacy, Privacy } from '@prisma/client';
import type { inferRouterOutputs } from '@trpc/server';
import { LucideIcon } from 'lucide-react';
import Player from 'video.js/dist/types/player';

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
  fileType: string;
  fileUrl: string;
  aspectRatio?: string;
  thumbnailUrl?: string;
  originalDimensions: {
    width: number;
    height: number;
  };
};

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

export type UserProfileInfoProps = {
  id: string;
  image: string | null;
  fullName: string | null;
  username: string;
  bio: string | null;
  link: string | null;
  privacy: Privacy;
  createdAt: Date;
  isAdmin: boolean | null;
  followers: {
    id: string;
    username: string;
    fullName: string | null;
    image: string | null;
  }[];
  following: {
    id: string;
    username: string;
    fullName: string | null;
    image: string | null;
  }[];
  posts: {
    id: string;
    media: PostMedia[];
  }[];
  totalLikes: number;
};

export type UserProfilePostsProps = {
  id: string;
  media: PostMedia[];
  pinned: boolean;
  author?: AuthorInfoProps;
};

export interface UserPostsListProps {
  posts: UserProfilePostsProps[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  type?: NavigationType;
  username: string;
}

export interface UserProfileContentProps extends UserPostsListProps {
  userId: string;
  username: string;
  selectedFilter: ProfileFilter;
  setSelectedFilter: (filter: ProfileFilter) => void;
}

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

export interface PostDisplayProps {
  index?: number;
  totalPosts?: number;
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

export type Repost = {
  postId: string;
  user: AuthorInfoProps;
  createdAt: Date;
};

export type ParentPostProps = {
  id: string;
  createdAt: Date;
  text: string | null;
  media: PostMedia[];
  likes: {
    userId: string;
  }[];
  bookmarks: { userId: string; collection: { isDefault: boolean } }[];
  quoteId: string | null;
  reposts: Repost[];
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
  pinned: boolean;
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

export interface PostCardProps extends ParentPostProps, PostDisplayProps {}

export interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  image: string | null | undefined;
  username: string;
  fullname: string | null | undefined;
}

export interface CreatePostInputProps {
  isOpen: boolean;
  replyPostInfo?: ReplyPostInfo | null;
  onTextareaChange: (textValue: string) => void;
  quoteInfo?: ParentPostInfo | null;
  placeholder?: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  value: string;
  setPostData: React.Dispatch<React.SetStateAction<PostData>>;
  handleMentionSearch: (value: string, cursorPosition: number) => void;
  isReply?: boolean;
}

export interface PostsListProps {
  posts?: ParentPostProps[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  showMuted?: boolean;
  isLoading?: boolean;
  emptyStateMessage?: string | React.ReactNode;
}

export interface EditProfileProps {
  userBio: string;
  userImage: string;
  userPrivacy: Privacy;
}

export interface PostActionsProps {
  id: string;
  privacy: PostPrivacy;
  likesCount: number;
  likes: { userId: string }[];
  text: string | null;
  author: AuthorInfoProps;
  createdAt: Date;
  repliesCount: number;
  reposts: Repost[];
  repostsCount: number;
  bookmarks: { userId: string; collection: { isDefault: boolean } }[];
  bookmarksCount: number;
  media: PostMedia[];
  linkPreview: LinkPreview | null;
  mentions: Array<{
    user: AuthorInfoProps;
    index: number;
  }>;
  hideLikes: boolean;
}

export interface RepostIndicatorProps {
  repostedBy?: {
    id: string;
    fullName: string | null;
    image: string | null;
  };
  isRepostedByMe?: Repost;
  reposts: Repost[];
}

export interface RepostersDialogProps {
  isRepostedByMe?: Repost;
  reposts: Repost[];
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

export type PostData = {
  privacy: PostPrivacy;
  text: string;
  linkPreview: LinkPreview | null;
};

export interface RepostButtonProps {
  id: string;
  reposts: Repost[];
  repostsCount: number;
  // isCheckingPermissions: boolean;
  // canInteract: boolean;
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
    media: PostMedia[];
    text: string | null;
    author: AuthorInfoProps;
  }[];
  postsCount: number;
  isDefault: boolean;
};

export type MediaFile = {
  file: File;
  preview: string;
  id: string;
  type: 'image' | 'video';
};

export interface PreviewStepProps {
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
}

export interface SortableMediaProps {
  file: MediaFile;
  index: number;
  isActive: boolean;
  onClick: () => void;
  onRemove: (id: string) => void;
}

export interface UploadStepProps {
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
}

export interface PostDialogTitleProps {
  hasError: boolean;
  discardPost: () => void;
}

export interface UploadErrorProps {
  title: string;
  message: string;
  onRetry: () => void;
}

export interface GalleryProps {
  mediaFiles: MediaFile[];
  setMediaFiles: (files: MediaFile[]) => void;
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
  onRemove: (id: string) => void;
}

export interface PostFooterProps {
  author: AuthorInfoProps;
  createdAt: Date;
  id: string;
  text: string | null;
  reposts: Repost[];
  repostedBy?: AuthorInfoProps;
}

export interface VideoContainerProps {
  children: React.ReactNode;
  player: Player | null;
  author: AuthorInfoProps;
  createdAt: Date;
  id: string;
  text: string | null;
  hideLikes: boolean;
  pinned: boolean;
  setInView: (inView: boolean) => void;
  reposts: Repost[];
  repostedBy?: AuthorInfoProps;
}

export interface MediaControlsProps {
  author: AuthorInfoProps;
  postId: string;
  createdAt: Date;
  text: string | null;
  hideLikes: boolean;
  pinned: boolean;
  showControls: boolean;
  VolumeControls?: React.ReactNode;
}

export interface PostImageCardProps {
  image: string;
  originalDimensions?: { width: number; height: number };
  createdAt: Date;
  author: AuthorInfoProps;
  id: string;
  text: string | null;
  hideLikes: boolean;
  pinned: boolean;
  reposts: Repost[];
  repostedBy?: AuthorInfoProps;
}

export interface PostVideoCardProps {
  video: string;
  postId: string;
  poster: string;
  author: AuthorInfoProps;
  createdAt: Date;
  text: string | null;
  hideLikes: boolean;
  pinned: boolean;
  reposts: Repost[];
  repostedBy?: AuthorInfoProps;
}

export interface PostActionMenuProps {
  author: AuthorInfoProps;
  postId: string;
  createdAt: Date;
  currentText: string;
  hideLikes: boolean;
  showControls: boolean;
  pinned: boolean;
}

export interface PostMediaCarouselProps {
  media: PostMedia[];
  author: AuthorInfoProps;
  createdAt: Date;
  postId: string;
  text: string | null;
  hideLikes: boolean;
  pinned: boolean;
  reposts: Repost[];
  repostedBy?: AuthorInfoProps;
}

export interface ProfileVideoPlayerProps {
  options: any;
  onPlayerReady: (player: Player) => void;
  poster?: string;
}

export interface VideoPlayerProps {
  options: any;
  onPlayerReady: (player: Player) => void;
  poster?: string;
  onTimeUpdate?: () => void;
}

export interface MediaTypeIndicatorProps {
  type: 'carousel' | 'video' | 'pinned';
  className?: string;
  iconClassName?: string;
}

export interface FilterButtonProps {
  label: string;
  value: ProfileFilter;
  isSelected: boolean;
  onClick: (value: ProfileFilter) => void;
}

export interface ProfileFiltersProps {
  selectedFilter: ProfileFilter;
  setSelectedFilter: (filter: ProfileFilter) => void;
}

export interface UserPostCardProps {
  media: PostMedia[];
  postId: string;
  pinned: boolean;
  username: string;
  type: NavigationType;
}

export interface ProfileTabsHeaderProps {
  isOwner: boolean;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export type ProfileFilter = 'LATEST' | 'OLDEST';

export interface CollectionCardProps {
  collection: Collection;
  username: string;
}

export interface CollectionData {
  id?: string;
  name: string;
  privacy: CollectionPrivacy;
  description: string;
}

export interface CollectionFormProps {
  initialData: CollectionData;
  isEditing: boolean;
  postId?: string;
  isLoading: boolean;
  error: string;
  setOpen: (open: boolean) => void;
  onSubmit: (data: CollectionData & { postId?: string }) => Promise<any>;
  onError: (error: string) => void;
}

export interface CollectionsMenuProps {
  postId: string;
  isOpen: boolean;
  onClose: () => void;
  anchorRect: DOMRect | null;
}

export interface SkeletonGridProps {
  count?: number;
  className?: string;
  skeletonClassName?: string;
}

export interface PostNavigatorContextType {
  isFirstPost: boolean;
  isLastPost: boolean;
  currentIndex: number;
  setPostNavigation: (index: number, total: number) => void;
}

export type NavigationType = 'post' | 'liked' | 'reposted';

export interface PostInfoClientProps {
  id: string;
  username: string;
  type?: NavigationType;
}

export interface NavigationButtonsProps {
  isFirstPost: boolean;
  isLastPost: boolean;
  handleNavigation: (direction: 'up' | 'down') => void;
  isLoading?: boolean;
}
