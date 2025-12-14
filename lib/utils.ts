import useCommentPanelStore from '@/store/commentPanel';
import { useNotificationStore } from '@/store/notificationStore';
import { useSearchStore } from '@/store/searchStore';
import useVideoPlayer from '@/store/videoPlayer';
import { type User } from '@clerk/nextjs/server';
import { type UserResource } from '@clerk/types';
import { AppealStatus, ReportStatus, UserStatus } from '@prisma/client';
import { type ClassValue, clsx } from 'clsx';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInWeeks,
  format,
  isSameDay,
  isToday,
  isYesterday,
} from 'date-fns';
import { twMerge } from 'tailwind-merge';
import {
  createPlaybackTokens,
  createThumbnailToken,
} from './actions/mux.actions';
import {
  type AdminPost,
  type AdminReport,
  type ContentType,
  type MediaFile,
  Message,
  ParentPostProps,
  type PostMedia,
} from './types';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function isBase64Image(imageData: string) {
  const base64Regex = /^data:image\/(png|jpe?g|gif|webp);base64,/;
  return base64Regex.test(imageData);
}

export function formatDateString(dateString: string) {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };

  const date = new Date(dateString);
  const formattedDate = date.toLocaleDateString(undefined, options);

  const time = date.toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return `${time} - ${formattedDate}`;
}

export const formatDate = (date: Date) => {
  if (!date) return '...';

  return format(date, 'MMMM d, yyyy');
};

export function formatTimeAgo(timestamp: Date): string {
  const now = new Date();
  const secondsDiff = differenceInSeconds(now, timestamp);
  const minutesDiff = differenceInMinutes(now, timestamp);
  const hoursDiff = differenceInHours(now, timestamp);
  const daysDiff = differenceInDays(now, timestamp);
  const weeksDiff = differenceInWeeks(now, timestamp);

  if (secondsDiff < 60) {
    return 'Just now';
  } else if (minutesDiff < 60) {
    return minutesDiff === 1 ? '1m ago' : `${minutesDiff}m ago`;
  } else if (hoursDiff < 24) {
    return hoursDiff === 1 ? '1h ago' : `${hoursDiff}h ago`;
  } else if (daysDiff < 7) {
    return daysDiff === 1 ? '1d ago' : `${daysDiff}d ago`;
  } else if (weeksDiff < 52) {
    return weeksDiff === 1 ? '1w ago' : `${weeksDiff}w ago`;
  } else {
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return timestamp.toLocaleDateString(undefined, options);
  }
}

export const formatMsgTime = (date: Date | string): string => {
  const messageDate = new Date(date);
  const now = new Date();

  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const msgDate = new Date(
    messageDate.getFullYear(),
    messageDate.getMonth(),
    messageDate.getDate()
  );

  const diffInMs = today.getTime() - msgDate.getTime();
  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

  if (diffInDays === 0) {
    return messageDate.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } else {
    return messageDate.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: '2-digit',
    });
  }
};

export const formatMessageTime = (date: string | Date): string => {
  return format(new Date(date), 'HH:mm');
};

export const formatDateSeparator = (date: string | Date): string => {
  const dateObj = new Date(date);
  if (isToday(dateObj)) {
    return 'Today';
  } else if (isYesterday(dateObj)) {
    return 'Yesterday';
  } else {
    return format(dateObj, 'MMMM dd, yyyy');
  }
};

export const getUserEmail = (user: UserResource | User | null) => {
  const email =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? '';

  return email;
};

export const getFullName = (firstName?: string, lastName?: string) => {
  if (
    !lastName ||
    lastName === undefined ||
    lastName === null ||
    lastName === ''
  ) {
    return firstName;
  }
  return `${firstName} ${lastName}`;
};

export const formatURL = (originalURL: string) => {
  const parsedUrl = new URL(originalURL);
  const domain = parsedUrl.hostname;
  const firstPath = parsedUrl.pathname.split('/')[1] ?? '';
  return `${domain}${firstPath ? `/${firstPath}` : ''}`;
};

