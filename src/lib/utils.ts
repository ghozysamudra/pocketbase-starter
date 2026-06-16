import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChild<T> = T extends { child?: any } ? Omit<T, "child"> : T;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WithoutChildren<T> = T extends { children?: any } ? Omit<T, "children"> : T;
export type WithoutChildrenOrChild<T> = WithoutChildren<WithoutChild<T>>;
export type WithElementRef<T, U extends HTMLElement = HTMLElement> = T & { ref?: U | null };

export function md5(str: string): string {
  const k = [
    0xd76aa478, 0xe8c7b756, 0x242070db, 0xc1bdceee,
    0xf57c0faf, 0x4787c62a, 0xa8304613, 0xfd469501,
    0x698098d8, 0x8b44f7af, 0xffff5bb1, 0x895cd7be,
    0x6b901122, 0xfd987193, 0xa679438e, 0x49b40821,
    0xf61e2562, 0xc040b340, 0x265e5a51, 0xe9b6c7aa,
    0xd62f105d, 0x02441453, 0xd8a1e681, 0xe7d3fbc8,
    0x21e1cde6, 0xc33707d6, 0xf4d50d87, 0x455a14ed,
    0xa9e3e905, 0xfcefa3f8, 0x676f02d9, 0x8d2a4c8a,
    0xfffa3942, 0x8771f681, 0x6d9d6122, 0xfde5380c,
    0xa4bee044, 0x4bdecfa9, 0xf6bb4b60, 0xbebfbc70,
    0x289b7ec6, 0xeaa127fa, 0xd4ef3085, 0x04881d05,
    0xd9d4d039, 0xe6db99e5, 0x1fa27cf8, 0xc4ac5665,
    0xf4292244, 0x432aff97, 0xab9423a7, 0xfc93a039,
    0x655b59c3, 0x8f0ccc92, 0xffeff47d, 0x85845dd1,
    0x6fa87e4f, 0xfe2ce6e0, 0xa3014314, 0x4e0811a1,
    0xf7537e82, 0xbd3af235, 0x2ad7d2bb, 0xeb86d391
  ];

  const s = [
    7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22, 7, 12, 17, 22,
    5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20, 5, 9, 14, 20,
    4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23, 4, 11, 16, 23,
    6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21, 6, 10, 15, 21
  ];

  const words: number[] = [];
  const utf8 = unescape(encodeURIComponent(str));
  for (let i = 0; i < utf8.length; i++) {
    words[i >> 2] |= utf8.charCodeAt(i) << ((i % 4) * 8);
  }
  words[utf8.length >> 2] |= 0x80 << ((utf8.length % 4) * 8);
  const wordCount = ((utf8.length + 8) >> 6) * 16 + 14;
  while (words.length < wordCount) words.push(0);
  words.push(utf8.length * 8);
  words.push(0);

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let i = 0; i < words.length; i += 16) {
    let originalA = a;
    let originalB = b;
    let originalC = c;
    let originalD = d;

    for (let j = 0; j < 64; j++) {
      let f, g;
      if (j < 16) {
        f = (b & c) | (~b & d);
        g = j;
      } else if (j < 32) {
        f = (d & b) | (~d & c);
        g = (5 * j + 1) % 16;
      } else if (j < 48) {
        f = b ^ c ^ d;
        g = (3 * j + 5) % 16;
      } else {
        f = c ^ (b | ~d);
        g = (7 * j) % 16;
      }

      const temp = d;
      d = c;
      c = b;
      const sum = (a + f + k[j] + (words[i + g] || 0)) | 0;
      b = (b + ((sum << s[j]) | (sum >>> (32 - s[j])))) | 0;
      a = temp;
    }

    a = (a + originalA) | 0;
    b = (b + originalB) | 0;
    c = (c + originalC) | 0;
    d = (d + originalD) | 0;
  }

  const hex = (num: number) => {
    let out = "";
    for (let i = 0; i < 4; i++) {
      out += ((num >> (i * 8)) & 0xff).toString(16).padStart(2, "0");
    }
    return out;
  };

  return hex(a) + hex(b) + hex(c) + hex(d);
}

export function getGravatarUrl(email: string, size = 80): string {
  const cleanEmail = (email || "").trim().toLowerCase();
  const hash = md5(cleanEmail);
  return `https://www.gravatar.com/avatar/${hash}?s=${size}&d=identicon`;
}
