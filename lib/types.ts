import type { AppRouter } from '@/server/api/root';
import type { RouterOutputs } from '@/trpc/shared';
import type { GifID, IGif } from '@giphy/js-types';
import MuxPlayer from '@mux/mux-player-react';
import type {
  AppealStatus,
  CollectionPrivacy,
  EncodingStatus,
  FileType,
  FilteredKeyword,
  FollowRequestStatus,
  MessageReportCategory,
  MessageRequestStatus,
  MessageStatus,
  NotificationType,
  PostStatus,
  ReportStatus,
  Role,
  User,
  UserStatus,
  Media,
} from '@prisma/client';
import { PostPrivacy, Privacy } from '@prisma/client';
import type { inferRouterOutputs } from '@trpc/server';
import { LucideIcon } from 'lucide-react';
import { ElementRef, ReactNode, RefObject } from 'react';
import { DropzoneInputProps, DropzoneRootProps } from 'react-dropzone';
import { type Area } from 'react-easy-crop';
import { type Swiper } from 'swiper';
import Player from 'video.js/dist/types/player';

type ArrayElement<ArrayType extends readonly unknown[]> = ArrayType[number];
type RouterOutput = inferRouterOutputs<AppRouter>;

export type PostProps = ArrayElement<
  RouterOutput['post']['getInfinitePosts']['posts']
>;

export type Post = RouterOutputs['post']['getInfinitePosts']['posts'][number];

export type Thread =
  RouterOutputs['thread']['getAllThreads']['threads'][number];

export type PostMedia = {
  fileType: string;
  fileUrl?: string;
  aspectRatio?: string;
  videoToken?: string;
  thumbnailToken?: string;
  originalDimensions?: {
    width: number;
    height: number;
  };
  videoId?: string;
  playbackId?: string;
  encodingStatus?: EncodingStatus;
};

export type ParentPostInfo = Pick<
  Post,
  'id' | 'text' | 'media' | 'author' | 'mentions'
> & { createdAt?: Date };

export type ThreadInfo = Partial<
  Pick<
    Thread,
    | 'id'
    | 'text'
    | 'author'
    | 'mentions'
    | 'createdAt'
    | 'media'
    | 'quoteId'
    | 'linkPreview'
  >
>;

export type ReplyPostInfo = {
  id: string;
  text: string;
  author: AuthorInfoProps;
  mentions?: Mention[];
  privacy: PostPrivacy;
  createdAt: Date;
};

export type UserProfileInfoProps = RouterOutputs['user']['getUserProfile'] & {
  isBlocked: boolean;
};

export type UserProfilePostsProps = {
  id: string;
  media: PostMedia[];
  pinned: boolean;
  author?: AuthorInfoProps;
};

