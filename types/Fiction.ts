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
  };
  createdAt: string;
  updatedAt: string;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  passwordHash: string;
  isPremium: boolean;
  premiumExpiryDate: string | null;
  favoriteTags: string[];
  createdAt: string;
  updatedAt: string;
  bio: string | null;
}

export interface Tag {
  _id: string;
  name: string;
  code: string;
  description: string;
  workCount: number;
}
