import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  differenceInSeconds,
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
} from 'date-fns';
import type { UserResource } from '@clerk/types';
import type { User } from '@clerk/nextjs/server';

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
    return `${secondsDiff}s`;
  } else if (minutesDiff < 60) {
    return `${minutesDiff}m`;
  } else if (hoursDiff < 24) {
    return `${hoursDiff}h`;
  } else if (daysDiff < 7) {
    return `${daysDiff}d`;
  } else {
    return `${weeksDiff}w`;
  }
}

export const getUserEmail = (user: UserResource | User | null) => {
  const email =
    user?.emailAddresses?.find((e) => e.id === user.primaryEmailAddressId)
      ?.emailAddress ?? '';

  return email;
};

export const getUsername = (user: UserResource | User | null) => {
  const username =
    user?.username ?? user?.emailAddresses[0].emailAddress.split('@')[0];
  return username;
};

export const getFullName = (firstName: string, lastName: string) => {
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
