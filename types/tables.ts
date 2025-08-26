export type TableStatus = 'LIBRE' | 'OCCUPEE' | 'EN_SERVICE';

export interface Table {
  id: string; // ex: "T1"
  name: string; // ex: "Table VIP"
  status: TableStatus;
  seats: number;
  isUsable: boolean;
  description?: string;
  restaurantId: string; // lien vers le restaurant
}
