export interface NormalizedTicket {
  id: number;
  type: string;
  status: string;
  createdAt: Date | string;
  firstName: string;
  lastName: string;
}
