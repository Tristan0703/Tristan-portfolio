export interface Fabric {
  id: string;
  name: string;
  sku: string;
  description: string;
  material: string;
  weight: "light" | "medium" | "heavy";
  threadCount: number;
  gsm: number;
  origin: string;
  price: number;
  imageUrl: string;
  isVaultItem: boolean;
  pairings: Fabric[];
}

export interface User {
  id: string;
  email: string;
  role: "standard" | "designer" | "vip";
}