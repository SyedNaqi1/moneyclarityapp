import { Transaction } from "./types";
export const demoTransactions: Transaction[] = [
 {id:"t1",date:"2026-08-14",amount:2800,type:"Income",description:"Website project — final payment",customer:"Northstar Studio",category:"Consulting",paymentMethod:"Bank transfer"},
 {id:"t2",date:"2026-08-13",amount:185,type:"Expense",description:"Fuel — Shell",category:"Fuel",paymentMethod:"Card",receipt:true},
 {id:"t3",date:"2026-08-12",amount:950,type:"Expense",description:"Electrical materials",supplier:"Pak Electric",category:"Suppliers",paymentMethod:"Cash",receipt:true},
 {id:"t4",date:"2026-08-10",amount:1500,type:"Income",description:"Monthly retainer",customer:"Bright Labs",category:"Consulting",paymentMethod:"Bank transfer"},
 {id:"t5",date:"2026-08-08",amount:420,type:"Expense",description:"Adobe + hosting",category:"Software",paymentMethod:"Card",receipt:true},
 {id:"t6",date:"2026-08-06",amount:2200,type:"Income",description:"Brand identity package",customer:"Kite & Co.",category:"Design",paymentMethod:"Bank transfer"},
 {id:"t7",date:"2026-08-04",amount:310,type:"Expense",description:"Fuel",category:"Fuel",paymentMethod:"Cash"},
 {id:"t8",date:"2026-08-02",amount:680,type:"Expense",description:"Tools & supplies",supplier:"Metro Tools",category:"Tools",paymentMethod:"Card",receipt:true},
 {id:"t9",date:"2026-08-01",amount:1750,type:"Income",description:"Consulting session",customer:"Northstar Studio",category:"Consulting",paymentMethod:"Bank transfer"},
 {id:"t10",date:"2026-07-28",amount:900,type:"Expense",description:"Marketing campaign",category:"Marketing",paymentMethod:"Card",receipt:true}
];
export const categories=["Fuel","Tools","Suppliers","Payroll/Subcontractors","Software","Rent","Marketing","Consulting","Design","Other"];
export const customers=["Northstar Studio","Bright Labs","Kite & Co.","Urban Workshop"];
export const suppliers=["Pak Electric","Metro Tools","Shell","Adobe"];