export interface UserPostsListProps {
  posts: ParentPostProps[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
}

export interface PostsGridProps {
  posts: ParentPostProps[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  query: string;
}

export type FollowRequest = {
  id: string;
  requesterId: string;
  receiverId: string;
  status: FollowRequestStatus;
  createdAt: Date;
  updatedAt: Date;
};

export interface UserProfileContentProps {
  userId: string;
  username: string;
  isFollower?: boolean;
  privacy?: Privacy;
  isBlocked: boolean;
}

export interface ThreadContentProps {
  text: string;
  media?: Media[] | null;
  mentions?: Mention[];
  author: AuthorInfoProps;
  variant?: 'default' | 'reply';
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

export type AuthorInfoProps = Post['author'] & {
  receivedFollowRequests?: FollowRequest[];
};

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
  icon: ((props: IconProps) => JSX.Element) | LucideIcon;
}

export interface MenuItemProps {
  icon?: LucideIcon | ((props: IconProps) => JSX.Element) | null;
  label: string | React.ReactNode;
  onClick?: () => void;
  className?: string;
  disabled?: boolean;
  iconColor?: string;
}

export type Repost = {
  postId?: string | null;
  threadId?: string | null;
  user: AuthorInfoProps;
  createdAt: Date;
};

export type Mention = {
  user: AuthorInfoProps;
  index: number;
};

export interface FeedWrapperProps {
  threads?: ThreadProps[];
  isLoading: boolean;
  isError: boolean;
  hasNextPage?: boolean;
  fetchNextPage?: any;
  selectedFilter?: ThreadFilter;
  emptyStateMessage: string | React.ReactNode;
  isSearch?: boolean;
}

export type ParentPostProps = {
  id: string;
  createdAt: Date;
  text: string | null;
  media: PostMedia[];
  likes: {
    userId: string;
  }[];
  bookmarks: Bookmark[];
  quoteId: string | null;
  reposts: Repost[];
  parentPostId?: string | null;
  parentPost?: any;
  parentId?: string | null;
  mentions: Mention[];
  author: AuthorInfoProps;
  linkPreview?: LinkPreview | null;
  repostedBy?: AuthorInfoProps | null;
  postChildren?: ParentPostProps[];
  likesCount?: number;
  bookmarksCount?: number;
  repostsCount?: number;
  repostedAt?: Date | null;
  pinned?: boolean;
  hideLikes?: boolean;
  turnOffComments?: boolean;
  isHidden?: boolean;
  isMuted?: boolean;
  privacy: PostPrivacy;
  status?: PostStatus;
  // _count?: {
  //   likes: number;
  //   reposts: number;
  //   replies: number;
  // };
  path: string | null;
  repliesCount: number;
  parentRepliesCount?: number;
};

export interface PostCardProps extends ParentPostProps, PostDisplayProps {}

export type ThreadProps = {
  id: string;
  createdAt: Date;
  text: string;
  media?: Media[];
  likes: {
    userId: string;
  }[];
  bookmarks: Bookmark[];
  quoteId: string | null;
  reposts: Repost[];
  parentId: string | null;
  mentions?: Mention[];
  author: AuthorInfoProps;
  linkPreview: LinkPreview | null;
  repostedBy?: AuthorInfoProps | null;
  likesCount: number;
  bookmarksCount: number;
  repostsCount: number;
  repostedAt?: Date | null;
  pinned?: boolean;
  hideLikes?: boolean;
  turnOffComments?: boolean;
  isHidden?: boolean;
  isMuted?: boolean;
  privacy: PostPrivacy;
  status?: PostStatus;
  // _count?: {
  //   likes: number;
  //   reposts: number;
  //   replies: number;
  // };
  path: string | null;
  repliesCount: number;
  parentRepliesCount?: number;
};

export interface ThreadCardBaseProps extends ThreadProps {
  variant?: 'default' | 'reply';
  showHeader?: boolean;
  showActions?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export interface UserAvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  image?: string | null;
  username: string;
  fullname?: string | null;
  showInfo?: boolean;
}

export interface CreatePostInputProps extends DropzoneProps {
  onTextareaChange: (textValue: string) => void;
  placeholder?: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setPostData: (data: PostData) => void;
  value: string;
  handleMentionSearch: (value: string, cursorPosition: number) => void;
}
export interface CreateThreadInputProps {
  placeholder: string;
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  handleMentionSearch: (value: string, cursorPosition: number) => void;
}

export interface PostsListProps {
  posts?: ParentPostProps[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
  showMuted?: boolean;
  isLoading?: boolean;
  emptyStateMessage?: string | React.ReactNode;
  resetToFirst?: boolean;
  onResetComplete?: () => void;
  containerRef?: React.RefObject<HTMLDivElement>;
}

export interface ThreadsListProps {
  threads: ThreadProps[];
  fetchNextPage: () => void;
  hasNextPage?: boolean;
}

export interface EditProfileProps {
  userBio: string;
  userImage: string;
}

export interface PostActionsProps {
  id: string;
  privacy: PostPrivacy;
  likesCount: number;
  likes: { userId: string }[];
  author: AuthorInfoProps;
  repliesCount: number;
  reposts: Repost[];
  repostsCount: number;
  bookmarks: Bookmark[];
  bookmarksCount: number;
  mentions: Mention[];
  hideLikes: boolean;
  turnOffComments: boolean;
  onCommentsToggle: () => void;
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

export interface UseLikeProps {
  initialLikesCount: number;
  likes: { userId: string }[];
  id: string;
  type: 'POST' | 'THREAD';
}

export interface LikeButtonProps {
  likeInfo: Pick<Post, 'id' | 'likes' | 'likesCount'>;
  authorId: string;
  hideLikes?: boolean;
  isPanel?: boolean;
}

export interface ThreadRepostButtonProps {
  id: string;
  text: string;
  author?: AuthorInfoProps;
  media?: Media[];
  linkPreview: LinkPreview | null;
  quoteId: string | null;
  mentions?: Mention[];
  createdAt: Date;
  reposts?: Repost[];
  repostsCount: number;
  isCheckingPermissions?: boolean;
}

export interface BookmarkButtonProps {
  bookmarkInfo: BookmarkInfo;
  isPanel?: boolean;
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

export type PostData = {
  privacy?: PostPrivacy;
  caption: string;
  hideLikes: boolean;
  turnOffComments: boolean;
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
  type: 'image' | 'video' | 'gif';
  aspectRatio?: string;
  originalDimensions?: {
    width: number;
    height: number;
  };
  originalWidth?: number;
  originalHeight?: number;
  poster?: string;
  cropData?: Area;
  userCrop?: { x: number; y: number };
  userZoom?: number;
};

export type GiphyMedia = {
  id: GifID;
  gif: IGif;
  type: 'gif';
};

export type LinkPreview = {
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
};

export interface LinkPreviewCardProps {
  title: string | null;
  description: string | null;
  image: string | null;
  isLoading?: boolean;
  onClose?: () => void;
  url: string;
}

export type ThreadData = {
  privacy: Privacy;
  text: string;
  linkPreview: LinkPreview | null;
  mentions: ValidMention[];
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
  disabled?: boolean;
}

export interface UploadStepProps {
  getRootProps: any;
  getInputProps: any;
  isDragActive: boolean;
}

export interface PostDialogTitleProps {
  hasError: boolean;
  discardPost: () => void;
  handleSubmit: (value: boolean) => void;
  isLoading: boolean;
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
  isMixedMedia: boolean;
}

export interface PostFooterProps {
  author: AuthorInfoProps;
  createdAt: Date;
  id: string;
  text?: string | null;
  reposts: Repost[];
  repostedBy?: AuthorInfoProps | null;
  mentions?: Mention[];
  totalCount?: number;
  currentIndex: number;
  swiperRef?: Swiper;
}

export interface VideoContainerProps {
  player: MuxPlayerRef | null;
  children: React.ReactNode;
  setInView: (inView: boolean) => void;
  showControls: boolean;
  isModal?: boolean;
}

export interface MediaControlsProps {
  author: AuthorInfoProps;
  postId: string;
  createdAt: Date;
  caption?: string | null;
  pinned?: boolean;
  showControls: boolean;
  VolumeControls?: React.ReactNode;
  hideLikes?: boolean;
  turnOffComments?: boolean;
  media?: PostMedia[];
}

export interface MediaLayerProps {
  file: MediaFile;
  isActive: boolean;
  isPostStep: boolean;
  updateMediaFile: any;
}

export interface PostImageCardProps {
  image: string;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
  text: string | null;
  isAdminPanel?: boolean;
  isCarousel?: boolean;
  isModal?: boolean;
}

export interface PostVideoCardProps {
  playbackId: string;
  postId: string;
  encodingStatus?: EncodingStatus;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
  videoToken?: string;
  thumbnailToken?: string;
  showControls: boolean;
  isCarousel?: boolean;
  onPlayerRegister?: (player: MuxPlayerRef | null) => void;
  isModal?: boolean;
}

export interface VolumeControlsProps {
  player: MuxPlayerRef | null;
  showControls: boolean;
  isVertical?: boolean;
}

export interface ThreadActionsProps {
  id: string;
  privacy: PostPrivacy;
  likesCount: number;
  likes: { userId: string }[];
  text: string;
  author: AuthorInfoProps;
  createdAt: Date;
  repliesCount: number;
  reposts?: Repost[];
  repostsCount: number;
  bookmarks: Bookmark[];
  bookmarksCount: number;
  media?: Media[];
  linkPreview: LinkPreview | null;
  mentions?: Mention[];
  hideLikes: boolean;
  isParentPost?: boolean;
  quoteId: string | null;
}

export interface PostActionMenuProps {
  author: AuthorInfoProps;
  postId: string;
  createdAt: Date;
  caption?: string | null;
  turnOffComments: boolean;
  hideLikes: boolean;
  showControls: boolean;
  pinned?: boolean;
  isModal?: boolean;
  media?: PostMedia[];
}

export interface PostMediaCarouselProps {
  media: PostMedia[];
  author: AuthorInfoProps;
  createdAt: Date;
  postId: string;
  text: string | null;
  pinned?: boolean;
  reposts: Repost[];
  repostedBy?: AuthorInfoProps | null;
  mentions?: Mention[];
  hideLikes?: boolean;
  turnOffComments?: boolean;
  isAdminPanel?: boolean;
  isModal?: boolean;
  onNavigate?: (direction: 'up' | 'down') => void;
  isFirstPost?: boolean;
  isLastPost?: boolean;
  isFetchingMore?: boolean;
}

export interface ProfileVideoPlayerProps {
  playbackId: string;
  videoToken?: string;
  thumbnailToken?: string;
  onPlayerReady?: (player: MuxPlayerRef) => void;
}

export interface VideoPlayerProps {
  onPlayerReady?: (player: Player) => void;
  poster?: string;
  onTimeUpdate?: () => void;
  playbackId: string;
  status: EncodingStatus;
  isMuted: boolean;
  inView: boolean;
  startTime?: number;
  onVolumeChange?: (muted: boolean) => void;
  videoToken?: string;
  thumbnailToken?: string;
  aspectRatio?: string;
  originalDimensions?: { width: number; height: number };
  isCarousel?: boolean;
  isModal?: boolean;
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

export interface UseDeletePostProps {
  postId: string;
  closeMenu?: () => void;
  isAdmin?: boolean;
}

export interface ProfileFiltersProps {
  selectedFilter: ProfileFilter;
  setSelectedFilter: (filter: ProfileFilter) => void;
}

export interface UserPostCardProps {
  media: PostMedia[];
  postId: string;
  pinned?: boolean;
  index: number;
  isSearch?: boolean;
  likesCount?: number;
  text?: string;
  createdAt?: Date;
  author?: AuthorInfoProps;
  query?: string;
}

export interface ProfileTabsHeaderProps {
  isOwner: boolean;
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
}

export type ProfileFilter = 'LATEST' | 'OLDEST';

export interface CollectionCardProps {
  collection: Collection;
  username: string;
}

export interface CollectionCoverProps {
  collection: Collection;
  postId: string;
  bookmarks: Bookmark[];
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
  bookmarkInfo: BookmarkInfo;
  isPanel?: boolean;
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

export type NavigationType =
  | 'post'
  | 'liked'
  | 'repost'
  | 'collection'
  | 'topPosts'
  | 'videoPosts';

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

export interface CommentsPanelProps {
  postId: string;
  onClose: () => void;
  authorId: string;
  isOpen: boolean;
  repliesCount: number;
  text: string;
  createdAt: Date;
  author: AuthorInfoProps;
  reposts: Repost[];
  repostedBy?: AuthorInfoProps | null;
  repostsCount?: number;
  likesCount?: number;
  likes?: { userId: string }[];
  bookmarks?: Bookmark[];
  hideLikes?: boolean;
  bookmarksCount?: number;
  isModal?: boolean;
}

export type Bookmark = {
  userId: string;
  collection: { id: string; isDefault: boolean } | null;
};

export type BookmarkInfo = Pick<Post, 'id' | 'bookmarks' | 'bookmarksCount'>;

export interface ActionsBarProps {
  postId: string;
  authorId?: string;
  stats: {
    likesCount?: number;
    likes?: { userId: string }[];
    hideLikes?: boolean;
    repliesCount?: number;
    bookmarksCount?: number;
    bookmarks?: Bookmark[];
    repostsCount?: number;
    reposts?: Repost[];
  };
}

export interface CopyLinkButtonProps {
  postId?: string;
  username?: string;
  threadId?: string;
}

export type Comment = {
  id: string;
  text: string | null;
  likesCount: number;
  author: AuthorInfoProps;
  createdAt: Date;
  repliesCount: number;
  likes: { userId: string }[];
  mentions: Mention[];
};

export interface CommentTextProps {
  text: string;
  mentions?: Mention[];
  className?: string;
}

export interface CommentActionsProps {
  authorId: string;
  postAuthorId: string;
  postId: string;
  createdAt: Date;
  text: string;
  isReply?: boolean;
  onEditClick?: () => void;
}

export interface ConfirmDialogProps {
  title: string;
  description: string;
  onClick: () => void;
  open: boolean;
  setOpen: (open: boolean) => void;
  isLoading: boolean;
  closeMenu?: () => void;
  btnTitle?: string;
  btnClassName?: string;
  trigger?: React.ReactNode;
}

export interface PostInfoCardProps {
  postText: string;
  author: AuthorInfoProps;
  createdAt: Date;
  reposts: Repost[];
  repostedBy?: AuthorInfoProps | null;
}

export interface UsersMenuProps {
  showMentionSuggestions: boolean;
  mentionSuggestions?: MentionSuggestion[];
  cursorPosition: {
    top: number;
    left: number;
  };
  isLoading: boolean;
  onSelect: (username: string, userId: string) => void;
}

export type MentionPosition = {
  top: number;
  left: number;
};

export interface UseMentionsProps {
  textareaRef: React.RefObject<HTMLTextAreaElement>;
  setCommentText: (commentText: string) => void;
  addValidMention?: (mention: ValidMention) => void;
  updateMentionIndices?: (text: string) => void;
}

export interface RepostBannerProps {
  repostedBy?: AuthorInfoProps | null;
  reposts: Repost[];
}

export interface ReplyInputProps {
  postId: string;
  commentId: string;
  onCancel: () => void;
  username?: string;
}

export interface ReplyCardProps {
  reply: Omit<Comment, 'repliesCount'>;
  isLast: boolean;
  originalPostId: string;
  postAuthorId: string;
}

export interface CommentInputProps {
  placeholder: string;
  textValue: string;
  onTextChange: (text: string) => void;
  onSubmit: () => void;
  charCount: number;
  maxChars: number;
  isSubmitting: boolean;
  showCancelButton?: boolean;
  onCancel?: () => void;
  isEdit?: boolean;
  replyToUsername?: string | null;
}

export interface CommentCardProps {
  comment: Comment;
  isLast: boolean;
  originalPostId: string;
  postAuthorId: string;
}

export type SortBy = 'LATEST' | 'OLDEST';

export type Tab = 'posts' | 'reposts' | 'liked' | 'collections';

export type SearchTab = 'top' | 'users' | 'videos';

export type NotificationTab =
  | 'all'
  | 'likes'
  | 'comments'
  | 'mentions'
  | 'followers';

export interface UsernameProps {
  author: AuthorInfoProps;
  isReposted?: boolean;
  repostedAt?: Date;
  className?: string;
  isComment?: boolean;
  postAuthorId?: string;
  isSearch?: boolean;
  isMention?: boolean;
}

export interface EmojiPickerProps {
  onChange?: (emoji: string) => void;
  isComment?: boolean;
  direction?: 'top' | 'bottom';
}

export interface SharePostProps {
  id: string;
  reposts: Repost[];
  repostsCount: number;
  authorId: string;
}

export interface UseRepostProps {
  reposts: Repost[];
  initialRepostsCount: number;
  postId: string;
}

export interface ReplyButtonProps {
  repliesCount: number;
  canInteract: boolean;
  onCommentsToggle: () => void;
  turnOffComments: boolean;
}

export interface MutedPostProps {
  userId: string;
  username: string;
}

export interface BlockUserDialogProps {
  username: string;
  userId: string;
  closeMenu?: () => void;
  isProfile?: boolean;
  isBlocked?: boolean;
}

export interface UseToggleBlockUserProps {
  userId: string;
  username: string;
  isProfile?: boolean;
  isBlocked?: boolean;
}

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  isNotification?: boolean;
}

export interface UserProfileMenuProps {
  username: string;
  isMuted: boolean;
  userId: string;
  isBlocked: boolean;
}

export type ReportPoint = string;

export interface BaseReportCategory {
  id: string;
  label: string;
  points?: ReportPoint[];
  showAdditionalForm?: boolean;
  showUserSearch?: boolean;
}

export interface DetailCategory extends BaseReportCategory {
  points: ReportPoint[];
}

export interface SubCategory extends BaseReportCategory {
  points?: ReportPoint[];
  children?: DetailCategory[];
}

export interface Category extends BaseReportCategory {
  points?: ReportPoint[];
  children?: SubCategory[];
}

export interface ReportCategories {
  [key: string]: Category;
}

export interface ReportHeaderProps {
  currentView: string;
  goBack: () => void;
  handleOpenChange: (open: boolean) => void;
}

type CategoryItem = {
  id: string;
  label: string;
  children?: CategoryItem[];
  points?: string[];
};

export interface ReportCategoriesListProps {
  title: string;
  items: CategoryItem[];
  onSelect: (item: CategoryItem) => void;
}

export interface ReportDetailsProps {
  categoryLabel: string;
  points: string[];
  showAdditionalForm: boolean;
  showUserSearch: boolean;
  isUserReport: boolean;
}

export type UserSuggestion = {
  id: string;
  username: string;
  fullName: string | null;
  image: string | null;
};

export interface AspectRatioSelectorProps {
  selectedRatio: string;
  onChange: (ratio: string) => void;
  isVideoOnly: boolean;
}

export interface DiscardPostProps {
  discardPost: () => void;
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showTrigger?: boolean;
}

export interface SidebarWrapperProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  title: string;
}

export type Notification = {
  id: string;
  senderUser: AuthorInfoProps | null;
  message: string;
  createdAt: Date;
  media?: PostMedia[];
  postId?: string;
  type: NotificationType;
};

export interface NotificationCardProps {
  sender: AuthorInfoProps | null;
  message: string;
  createdAt: Date;
  media?: PostMedia;
  postId?: string;
  type: NotificationType;
  isLast: boolean;
}

export interface NotificationsListProps {
  notifications: Notification[];
  hasNextPage?: boolean;
  fetchNextPage: () => void;
}

export interface MessageInputProps {
  value: string;
  setIsMultiLine: (isMultiLine: boolean) => void;
  isMultiLine: boolean;
  onChange: (text: string, element: EventTarget & HTMLDivElement) => void;
  onSubmit: (e?: React.FormEvent) => void;
  loading: boolean;
  placeholder?: string;
  disabled?: boolean;
}

export type ViewMode = 'chats' | 'requests';

export interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => Promise<void> | void;
  trigger?: ReactNode;
  type: 'MESSAGE_REQUEST' | 'CHAT' | 'MESSAGES';
  targetName?: string;
  customTitle?: string;
  customDescription?: string;
  deleteButtonText?: string;
  closeDropdown?: () => void;
}

export interface ChatUser {
  id: string;
  username: string;
  fullName?: string | null;
  image?: string | null;
}

export type MessageReaction = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  emoji: string;
  messageId: string;
  userId: string;
  user: {
    id: string;
    username: string;
  };
};

export interface Message {
  id: string;
  content: string;
  type: 'TEXT' | 'MEDIA';
  status?: MessageStatus;
  createdAt: string | Date;
  readAt?: Date | null;
  senderId: string | null;
  chatId: string;
  sender: ChatUser | null;
  reactions?: MessageReaction[];
}

export interface Chat {
  id: string;
  participants: ChatUser[];
  lastMessage?: Message;
  lastMessageAt?: Date | null;
  unreadCount: number;
  messageRequest?: boolean;
  messageRequestStatus?: MessageRequestStatus | null;
  requestedById?: string | null;
  isMuted?: boolean;
}

export interface ChatMessageItemProps {
  message: Message;
  isOwn: boolean;
  isLastMessage: boolean;
}

export interface MutedChat {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  chatId: string;
  userId: string;
  isActive: boolean;
}

export interface ChatListItemParams {
  chat: Chat;
  isSelected: boolean;
  otherUser: ChatUser;
}

export type MessageReportCategoryType = MessageReportCategory;

export interface MessageReportProps {
  messageId: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export interface PostMediaPreviewProps {
  type: 'image' | 'video' | 'gif';
  url?: string | IGif;
  text?: string;
  onRemove?: () => void;
}

export interface PostMediaToolsProps extends DropzoneProps {
  onGifSelect: (gif: IGif) => void;
  onEmojiSelect: (emoji: string) => void;
}

export interface DropzoneProps {
  getRootProps: <T extends DropzoneRootProps>(props?: T) => T;
  getInputProps: <T extends DropzoneInputProps>(props?: T) => T;
}

export interface CreateThreadProps extends DropzoneProps {
  isLoading: boolean;
  handleSubmit: (value: boolean) => void;
}

export interface PostHeaderProps {
  author: AuthorInfoProps;
  createdAt: Date;
  id: string;
  currentText: string;
  pinned?: boolean;
  hideLikes?: boolean;
}

export interface PostTextProps {
  text: string;
  className?: string;
  isThreadPost?: boolean;
  mentions?: Mention[];
  showMore?: boolean;
}

export type ValidMention = {
  mentionedUserId: string;
  username: string;
  startIndex: number;
  endIndex: number;
};

export interface UserPostThreadCardProps {
  pinned?: boolean;
  postId: string;
  index: number;
  username: string;
  mentions?: Mention[];
}

export interface UseTimeLeftProps {
  createdAt: Date | string;
  durationInMinutes?: number;
}

export type SectionRefs = {
  [key: string]: RefObject<HTMLDivElement>;
};

export interface SettingsLayoutProps {
  sectionRefs: SectionRefs;
  children: React.ReactNode;
  isLoading?: boolean;
  isMainPage?: boolean;
}

export interface PrivacySectionProps {
  sectionRef: React.RefObject<HTMLDivElement>;
  user?: RouterOutput['user']['getMe'];
}

export interface SettingRowProps {
  title: string;
  description?: string;
  control: React.ReactNode;
  onClick?: () => void;
  isButton?: boolean;
  border?: boolean;
  className?: string;
}

export interface SettingSectionProps {
  id: string;
  sectionRef: React.RefObject<HTMLDivElement>;
  title: string;
  children: React.ReactNode;
}

export interface SettingPanelProps {
  sectionRefs: SectionRefs;
  user?: RouterOutput['user']['getMe'];
}

export type FollowStatus = 'FOLLOWING' | 'REQUESTED' | 'NOT_FOLLOWING';

export interface FollowButtonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant: 'default' | 'outline' | 'destructive';
  author: AuthorInfoProps;
  size: 'default' | 'sm' | 'lg' | 'icon';
  isNotification?: boolean;
}

export interface FollowRequestCardProps {
  id: string;
  username: string;
  image: string;
  fullName: string;
  isLast: boolean;
}

export type BlockedOrMutedUser = {
  id?: string;
  image: string | null;
  username: string | null;
  fullName: string | null;
  bio: string | null;
  followersCount: number;
};

export interface UserAccountCardProps extends BlockedOrMutedUser {
  isLoading: boolean;
  btnTitle: string;
  onClick: () => void;
}

export interface BlockListProps {
  allBlockedUsers: BlockedOrMutedUser[] | undefined;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export interface MuteListProps {
  allMutedUsers: BlockedOrMutedUser[] | undefined;
  isError: boolean;
  hasNextPage: boolean;
  fetchNextPage: () => void;
}

export interface DeleteUserFooterProps {
  btnTitle: string;
  onClick: () => void;
  isLoading?: boolean;
  onCancel?: () => void;
}

export interface KeywordListItemProps {
  item: FilteredKeyword;
  onDelete: (keywordId: string) => void;
  isDeleting: boolean;
  onEdit: (keyword: FilteredKeyword) => void;
}

export interface KeywordListProps {
  keywords: FilteredKeyword[];
  totalCount: number;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  onDelete: (keywordId: string) => void;
  isDeleting: boolean;
  onEdit: (keyword: FilteredKeyword) => void;
}

export type FeedsState = {
  forYou: boolean;
  following: boolean;
  friends: boolean;
};

export interface AddKeywordProps {
  onSaveSuccess: () => void;
  onCancel: () => void;
  keywordToEdit?: FilteredKeyword | null;
}

export enum DownloadableData {
  Posts = 'Posts',
  Comments = 'Comments',
  DirectMessages = 'Direct Messages',
  LikesAndFavorites = 'Likes and Favorites',
  ProfileAndSettings = 'Profile and Settings',
}

export interface UsersListProps {
  isLoading: boolean;
  users?: AuthorInfoProps[];
  fetchNextPage: () => void;
  hasNextPage: boolean | undefined;
  type: 'users' | 'followings' | 'followers';
  showDetails?: boolean;
  searchQuery?: string;
}

type ChartData = {
  date: string;
  value: number;
};

export interface DashboardChartsProps {
  usersChartData: ChartData[];
  postsChartData: ChartData[];
}

export interface SectionCardsProps {
  totalUsers: number;
  totalPosts: number;
  newUsers24h: number;
  activeUsers24h: number;
}

export interface UserActionsProps {
  id: string;
  role: Role;
  isSuspended: boolean;
  isBanned: boolean;
}

export interface IssueStrikeProps {
  userId: string;
  postId?: string;
  reportId?: string;
}

export interface CommentViewProps {
  text: string;
  author: AuthorInfoProps;
  mentions?: Mention[];
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export interface FilterBarProps {
  searchValue: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  onReset: () => void;
  children: React.ReactNode;
}

export interface AdminItemsTableProps<T> {
  items: T[] | undefined;
  isLoading: boolean;
  hasNextPage: boolean | undefined;
  fetchNextPage: () => void;
  skeleton: React.ReactNode;
  tableHeader: React.ReactNode;
  renderRow: (item: T) => React.ReactNode;
  emptyStateMessage: string;
  colSpan: number;
  children?: React.ReactNode;
}

export interface CarouselNavigationProps {
  selectedIndex: number;
  totalCount: number;
  onPrev: () => void;
  onNext: () => void;
  className?: string;
}

export interface CarouselPaginationProps {
  selectedIndex: number;
  totalCount: number;
  onSelect: (index: number) => void;
}

export type ContentType = 'ALL' | 'IMAGE' | 'VIDEO';
export type PostStatusFilter = 'ALL' | PostStatus;
export type UserStatusFilter = 'ALL' | UserStatus;
export type AppealStatusFilter = 'ALL' | AppealStatus;
export type ReportStatusFilter = 'ALL' | ReportStatus;
export type AdminPost = RouterOutputs['admin']['getAllPosts']['posts'][number];
export type AdminUser = RouterOutputs['admin']['getAllUsers']['users'][number];
export type AdminReport =
  RouterOutputs['admin']['getAllReports']['reports'][number];
export type AdminAppeal =
  RouterOutputs['admin']['getAppeals']['appeals'][number];
export type AdminReportPost = NonNullable<AdminReport['post']>;

export type MuxPlayerRef = ElementRef<typeof MuxPlayer>;

export type UploadResult = {
  fileUrl: string;
  fileType: FileType;
} | null;
