export interface Product {
  id: string;
  name: string;
  category: string;
  subcategory: string;
  strainType: "Indica" | "Sativa" | "Hybrid" | null;
  terpeneProfile: string;
  thc: string;
  description: string;
}

export const menuCategories = [
  {
    name: "Boutique Flower",
    subtitle: "5G Tiers",
    slug: "boutique"
  },
  {
    name: "Premium Flower",
    subtitle: "2G & 1G Tiers",
    slug: "premium"
  },
  {
    name: "Edibles & Infusions",
    subtitle: "Specialty Items",
    slug: "edibles"
  }
];

export const menuItems: Product[] = [
  // Boutique Flower (5G Tiers)
  {
    id: "bf-1",
    name: "Critical Kush",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Indica",
    terpeneProfile: "Myrcene, Limonene, Caryophyllene",
    thc: "24%",
    description: "Deep relaxation with earthy, Kush notes."
  },
  {
    id: "bf-2",
    name: "Medusa",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Indica",
    terpeneProfile: "Myrcene, Pinene, Linalool",
    thc: "22%",
    description: "Serpentine calm with sweet herbal undertones."
  },
  {
    id: "bf-3",
    name: "Downward Dog",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Hybrid",
    terpeneProfile: "Caryophyllene, Humulene, Limonene",
    thc: "23%",
    description: "Balanced bliss perfect for mindful moments."
  },
  {
    id: "bf-4",
    name: "Granny Smith",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Sativa",
    terpeneProfile: "Limonene, Pinene, Terpinolene",
    thc: "21%",
    description: "Crisp, apple-like refreshment with gentle energy."
  },
  {
    id: "bf-5",
    name: "Master Kush",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Indica",
    terpeneProfile: "Myrcene, Caryophyllene",
    thc: "25%",
    description: "Classic indica power with hashy, earthy depth."
  },
  {
    id: "bf-6",
    name: "WW",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Hybrid",
    terpeneProfile: "Limonene, Caryophyllene, Myrcene",
    thc: "20%",
    description: "Legendary walker scope with herbal sweetness."
  },
  {
    id: "bf-7",
    name: "Twisted Pie",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Hybrid",
    terpeneProfile: "Caryophyllene, Limonene, Linalool",
    thc: "24%",
    description: "Dessert-like decadence with pie spice warmth."
  },
  {
    id: "bf-8",
    name: "Gelato",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Hybrid",
    terpeneProfile: "Limonene, Caryophyllene, Humulene",
    thc: "26%",
    description: "Sweet, creamy indulgence with vivid color."
  },
  {
    id: "bf-9",
    name: "Triple X",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Sativa",
    terpeneProfile: "Terpinolene, Pinene, Limonene",
    thc: "23%",
    description: "Triple the citrus punch for vibrant uplift."
  },
  {
    id: "bf-10",
    name: "Sour Diesel",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Sativa",
    terpeneProfile: "Caryophyllene, Limonene, Myrcene",
    thc: "22%",
    description: "Classic diesel tang with sharp energy."
  },
  {
    id: "bf-11",
    name: "Ice Lemon",
    category: "Boutique Flower",
    subcategory: "5G Tiers",
    strainType: "Sativa",
    terpeneProfile: "Limonene, Terpinolene, Pinene",
    thc: "24%",
    description: "Icy citrus refreshment with zingy finish."
  },

  // Premium Flower (2G & 1G Tiers)
  {
    id: "pf-1",
    name: "Banana Daddy",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Hybrid",
    terpeneProfile: "Limonene, Caryophyllene, Myrcene",
    thc: "27%",
    description: "Tropical banana sweetness with creamy exhale."
  },
  {
    id: "pf-2",
    name: "Citradelic Sunset",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Sativa",
    terpeneProfile: "Limonene, Terpinolene",
    thc: "25%",
    description: "Citrus explosion with sunset vibes."
  },
  {
    id: "pf-3",
    name: "Jungle Berry",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Hybrid",
    terpeneProfile: "Myrcene, Limonene, Pinene",
    thc: "24%",
    description: "Wild berry notes from the jungle canopy."
  },
  {
    id: "pf-4",
    name: "World Fire",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Indica",
    terpeneProfile: "Caryophyllene, Myrcene, Limonene",
    thc: "28%",
    description: "Blazing intensity with smoky depth."
  },
  {
    id: "pf-5",
    name: "Rainbow Marker",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Hybrid",
    terpeneProfile: "Limonene, Caryophyllene",
    thc: "23%",
    description: "Colorful terps with marker-like sharpness."
  },
  {
    id: "pf-6",
    name: "F1 Cheese",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Indica",
    terpeneProfile: "Myrcene, Limonene",
    thc: "22%",
    description: "Sharp, pungent cheese with creamy body."
  },
  {
    id: "pf-7",
    name: "Black Cherry Punch",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Indica",
    terpeneProfile: "Myrcene, Caryophyllene, Limonene",
    thc: "26%",
    description: "Dark fruit sweetness with berry punch."
  },
  {
    id: "pf-8",
    name: "Mokums Tulip",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Sativa",
    terpeneProfile: "Terpinolene, Pinene, Limonene",
    thc: "21%",
    description: "Dutch delight with floral elegance."
  },
  {
    id: "pf-9",
    name: "Divine Storm",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Hybrid",
    terpeneProfile: "Caryophyllene, Humulene, Limonene",
    thc: "27%",
    description: "Powerful storm of euphoria and calm."
  },
  {
    id: "pf-10",
    name: "Gorilla Glue",
    category: "Premium Flower",
    subcategory: "2G & 1G Tiers",
    strainType: "Hybrid",
    terpeneProfile: "Myrcene, Caryophyllene, Limonene",
    thc: "28%",
    description: "Heavy-hitting glue with sticky resin."
  },

  // Specialty Strains
  {
    id: "sp-1",
    name: "Jungle Diamonds",
    category: "Premium Flower",
    subcategory: "Specialty Strains",
    strainType: "Hybrid",
    terpeneProfile: "Limonene, Caryophyllene, Linalool",
    thc: "30%",
    description: "Crystal-coated jungle treasure."
  },
  {
    id: "sp-2",
    name: "La Cron",
    category: "Premium Flower",
    subcategory: "Specialty Strains",
    strainType: "Sativa",
    terpeneProfile: "Terpinolene, Pinene",
    thc: "24%",
    description: "Time-honored classic with refined edge."
  },
  {
    id: "sp-3",
    name: "GSC",
    category: "Premium Flower",
    subcategory: "Specialty Strains",
    strainType: "Hybrid",
    terpeneProfile: "Caryophyllene, Limonene, Humulene",
    thc: "28%",
    description: "Girl Scout Cookie royalty with sweet dough."
  },
  {
    id: "sp-4",
    name: "Mandarin Q",
    category: "Premium Flower",
    subcategory: "Specialty Strains",
    strainType: "Sativa",
    terpeneProfile: "Limonene, Terpinolene",
    thc: "25%",
    description: "Zesty mandarin with clean citrus finish."
  },
  {
    id: "sp-5",
    name: "Lilac Diesel",
    category: "Premium Flower",
    subcategory: "Specialty Strains",
    strainType: "Sativa",
    terpeneProfile: "Caryophyllene, Limonene, Pinene",
    thc: "26%",
    description: "Floral diesel with purple undertones."
  },
  {
    id: "sp-6",
    name: "Mac Stomper",
    category: "Premium Flower",
    subcategory: "Specialty Strains",
    strainType: "Hybrid",
    terpeneProfile: "Limonene, Caryophyllene, Myrcene",
    thc: "27%",
    description: "MAC genetics with powerful punch."
  },
  {
    id: "sp-7",
    name: "Blue Dream",
    category: "Premium Flower",
    subcategory: "Specialty Strains",
    strainType: "Sativa",
    terpeneProfile: "Myrcene, Pinene, Caryophyllene",
    thc: "22%",
    description: "Dreamy blue berry with gentle haze."
  },

  // Edibles & Infusions
  {
    id: "ed-1",
    name: "Gourmet Cookies",
    category: "Edibles & Infusions",
    subcategory: "Baked Goods",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "50mg",
    description: "Artisan baked with premium extract."
  },
  {
    id: "ed-2",
    name: "Artisanal Chocolate Slabs",
    category: "Edibles & Infusions",
    subcategory: "Chocolate",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "75mg",
    description: "Rich Belgian chocolate, precisely dosed."
  },
  {
    id: "ed-3",
    name: "Infused Jubes",
    category: "Edibles & Infusions",
    subcategory: "Gummies",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "25mg",
    description: "Chewy fruit bites with accurate dosing."
  },
  {
    id: "ed-4",
    name: "Gummy Bears",
    category: "Edibles & Infusions",
    subcategory: "Gummies",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "50mg",
    description: "Classic gummy bears, medicated perfection."
  },
  {
    id: "ed-5",
    name: "Jelly Tots",
    category: "Edibles & Infusions",
    subcategory: "Gummies",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "25mg",
    description: "South African favorite, now medicated."
  },
  {
    id: "ed-6",
    name: "Fresh Donuts",
    category: "Edibles & Infusions",
    subcategory: "Baked Goods",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "100mg",
    description: "Freshly baked with frosting and sprinkles."
  },
  {
    id: "ed-7",
    name: "Rainbows Double",
    category: "Edibles & Infusions",
    subcategory: "Specialty",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "100mg",
    description: "Double the rainbow, double the fun."
  },
  {
    id: "ed-8",
    name: "Mango Juice (Big)",
    category: "Edibles & Infusions",
    subcategory: "Beverages",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "100mg",
    description: "Tropical mango burst in every sip."
  },
  {
    id: "ed-9",
    name: "Mango Juice (Shots)",
    category: "Edibles & Infusions",
    subcategory: "Beverages",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "50mg",
    description: "Ready-to-drink mango shots."
  },
  {
    id: "ed-10",
    name: "Medicated Suckers (10mg)",
    category: "Edibles & Infusions",
    subcategory: "Candies",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "10mg",
    description: "Classic lollipop, perfectly portioned."
  },
  {
    id: "ed-11",
    name: "Medicated Suckers (25mg)",
    category: "Edibles & Infusions",
    subcategory: "Candies",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "25mg",
    description: "Long-lasting relief in every lick."
  },
  {
    id: "ed-12",
    name: "Medicated Suckers (50mg)",
    category: "Edibles & Infusions",
    subcategory: "Candies",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "50mg",
    description: "Bold strength, lingering sweetness."
  },
  {
    id: "ed-13",
    name: "Medicated Suckers (100mg)",
    category: "Edibles & Infusions",
    subcategory: "Candies",
    strainType: null,
    terpeneProfile: "N/A",
    thc: "100mg",
    description: "Maximum strength, premium quality."
  }
];

export function getProductsByCategory(categorySlug: string): Product[] {
  const category = menuCategories.find(c => c.slug === categorySlug);
  if (!category) return [];
  
  if (categorySlug === "boutique") {
    return menuItems.filter(p => p.subcategory === "5G Tiers");
  } else if (categorySlug === "premium") {
    return menuItems.filter(p => 
      p.subcategory === "2G & 1G Tiers" || p.subcategory === "Specialty Strains"
    );
  } else if (categorySlug === "edibles") {
    return menuItems.filter(p => p.category === "Edibles & Infusions");
  }
  
  return menuItems;
}

export function getAllCategoriesWithProducts(): { category: typeof menuCategories[0]; products: Product[] }[] {
  return menuCategories.map(cat => ({
    category: cat,
    products: getProductsByCategory(cat.slug)
  }));
}
