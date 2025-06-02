import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// utils/generateRoomId.ts
import { customAlphabet } from "nanoid";
import { api } from "./axios";

// Using only lowercase letters for simplicity and readability
const alphabet = "abcdefghijklmnopqrstuvwxyz";
const nanoid = customAlphabet(alphabet, 9); // 9 characters total

export const generateRoomId = (): string => {
  const id = nanoid(); // e.g., "abcxyzdef"
  return id.match(/.{1,3}/g)?.join("-") ?? id; // e.g., "abc-xyz-def"
};

export const generateId = (length: number = 21): string => {
  return nanoid(length);
};

export const fetchCurrentUser = async () => {
  const res = await api.get("/auth/me");
  return res.data.user;
};
