import useCommentPanelStore from '@/store/commentPanel';
import { useNotificationStore } from '@/store/notificationStore';
import { useSearchStore } from '@/store/searchStore';
import useVideoPlayer from '@/store/videoPlayer';
import { type User } from '@clerk/nextjs/server';
import { type UserResource } from '@clerk/types';
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
  type AspectRatio,
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
  aspectRatio: AspectRatio | string,
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

export const getImageObjectFit = (
  aspectRatio: AspectRatio,
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

export const getTargetRatio = (
  aspectRatio: AspectRatio,
  originalDimensions?: { width: number; height: number }
) => {
  let targetRatio: number;

  switch (aspectRatio) {
    case 'original':
      if (originalDimensions) {
        targetRatio = originalDimensions.width / originalDimensions.height;
      } else {
        targetRatio = 1;
      }
      break;
    case '1:1':
      targetRatio = 1;
      break;
    case '4:5':
      targetRatio = 4 / 5;
      break;
    case '9:16':
      targetRatio = 9 / 16;
      break;
    case '16:9':
      targetRatio = 16 / 9;
      break;
    default:
      targetRatio = 1;
  }

  return targetRatio;
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
  return media.thumbnailUrl;
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
