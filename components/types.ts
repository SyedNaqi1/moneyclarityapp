export type TransactionType = "Income" | "Expense";

export type Transaction = {
  id: string;
  date: string;
  amount: number;
  type: TransactionType;
  description: string;
  customer?: string;
  supplier?: string;
  category?: string;
  paymentMethod?: string;
  receipt?: boolean;
};

export type Customer = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  description?: string;
};

export type Supplier = {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  description?: string;
};

export type TeamRole = "Viewer" | "Editor" | "Admin";

export type TeamMember = {
  id: string;
  email: string;
  role: TeamRole;
  status: "Pending" | "Active";
  invitedAt: string;
};

export type Page =
  | "dashboard"
  | "transactions"
  | "customers"
  | "suppliers"
  | "categories"
  | "rules"
  | "insights"
  | "settings";
