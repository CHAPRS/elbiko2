export interface Bike {
  id: number;
  name: string;
  speed: string;
  range: string;
  motor: string;
  isWaterproof: boolean;
  status: string;
  pricePerDay: number;
  imageUrl?: string | null;
}
