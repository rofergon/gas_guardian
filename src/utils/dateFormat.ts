import { format } from 'date-fns';

export const formatTimeString = (timeString: string) => {
  try {
    return format(new Date(timeString), 'HH:mm');
  } catch (error) {
    console.error('Error formatting time:', error);
    return timeString;
  }
}; 