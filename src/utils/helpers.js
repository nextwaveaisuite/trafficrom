import { format, formatDistanceToNow } from 'date-fns';

export const formatDate = (date) =>
  format(new Date(date), 'MMM d, yyyy');

export const timeAgo = (date) =>
  formatDistanceToNow(new Date(date), { addSuffix: true });

export const formatCredits = (n) =>
  n?.toLocaleString() ?? '0';

export const truncate = (str, len = 60) =>
  str?.length > len ? str.slice(0, len) + '…' : str;

export const getInitials = (name) =>
  name
    ?.split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) ?? '??';

export const openRateBadge = (opens, recipients) => {
  if (!recipients) return '0%';
  const rate = ((opens / recipients) * 100).toFixed(1);
  return `${rate}%`;
};