export const countTotalReplies = (replies: any) => {
  let totalReplies = replies?.length;

  replies?.forEach((reply: any) => {
    if (reply.replies && reply.replies.length > 0) {
      totalReplies += countTotalReplies(reply.replies);
    }
  });

  return totalReplies;
};

export function buildReplyTree(
  replies?: ParentPostProps[],
  rootPostId?: string
) {
  const replyMap: { [key: string]: ParentPostProps } = {};
  replies?.forEach((reply) => {
    reply.postChildren = [];
    replyMap[reply.id] = reply;
  });

  const tree: ParentPostProps[] = [];
  replies?.forEach((reply) => {
    if (reply.parentPostId === rootPostId) {
      tree.push(reply);
    } else if (reply.parentPostId && replyMap[reply.parentPostId]) {
      if (replyMap[reply.parentPostId]) {
        replyMap[reply.parentPostId].postChildren?.push(reply);
      }
    }
  });

  return tree;
}

export function formatRepostTime(repostTimestamp: Date): string {
  const now = new Date();
  const secondsDiff = differenceInSeconds(now, repostTimestamp);
  const minutesDiff = differenceInMinutes(now, repostTimestamp);

  if (secondsDiff < 60) {
    return 'now';
  } else if (minutesDiff < 60) {
    return `${minutesDiff}m ago`;
  } else {
    return '';
  }
}

export function isImageOrVideo(fileType: string): 'image' | 'video' | null {
  const imageTypes = ['jpeg', 'jpg', 'png', 'webp'];
  const videoTypes = ['mp4', 'mov'];

  if (imageTypes.includes(fileType.toLowerCase())) {
    return 'image';
  } else if (videoTypes.includes(fileType.toLowerCase())) {
    return 'video';
  } else {
    return null;
  }
}

export function isImage(fileType: string): boolean {
  if (!fileType) return false;
  const imageTypes = ['jpeg', 'jpg', 'png', 'webp'];
  return imageTypes.includes(fileType.toLowerCase());
}

export function isGif(fileType: string): boolean {
  if (!fileType) return false;
  return fileType.toLowerCase() === 'gif';
}

export function isVideo(fileType: string): boolean {
  if (!fileType) return false;
  const videoTypes = ['mp4', 'mov'];
  return videoTypes.includes(fileType.toLowerCase());
}

export const getImageDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

export const getVideoDimensions = (
  file: File
): Promise<{ width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';

    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve({
        width: video.videoWidth,
        height: video.videoHeight,
      });
    };

    video.onerror = () => {
      URL.revokeObjectURL(video.src);
      reject(new Error('Error loading video metadata'));
    };

    video.src = URL.createObjectURL(file);
  });
};

export const getMediaAspectRatio = (dimensions: {
  width: number;
  height: number;
}): string | undefined => {
  const ratio = dimensions.width / dimensions.height;

  if (Math.abs(ratio - 1) < 0.01) {
    return '1:1';
  } else if (Math.abs(ratio - 16 / 9) < 0.01) {
    return '16:9';
  } else if (Math.abs(ratio - 4 / 5) < 0.01) {
    return '4:5';
  } else if (Math.abs(ratio - 9 / 16) < 0.01) {
    return '9:16';
  }

  return undefined;
};

export const getVideoObjectFit = (
  aspectRatio: string,
  originalDimensions?: { width: number; height: number }
): 'object-cover' | 'object-contain' => {
  if (!originalDimensions) return 'object-cover';

  const originalRatio = originalDimensions.width / originalDimensions.height;

  if (originalRatio < 1) {
    return aspectRatio === 'original' || aspectRatio === '9:16'
      ? 'object-contain'
      : 'object-cover';
  } else if (originalRatio > 1) {
    return aspectRatio === 'original' || aspectRatio === '16:9'
      ? 'object-contain'
      : 'object-cover';
  } else {
    return 'object-cover';
  }
};

