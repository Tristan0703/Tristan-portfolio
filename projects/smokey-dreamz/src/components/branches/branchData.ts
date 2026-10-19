export type BranchTheme = 'blairgowrie' | 'randpark' | 'witbank' | 'albertskroon' | 'bronkhorstspruit';

export interface Branch {
  id: BranchTheme;
  name: string;
  subtitle: string;
  tagline: string;
  address: string;
  mapsUrl: string;
  instagramUrl: string;
  hours: {
    [key: string]: string;
  };
  hasPage: boolean;
  vibe?: string;
  theme?: {
    primary: string;
    accent: string;
    glow: string;
    gradient: string;
  };
}

export const branches: Record<BranchTheme, Branch> = {
  blairgowrie: {
    id: 'blairgowrie',
    name: 'Blairgowrie',
    subtitle: 'Fairy Crescent',
    tagline: 'Where Whimsy Meets Wonder',
    address: 'Fairy Crescent, Blairgowrie, Johannesburg',
    mapsUrl: 'https://maps.google.com/?q=Fairy+Crescent+Blairgowrie+Johannesburg',
    instagramUrl: 'https://www.instagram.com/smokeydreamz.blairgowrie420',
    hours: {
      'Mon-Wed': '10:00 AM - 11:30 PM',
      'Thu': '10:00 AM - 00:00',
      'Fri': '10:00 AM - 00:30',
      'Sat': '10:00 AM - 00:00',
      'Sun': '10:00 AM - 12:00 PM',
    },
    hasPage: true,
    vibe: 'Whimsical and surreal, like stepping through the looking glass into a dreamy wonderland.',
    theme: {
      primary: '#22c55e',
      accent: '#86efac',
      glow: 'shadow-green-500/20',
      gradient: 'from-green-900/20 via-transparent to-emerald-900/10',
    },
  },
  randpark: {
    id: 'randpark',
    name: 'Randpark Ridge',
    subtitle: 'Pond & Garden',
    tagline: 'Tranquility in Nature',
    address: 'Randpark Ridge, Johannesburg',
    mapsUrl: 'https://maps.google.com/?q=Randpark+Ridge+Johannesburg',
    instagramUrl: 'https://www.instagram.com/smokeydreamz.randpark',
    hours: {
      'Mon-Wed': '10:00 AM - 11:30 PM',
      'Thu': '10:00 AM - 00:00',
      'Fri': '10:00 AM - 00:30',
      'Sat': '10:00 AM - 00:00',
      'Sun': '10:00 AM - 12:00 PM',
    },
    hasPage: true,
    vibe: 'Tranquil, organic, and bespoke — a sanctuary where nature meets premium cannabis culture.',
    theme: {
      primary: '#0ea5e9',
      accent: '#7dd3fc',
      glow: 'shadow-sky-500/20',
      gradient: 'from-sky-900/20 via-transparent to-blue-900/10',
    },
  },
  witbank: {
    id: 'witbank',
    name: 'Witbank',
    subtitle: 'Retro Arcade',
    tagline: 'Insert Coin to Dream',
    address: 'Witbank, Mpumalanga',
    mapsUrl: 'https://maps.google.com/?q=Witbank+Mpumalanga',
    instagramUrl: 'https://www.instagram.com/smokeydreamzwitdank',
    hours: {
      'Mon-Wed': '11:00 AM - 11:30 PM',
      'Thu': '11:00 AM - 00:00',
      'Fri': '11:00 AM - 00:30',
      'Sat': '11:00 AM - 00:00',
      'Sun': '11:00 AM - 12:30 PM',
    },
    hasPage: true,
    vibe: '80s Neon dreamscape — where synthwave meets premium cannabis in an arcade wonderland.',
    theme: {
      primary: '#ec4899',
      accent: '#f472b6',
      glow: 'shadow-pink-500/30',
      gradient: 'from-pink-900/20 via-transparent to-purple-900/10',
    },
  },
  albertskroon: {
    id: 'albertskroon',
    name: 'Albertskroon',
    subtitle: 'City Center',
    tagline: 'Your Urban Cannabis Hub',
    address: '61 5th St, Albertskroon, Johannesburg',
    mapsUrl: 'https://maps.google.com/?q=61+5th+St+Albertskroon+Johannesburg',
    instagramUrl: 'https://www.instagram.com/smokeydreamz',
    hours: {
      'Mon-Wed': '08:00 AM - 9:00 PM',
      'Thu': '08:00 AM - 00:00',
      'Fri': '08:00 AM - 00:30',
      'Sat': '08:00 AM - 00:00',
      'Sun': '09:00 AM - 8:00 PM',
    },
    hasPage: false,
  },
  bronkhorstspruit: {
    id: 'bronkhorstspruit',
    name: 'Bronkhorstspruit',
    subtitle: 'Eastern Gateway',
    tagline: 'Quality Cannabis, Personal Service',
    address: '6 Mulder Rd, Erasmus, Bronkhorstspruit',
    mapsUrl: 'https://maps.google.com/?q=6+Mulder+Rd+Erasmus+Bronkhorstspruit',
    instagramUrl: 'https://www.instagram.com/smokeydreamz',
    hours: {
      'Mon-Sat': '08:30 AM - 7:00 PM',
      'Sun': '09:00 AM - 5:00 PM',
    },
    hasPage: false,
  },
};

export const getTodayHours = (branch: Branch): string => {
  const day = new Date().toLocaleDateString('en-US', { weekday: 'short' });
  const fullDay = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
  if (branch.hours[fullDay]) return branch.hours[fullDay];
  if (branch.hours[day]) return branch.hours[day];
  
  for (const [key, value] of Object.entries(branch.hours)) {
    if (key.includes(day) || key.includes(fullDay)) return value;
  }
  
  return 'Hours not available';
};