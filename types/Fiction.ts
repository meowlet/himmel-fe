export interface Fiction {
  _id: string;
  title: string;
  description: string;
  tags: string[] | Tag[];
  status: string;
  type: string;
  author: string | User;
  stats: {
    viewCount: number;
    ratingCount: number;
    averageRating: number;
    commentCount: number;
    favoriteCount: number;
  };
  chapters?: string[] | Chapter[];
  createdAt: string;
  updatedAt: string;
}

interface ReadingHistory {
  chapter: string | Chapter;
  lastReadPage: number;
  lastReadTime: Date;
}

export interface User {
  _id: string;
  username: string;
  fullName: string;
  email: string;
  passwordHash: string;
  isPremium: boolean;
  premiumExpiryDate: string | null;
  favoriteTags: string[];
  bookmarks: string[] | Chapter[];
  createdAt: string;
  updatedAt: string;
  bio: string | null;
  favorites: string[] | Fiction[];
  readingHistory: ReadingHistory[];
}

export interface Tag {
  _id: string;
  name: string;
  code: string;
  description: string;
  workCount: number;
}

export interface Chapter {
  _id: string;
  fiction: string | Fiction;
  chapterIndex: number;
  title: string;
  createdAt: string;
  updatedAt: string;
}