export const getVideoThumbnailUrl = (
  playbackId: string,
  thumbnailToken: string
) => {
  if (!playbackId && !thumbnailToken) return '';
  return `https://image.mux.com/${playbackId}/thumbnail.png?token=${thumbnailToken}`;
};

export const getImageObjectFit = (
  aspectRatio: string,
  originalDimensions?: { width: number; height: number }
): 'object-cover' | 'object-contain' => {
  if (!originalDimensions) return 'object-cover';
  const originalRatio = originalDimensions.width / originalDimensions.height;

  if (originalRatio < 1) {
    return aspectRatio === 'original' || aspectRatio === '4:5'
      ? 'object-contain'
      : 'object-cover';
  } else if (originalRatio > 1) {
    return aspectRatio === 'original' || aspectRatio === '16:9'
      ? 'object-contain'
      : 'object-cover';
  } else {
    return 'object-cover';
  }
};

export const getTargetRatio = (ratio?: string | null) => {
  if (!ratio || ratio === 'original') return 9 / 16;

  const separator = ratio.includes(':') ? ':' : '/';
  const [width, height] = ratio.split(separator).map(Number);

  if (isNaN(width) || isNaN(height) || height === 0) return 9 / 16;

  return width / height;
};

export const getAspectRatio = (
  file: MediaFile,
  dims: { width: number; height: number }
) => {
  const selectedRatio = file?.aspectRatio || 'original';
  let ratio: number | undefined = undefined;

  if (selectedRatio !== 'original') {
    ratio = getTargetRatio(selectedRatio);
  } else if (dims) {
    ratio = dims.width / dims.height;
  }
  return ratio;
};

export function highlightTextContent(text: string) {
  const withUrls = text.replace(
    /(https?:\/\/)?([a-zA-Z0-9-]+(?:\.[a-zA-Z]{2,})+(?:\/[^\s]*)?)/g,
    (match, protocol, domain) => {
      const fullUrl = protocol ? match : `https://${match}`;
      const displayUrl = domain.slice(0, 25);
      return `<a href="${fullUrl}" class="text-primary-blue hover:underline break-all" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${displayUrl}${
        displayUrl.length < domain.length ? '...' : ''
      }</a>`;
    }
  );

  const withHashtags = withUrls.replace(
    /#([\w.+?!,@$%&*()-]+[a-zA-Z0-9_$]+)(?=\s|$)/g,
    '<a href="/feed/$1" class="hashtag-link !text-primary-blue hover:underline hover:decoration-1 hover:transition-all hover:duration-300">#$1</a>'
  );

  return withHashtags.replace(
    /@(\w+)/g,
    '<a href="/@$1" class="text-primary-blue hover:underline">@$1</a>'
  );
}

export function extractHashtags(text: string): string[] {
  const HASHTAG_REGEX = /#[\w.+?!,@$%&*()-]+[a-zA-Z0-9_$](?=\s|$)/g;
  const matches = text.match(HASHTAG_REGEX);
  return matches ? matches.map((tag) => tag.toLowerCase()) : [];
}

export const formatTimeLeft = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export function formatCount(count: number): string {
  if (count === 0) return '0';

  const formatter = Intl.NumberFormat('en', {
    notation: 'compact',
    maximumFractionDigits: 1,
  });
  return formatter.format(count);
}

export function parseUsernamePath(
  path: string,
  username: string
): {
  basePath: string;
  lastSegment: string;
} {
  const cleanUsername = decodeURIComponent(username).substring(1);
  const basePath = `@${cleanUsername}`;

  const segments = path.split('/');
  const lastSegment = segments[segments.length - 1];

  return {
    basePath,
    lastSegment,
  };
}

export const getInitials = (name: string | null): string => {
  if (!name) return '??';
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};

export const getMediaType = (file: File) => {
  return file.type.split('/')[0];
};

export const getVideoDuration = async (file: File): Promise<number> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      window.URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = reject;
    video.src = URL.createObjectURL(file);
  });
};

