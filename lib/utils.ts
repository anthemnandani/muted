import type { User } from '@clerk/nextjs/server';
import type { UserResource } from '@clerk/types';
import { type ClassValue, clsx } from 'clsx';
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  differenceInWeeks,
} from 'date-fns';
import { twMerge } from 'tailwind-merge';
import { ParentPostProps } from './types';

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

export function highlightHashtagsAndUrls(text: string) {
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

  return withUrls.replace(
    /#([\w.+?!,@$%&*()-]+[a-zA-Z0-9_$]+)(?=\s|$)/g,
    '<a href="/feed/$1" class="hashtag-link !text-primary-blue hover:underline hover:decoration-1 hover:transition-all hover:duration-300">#$1</a>'
  );
}

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

export const extractMentions = (
  text: string
): Array<{ username: string; index: number }> => {
  const mentionRegex = /@(\w+)/g;
  let match;
  const mentions: Array<{ username: string; index: number }> = [];

  while ((match = mentionRegex.exec(text)) !== null) {
    const username = match[1];
    const index = match.index;

    mentions.push({
      username,
      index,
    });
  }

  return mentions;
};

export const triggerFeedRefresh = () => {
  const event = new CustomEvent('refreshFeed');
  window.dispatchEvent(event);
};
