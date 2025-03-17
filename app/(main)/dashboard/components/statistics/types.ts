export enum GroupByOption {
  DAY = "day",
  WEEK = "week",
  MONTH = "month",
  YEAR = "year",
}

export interface GeneralStats {
  totalUsers: number;
  totalAuthors: number;
  totalFictions: number;
  totalPremiumFictions: number;
  totalFreeFictions: number;
  totalViews: number;
  totalRevenue: number;
  totalPaidOut: number;
}

export interface GroupedGeneralStats extends GeneralStats {
  date: string;
}

export interface FictionStats {
  totalViews: number;
  totalFavorites: number;
  totalComments: number;
  totalRatings: number;
  averageRating: number;
  viewsByType: {
    free: number;
    premium: number;
  };
  topViewedFictions: {
    _id: string;
    title: string;
    views: number;
  }[];
}

export interface UserStats {
  totalUsers: number;
  premiumUsers: number;
  newUsersCount: number;
  usersByRole: {
    [key: string]: number;
  };
}