export const calculateTotalVideoDuration = async (
  files: File[]
): Promise<number> => {
  const durations = await Promise.all(
    files.filter((file) => getMediaType(file) === 'video').map(getVideoDuration)
  );
  return durations.reduce((sum, duration) => sum + duration, 0);
};

export const triggerHardRefresh = (resetToFirstPost = true) => {
  const videoPlayerStore = useVideoPlayer.getState();
  videoPlayerStore.resetState();

  const commentPanelStore = useCommentPanelStore.getState();
  commentPanelStore.resetState();

  const notificationSidebarStore = useNotificationStore.getState();
  notificationSidebarStore.setIsNotificationOpen(false);

  const searchSidebarStore = useSearchStore.getState();
  searchSidebarStore.setIsSearchOpen(false);

  document.body.style.overflow = '';

  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur();
  }

  triggerFeedRefresh(resetToFirstPost);
};

export const triggerFeedRefresh = (resetToFirstPost = true) => {
  const event = new CustomEvent('refreshFeed', {
    detail: { resetToFirstPost },
  });
  window.dispatchEvent(event);
};

export const getTotalRepliesCount = (post: any) => {
  const directCommentsCount = post._count.replies;

  const nestedRepliesCount = post.replies.reduce(
    (total: number, comment: any) => {
      return total + comment._count.replies;
    },
    0
  );

  return directCommentsCount + nestedRepliesCount;
};

export const extractSuggestions = (
  texts: string[],
  query: string,
  limit: number
): string[] => {
  const bestSuggestionPerPost: Map<string, string> = new Map();
  const queryLower = query.toLowerCase();

  for (const text of texts) {
    if (!text) continue;

    if (text.toLowerCase() === queryLower) continue;

    if (
      text.toLowerCase().includes(queryLower) &&
      text.length > query.length &&
      text.length <= 50 &&
      !text.startsWith('@') &&
      !text.startsWith('#')
    ) {
      bestSuggestionPerPost.set(text, text);
    } else {
      let bestPhrase = '';

      const sentences = text.split(/[.!?;]/);

      for (const sentence of sentences) {
        const words = sentence.trim().split(/\s+/);

        if (sentence.toLowerCase().includes(queryLower)) {
          for (let size = 4; size >= 1; size--) {
            for (let i = 0; i <= words.length - size; i++) {
              const phrase = words
                .slice(i, i + size)
                .join(' ')
                .trim();

              if (
                phrase.toLowerCase().includes(queryLower) &&
                phrase.length > query.length &&
                phrase.length <= 50 &&
                !phrase.startsWith('@') &&
                !phrase.startsWith('#') &&
                phrase.toLowerCase() !== queryLower
              ) {
                if (
                  !bestPhrase ||
                  (phrase.toLowerCase().startsWith(queryLower) &&
                    !bestPhrase.toLowerCase().startsWith(queryLower))
                ) {
                  bestPhrase = phrase;

                  if (phrase.toLowerCase().startsWith(queryLower)) {
                    break;
                  }
                }
              }
            }

            if (bestPhrase) {
              break;
            }
          }
        }
      }

      if (bestPhrase) {
        bestSuggestionPerPost.set(text, bestPhrase);
      }
    }
  }

  const uniqueSuggestions = Array.from(new Set(bestSuggestionPerPost.values()));

  return uniqueSuggestions
    .sort((a, b) => {
      const aStartsWithQuery = a.toLowerCase().startsWith(queryLower);
      const bStartsWithQuery = b.toLowerCase().startsWith(queryLower);

      if (aStartsWithQuery && !bStartsWithQuery) return -1;
      if (!aStartsWithQuery && bStartsWithQuery) return 1;

      return a.length - b.length;
    })
    .slice(0, limit);
};

export const getImageUrl = (media: PostMedia) => {
  if (media.fileType === 'image') {
    return media.fileUrl;
  }
  return `https://image.mux.com/${media.playbackId}/thumbnail.png?token=${media.thumbnailToken}`;
};

