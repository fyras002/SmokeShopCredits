export interface Credit {
  id?: number;
  personId: number;
  personName?: string | null;
  amount: number;
  status?: string | number | null;
  notes?: string | null;
  createdAt?: string;
}
