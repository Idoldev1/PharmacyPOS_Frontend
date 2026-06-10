import { format, differenceInDays, parseISO } from "date-fns";

export const formatDate = (date: string) => format(parseISO(date), "dd MMM yyyy");
export const formatDateTime = (date: string) => format(parseISO(date), "dd MMM yyyy, h:mm a");
export const isExpiringSoon = (expiryDate: string, thresholdDays = 90): boolean =>
  differenceInDays(parseISO(expiryDate), new Date()) <= thresholdDays;
export const daysBetween = (a: string, b: string): number =>
  differenceInDays(parseISO(b), parseISO(a));
