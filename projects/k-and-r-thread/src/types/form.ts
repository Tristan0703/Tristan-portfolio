export interface FormData {
  projectType: string;
  yardage: string;
  width: string;
  deadline: string;
  addOns: string[];
  name: string;
  company: string;
  email: string;
  notes: string;
}

export const projectTypes = [
  "Bespoke Tailoring",
  "Interior Drapery",
  "Soft Furnishings",
  "Upholstery",
  "Bridal & Evening Wear",
] as const;

export const addOnOptions = [
  { id: "silk-lining", label: "Silk Lining" },
  { id: "anti-stain", label: "Anti-Stain Treatment" },
  { id: "priority", label: "Priority Shipping" },
  { id: "rush-production", label: "Rush Production" },
] as const;

export const initialFormData: FormData = {
  projectType: "",
  yardage: "",
  width: "",
  deadline: "",
  addOns: [],
  name: "",
  company: "",
  email: "",
  notes: "",
};