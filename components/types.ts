export type TransactionType = "Income" | "Expense";
export type Transaction = {
  id:string; date:string; amount:number; type:TransactionType; description:string;
  customer?:string; supplier?:string; category?:string; paymentMethod?:string; receipt?:boolean;
};
export type Page = "dashboard"|"transactions"|"customers"|"suppliers"|"categories"|"rules"|"insights"|"settings";