export const shouldShowDateSeparator = (
  currentMessage: Message,
  previousMessage?: Message | null
): boolean => {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.createdAt);
  const previousDate = new Date(previousMessage.createdAt);

  if (!isSameDay(currentDate, previousDate)) {
    return true;
  }

  const currentTimeFormatted = format(currentDate, 'h:mm a');
  const previousTimeFormatted = format(previousDate, 'h:mm a');

  return currentTimeFormatted !== previousTimeFormatted;
};

export const formatMessageDateSeparator = (date: Date) => {
  if (isToday(date)) {
    return format(date, 'h:mm a');
  } else {
    return format(date, 'MMM d, yyyy • h:mm a');
  }
};

export const formatEmail = (email: string): string => {
  const atIndex = email.indexOf('@');

  if (atIndex < 1) {
    return email;
  }

  const localPart = email.substring(0, atIndex);
  const domain = email.substring(atIndex);

  if (localPart.length <= 2) {
    return `${localPart.charAt(0)}**${domain}`;
  }

  const firstChar = localPart.charAt(0);
  const lastChar = localPart.charAt(localPart.length - 1);

  const formattedEmail = `${firstChar}**${lastChar}${domain}`;

  return formattedEmail;
};

export const getOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const formatFeedsToString = (feeds: string[]): string => {
  if (!feeds || feeds.length === 0) {
    return '';
  }

  const formatted = feeds.map((feed) =>
    feed
      .toLowerCase()
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  );

  return formatted.join(', ');
};

export const formatUTCDate = (date: Date) => {
  return format(date, "yyyy-MM-dd HH:mm:ss 'UTC'");
};

export const formatDateAndTime = (date: Date) => {
  return format(date, 'yyyy-MM-dd HH:mm:ss');
};

export const capitalizeFirstLetter = (
  str: string | null | undefined
): string => {
  if (!str) {
    return '';
  }
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const getChartDataTemplate = (daysCount: number) => {
  const days = Array.from({ length: daysCount }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - i);
    return date.toISOString().split('T')[0];
  }).reverse();

  return days.map((date) => ({ date, value: 0 }));
};

export const tickFormatter = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', { month: 'short' });
};

