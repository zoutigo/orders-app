export type OrderStatus =
  | 'DRAFT'
  | 'ATTENTE_PREPA'
  | 'EN_PREPA'
  | 'PRET_PARTIEL'
  | 'PRET_A_SERVIR'
  | 'SERVIE_PARTIEL'
  | 'SERVIE';

export interface OrderItem {
  id: string;
  productId: string;
  name: string;
  qty: number;
  price: number; // prix unitaire
  note?: string;
}

export interface Comment {
  id: string;
  role: 'SERVEUR' | 'CUISINE' | 'CAISSIER' | 'SUPERVISEUR';
  message: string;
  at: string; // ISO string
}

export interface Order {
  id: string; // ex: "#108"
  tableId?: string;
  status: OrderStatus;
  items: OrderItem[];
  comments: Comment[];
  restaurantId: string;

  waiterId?: string; // qui a pris la commande
  cashierId?: string; // qui a encaissé
  preparatorId?: string; // qui a préparé
  supervisorId?: string; // qui a supervisé

  createdAt: string; // ISO
  expectedAt?: string; // ISO prévu (service)
  isPaid: boolean; // payé ou non
}
