export interface Product {
  id: string;
  name: string;
  category: 'Boutique' | 'Premium' | 'Edibles';
  description: string | null;
  image_url: string | null;
  is_available: boolean;
  created_at: string;
}

export type ProductCategory = 'All' | 'Boutique' | 'Premium' | 'Edibles';

export const isNewDrop = (createdAt: string): boolean => {
  const created = new Date(createdAt);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - created.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
};

export const formatCategoryForFilter = (category: string): ProductCategory => {
  switch (category) {
    case 'Boutique':
      return 'Boutique';
    case 'Premium':
      return 'Premium';
    case 'Edibles':
      return 'Edibles';
    default:
      return 'All';
  }
};

const generatePlaceholderSvg = (name: string, category: string): string => {
  const colors: Record<string, { bg: string; accent: string }> = {
    Boutique: { bg: '1a1a1a', accent: 'c5a059' },
    Premium: { bg: '0f172a', accent: '3b82f6' },
    Edibles: { bg: '1e0a2e', accent: 'ec4899' },
  };
  const { bg, accent } = colors[category] || colors.Boutique;
  
  return `data:image/svg+xml,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <rect width="400" height="400" fill="#${bg}"/>
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#${accent}" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#${accent}" stopOpacity="0.05"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#grad)"/>
      <text x="200" y="180" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#${accent}" letter-spacing="2">SMOKEY</text>
      <text x="200" y="210" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="#${accent}" letter-spacing="2">DREAMZ</text>
      <text x="200" y="250" text-anchor="middle" font-family="system-ui" font-size="14" fill="#${accent}" opacity="0.7">${name}</text>
      <text x="200" y="275" text-anchor="middle" font-family="system-ui" font-size="10" fill="#${accent}" opacity="0.5">${category}</text>
    </svg>
  `)}`;
};

export const getPlaceholderImage = (name: string, category: string): string => {
  return generatePlaceholderSvg(name, category);
};