export const tooltipLabelFormatter = (value: string) => {
  const date = new Date(value);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const getContentType = (post: AdminPost) => {
  if (post.media?.length > 0) {
    const fileType = post.media[0].fileType;
    if (fileType === 'image') return 'IMAGE';
    if (fileType === 'video') return 'VIDEO';
  }
};

export const getContentTypeBadgeClass = (type: ContentType) => {
  const badgeStyles = {
    IMAGE: 'border-transparent bg-blue-700/70 text-zinc-300 hover:bg-blue-700',
    VIDEO:
      'border-transparent bg-yellow-700/70 text-zinc-300 hover:bg-yellow-700',
    TEXT: 'border-transparent bg-green-700/70 text-zinc-300 hover:bg-green-700',
  };
  switch (type) {
    case 'IMAGE':
      return badgeStyles['IMAGE'];
    case 'VIDEO':
      return badgeStyles['VIDEO'];
  }
};

export const getPostThumbnail = (media?: PostMedia) => {
  if (!media) return '';
  return media?.fileType === 'image'
    ? media?.fileUrl
    : getVideoThumbnailUrl(
        media.playbackId as string,
        media.thumbnailToken as string
      );
};

export const getStrikeBadgeClass = (strikes: number) => {
  switch (strikes) {
    case 0:
      return 'bg-emerald-500/20 text-emerald-500 border-emerald-500/30 hover:bg-emerald-500/30';
    case 1:
      return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30';
    case 2:
      return 'bg-orange-500/20 text-orange-500 border-orange-500/30 hover:bg-orange-500/30';
    case 3:
      return 'bg-red-500/20 text-red-500 border-red-500/30 hover:bg-red-500/30';
    case 4:
      return 'bg-red-700/20 text-red-700 border-red-700/30 hover:bg-red-700/30 font-bold';
    default:
      return 'bg-red-900/20 text-red-900 border-red-900/30 hover:bg-red-900/30 font-bold';
  }
};

export const formatStrikesDisplay = (strikesCount: number): string | number => {
  if (strikesCount === 1) {
    return 'W';
  }
  return strikesCount;
};

export const getUserStatusInfo = (status: UserStatus) => {
  switch (status) {
    case UserStatus.ACTIVE:
      return {
        text: 'Active',
        className:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
      };
    case UserStatus.SUSPENDED:
      return {
        text: 'Suspended',
        className:
          'bg-yellow-500/20 text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/30',
      };
    case UserStatus.BANNED:
      return {
        text: 'Banned',
        className:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
      };
    default:
      return {
        text: 'Unknown',
        className:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
      };
  }
};

export function getAppealStatusInfo(status: AppealStatus) {
  switch (status) {
    case AppealStatus.PENDING:
      return {
        text: 'Pending',
        className: 'bg-blue-500/20 text-blue-300 border border-blue-400',
      };
    case AppealStatus.OVERTURNED:
      return {
        text: 'Overturned',
        className: 'bg-green-500/20 text-green-300 border border-green-400',
      };
    case AppealStatus.UPHELD:
      return {
        text: 'Upheld',
        className: 'bg-red-500/20 text-red-300 border border-red-400',
      };
    default:
      return {
        text: 'Unknown',
        className: 'bg-gray-500/20 text-gray-300 border border-gray-400',
      };
  }
}

export const getReportStatusClass = (status: ReportStatus) => {
  switch (status) {
    case ReportStatus.PENDING:
      return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30';
    case ReportStatus.ACTIONED:
      return 'bg-red-500/20 text-red-500 border-red-500/30';
    case ReportStatus.DISMISSED:
      return 'bg-green-500/20 text-green-500 border-green-500/30';
    default:
      return 'secondary';
  }
};

export const getReportType = (report: AdminReport) => {
  if (report.post?.parentPostId) return 'Comment';
  if (report.post) return 'Post';
  if (report.user) return 'User';
  return 'Unknown';
};

export async function enrichPostWithTokens<T extends { media: unknown }>(
  post: T
): Promise<T & { media: PostMedia[] }> {
  const mediaItems = (post.media as PostMedia[]) || [];

  if (mediaItems.length === 0) {
    return { ...post, media: [] };
  }

  const mediaWithTokens = await Promise.all(
    mediaItems.map(async (mediaItem) => {
      if (mediaItem.fileType === 'video' && mediaItem.playbackId) {
        const { videoToken, thumbnailToken } = await createPlaybackTokens(
          mediaItem.playbackId
        );

        return {
          ...mediaItem,
          videoToken,
          thumbnailToken,
        };
      }
      return mediaItem;
    })
  );

  return {
    ...post,
    media: mediaWithTokens,
  };
}

export async function enrichPostsWithTokens<T extends { media: unknown }>(
  posts: T[]
): Promise<(T & { media: PostMedia[] })[]> {
  return Promise.all(posts.map((post) => enrichPostWithTokens(post)));
}

export const enrichThumbnailToken = async (media: PostMedia[]) => {
  if (!media || !Array.isArray(media) || media.length === 0) return [];

  const newMedia = [...media];
  const firstItem = newMedia[0];

  if (firstItem.fileType === 'video' && firstItem.playbackId) {
    const { thumbnailToken } = await createThumbnailToken(firstItem.playbackId);

    newMedia[0] = {
      ...firstItem,
      thumbnailToken,
    };
  }

  return newMedia;
};

export const enrichMediaTokens = async (media: PostMedia[]) => {
  if (!media || !Array.isArray(media) || media.length === 0) return [];

  const newMedia = [...media];
  const firstItem = newMedia[0];

  if (firstItem.fileType === 'video' && firstItem.playbackId) {
    const { videoToken, thumbnailToken } = await createPlaybackTokens(
      firstItem.playbackId
    );

    newMedia[0] = {
      ...firstItem,
      videoToken,
      thumbnailToken,
    };
  }

  return newMedia;
};
