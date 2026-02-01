// Formatting utilities for Goldify

export const getAPRColor = (apr: number): string => {
  if (apr < 3) return 'var(--apr-excellent)';
  if (apr < 5) return 'var(--apr-good)';
  if (apr < 8) return 'var(--apr-moderate)';
  if (apr < 12) return 'var(--apr-high)';
  return 'var(--apr-extreme)';
};

export const getAPRLabel = (apr: number): string => {
  if (apr < 3) return 'Excellent';
  if (apr < 5) return 'Good';
  if (apr < 8) return 'Moderate';
  if (apr < 12) return 'High';
  return 'Very High';
};

export const getAPRPercentage = (apr: number): number => {
  return Math.min((apr / 15) * 100, 100);
};

export const getTimeAgo = (date: Date | null): string => {
  if (!date) return 'Never';
  
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  
  if (seconds < 60) return 'Just now';
  if (seconds < 120) return '1 minute ago';
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
  if (seconds < 7200) return '1 hour ago';
  return `${Math.floor(seconds / 3600)} hours ago`;
};

export const getDataFreshnessStatus = (lastFetchTime: Date | null): {
  label: string;
  color: string;
  shouldRefresh: boolean;
} => {
  if (!lastFetchTime) {
    return { 
      label: 'No Data', 
      color: 'var(--apr-extreme)', 
      shouldRefresh: true 
    };
  }
  
  const ageMs = Date.now() - lastFetchTime.getTime();
  const ageMinutes = Math.floor(ageMs / 60000);
  
  if (ageMinutes < 2) {
    return { 
      label: 'Live', 
      color: 'var(--apr-excellent)', 
      shouldRefresh: false 
    };
  }
  if (ageMinutes < 5) {
    return { 
      label: 'Recent', 
      color: 'var(--gold-500)', 
      shouldRefresh: false 
    };
  }
  return { 
    label: 'Stale', 
    color: 'var(--accent-warning)', 
    shouldRefresh: true 
  };
};
