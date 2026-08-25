export interface PersonCredit {
  id?: number;
  personId: number;
  amount: number;
  status?: string | null;
  notes?: string | null;
  createdAt?: string;
}

export interface Person {
  id?: number;
  name: string;
  phone?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string | null;
  credits?: PersonCredit[];
}
