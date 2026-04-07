export type Status = "PAGO" | "PARCIAL" | "PENDENTE";

export type PassengerQuery = {
  search?: string;
  status?: Status | "TODOS";
  sort?: "seat" | "name" | "status" | "pending";
  order?: "asc" | "desc";
};

export type User = {
  id: string;
  email: string;
  createdAt: string;
};

export type Payment = {
  id: string;
  passengerId: string;
  amount: number;
  paidAt: string;
};

export type Passenger = {
  id: string;
  name: string;
  phone: string | null;
  seat: number;
  total: number;
  paid: number;
  pending: number;
  notes: string | null;
  status: Status;
  createdAt: string;
  updatedAt: string;
  payments?: Payment[];
};

export type DashboardData = {
  totalSeats: number;
  soldSeats: number;
  availableSeats: number;
  occupancyRate: number;
  totalExpected: number;
  totalReceived: number;
  totalPending: number;
  statusCounts: Record<Status, number>;
};

export type LoginPayload = {
  email: string;
  password: string;
};

export type PassengerPayload = {
  name: string;
  phone?: string;
  seat: number;
  total: number;
  paid: number;
  notes?: string;
};

export type PaymentPayload = {
  amount: number;
};

