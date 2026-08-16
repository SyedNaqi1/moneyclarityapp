"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
  type CSSProperties,
} from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ReceiptText,
  Users,
  Truck,
  Tags,
  Lightbulb,
  Settings,
  Plus,
  Search,
  Bell,
  ChevronDown,
  Menu,
  X,
  Upload,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  FileDown,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Camera,
  Trash2,
  SlidersHorizontal,
  LogOut,
  User,
  Image as ImageIcon,
  FileText,
  Pencil,
  Download,
  Mail,
  Shield,
  UserPlus,
  Phone,
  Building2,
  CalendarDays,
} from "lucide-react";

import { demoTransactions } from "./data";
import {
  Page,
  Transaction,
  TransactionType,
  Customer,
  Supplier,
  TeamMember,
  TeamRole,
} from "./types";

type NavItem = {
  id: Page;
  label: string;
  icon: any;
};

type Period = "month" | "lastMonth" | "threeMonths";

type UserSettings = {
  businessName: string;
  businessType: string;
  currency: string;
};

type EntityModalProps = {
  title: string;
  entity?: Customer | Supplier;
  onClose: () => void;
  onSave: (entity: Customer | Supplier) => void;
  kind: "customer" | "supplier";
};

const nav: NavItem[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions", label: "Transactions", icon: ReceiptText },
  { id: "customers", label: "Customers", icon: Users },
  { id: "suppliers", label: "Suppliers", icon: Truck },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "settings", label: "Settings", icon: Settings },
];

const CURRENCIES = [
  ["PKR", "Pakistani Rupee"],
  ["USD", "US Dollar"],
  ["EUR", "Euro"],
  ["GBP", "British Pound"],
  ["AED", "UAE Dirham"],
  ["SAR", "Saudi Riyal"],
  ["QAR", "Qatari Riyal"],
  ["KWD", "Kuwaiti Dinar"],
  ["BHD", "Bahraini Dinar"],
  ["OMR", "Omani Rial"],
  ["INR", "Indian Rupee"],
  ["BDT", "Bangladeshi Taka"],
  ["AUD", "Australian Dollar"],
  ["CAD", "Canadian Dollar"],
  ["NZD", "New Zealand Dollar"],
  ["SGD", "Singapore Dollar"],
  ["MYR", "Malaysian Ringgit"],
  ["CNY", "Chinese Yuan"],
  ["JPY", "Japanese Yen"],
  ["KRW", "South Korean Won"],
  ["TRY", "Turkish Lira"],
  ["ZAR", "South African Rand"],
  ["CHF", "Swiss Franc"],
  ["SEK", "Swedish Krona"],
  ["NOK", "Norwegian Krone"],
  ["DKK", "Danish Krone"],
  ["BRL", "Brazilian Real"],
  ["MXN", "Mexican Peso"],
  ["THB", "Thai Baht"],
  ["IDR", "Indonesian Rupiah"],
  ["PHP", "Philippine Peso"],
  ["NGN", "Nigerian Naira"],
  ["EGP", "Egyptian Pound"],
  ["PLN", "Polish Zloty"],
  ["CZK", "Czech Koruna"],
  ["ILS", "Israeli New Shekel"],
] as const;

const DEFAULT_SETTINGS: UserSettings = {
  businessName: "My Business",
  businessType: "Small business",
  currency: "PKR",
};

const money = (n: number, currency = "PKR") => {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);
  } catch {
    return `${currency} ${Math.round(n || 0).toLocaleString("en-US")}`;
  }
};

const todayISO = () => new Date().toISOString().slice(0, 10);

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function getSession() {
  if (typeof window === "undefined") return null;
  return readJSON<any>("mc-session", null);
}

function keyFor(session: any, name: string) {
  return session?.id ? `mc-${name}-${session.id}` : null;
}

function saveJSON(key: string | null, value: unknown) {
  if (!key || typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

function downloadText(
  filename: string,
  text: string,
  type = "text/plain"
) {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return /[",\n]/.test(text)
    ? `"${text.replace(/"/g, '""')}"`
    : text;
}

function transactionCSV(tx: Transaction[]) {
  const headers = [
    "date",
    "type",
    "description",
    "amount",
    "category",
    "customer",
    "supplier",
    "paymentMethod",
    "receipt",
  ];

  return [
    headers.join(","),
    ...tx.map((x) =>
      [
        x.date,
        x.type,
        x.description,
        x.amount,
        x.category || "",
        x.customer || "",
        x.supplier || "",
        x.paymentMethod || "",
        x.receipt ? "yes" : "no",
      ]
        .map(csvEscape)
        .join(",")
    ),
  ].join("\n");
}

function parseCSV(text: string): Transaction[] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === '"' && quoted && next === '"') {
      cell += '"';
      i += 1;
    } else if (ch === '"') {
      quoted = !quoted;
    } else if (ch === "," && !quoted) {
      row.push(cell.trim());
      cell = "";
    } else if ((ch === "\n" || ch === "\r") && !quoted) {
      if (ch === "\r" && next === "\n") i += 1;

      row.push(cell.trim());

      if (row.some((v) => v !== "")) rows.push(row);

      row = [];
      cell = "";
    } else {
      cell += ch;
    }
  }

  if (cell || row.length) {
    row.push(cell.trim());

    if (row.some((v) => v !== "")) {
      rows.push(row);
    }
  }

  if (rows.length < 2) return [];

  const headers = rows[0].map((h) => h.trim().toLowerCase());

  const index = (...names: string[]) => {
    for (const name of names) {
      const i = headers.indexOf(name);

      if (i >= 0) return i;
    }

    return -1;
  };

  const dateI = index("date", "transaction date");
  const typeI = index("type", "transaction type");
  const descI = index("description", "name", "memo");
  const amountI = index("amount", "value");
  const categoryI = index("category");
  const customerI = index("customer", "client");
  const supplierI = index("supplier", "vendor");
  const methodI = index(
    "paymentmethod",
    "payment method",
    "method"
  );
  const receiptI = index("receipt", "receipt attached");

  return rows.slice(1).flatMap((r, i) => {
    const amount = Math.abs(
      Number(
        String(r[amountI] ?? "").replace(/[^0-9.-]/g, "")
      )
    );

    if (!amount) return [];

    const rawType = String(r[typeI] ?? "").toLowerCase();

    const type: TransactionType =
      rawType.includes("income") || rawType.includes("credit")
        ? "Income"
        : "Expense";

    return [
      {
        id: `import-${Date.now()}-${i}`,
        date: r[dateI] || todayISO(),
        amount,
        type,
        description: r[descI] || "Imported transaction",
        category: r[categoryI] || undefined,
        customer: r[customerI] || undefined,
        supplier: r[supplierI] || undefined,
        paymentMethod: r[methodI] || undefined,
        receipt: /yes|true|1/i.test(r[receiptI] || ""),
      },
    ];
  });
}

function sameMonth(dateString: string, offset = 0) {
  const now = new Date();
  const d = new Date(dateString);

  const target = new Date(
    now.getFullYear(),
    now.getMonth() - offset,
    1
  );

  return (
    d.getFullYear() === target.getFullYear() &&
    d.getMonth() === target.getMonth()
  );
}

function migratePeople(
  value: unknown,
  type: "customer" | "supplier"
): Customer[] | Supplier[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item: any, index) => {
      if (typeof item === "string") {
        return {
          id: `${type}-${index}-${item}`,
          name: item,
        };
      }

      if (item && typeof item === "object" && item.name) {
        return {
          id:
            item.id ||
            `${type}-${index}-${item.name}`,
          name: String(item.name),
          email: item.email || "",
          phone: item.phone || "",
          company: item.company || "",
          description: item.description || "",
        };
      }

      return null;
    })
    .filter(Boolean) as Customer[] | Supplier[];
}

export default function AppShell({
  initialPage = "dashboard",
}: {
  initialPage?: Page;
}) {
  const [page, setPage] = useState<Page>(initialPage);

  const [tx, setTx] = useState<Transaction[]>([]);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);

  const [categories, setCategories] = useState<string[]>([]);

  const [settings, setSettings] =
    useState<UserSettings>(DEFAULT_SETTINGS);

  const [team, setTeam] = useState<TeamMember[]>([]);

  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);

  const [mobile, setMobile] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  const [highlightedTransaction, setHighlightedTransaction] =
    useState<string | null>(null);

  useEffect(() => {
    const current = getSession();

    if (!current) {
      window.location.replace("/login");
      return;
    }

    setSession(current);

    const id = current.id;

    const txKey = keyFor(current, "transactions");
    const customerKey = keyFor(current, "customers");
    const supplierKey = keyFor(current, "suppliers");
    const categoryKey = keyFor(current, "categories");
    const settingsKey = keyFor(current, "settings");
    const teamKey = keyFor(current, "team");

    let loadedTx = readJSON<Transaction[]>(
      txKey || "",
      []
    );

    if (!loadedTx.length && id === "demo-user") {
      loadedTx = demoTransactions;
    }

    setTx(loadedTx);

    const oldCustomers = readJSON<any[]>(
      customerKey || "",
      []
    );

    const oldSuppliers = readJSON<any[]>(
      supplierKey || "",
      []
    );

    setCustomers(
      migratePeople(oldCustomers, "customer") as Customer[]
    );

    setSuppliers(
      migratePeople(oldSuppliers, "supplier") as Supplier[]
    );

    setCategories(
      readJSON<string[]>(categoryKey || "", [])
    );

    setSettings({
      ...DEFAULT_SETTINGS,
      ...readJSON<Partial<UserSettings>>(
        settingsKey || "",
        {}
      ),
    });

    setTeam(
      readJSON<TeamMember[]>(teamKey || "", [])
    );

    setCheckingAuth(false);
  }, []);

  useEffect(() => {
    if (session) {
      saveJSON(
        keyFor(session, "transactions"),
        tx
      );
    }
  }, [session, tx]);

  useEffect(() => {
    if (session) {
      saveJSON(
        keyFor(session, "customers"),
        customers
      );
    }
  }, [session, customers]);

  useEffect(() => {
    if (session) {
      saveJSON(
        keyFor(session, "suppliers"),
        suppliers
      );
    }
  }, [session, suppliers]);

  useEffect(() => {
    if (session) {
      saveJSON(
        keyFor(session, "categories"),
        categories
      );
    }
  }, [session, categories]);

  useEffect(() => {
    if (session) {
      saveJSON(
        keyFor(session, "settings"),
        settings
      );
    }
  }, [session, settings]);

  useEffect(() => {
    if (session) {
      saveJSON(
        keyFor(session, "team"),
        team
      );
    }
  }, [session, team]);

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const txId = params.get("transaction");

    if (txId) {
      setHighlightedTransaction(txId);
      setPage("transactions");

      window.history.replaceState(
        {},
        "",
        "/transactions"
      );

      setTimeout(() => {
        const element =
          document.getElementById(
            `transaction-${txId}`
          );

        element?.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }, 500);

      setTimeout(() => {
        setHighlightedTransaction(null);
      }, 5000);
    }
  }, []);

  const go = (next: Page) => {
    setPage(next);
    setMobile(false);
    setProfileOpen(false);
    setNotificationsOpen(false);

    window.history.replaceState(
      {},
      "",
      next === "dashboard"
        ? "/dashboard"
        : `/${next}`
    );
  };

  const currentRevenue = useMemo(
    () =>
      tx
        .filter(
          (x) =>
            sameMonth(x.date, 0) &&
            x.type === "Income"
        )
        .reduce(
          (a, x) => a + x.amount,
          0
        ),
    [tx]
  );

  const currentExpenses = useMemo(
    () =>
      tx
        .filter(
          (x) =>
            sameMonth(x.date, 0) &&
            x.type === "Expense"
        )
        .reduce(
          (a, x) => a + x.amount,
          0
        ),
    [tx]
  );

  const uncategorized = tx.filter(
    (x) => !x.category
  ).length;

  const missingReceipts = tx.filter(
    (x) =>
      x.type === "Expense" &&
      !x.receipt
  );

  const logout = () => {
    localStorage.removeItem("mc-session");
    setSession(null);
    window.location.replace("/login");
  };

  const deleteAccount = () => {
    const confirmed = window.confirm(
      "Delete your Money Clarity account and all locally stored business data? This cannot be undone."
    );

    if (!confirmed || !session) return;

    const id = session.id;

    [
      "transactions",
      "customers",
      "suppliers",
      "categories",
      "settings",
      "team",
    ].forEach((name) => {
      localStorage.removeItem(
        `mc-${name}-${id}`
      );
    });

    localStorage.removeItem("mc-session");

    window.location.replace("/login");
  };

  const addTransaction = (item: Transaction) => {
    const newItem = {
      ...item,
      id: crypto.randomUUID(),
    };

    setTx((old) => [
      newItem,
      ...old,
    ]);

    if (
      item.customer &&
      !customers.some(
        (x) => x.name === item.customer
      )
    ) {
      setCustomers((old) => [
        ...old,
        {
          id: crypto.randomUUID(),
          name: item.customer!,
        },
      ]);
    }

    if (
      item.supplier &&
      !suppliers.some(
        (x) => x.name === item.supplier
      )
    ) {
      setSuppliers((old) => [
        ...old,
        {
          id: crypto.randomUUID(),
          name: item.supplier!,
        },
      ]);
    }

    if (
      item.category &&
      !categories.includes(item.category)
    ) {
      setCategories((old) => [
        ...old,
        item.category!,
      ]);
    }

    setAddOpen(false);
  };

  const deleteTransaction = (id: string) => {
    setTx((old) =>
      old.filter((x) => x.id !== id)
    );
  };

  const updateCustomer = (
    id: string,
    next: Customer
  ) => {
    setCustomers((old) =>
      old.map((x) =>
        x.id === id ? next : x
      )
    );

    const oldCustomer =
      customers.find((x) => x.id === id);

    if (oldCustomer) {
      setTx((old) =>
        old.map((x) =>
          x.customer === oldCustomer.name
            ? {
                ...x,
                customer: next.name,
              }
            : x
        )
      );
    }
  };

  const deleteCustomer = (
    customer: Customer
  ) => {
    if (
      !window.confirm(
        `Delete ${customer.name}? Existing transactions will remain.`
      )
    ) {
      return;
    }

    setCustomers((old) =>
      old.filter((x) => x.id !== customer.id)
    );
  };

  const updateSupplier = (
    id: string,
    next: Supplier
  ) => {
    setSuppliers((old) =>
      old.map((x) =>
        x.id === id ? next : x
      )
    );

    const oldSupplier =
      suppliers.find((x) => x.id === id);

    if (oldSupplier) {
      setTx((old) =>
        old.map((x) =>
          x.supplier === oldSupplier.name
            ? {
                ...x,
                supplier: next.name,
              }
            : x
        )
      );
    }
  };

  const deleteSupplier = (
    supplier: Supplier
  ) => {
    if (
      !window.confirm(
        `Delete ${supplier.name}? Existing transactions will remain.`
      )
    ) {
      return;
    }

    setSuppliers((old) =>
      old.filter((x) => x.id !== supplier.id)
    );
  };

  const updateCategory = (
    oldName: string,
    newName: string
  ) => {
    const clean = newName.trim();

    if (!clean) return;

    setCategories((old) =>
      old.map((x) =>
        x === oldName ? clean : x
      )
    );

    setTx((old) =>
      old.map((x) =>
        x.category === oldName
          ? {
              ...x,
              category: clean,
            }
          : x
      )
    );
  };

  const deleteCategory = (
    name: string
  ) => {
    if (
      !window.confirm(
        `Delete ${name}? Transactions using it will become uncategorized.`
      )
    ) {
      return;
    }

    setCategories((old) =>
      old.filter((x) => x !== name)
    );

    setTx((old) =>
      old.map((x) =>
        x.category === name
          ? {
              ...x,
              category: undefined,
            }
          : x
      )
    );
  };

  const inviteTeamMember = (
    email: string,
    role: TeamRole
  ) => {
    const clean = email
      .trim()
      .toLowerCase();

    if (!clean) return;

    if (
      team.some(
        (x) =>
          x.email.toLowerCase() === clean
      )
    ) {
      window.alert(
        "This email is already on the team."
      );
      return;
    }

    setTeam((old) => [
      ...old,
      {
        id: crypto.randomUUID(),
        email: clean,
        role,
        status: "Pending",
        invitedAt: todayISO(),
      },
    ]);
  };

  const removeTeamMember = (
    id: string
  ) => {
    setTeam((old) =>
      old.filter((x) => x.id !== id)
    );
  };

  if (checkingAuth) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f7f8f6",
        }}
      >
        Loading Money Clarity...
      </main>
    );
  }

  if (!session) return null;

  const displayName =
    session.name || "User";

  const businessName =
    settings.businessName ||
    "My Business";

  return (
    <div className="app-layout">
      <aside
        className={`sidebar ${
          mobile ? "mobile-open" : ""
        }`}
      >
        <div className="side-brand">
          <Link
            href="/dashboard"
            className="brand"
          >
            <span className="brand-mark">
              M
            </span>
            <span>
              Money <b>Clarity</b>
            </span>
          </Link>

          <button
            onClick={() =>
              setMobile(false)
            }
            className="close-side"
          >
            <X size={20} />
          </button>
        </div>

        <div className="business-switch">
          <div className="business-avatar">
            {businessName
              .slice(0, 1)
              .toUpperCase()}
          </div>

          <div>
            <b>{businessName}</b>
            <small>
              {settings.businessType}
            </small>
          </div>

          <ChevronDown size={15} />
        </div>

        <nav>
          {nav.map(
            ({
              id,
              label,
              icon: Icon,
            }) => (
              <button
                className={
                  page === id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  go(id)
                }
                key={id}
              >
                <Icon size={18} />
                {label}
              </button>
            )
          )}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <Sparkles size={17} />

            <div>
              <b>Clarity tip</b>

              <p>
                {uncategorized
                  ? "Categorize transactions to make reports more useful."
                  : "Keep receipts attached to expenses for better records."}
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              go("settings")
            }
          >
            <Settings size={17} />
            Settings
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <button
            className="mobile-trigger"
            onClick={() =>
              setMobile(true)
            }
          >
            <Menu />
          </button>

          <div>
            <div className="crumb">
              {businessName} /{" "}
              <b>
                {
                  nav.find(
                    (x) =>
                      x.id === page
                  )?.label
                }
              </b>
            </div>
          </div>

          <div className="header-actions">
            <div
              style={{
                position:
                  "relative",
              }}
            >
              <button
                className="icon-btn"
                onClick={() => {
                  setNotificationsOpen(
                    (v) => !v
                  );
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
              >
                <Bell size={18} />

                {missingReceipts.length >
                  0 && <i />}
              </button>

              {notificationsOpen && (
                <NotificationDropdown
                  transactions={
                    missingReceipts
                  }
                  onClose={() =>
                    setNotificationsOpen(
                      false
                    )
                  }
                  onNavigate={(
                    id
                  ) => {
                    setNotificationsOpen(
                      false
                    );
                    window.history.replaceState(
                      {},
                      "",
                      `/transactions?transaction=${id}`
                    );
                    setHighlightedTransaction(
                      id
                    );
                    setPage(
                      "transactions"
                    );

                    setTimeout(() => {
                      document
                        .getElementById(
                          `transaction-${id}`
                        )
                        ?.scrollIntoView({
                          behavior:
                            "smooth",
                          block: "center",
                        });
                    }, 200);

                    setTimeout(
                      () =>
                        setHighlightedTransaction(
                          null
                        ),
                      5000
                    );
                  }}
                />
              )}
            </div>

            <div
              style={{
                position:
                  "relative",
              }}
            >
              <button
                className="profile"
                onClick={() => {
                  setProfileOpen(
                    (v) => !v
                  );
                  setNotificationsOpen(
                    false
                  );
                }}
              >
                <span>
                  {displayName
                    .slice(0, 2)
                    .toUpperCase()}
                </span>

                <b>{displayName}</b>

                <ChevronDown
                  size={14}
                />
              </button>

              {profileOpen && (
                <ProfileDropdown
                  displayName={
                    displayName
                  }
                  email={
                    session.email
                  }
                  onSettings={() =>
                    go("settings")
                  }
                  onLogout={logout}
                />
              )}
            </div>
          </div>
        </header>

        <div className="page-wrap">
          {page === "dashboard" && (
            <Dashboard
              tx={tx}
              currency={
                settings.currency
              }
              onAdd={() =>
                setAddOpen(true)
              }
              onImport={() =>
                setImportOpen(true)
              }
              onTransactions={() =>
                go("transactions")
              }
              onCategories={() =>
                go("categories")
              }
              onCustomers={() =>
                go("customers")
              }
            />
          )}

          {page === "transactions" && (
            <Transactions
              tx={tx}
              currency={
                settings.currency
              }
              customers={customers}
              categories={
                categories
              }
              highlightedId={
                highlightedTransaction
              }
              onAdd={() =>
                setAddOpen(true)
              }
              onImport={() =>
                setImportOpen(true)
              }
              onDelete={
                deleteTransaction
              }
            />
          )}

          {page === "customers" && (
            <PeoplePage
              title="Customers"
              subtitle="Manage the people and businesses that generate your revenue."
              icon={<Users />}
              people={customers}
              kind="customer"
              tx={tx}
              currency={
                settings.currency
              }
              onSave={(
                person
              ) => {
                const customer =
                  person as Customer;

                setCustomers(
                  (old) => [
                    ...old,
                    {
                      ...customer,
                      id:
                        customer.id ||
                        crypto.randomUUID(),
                    },
                  ]
                );
              }}
              onEdit={
                updateCustomer
              }
              onDelete={
                deleteCustomer
              }
            />
          )}

          {page === "suppliers" && (
            <PeoplePage
              title="Suppliers"
              subtitle="Manage the businesses and people you pay."
              icon={<Truck />}
              people={suppliers}
              kind="supplier"
              tx={tx}
              currency={
                settings.currency
              }
              onSave={(
                person
              ) => {
                const supplier =
                  person as Supplier;

                setSuppliers(
                  (old) => [
                    ...old,
                    {
                      ...supplier,
                      id:
                        supplier.id ||
                        crypto.randomUUID(),
                    },
                  ]
                );
              }}
              onEdit={
                updateSupplier
              }
              onDelete={
                deleteSupplier
              }
            />
          )}

          {page === "categories" && (
            <CategoryPage
              tx={tx}
              categories={
                categories
              }
              currency={
                settings.currency
              }
              onAdd={(name) =>
                setCategories(
                  (old) =>
                    old.includes(name)
                      ? old
                      : [
                          ...old,
                          name,
                        ]
                )
              }
              onEdit={
                updateCategory
              }
              onDelete={
                deleteCategory
              }
            />
          )}

          {page === "insights" && (
            <InsightsPage
              tx={tx}
              revenue={
                currentRevenue
              }
              expenses={
                currentExpenses
              }
              currency={
                settings.currency
              }
            />
          )}

          {page === "settings" && (
            <SettingsPage
              session={session}
              settings={settings}
              currencies={
                CURRENCIES
              }
              team={team}
              onSave={(next) => {
                setSettings(next);

                const updated = {
                  ...session,
                  business:
                    next.businessName,
                };

                localStorage.setItem(
                  "mc-session",
                  JSON.stringify(
                    updated
                  )
                );

                setSession(
                  updated
                );
              }}
              onExport={() =>
                downloadText(
                  "money-clarity-transactions.csv",
                  transactionCSV(tx),
                  "text/csv;charset=utf-8"
                )
              }
              onLogout={
                logout
              }
              onDeleteAccount={
                deleteAccount
              }
              onInvite={
                inviteTeamMember
              }
              onRemoveTeamMember={
                removeTeamMember
              }
            />
          )}
        </div>
      </main>

      <div className="mobile-bottom">
        {nav
          .slice(0, 2)
          .map(
            ({
              id,
              label,
              icon: Icon,
            }) => (
              <button
                key={id}
                className={
                  page === id
                    ? "active"
                    : ""
                }
                onClick={() =>
                  go(id)
                }
              >
                <Icon />
                <span>
                  {label}
                </span>
              </button>
            )
          )}

        <button
          onClick={() =>
            setAddOpen(true)
          }
          className="mobile-add"
        >
          <Plus />
        </button>

        <button
          onClick={() =>
            go("insights")
          }
          className={
            page === "insights"
              ? "active"
              : ""
          }
        >
          <Lightbulb />
          <span>
            Insights
          </span>
        </button>

        <button
          onClick={() =>
            go("settings")
          }
          className={
            page === "settings"
              ? "active"
              : ""
          }
        >
          <MoreHorizontal />
          <span>More</span>
        </button>
      </div>

      {addOpen && (
        <AddTransaction
          categories={
            categories
          }
          customers={
            customers
          }
          suppliers={
            suppliers
          }
          currency={
            settings.currency
          }
          onClose={() =>
            setAddOpen(false)
          }
          onSave={
            addTransaction
          }
        />
      )}

      {importOpen && (
        <ImportModal
          onClose={() =>
            setImportOpen(false)
          }
          onImport={(items) => {
            setTx((old) => [
              ...items.map(
                (x) => ({
                  ...x,
                  id:
                    crypto.randomUUID(),
                })
              ),
              ...old,
            ]);

            setImportOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* =========================================================
   NOTIFICATIONS
========================================================= */

function NotificationDropdown({
  transactions,
  onClose,
  onNavigate,
}: {
  transactions: Transaction[];
  onClose: () => void;
  onNavigate: (id: string) => void;
}) {
  return (
    <div
      className="header-dropdown"
      style={{
        position: "absolute",
        right: 0,
        top: "calc(100% + 10px)",
        width: 340,
        maxWidth:
          "calc(100vw - 30px)",
        zIndex: 100,
        background: "white",
        border:
          "1px solid #e5e9e6",
        borderRadius: 14,
        boxShadow:
          "0 15px 40px rgba(0,0,0,.12)",
        padding: 14,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <b>
          Receipt notifications
        </b>

        <button
          onClick={onClose}
          style={{
            border: 0,
            background: "none",
            cursor: "pointer",
          }}
        >
          <X size={16} />
        </button>
      </div>

      {transactions.length ? (
        transactions.map(
          (tx) => (
            <button
              key={tx.id}
              onClick={() =>
                onNavigate(
                  tx.id
                )
              }
              style={{
                width: "100%",
                display: "flex",
                alignItems:
                  "flex-start",
                gap: 10,
                padding:
                  "11px 4px",
                border: 0,
                borderBottom:
                  "1px solid #edf0ee",
                background:
                  "transparent",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <AlertCircle
                size={18}
                style={{
                  flexShrink: 0,
                }}
              />

              <span
                style={{
                  display: "block",
                }}
              >
                <b>
                  Receipt missing
                </b>

                <small
                  style={{
                    display:
                      "block",
                    marginTop: 3,
                    color:
                      "#69736e",
                  }}
                >
                  {tx.description}
                </small>

                <small
                  style={{
                    display:
                      "block",
                    marginTop: 2,
                    color:
                      "#69736e",
                  }}
                >
                  {tx.date} ·{" "}
                  {money(
                    tx.amount
                  )}
                </small>
              </span>
            </button>
          )
        )
      ) : (
        <p
          style={{
            margin:
              "8px 0",
            fontSize: 13,
            color:
              "#69736e",
          }}
        >
          You're all caught up.
        </p>
      )}
    </div>
  );
}

/* =========================================================
   PROFILE
========================================================= */

function ProfileDropdown({
  displayName,
  email,
  onSettings,
  onLogout,
}: {
  displayName: string;
  email?: string;
  onSettings: () => void;
  onLogout: () => void;
}) {
  return (
    <div
      style={{
        position: "absolute",
        right: 0,
        top: "calc(100% + 10px)",
        width: 230,
        zIndex: 100,
        background: "white",
        border:
          "1px solid #e5e9e6",
        borderRadius: 14,
        boxShadow:
          "0 15px 40px rgba(0,0,0,.12)",
        padding: 8,
      }}
    >
      <div
        style={{
          padding: 10,
          borderBottom:
            "1px solid #edf0ee",
          marginBottom: 5,
        }}
      >
        <b>{displayName}</b>

        <small
          style={{
            display: "block",
            marginTop: 3,
            color: "#69736e",
          }}
        >
          {email ||
            "Signed in"}
        </small>
      </div>

      <button
        onClick={onSettings}
        style={menuButtonStyle}
      >
        <User size={16} />
        Profile & settings
      </button>

      <button
        onClick={onLogout}
        style={{
          ...menuButtonStyle,
          color: "#a83218",
        }}
      >
        <LogOut size={16} />
        Sign out
      </button>
    </div>
  );
}

const menuButtonStyle: CSSProperties =
  {
    width: "100%",
    display: "flex",
    alignItems:
      "center",
    gap: 9,
    padding: 10,
    border: 0,
    background:
      "transparent",
    cursor: "pointer",
    textAlign: "left",
  };

/* =========================================================
   DASHBOARD
========================================================= */

function Dashboard({
  tx,
  currency,
  onAdd,
  onImport,
  onTransactions,
  onCategories,
  onCustomers,
}: {
  tx: Transaction[];
  currency: string;
  onAdd: () => void;
  onImport: () => void;
  onTransactions: () => void;
  onCategories: () => void;
  onCustomers: () => void;
}) {
  const [period, setPeriod] =
    useState<Period>("month");

  const periodTx =
    useMemo(
      () =>
        tx.filter((x) =>
          period === "month"
            ? sameMonth(
                x.date,
                0
              )
            : period ===
              "lastMonth"
            ? sameMonth(
                x.date,
                1
              )
            : sameMonth(
                x.date,
                0
              ) ||
              sameMonth(
                x.date,
                1
              ) ||
              sameMonth(
                x.date,
                2
              )
        ),
      [tx, period]
    );

  const revenue =
    periodTx
      .filter(
        (x) =>
          x.type ===
          "Income"
      )
      .reduce(
        (a, x) =>
          a + x.amount,
        0
      );

  const expenses =
    periodTx
      .filter(
        (x) =>
          x.type ===
          "Expense"
      )
      .reduce(
        (a, x) =>
          a + x.amount,
        0
      );

  const net =
    revenue - expenses;

  const unc =
    periodTx.filter(
      (x) => !x.category
    ).length;

  const missing =
    periodTx.filter(
      (x) =>
        x.type ===
          "Expense" &&
        !x.receipt
    ).length;

  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">
            MONEY OVERVIEW
          </div>

          <h1>
            Dashboard
          </h1>

          <p>
            A clear view of
            your business
            money, based on
            recorded
            transactions.
          </p>
        </div>

        <div className="row-actions">
          <button
            className="button secondary"
            onClick={onImport}
          >
            <Upload size={16} />
            Import CSV
          </button>

          <button
            className="button primary"
            onClick={onAdd}
          >
            <Plus size={17} />
            Add transaction
          </button>
        </div>
      </div>

      <div className="period-row">
        <div className="period-tabs">
          {[
            [
              "month",
              "This month",
            ],
            [
              "lastMonth",
              "Last month",
            ],
            [
              "threeMonths",
              "Last 3 months",
            ],
          ].map(
            ([value, label]) => (
              <button
                key={value}
                className={
                  period === value
                    ? "selected"
                    : ""
                }
                onClick={() =>
                  setPeriod(
                    value as Period
                  )
                }
              >
                {label}
              </button>
            )
          )}
        </div>

        <button
          className="filter-btn"
          onClick={() =>
            setPeriod(
              "threeMonths"
            )
          }
        >
          <SlidersHorizontal
            size={15}
          />
          Period
        </button>
      </div>

      <div className="kpi-grid">
        <KPI
          label="REVENUE"
          value={money(
            revenue,
            currency
          )}
          icon={
            <ArrowUpRight
              size={17}
            />
          }
          tone="positive"
        />

        <KPI
          label="EXPENSES"
          value={money(
            expenses,
            currency
          )}
          icon={
            <ArrowUpRight
              size={17}
            />
          }
          tone="warning"
        />

        <KPI
          label="NET"
          value={money(
            net,
            currency
          )}
          icon={
            <ArrowUpRight
              size={17}
            />
          }
          tone={
            net >= 0
              ? "positive"
              : "warning"
          }
        />

        <KPI
          label="UNCATEGORIZED"
          value={String(unc)}
          icon={
            <AlertCircle
              size={17}
            />
          }
          tone={
            unc
              ? "warning"
              : "positive"
          }
          footer={
            unc
              ? "Action needed"
              : "All clear"
          }
        />
      </div>

      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>
                Revenue vs
                expenses
              </h3>

              <p>
                Actual
                transaction
                values by
                month
              </p>
            </div>

            <button
              className="select"
              onClick={() =>
                setPeriod(
                  "threeMonths"
                )
              }
            >
              Last 6 months
              <ChevronDown
                size={14}
              />
            </button>
          </div>

          <RealLineChart
            tx={tx}
            currency={
              currency
            }
          />
        </section>

        <section className="panel action-panel">
          <div className="panel-head">
            <div>
              <h3>
                Action Needed
              </h3>

              <p>
                Things worth
                your attention
              </p>
            </div>

            <span className="count-pill">
              {unc + missing}
            </span>
          </div>

          <div className="action-list">
            {unc > 0 ? (
              <button
                className="action-item"
                onClick={
                  onCategories
                }
              >
                <span className="action-icon">
                  <AlertCircle />
                </span>

                <div>
                  <b>
                    {unc}{" "}
                    transactions
                    uncategorized
                  </b>

                  <p>
                    Add categories
                    to make
                    reports
                    clearer.
                  </p>
                </div>

                <ChevronDown
                  size={15}
                />
              </button>
            ) : (
              <div className="action-item">
                <span className="action-icon">
                  <CheckCircle2 />
                </span>

                <div>
                  <b>
                    Everything
                    looks good
                  </b>

                  <p>
                    No
                    uncategorized
                    transactions
                    in this
                    period.
                  </p>
                </div>
              </div>
            )}

            <button
              className="action-item"
              onClick={
                onTransactions
              }
            >
              <span className="action-icon">
                <ArrowUpRight />
              </span>

              <div>
                <b>
                  Review your
                  spending
                </b>

                <p>
                  Use
                  transactions
                  and insights
                  to understand
                  movement.
                </p>
              </div>

              <ChevronDown
                size={15}
              />
            </button>

            {missing > 0 && (
              <button
                className="action-item"
                onClick={
                  onTransactions
                }
              >
                <span className="action-icon">
                  <ReceiptText />
                </span>

                <div>
                  <b>
                    {missing}{" "}
                    receipts
                    missing
                  </b>

                  <p>
                    Attach receipts
                    to your
                    expenses.
                  </p>
                </div>

                <ChevronDown
                  size={15}
                />
              </button>
            )}
          </div>
        </section>
      </div>

      <div className="dashboard-grid lower">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>
                Expense
                breakdown
              </h3>

              <p>
                Where your
                money went
              </p>
            </div>

            <button
              className="link-btn"
              onClick={
                onCategories
              }
            >
              View categories
            </button>
          </div>

          <ExpenseBars
            tx={periodTx}
            currency={
              currency
            }
          />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>
                Top customers
              </h3>

              <p>
                Revenue
                concentration
              </p>
            </div>

            <button
              className="link-btn"
              onClick={
                onCustomers
              }
            >
              View customers
            </button>
          </div>

          <CustomerRows
            tx={periodTx}
            currency={
              currency
            }
          />
        </section>
      </div>

      <section className="recent panel">
        <div className="panel-head">
          <div>
            <h3>
              Recent
              transactions
            </h3>

            <p>
              Your latest
              money movements
            </p>
          </div>

          <button
            className="link-btn"
            onClick={
              onTransactions
            }
          >
            View transactions
          </button>
        </div>

        {tx.length ? (
          <MiniTransactions
            tx={tx.slice(
              0,
              5
            )}
            currency={
              currency
            }
          />
        ) : (
          <EmptyTransactions
            onAdd={onAdd}
          />
        )}
      </section>
    </>
  );
}

function KPI({
  label,
  value,
  icon,
  tone,
  footer,
}: {
  label: string;
  value: string;
  icon: ReactNode;
  tone:
    | "positive"
    | "warning";
  footer?: string;
}) {
  return (
    <div className="kpi">
      <div className="kpi-top">
        <span>
          {label}
        </span>

        {icon}
      </div>

      <strong>
        {value}
      </strong>

      <div
        className={`change ${tone}`}
      >
        {footer ||
          "Current period"}
      </div>
    </div>
  );
}

function RealLineChart({
  tx,
  currency,
}: {
  tx: Transaction[];
  currency: string;
}) {
  const [hovered, setHovered] =
    useState<number | null>(
      null
    );

  const months =
    useMemo(() => {
      const now =
        new Date();

      return Array.from(
        { length: 6 },
        (_, idx) => {
          const offset =
            5 - idx;

          const d =
            new Date(
              now.getFullYear(),
              now.getMonth() -
                offset,
              1
            );

          const key = `${d.getFullYear()}-${String(
            d.getMonth() + 1
          ).padStart(2, "0")}`;

          const items =
            tx.filter(
              (x) => {
                const xDate =
                  new Date(
                    x.date
                  );

                return `${xDate.getFullYear()}-${String(
                  xDate.getMonth() +
                    1
                ).padStart(
                  2,
                  "0"
                )}` === key;
              }
            );

          return {
            key,
            label:
              d.toLocaleDateString(
                "en-US",
                {
                  month:
                    "short",
                }
              ),
            revenue:
              items
                .filter(
                  (x) =>
                    x.type ===
                    "Income"
                )
                .reduce(
                  (a, x) =>
                    a +
                    x.amount,
                  0
                ),
            expenses:
              items
                .filter(
                  (x) =>
                    x.type ===
                    "Expense"
                )
                .reduce(
                  (a, x) =>
                    a +
                    x.amount,
                  0
                ),
          };
        }
      );
    }, [tx]);

  const maxValue =
    Math.max(
      ...months.map(
        (m) =>
          Math.max(
            m.revenue,
            m.expenses
          )
      ),
      1
    );

  const width = 600;
  const height = 210;
  const paddingX = 10;
  const paddingY = 20;

  const xStep =
    (width -
      paddingX * 2) /
    (months.length - 1);

  const getY = (
    value: number
  ) =>
    height -
    paddingY -
    (value /
      maxValue) *
      (height -
        paddingY * 2);

  const revenuePoints =
    months
      .map(
        (m, i) =>
          `${paddingX +
            i * xStep},${getY(
            m.revenue
          )}`
      )
      .join(" ");

  const expensePoints =
    months
      .map(
        (m, i) =>
          `${paddingX +
            i * xStep},${getY(
            m.expenses
          )}`
      )
      .join(" ");

  const active =
    hovered === null
      ? null
      : months[hovered];

  return (
    <div className="line-chart">
      <div className="ylabels">
        <span>
          {money(
            maxValue,
            currency
          )}
        </span>

        <span>
          {money(
            maxValue / 2,
            currency
          )}
        </span>

        <span>
          {money(
            0,
            currency
          )}
        </span>
      </div>

      <div
        style={{
          position:
            "relative",
        }}
      >
        <svg
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="none"
          style={{
            display:
              "block",
            width: "100%",
            overflow:
              "visible",
          }}
          onMouseLeave={() =>
            setHovered(null)
          }
        >
          <line
            x1="0"
            y1={getY(0)}
            x2={width}
            y2={getY(0)}
            stroke="#e5e9e6"
          />

          <line
            x1="0"
            y1={getY(
              maxValue / 2
            )}
            x2={width}
            y2={getY(
              maxValue / 2
            )}
            stroke="#edf0ee"
          />

          <line
            x1="0"
            y1={getY(
              maxValue
            )}
            x2={width}
            y2={getY(
              maxValue
            )}
            stroke="#edf0ee"
          />

          <polyline
            points={
              revenuePoints
            }
            fill="none"
            stroke="#1c8c7c"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polyline
            points={
              expensePoints
            }
            fill="none"
            stroke="#b3401f"
            strokeWidth="2"
            strokeDasharray="5 6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {months.map(
            (m, i) => (
              <g
                key={
                  m.key
                }
                onMouseEnter={() =>
                  setHovered(
                    i
                  )
                }
              >
                <circle
                  cx={
                    paddingX +
                    i *
                      xStep
                  }
                  cy={getY(
                    m.revenue
                  )}
                  r="5"
                  fill="white"
                  stroke="#1c8c7c"
                  strokeWidth="2"
                />

                <circle
                  cx={
                    paddingX +
                    i *
                      xStep
                  }
                  cy={getY(
                    m.expenses
                  )}
                  r="4"
                  fill="white"
                  stroke="#b3401f"
                  strokeWidth="2"
                />

                <rect
                  x={Math.max(
                    0,
                    paddingX +
                      i *
                        xStep -
                      38
                  )}
                  y="0"
                  width="76"
                  height={
                    height
                  }
                  fill="transparent"
                />
              </g>
            )
          )}

          {hovered !==
            null && (
            <line
              x1={
                paddingX +
                hovered *
                  xStep
              }
              y1="0"
              x2={
                paddingX +
                hovered *
                  xStep
              }
              y2={
                height
              }
              stroke="#cdd6d2"
              strokeDasharray="3 4"
            />
          )}
        </svg>

        {active && (
          <div
            style={{
              position:
                "absolute",
              top: 8,
              left: `${
                (hovered! /
                  (months.length -
                    1)) *
                100
              }%`,
              transform: `translateX(${
                hovered ===
                0
                  ? "0"
                  : hovered ===
                    months.length -
                      1
                  ? "-100%"
                  : "-50%"
              })`,
              background:
                "#123f3a",
              color:
                "white",
              borderRadius: 9,
              padding:
                "8px 10px",
              fontSize: 11,
              lineHeight: 1.45,
              pointerEvents:
                "none",
              whiteSpace:
                "nowrap",
              boxShadow:
                "0 8px 22px rgba(0,0,0,.16)",
              zIndex: 3,
            }}
          >
            <b>
              {
                active.label
              }
            </b>

            <div>
              Revenue:{" "}
              {money(
                active.revenue,
                currency
              )}
            </div>

            <div>
              Expenses:{" "}
              {money(
                active.expenses,
                currency
              )}
            </div>
          </div>
        )}
      </div>

      <div className="xlabels">
        {months.map(
          (m) => (
            <span
              key={
                m.key
              }
            >
              {m.label}
            </span>
          )
        )}
      </div>

      <div className="legend">
        <span>
          <i />
          Revenue
        </span>

        <span>
          <i className="expense-dot" />
          Expenses
        </span>
      </div>

      {tx.length === 0 && (
        <div
          style={{
            textAlign:
              "center",
            padding: 12,
            fontSize: 13,
            color:
              "#69736e",
          }}
        >
          Add transactions
          to see your money
          movement.
        </div>
      )}
    </div>
  );
}

function ExpenseBars({
  tx,
  currency,
}: {
  tx: Transaction[];
  currency: string;
}) {
  const vals =
    Array.from(
      new Set(
        tx
          .map(
            (x) =>
              x.category
          )
          .filter(Boolean) as string[]
      )
    )
      .map((c) => ({
        c,
        v: tx
          .filter(
            (x) =>
              x.type ===
                "Expense" &&
              x.category ===
                c
          )
          .reduce(
            (a, x) =>
              a +
              x.amount,
            0
          ),
      }))
      .filter(
        (x) => x.v > 0
      )
      .sort(
        (a, b) =>
          b.v - a.v
      )
      .slice(0, 5);

  const max =
    vals[0]?.v || 1;

  if (!vals.length) {
    return (
      <EmptyState
        title="No categorized expenses"
        text="Add an expense and assign a category to see the breakdown."
      />
    );
  }

  return (
    <div className="expense-bars">
      {vals.map(
        (x) => (
          <div
            className="expense-row"
            key={x.c}
          >
            <div>
              <b>{x.c}</b>

              <span>
                {money(
                  x.v,
                  currency
                )}
              </span>
            </div>

            <div className="bar-track">
              <i
                style={{
                  width: `${
                    (x.v /
                      max) *
                    100
                  }%`,
                }}
              />
            </div>
          </div>
        )
      )}
    </div>
  );
}

function CustomerRows({
  tx,
  currency,
}: {
  tx: Transaction[];
  currency: string;
}) {
  const vals =
    Array.from(
      new Set(
        tx
          .filter(
            (x) =>
              x.type ===
                "Income" &&
              x.customer
          )
          .map(
            (x) =>
              x.customer as string
          )
      )
    )
      .map((c) => ({
        c,
        v: tx
          .filter(
            (x) =>
              x.type ===
                "Income" &&
              x.customer ===
                c
          )
          .reduce(
            (a, x) =>
              a +
              x.amount,
            0
          ),
      }))
      .sort(
        (a, b) =>
          b.v - a.v
      )
      .slice(0, 5);

  if (!vals.length) {
    return (
      <EmptyState
        title="No customer revenue yet"
        text="Add income with a customer name to see revenue concentration."
      />
    );
  }

  return (
    <div className="customer-rows">
      {vals.map(
        (x, i) => (
          <div
            className="customer-row"
            key={x.c}
          >
            <span className="avatar">
              {x.c
                .slice(
                  0,
                  1
                )
                .toUpperCase()}
            </span>

            <div>
              <b>{x.c}</b>

              <small>
                {i === 0
                  ? "Top customer"
                  : "Revenue contributor"}
              </small>
            </div>

            <strong>
              {money(
                x.v,
                currency
              )}
            </strong>
          </div>
        )
      )}
    </div>
  );
}

function MiniTransactions({
  tx,
  currency,
}: {
  tx: Transaction[];
  currency: string;
}) {
  return (
    <div className="mini-transactions">
      {tx.map((x) => (
        <div
          className="mini-tx"
          key={x.id}
        >
          <span
            className={
              x.type ===
              "Income"
                ? "tx-icon income"
                : "tx-icon expense"
            }
          >
            {x.type ===
            "Income" ? (
              <ArrowDownRight />
            ) : (
              <ArrowUpRight />
            )}
          </span>

          <div>
            <b>
              {x.description}
            </b>

            <small>
              {x.date} ·{" "}
              {x.category ||
                "Uncategorized"}
            </small>
          </div>

          <strong
            className={
              x.type ===
              "Income"
                ? "amount-income"
                : "amount-expense"
            }
          >
            {x.type ===
            "Income"
              ? "+"
              : "-"}
            {money(
              x.amount,
              currency
            )}
          </strong>
        </div>
      ))}
    </div>
  );
}

function EmptyTransactions({
  onAdd,
}: {
  onAdd: () => void;
}) {
  return (
    <EmptyState
      title="No transactions yet"
      text="Your dashboard will populate as you record income and expenses."
      action="Add transaction"
      onAction={onAdd}
    />
  );
}

function EmptyState({
  title,
  text,
  action,
  onAction,
}: {
  title: string;
  text: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div
      style={{
        padding:
          "30px 10px",
        textAlign:
          "center",
      }}
    >
      <div
        style={{
          fontWeight: 700,
          marginBottom: 6,
        }}
      >
        {title}
      </div>

      <p
        style={{
          margin:
            "0 auto 14px",
          maxWidth: 460,
          color:
            "#69736e",
          fontSize: 13,
        }}
      >
        {text}
      </p>

      {action &&
        onAction && (
          <button
            className="button secondary"
            onClick={
              onAction
            }
          >
            {action}
          </button>
        )}
    </div>
  );
}

/* =========================================================
   TRANSACTIONS + FILTERING
========================================================= */

function Transactions({
  tx,
  currency,
  customers,
  categories,
  highlightedId,
  onAdd,
  onImport,
  onDelete,
}: {
  tx: Transaction[];
  currency: string;
  customers: Customer[];
  categories: string[];
  highlightedId: string | null;
  onAdd: () => void;
  onImport: () => void;
  onDelete: (id: string) => void;
}) {
  const [q, setQ] =
    useState("");

  const [type, setType] =
    useState("All");

  const [customer, setCustomer] =
    useState("All");

  const [category, setCategory] =
    useState("All");

  const [month, setMonth] =
    useState("All");

  const [year, setYear] =
    useState("All");

  const [minAmount, setMinAmount] =
    useState("");

  const [maxAmount, setMaxAmount] =
    useState("");

  const [receiptStatus, setReceiptStatus] =
    useState("All");

  const years =
    Array.from(
      new Set(
        tx.map((x) =>
          new Date(
            x.date
          ).getFullYear()
        )
      )
    ).sort(
      (a, b) => b - a
    );

  const filtered =
    tx.filter((x) => {
      const date =
        new Date(
          x.date
        );

      const matchesSearch =
        `${x.description} ${
          x.customer ||
          ""
        } ${
          x.supplier ||
          ""
        } ${
          x.category ||
          ""
        }`
          .toLowerCase()
          .includes(
            q.toLowerCase()
          );

      const matchesType =
        type === "All" ||
        x.type === type;

      const matchesCustomer =
        customer === "All" ||
        x.customer ===
          customer;

      const matchesCategory =
        category === "All" ||
        x.category ===
          category;

      const matchesMonth =
        month === "All" ||
        date.getMonth() + 1 ===
          Number(month);

      const matchesYear =
        year === "All" ||
        date.getFullYear() ===
          Number(year);

      const matchesMin =
        !minAmount ||
        x.amount >=
          Number(
            minAmount
          );

      const matchesMax =
        !maxAmount ||
        x.amount <=
          Number(
            maxAmount
          );

      const matchesReceipt =
        receiptStatus ===
          "All" ||
        (receiptStatus ===
          "Attached"
          ? x.receipt
          : !x.receipt);

      return (
        matchesSearch &&
        matchesType &&
        matchesCustomer &&
        matchesCategory &&
        matchesMonth &&
        matchesYear &&
        matchesMin &&
        matchesMax &&
        matchesReceipt
      );
    });

  const clearFilters =
    () => {
      setQ("");
      setType("All");
      setCustomer("All");
      setCategory("All");
      setMonth("All");
      setYear("All");
      setMinAmount("");
      setMaxAmount("");
      setReceiptStatus(
        "All"
      );
    };

  return (
    <>
      <div className="title-row">
        <div>
          <h1>
            Transactions
          </h1>

          <p>
            Search, filter and
            manage every
            money movement.
          </p>
        </div>

        <div className="row-actions">
          <button
            className="button secondary"
            onClick={
              onImport
            }
          >
            <Upload size={16} />
            Import CSV
          </button>

          <button
            className="button primary"
            onClick={onAdd}
          >
            <Plus size={17} />
            Add transaction
          </button>
        </div>
      </div>

      <section
        className="panel"
        style={{
          marginBottom: 18,
          padding: 18,
        }}
      >
        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "minmax(220px, 2fr) repeat(3, minmax(130px, 1fr))",
            gap: 10,
          }}
        >
          <div className="search">
            <Search
              size={17}
            />

            <input
              value={q}
              onChange={(
                e
              ) =>
                setQ(
                  e.target
                    .value
                )
              }
              placeholder="Search description, customer, supplier..."
            />
          </div>

          <select
            value={type}
            onChange={(e) =>
              setType(
                e.target
                  .value
              )
            }
            style={
              filterSelectStyle
            }
          >
            <option>
              All types
            </option>
            <option>
              Income
            </option>
            <option>
              Expense
            </option>
          </select>

          <select
            value={customer}
            onChange={(e) =>
              setCustomer(
                e.target
                  .value
              )
            }
            style={
              filterSelectStyle
            }
          >
            <option value="All">
              All customers
            </option>

            {customers.map(
              (c) => (
                <option
                  key={
                    c.id
                  }
                  value={
                    c.name
                  }
                >
                  {c.name}
                </option>
              )
            )}
          </select>

          <select
            value={category}
            onChange={(e) =>
              setCategory(
                e.target
                  .value
              )
            }
            style={
              filterSelectStyle
            }
          >
            <option value="All">
              All categories
            </option>

            {categories.map(
              (c) => (
                <option
                  key={c}
                  value={c}
                >
                  {c}
                </option>
              )
            )}
          </select>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "repeat(5, minmax(120px, 1fr))",
            gap: 10,
            marginTop: 10,
          }}
        >
          <select
            value={month}
            onChange={(e) =>
              setMonth(
                e.target
                  .value
              )
            }
            style={
              filterSelectStyle
            }
          >
            <option value="All">
              All months
            </option>

            {[
              "January",
              "February",
              "March",
              "April",
              "May",
              "June",
              "July",
              "August",
              "September",
              "October",
              "November",
              "December",
            ].map(
              (m, i) => (
                <option
                  key={m}
                  value={
                    i + 1
                  }
                >
                  {m}
                </option>
              )
            )}
          </select>

          <select
            value={year}
            onChange={(e) =>
              setYear(
                e.target
                  .value
              )
            }
            style={
              filterSelectStyle
            }
          >
            <option value="All">
              All years
            </option>

            {years.map(
              (y) => (
                <option
                  key={y}
                  value={y}
                >
                  {y}
                </option>
              )
            )}
          </select>

          <input
            type="number"
            min="0"
            placeholder="Minimum amount"
            value={
              minAmount
            }
            onChange={(e) =>
              setMinAmount(
                e.target
                  .value
              )
            }
            style={
              filterInputStyle
            }
          />

          <input
            type="number"
            min="0"
            placeholder="Maximum amount"
            value={
              maxAmount
            }
            onChange={(e) =>
              setMaxAmount(
                e.target
                  .value
              )
            }
            style={
              filterInputStyle
            }
          />

          <select
            value={
              receiptStatus
            }
            onChange={(e) =>
              setReceiptStatus(
                e.target
                  .value
              )
            }
            style={
              filterSelectStyle
            }
          >
            <option value="All">
              All receipts
            </option>
            <option value="Attached">
              Attached
            </option>
            <option value="Missing">
              Missing
            </option>
          </select>
        </div>

        <div
          style={{
            display:
              "flex",
            justifyContent:
              "space-between",
            alignItems:
              "center",
            gap: 10,
            marginTop: 12,
            flexWrap:
              "wrap",
          }}
        >
          <span
            style={{
              fontSize: 13,
              color:
                "#69736e",
            }}
          >
            {filtered.length}{" "}
            matching
            transaction
            {filtered.length ===
            1
              ? ""
              : "s"}
          </span>

          <button
            className="button ghost"
            onClick={
              clearFilters
            }
          >
            Clear filters
          </button>
        </div>
      </section>

      <section className="panel table-panel">
        <div className="table-summary">
          <span>
            {filtered.length}{" "}
            transactions
          </span>

          <span>
            Filtered total:{" "}
            <b>
              {money(
                filtered.reduce(
                  (a, x) =>
                    a +
                    (x.type ===
                    "Income"
                      ? x.amount
                      : -x.amount),
                  0
                ),
                currency
              )}
            </b>
          </span>
        </div>

        {filtered.length ? (
          <div className="tx-table">
            <div
              className="tx-head"
              style={{
                gridTemplateColumns:
                  "110px 1.7fr 1fr 1fr 130px 100px 70px",
              }}
            >
              <span>
                Date
              </span>

              <span>
                Description
              </span>

              <span>
                Category
              </span>

              <span>
                Method
              </span>

              <span>
                Amount
              </span>

              <span>
                Receipt
              </span>

              <span>
                Action
              </span>
            </div>

            {filtered.map(
              (x) => {
                const highlighted =
                  highlightedId ===
                  x.id;

                return (
                  <div
                    id={`transaction-${x.id}`}
                    className="tx-row"
                    key={
                      x.id
                    }
                    style={{
                      gridTemplateColumns:
                        "110px 1.7fr 1fr 1fr 130px 100px 70px",
                      background:
                        highlighted
                          ? "#fff6d9"
                          : undefined,
                      outline:
                        highlighted
                          ? "2px solid #d5ad3f"
                          : undefined,
                      borderRadius:
                        highlighted
                          ? 10
                          : undefined,
                      transition:
                        "background .2s ease",
                    }}
                  >
                    <span>
                      {new Date(
                        x.date
                      ).toLocaleDateString(
                        "en-US",
                        {
                          month:
                            "short",
                          day:
                            "numeric",
                          year:
                            "numeric",
                        }
                      )}
                    </span>

                    <div>
                      <b>
                        {x.description}
                      </b>

                      <small>
                        {x.customer ||
                          x.supplier ||
                          "—"}
                      </small>
                    </div>

                    <span
                      className={
                        x.category
                          ? "chip"
                          : "chip muted"
                      }
                    >
                      {x.category ||
                        "Uncategorized"}
                    </span>

                    <span>
                      {x.paymentMethod ||
                        "—"}
                    </span>

                    <strong
                      className={
                        x.type ===
                        "Income"
                          ? "amount-income"
                          : "amount-expense"
                      }
                    >
                      {x.type ===
                      "Income"
                        ? "+"
                        : "-"}
                      {money(
                        x.amount,
                        currency
                      )}
                    </strong>

                    <span>
                      <span
                        style={{
                          display:
                            "inline-flex",
                          alignItems:
                            "center",
                          gap: 5,
                          fontSize: 12,
                          fontWeight:
                            700,
                          color:
                            x.receipt
                              ? "#1c8c7c"
                              : "#b3401f",
                        }}
                      >
                        {x.receipt ? (
                          <>
                            <CheckCircle2
                              size={
                                14
                              }
                            />
                            Attached
                          </>
                        ) : (
                          <>
                            <AlertCircle
                              size={
                                14
                              }
                            />
                            Missing
                          </>
                        )}
                      </span>
                    </span>

                    <button
                      className="more"
                      onClick={() => {
                        if (
                          window.confirm(
                            "Delete this transaction?"
                          )
                        ) {
                          onDelete(
                            x.id
                          );
                        }
                      }}
                      title="Delete"
                    >
                      <Trash2
                        size={
                          15
                        }
                      />
                    </button>
                  </div>
                );
              }
            )}
          </div>
        ) : (
          <EmptyState
            title="No matching transactions"
            text={
              tx.length
                ? "Try another search or filter."
                : "Start by adding your first transaction."
            }
            action={
              !tx.length
                ? "Add transaction"
                : undefined
            }
            onAction={
              !tx.length
                ? onAdd
                : undefined
            }
          />
        )}
      </section>
    </>
  );
}

const filterSelectStyle: CSSProperties =
  {
    width: "100%",
    minHeight: 42,
    border:
      "1px solid #dfe5e1",
    borderRadius: 9,
    padding:
      "0 10px",
    background:
      "white",
    color:
      "#24312c",
    outline: "none",
  };

const filterInputStyle: CSSProperties =
  {
    width: "100%",
    minHeight: 42,
    border:
      "1px solid #dfe5e1",
    borderRadius: 9,
    padding:
      "0 10px",
    background:
      "white",
    color:
      "#24312c",
    outline: "none",
  };

/* =========================================================
   CUSTOMERS / SUPPLIERS
========================================================= */

function PeoplePage({
  title,
  subtitle,
  icon,
  people,
  kind,
  tx,
  currency,
  onSave,
  onEdit,
  onDelete,
}: {
  title: string;
  subtitle: string;
  icon: ReactNode;
  people:
    | Customer[]
    | Supplier[];
  kind:
    | "customer"
    | "supplier";
  tx: Transaction[];
  currency: string;
  onSave: (
    person:
      | Customer
      | Supplier
  ) => void;
  onEdit: (
    id: string,
    person:
      | Customer
      | Supplier
  ) => void;
  onDelete: (
    person:
      | Customer
      | Supplier
  ) => void;
}) {
  const [modalOpen, setModalOpen] =
    useState(false);

  const [selected, setSelected] =
    useState<
      Customer | Supplier | undefined
    >();

  const openAdd =
    () => {
      setSelected(
        undefined
      );
      setModalOpen(
        true
      );
    };

  const openEdit =
    (
      person:
        | Customer
        | Supplier
    ) => {
      setSelected(
        person
      );
      setModalOpen(
        true
      );
    };

  const save =
    (
      person:
        | Customer
        | Supplier
    ) => {
      if (selected) {
        onEdit(
          selected.id,
          person
        );
      } else {
        onSave(
          person
        );
      }

      setModalOpen(
        false
      );
    };

  return (
    <>
      <div className="title-row">
        <div>
          <div className="page-icon">
            {icon}
          </div>

          <h1>
            {title}
          </h1>

          <p>
            {subtitle}
          </p>
        </div>

        <button
          className="button primary"
          onClick={
            openAdd
          }
        >
          <Plus size={17} />
          Add{" "}
          {kind ===
          "customer"
            ? "customer"
            : "supplier"}
        </button>
      </div>

      {people.length ? (
        <div className="entity-grid">
          {people.map(
            (person, i) => {
              const total =
                tx
                  .filter(
                    (x) =>
                      (kind ===
                      "customer"
                        ? x.customer
                        : x.supplier) ===
                      person.name
                  )
                  .reduce(
                    (a, x) =>
                      a +
                      x.amount,
                    0
                  );

              return (
                <div
                  className="entity-card"
                  key={
                    person.id
                  }
                >
                  <div className="entity-avatar">
                    {person.name
                      .slice(
                        0,
                        1
                      )
                      .toUpperCase()}
                  </div>

                  <div
                    className="entity-main"
                  >
                    <b>
                      {person.name}
                    </b>

                    <small>
                      {person.company ||
                        (i ===
                        0
                          ? "Active record"
                          : "Business partner")}
                    </small>

                    {person.email && (
                      <small>
                        {person.email}
                      </small>
                    )}

                    {person.phone && (
                      <small>
                        {person.phone}
                      </small>
                    )}
                  </div>

                  <div className="entity-total">
                    <small>
                      {kind ===
                      "customer"
                        ? "Revenue"
                        : "Spend"}
                    </small>

                    <strong>
                      {money(
                        total,
                        currency
                      )}
                    </strong>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      gap: 4,
                    }}
                  >
                    <button
                      className="more"
                      onClick={() =>
                        openEdit(
                          person
                        )
                      }
                      aria-label={`Edit ${person.name}`}
                    >
                      <Pencil
                        size={
                          15
                        }
                      />
                    </button>

                    <button
                      className="more"
                      onClick={() =>
                        onDelete(
                          person
                        )
                      }
                      aria-label={`Delete ${person.name}`}
                    >
                      <Trash2
                        size={
                          15
                        }
                      />
                    </button>
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <section className="panel">
          <EmptyState
            title={`No ${title.toLowerCase()} yet`}
            text={`Create your first ${
              kind ===
              "customer"
                ? "customer"
                : "supplier"
            }. You can also add names directly when entering a transaction.`}
            action={`Add ${
              kind ===
              "customer"
                ? "customer"
                : "supplier"
            }`}
            onAction={
              openAdd
            }
          />
        </section>
      )}

      {modalOpen && (
        <EntityModal
          title={`${selected ? "Edit" : "Add"} ${
            kind ===
            "customer"
              ? "customer"
              : "supplier"
          }`}
          entity={
            selected
          }
          kind={kind}
          onClose={() =>
            setModalOpen(
              false
            )
          }
          onSave={save}
        />
      )}
    </>
  );
}

function EntityModal({
  title,
  entity,
  onClose,
  onSave,
  kind,
}: EntityModalProps) {
  const [name, setName] =
    useState(
      entity?.name ||
        ""
    );

  const [email, setEmail] =
    useState(
      entity?.email ||
        ""
    );

  const [phone, setPhone] =
    useState(
      entity?.phone ||
        ""
    );

  const [company, setCompany] =
    useState(
      entity?.company ||
        ""
    );

  const [description, setDescription] =
    useState(
      entity?.description ||
        ""
    );

  const save =
    () => {
      if (!name.trim()) {
        window.alert(
          "Name is required."
        );
        return;
      }

      onSave({
        id:
          entity?.id ||
          crypto.randomUUID(),
        name:
          name.trim(),
        email:
          email.trim() ||
          undefined,
        phone:
          phone.trim() ||
          undefined,
        company:
          company.trim() ||
          undefined,
        description:
          description.trim() ||
          undefined,
      } as Customer &
        Supplier);
    };

  return (
    <div className="modal-backdrop">
      <div
        className="modal"
        style={{
          maxWidth: 600,
        }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              DIRECTORY
            </span>

            <h2>
              {title}
            </h2>
          </div>

          <button
            onClick={
              onClose
            }
          >
            <X />
          </button>
        </div>

        <label>
          Name *
          <input
            autoFocus
            value={name}
            onChange={(e) =>
              setName(
                e.target
                  .value
              )
            }
            placeholder="Enter name"
          />
        </label>

        <div className="form-grid">
          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(
                  e.target
                    .value
                )
              }
              placeholder="email@example.com"
            />
          </label>

          <label>
            Phone
            <input
              value={phone}
              onChange={(e) =>
                setPhone(
                  e.target
                    .value
                )
              }
              placeholder="Phone number"
            />
          </label>
        </div>

        <label>
          Company name
          <input
            value={company}
            onChange={(e) =>
              setCompany(
                e.target
                  .value
              )
            }
            placeholder="Optional"
          />
        </label>

        <label>
          Description / notes
          <textarea
            value={
              description
            }
            onChange={(e) =>
              setDescription(
                e.target
                  .value
              )
            }
            placeholder="Optional notes"
            rows={4}
            style={{
              width: "100%",
              border:
                "1px solid #dfe5e1",
              borderRadius: 9,
              padding: 10,
              resize:
                "vertical",
            }}
          />
        </label>

        <div className="modal-actions">
          <button
            className="button secondary"
            onClick={
              onClose
            }
          >
            Cancel
          </button>

          <button
            className="button primary"
            disabled={
              !name.trim()
            }
            onClick={save}
          >
            Save{" "}
            {kind ===
            "customer"
              ? "customer"
              : "supplier"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   CATEGORIES
========================================================= */

function CategoryPage({
  tx,
  categories,
  currency,
  onAdd,
  onEdit,
  onDelete,
}: {
  tx: Transaction[];
  categories: string[];
  currency: string;
  onAdd: (name: string) => void;
  onEdit: (
    oldName: string,
    newName: string
  ) => void;
  onDelete: (
    name: string
  ) => void;
}) {
  const [modal, setModal] =
    useState<
      "add" | "edit" | null
    >(null);

  const [selected, setSelected] =
    useState<
      string | undefined
    >();

  const [menu, setMenu] =
    useState<
      string | null
    >(null);

  const submit =
    (name: string) => {
      if (
        modal ===
        "add"
      ) {
        onAdd(name);
      } else if (
        selected
      ) {
        onEdit(
          selected,
          name
        );
      }

      setModal(
        null
      );

      setMenu(
        null
      );
    };

  return (
    <>
      <div className="title-row">
        <div>
          <h1>
            Categories
          </h1>

          <p>
            Create categories
            that match the
            way your business
            actually operates.
          </p>
        </div>

        <button
          className="button primary"
          onClick={() => {
            setSelected(
              undefined
            );
            setModal(
              "add"
            );
          }}
        >
          <Plus size={17} />
          New category
        </button>
      </div>

      {categories.length ? (
        <div className="category-grid">
          {categories.map(
            (c) => {
              const related =
                tx.filter(
                  (x) =>
                    x.category ===
                    c
                );

              const total =
                related.reduce(
                  (a, x) =>
                    a +
                    x.amount,
                  0
                );

              return (
                <div
                  className="category-card"
                  key={c}
                >
                  <div className="category-dot" />

                  <div
                    style={{
                      minWidth: 0,
                      flex: 1,
                    }}
                  >
                    <b>{c}</b>

                    <small>
                      {
                        related.length
                      }{" "}
                      transaction
                      {related.length ===
                      1
                        ? ""
                        : "s"}
                    </small>
                  </div>

                  <strong>
                    {money(
                      total,
                      currency
                    )}
                  </strong>

                  <div
                    style={{
                      position:
                        "relative",
                    }}
                  >
                    <button
                      className="more"
                      onClick={() =>
                        setMenu(
                          menu ===
                            c
                            ? null
                            : c
                        )
                      }
                    >
                      <MoreHorizontal
                        size={
                          18
                        }
                      />
                    </button>

                    {menu ===
                      c && (
                      <div
                        style={{
                          position:
                            "absolute",
                          right: 0,
                          top:
                            "calc(100% + 6px)",
                          width: 150,
                          zIndex: 10,
                          background:
                            "white",
                          border:
                            "1px solid #e5e9e6",
                          borderRadius: 10,
                          boxShadow:
                            "0 12px 30px rgba(0,0,0,.12)",
                          padding: 5,
                        }}
                      >
                        <button
                          onClick={() => {
                            setSelected(
                              c
                            );
                            setModal(
                              "edit"
                            );
                            setMenu(
                              null
                            );
                          }}
                          style={
                            menuButtonStyle
                          }
                        >
                          <Pencil
                            size={
                              15
                            }
                          />
                          Edit
                        </button>

                        <button
                          onClick={() => {
                            onDelete(
                              c
                            );
                            setMenu(
                              null
                            );
                          }}
                          style={{
                            ...menuButtonStyle,
                            color:
                              "#a83218",
                          }}
                        >
                          <Trash2
                            size={
                              15
                            }
                          />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            }
          )}
        </div>
      ) : (
        <section className="panel">
          <EmptyState
            title="No categories yet"
            text="Build your own category structure around your business."
            action="Create category"
            onAction={() => {
              setSelected(
                undefined
              );
              setModal(
                "add"
              );
            }}
          />
        </section>
      )}

      {modal && (
        <EntityModal
          title={`${modal === "add" ? "Create" : "Edit"} category`}
          value={
            modal ===
            "edit"
              ? selected
              : ""
          }
          onClose={() =>
            setModal(
              null
            )
          }
          onSave={
            submit
          }
        />
      )}
    </>
  );
}

/* =========================================================
   INSIGHTS
========================================================= */

function InsightsPage({
  tx,
  revenue,
  expenses,
  currency,
}: {
  tx: Transaction[];
  revenue: number;
  expenses: number;
  currency: string;
}) {
  const expenseGroups =
    Array.from(
      new Set(
        tx
          .filter(
            (x) =>
              x.type ===
                "Expense" &&
              x.category
          )
          .map(
            (x) =>
              x.category as string
          )
      )
    )
      .map(
        (category) => ({
          category,
          amount: tx
            .filter(
              (x) =>
                x.type ===
                  "Expense" &&
                x.category ===
                  category
            )
            .reduce(
              (a, x) =>
                a +
                x.amount,
              0
            ),
        })
      )
      .sort(
        (a, b) =>
          b.amount -
          a.amount
      );

  const topExpense =
    expenseGroups[0]
      ?.category ||
    "No data";

  const customerGroups =
    Array.from(
      new Set(
        tx
          .filter(
            (x) =>
              x.type ===
                "Income" &&
              x.customer
          )
          .map(
            (x) =>
              x.customer as string
          )
      )
    )
      .map(
        (customer) => ({
          customer,
          amount: tx
            .filter(
              (x) =>
                x.type ===
                  "Income" &&
                x.customer ===
                  customer
            )
            .reduce(
              (a, x) =>
                a +
                x.amount,
              0
            ),
        })
      )
      .sort(
        (a, b) =>
          b.amount -
          a.amount
      );

  const topCustomer =
    customerGroups[0]
      ?.customer ||
    "No data";

  const expenseCount =
    tx.filter(
      (x) =>
        x.type ===
        "Expense"
    ).length;

  const receiptCount =
    tx.filter(
      (x) =>
        x.type ===
          "Expense" &&
        x.receipt
    ).length;

  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">
            WHAT CHANGED
          </div>

          <h1>
            Insights
          </h1>

          <p>
            Plain-language
            signals from
            your recorded
            transactions.
          </p>
        </div>
      </div>

      <div className="insight-hero">
        <div className="insight-spark">
          <Sparkles />
        </div>

        <div>
          <h2>
            Your net is{" "}
            {money(
              revenue -
                expenses,
              currency
            )}{" "}
            this month.
          </h2>

          <p>
            Revenue is{" "}
            {money(
              revenue,
              currency
            )}{" "}
            and expenses
            are{" "}
            {money(
              expenses,
              currency
            )}{" "}
            in the current
            period.
          </p>
        </div>
      </div>

      <div className="insight-grid">
        <Insight
          title="Expense concentration"
          value={
            topExpense
          }
          text={
            topExpense ===
            "No data"
              ? "Add categorized expenses to identify your largest spending area."
              : `${topExpense} is your largest tracked expense category.`
          }
        />

        <Insight
          title="Customer concentration"
          value={
            topCustomer
          }
          text={
            topCustomer ===
            "No data"
              ? "Add income transactions with customer names to see revenue concentration."
              : `${topCustomer} currently contributes the most recorded revenue.`
          }
        />

        <Insight
          title="Data quality"
          value={`${tx.filter(
            (x) => !x.category
          ).length} uncategorized`}
          text="Categorize transactions to make your reports more reliable."
        />

        <Insight
          title="Receipt coverage"
          value={`${receiptCount}/${expenseCount}`}
          text="Expenses with an attached receipt."
        />
      </div>
    </>
  );
}

function Insight({
  title,
  value,
  text,
}: {
  title: string;
  value: string;
  text: string;
}) {
  return (
    <div className="insight-card">
      <small>
        {title}
      </small>

      <h3>
        {value}
      </h3>

      <p>
        {text}
      </p>
    </div>
  );
}

/* =========================================================
   SETTINGS + TEAM
========================================================= */

function SettingsPage({
  session,
  settings,
  currencies,
  team,
  onSave,
  onExport,
  onLogout,
  onDeleteAccount,
  onInvite,
  onRemoveTeamMember,
}: {
  session: any;
  settings: UserSettings;
  currencies: readonly (
    readonly [
      string,
      string
    ]
  )[];
  team: TeamMember[];
  onSave: (
    settings: UserSettings
  ) => void;
  onExport: () => void;
  onLogout: () => void;
  onDeleteAccount: () => void;
  onInvite: (
    email: string,
    role: TeamRole
  ) => void;
  onRemoveTeamMember: (
    id: string
  ) => void;
}) {
  const [
    businessName,
    setBusinessName,
  ] = useState(
    settings.businessName
  );

  const [
    businessType,
    setBusinessType,
  ] = useState(
    settings.businessType
  );

  const [
    currency,
    setCurrency,
  ] = useState(
    settings.currency
  );

  const [saved, setSaved] =
    useState(false);

  const [inviteEmail, setInviteEmail] =
    useState("");

  const [inviteRole, setInviteRole] =
    useState<TeamRole>(
      "Viewer"
    );

  useEffect(() => {
    setBusinessName(
      settings.businessName
    );

    setBusinessType(
      settings.businessType
    );

    setCurrency(
      settings.currency
    );
  }, [settings]);

  const save =
    () => {
      onSave({
        businessName:
          businessName.trim() ||
          "My Business",
        businessType,
        currency,
      });

      setSaved(true);

      window.setTimeout(
        () =>
          setSaved(
            false
          ),
        1800
      );
    };

  const invite =
    () => {
      if (
        !inviteEmail.trim()
      ) {
        window.alert(
          "Enter an email address."
        );
        return;
      }

      onInvite(
        inviteEmail,
        inviteRole
      );

      setInviteEmail("");
      setInviteRole(
        "Viewer"
      );
    };

  return (
    <>
      <div className="title-row">
        <div>
          <h1>
            Settings
          </h1>

          <p>
            Business profile,
            currency, account
            and team access.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel settings-panel">
          <h3>
            Business profile
          </h3>

          <p className="panel-note">
            These details
            are used
            throughout your
            money workspace.
          </p>

          <label>
            Business name

            <input
              value={
                businessName
              }
              onChange={(e) =>
                setBusinessName(
                  e.target
                    .value
                )
              }
            />
          </label>

          <label>
            Currency

            <select
              value={
                currency
              }
              onChange={(e) =>
                setCurrency(
                  e.target
                    .value
                )
              }
            >
              {currencies.map(
                ([
                  code,
                  name,
                ]) => (
                  <option
                    value={
                      code
                    }
                    key={
                      code
                    }
                  >
                    {code} —{" "}
                    {name}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            Business type

            <select
              value={
                businessType
              }
              onChange={(e) =>
                setBusinessType(
                  e.target
                    .value
                )
              }
            >
              <option>
                Small business
              </option>

              <option>
                Consulting
              </option>

              <option>
                Retail
              </option>

              <option>
                Services
              </option>

              <option>
                Freelance
              </option>

              <option>
                Agency
              </option>

              <option>
                Other
              </option>
            </select>
          </label>

          <button
            className="button primary"
            onClick={save}
          >
            {saved ? (
              <>
                <CheckCircle2
                  size={16}
                />
                Saved
              </>
            ) : (
              "Save changes"
            )}
          </button>
        </section>

        <section className="panel settings-panel">
          <h3>
            Account
            information
          </h3>

          <p className="panel-note">
            Information
            associated with
            your Money Clarity
            account.
          </p>

          <AccountInfo
            label="Name"
            value={
              session.name ||
              "Not provided"
            }
            icon={
              <User
                size={17}
              />
            }
          />

          <AccountInfo
            label="Email"
            value={
              session.email ||
              "Not provided"
            }
            icon={
              <Mail
                size={17}
              />
            }
          />

          <AccountInfo
            label="Account ID"
            value={
              session.id ||
              "Local account"
            }
            icon={
              <Shield
                size={17}
              />
            }
          />

          <button
            className="setting-action"
            onClick={
              onExport
            }
          >
            <FileDown />

            <div>
              <b>
                Export all data
              </b>

              <small>
                Download your
                transactions as
                CSV.
              </small>
            </div>

            <Download
              size={16}
            />
          </button>

          <button
            className="setting-action"
            onClick={
              onLogout
            }
          >
            <LogOut />

            <div>
              <b>
                Sign out
              </b>

              <small>
                Sign out of
                this account.
              </small>
            </div>
          </button>

          <button
            onClick={
              onDeleteAccount
            }
            style={{
              width:
                "100%",
              display:
                "flex",
              alignItems:
                "center",
              gap: 10,
              marginTop: 8,
              padding:
                "12px 10px",
              border:
                "1px solid #efc8bf",
              borderRadius: 10,
              background:
                "#fff8f6",
              color:
                "#a83218",
              cursor:
                "pointer",
              textAlign:
                "left",
            }}
          >
            <Trash2
              size={18}
            />

            <div>
              <b>
                Delete account
              </b>

              <small
                style={{
                  display:
                    "block",
                  marginTop: 2,
                }}
              >
                Permanently
                remove local
                account data.
              </small>
            </div>
          </button>
        </section>
      </div>

      <section
        className="panel"
        style={{
          marginTop: 18,
        }}
      >
        <div className="panel-head">
          <div>
            <h3>
              Team Access
            </h3>

            <p>
              Invite people to
              collaborate on
              this business.
            </p>
          </div>

          <span className="count-pill">
            {team.length}
          </span>
        </div>

        <div
          style={{
            display:
              "grid",
            gridTemplateColumns:
              "1fr 150px auto",
            gap: 10,
            marginBottom: 18,
          }}
        >
          <div className="search">
            <Mail
              size={17}
            />

            <input
              value={
                inviteEmail
              }
              onChange={(e) =>
                setInviteEmail(
                  e.target
                    .value
                )
              }
              placeholder="Email address"
              type="email"
            />
          </div>

          <select
            value={
              inviteRole
            }
            onChange={(e) =>
              setInviteRole(
                e.target
                  .value as TeamRole
              )
            }
            style={
              filterSelectStyle
            }
          >
            <option>
              Viewer
            </option>

            <option>
              Editor
            </option>

            <option>
              Admin
            </option>
          </select>

          <button
            className="button primary"
            onClick={
              invite
            }
          >
            <UserPlus
              size={16}
            />
            Invite
          </button>
        </div>

        {team.length ? (
          <div
            style={{
              display:
                "grid",
              gap: 8,
            }}
          >
            {team.map(
              (member) => (
                <div
                  key={
                    member.id
                  }
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "1fr 120px 100px 70px",
                    alignItems:
                      "center",
                    gap: 12,
                    padding:
                      "12px 10px",
                    border:
                      "1px solid #edf0ee",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: 10,
                    }}
                  >
                    <span className="avatar">
                      {member.email
                        .slice(
                          0,
                          1
                        )
                        .toUpperCase()}
                    </span>

                    <div>
                      <b>
                        {
                          member.email
                        }
                      </b>

                      <small
                        style={{
                          display:
                            "block",
                          color:
                            "#69736e",
                          marginTop: 2,
                        }}
                      >
                        Invited{" "}
                        {
                          member.invitedAt
                        }
                      </small>
                    </div>
                  </div>

                  <span className="chip">
                    {
                      member.role
                    }
                  </span>

                  <span
                    style={{
                      fontSize: 12,
                      fontWeight:
                        700,
                      color:
                        member.status ===
                        "Pending"
                          ? "#a56b00"
                          : "#1c8c7c",
                    }}
                  >
                    {
                      member.status
                    }
                  </span>

                  <button
                    className="more"
                    title="Remove"
                    onClick={() =>
                      onRemoveTeamMember(
                        member.id
                      )
                    }
                  >
                    <Trash2
                      size={
                        15
                      }
                    />
                  </button>
                </div>
              )
            )}
          </div>
        ) : (
          <EmptyState
            title="No team members"
            text="Invite someone using their email address to give them access to this business."
          />
        )}

        <p
          style={{
            marginTop: 15,
            fontSize: 12,
            color:
              "#69736e",
          }}
        >
          Viewer can view
          information. Editor
          can manage business
          data. Admin has
          administrative
          access. Real email
          invitations and
          multi-user
          authentication will
          require the backend
          connection.
        </p>
      </section>
    </>
  );
}

function AccountInfo({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div
      style={{
        display:
          "flex",
        alignItems:
          "center",
        gap: 10,
        padding:
          "10px 0",
        borderBottom:
          "1px solid #edf0ee",
      }}
    >
      {icon}

      <div
        style={{
          minWidth: 0,
        }}
      >
        <small
          style={{
            display:
              "block",
            color:
              "#69736e",
          }}
        >
          {label}
        </small>

        <b
          style={{
            display:
              "block",
            marginTop: 2,
            overflow:
              "hidden",
            textOverflow:
              "ellipsis",
          }}
        >
          {value}
        </b>
      </div>
    </div>
  );
}

/* =========================================================
   ADD TRANSACTION
========================================================= */

function AddTransaction({
  onClose,
  onSave,
  categories,
  customers,
  suppliers,
  currency,
}: {
  onClose: () => void;
  onSave: (
    x: Transaction
  ) => void;
  categories: string[];
  customers: Customer[];
  suppliers: Supplier[];
  currency: string;
}) {
  const [type, setType] =
    useState<TransactionType>(
      "Expense"
    );

  const [amount, setAmount] =
    useState("");

  const [desc, setDesc] =
    useState("");

  const [category, setCategory] =
    useState("");

  const [date, setDate] =
    useState(
      todayISO()
    );

  const [
    paymentMethod,
    setPaymentMethod,
  ] =
    useState(
      "Bank transfer"
    );

  const [party, setParty] =
    useState("");

  const [receipt, setReceipt] =
    useState(false);

  const [
    receiptName,
    setReceiptName,
  ] = useState("");

  const [
    receiptMenu,
    setReceiptMenu,
  ] = useState(false);

  const cameraRef =
    useRef<HTMLInputElement>(
      null
    );

  const galleryRef =
    useRef<HTMLInputElement>(
      null
    );

  const fileRef =
    useRef<HTMLInputElement>(
      null
    );

  const handleReceipt =
    (
      e: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target
          .files?.[0];

      if (!file)
        return;

      setReceipt(
        true
      );

      setReceiptName(
        file.name
      );

      setReceiptMenu(
        false
      );
    };

  const save =
    () => {
      const numericAmount =
        Number(
          amount.replace(
            /,/g,
            ""
          )
        );

      if (
        !numericAmount ||
        numericAmount <=
          0
      ) {
        window.alert(
          "Please enter a valid amount."
        );
        return;
      }

      onSave({
        id: "",
        date,
        amount:
          numericAmount,
        type,
        description:
          desc.trim() ||
          "Untitled transaction",
        category:
          category ||
          undefined,
        paymentMethod,
        receipt,
        ...(type ===
        "Income"
          ? {
              customer:
                party.trim() ||
                undefined,
            }
          : {
              supplier:
                party.trim() ||
                undefined,
            }),
      });
    };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              QUICK ENTRY
            </span>

            <h2>
              Add transaction
            </h2>
          </div>

          <button
            onClick={
              onClose
            }
          >
            <X />
          </button>
        </div>

        <div className="type-toggle">
          <button
            className={
              type ===
              "Income"
                ? "active income"
                : ""
            }
            onClick={() =>
              setType(
                "Income"
              )
            }
          >
            Income
          </button>

          <button
            className={
              type ===
              "Expense"
                ? "active expense"
                : ""
            }
            onClick={() =>
              setType(
                "Expense"
              )
            }
          >
            Expense
          </button>
        </div>

        <label>
          Amount

          <input
            autoFocus
            value={amount}
            onChange={(e) =>
              setAmount(
                e.target
                  .value
              )
            }
            inputMode="decimal"
            placeholder={money(
              0,
              currency
            )}
          />
        </label>

        <div className="form-grid">
          <label>
            Date

            <input
              type="date"
              value={date}
              onChange={(e) =>
                setDate(
                  e.target
                    .value
                )
              }
            />
          </label>

          <label>
            Payment method

            <select
              value={
                paymentMethod
              }
              onChange={(e) =>
                setPaymentMethod(
                  e.target
                    .value
                )
              }
            >
              <option>
                Bank transfer
              </option>

              <option>
                Card
              </option>

              <option>
                Cash
              </option>

              <option>
                Cheque
              </option>

              <option>
                Other
              </option>
            </select>
          </label>
        </div>

        <label>
          Description

          <input
            value={desc}
            onChange={(e) =>
              setDesc(
                e.target
                  .value
              )
            }
            placeholder="What was this for?"
          />
        </label>

        <div className="form-grid">
          <label>
            Category

            <select
              value={
                category
              }
              onChange={(e) =>
                setCategory(
                  e.target
                    .value
                )
              }
            >
              <option value="">
                Uncategorized
              </option>

              {categories.map(
                (c) => (
                  <option
                    key={c}
                  >
                    {c}
                  </option>
                )
              )}
            </select>
          </label>

          <label>
            {type ===
            "Income"
              ? "Customer"
              : "Supplier"}

            <input
              list={
                type ===
                "Income"
                  ? "customer-list"
                  : "supplier-list"
              }
              value={
                party
              }
              onChange={(e) =>
                setParty(
                  e.target
                    .value
                )
              }
              placeholder="Optional"
            />

            {type ===
            "Income" ? (
              <datalist id="customer-list">
                {customers.map(
                  (c) => (
                    <option
                      value={
                        c.name
                      }
                      key={
                        c.id
                      }
                    />
                  )
                )}
              </datalist>
            ) : (
              <datalist id="supplier-list">
                {suppliers.map(
                  (s) => (
                    <option
                      value={
                        s.name
                      }
                      key={
                        s.id
                      }
                    />
                  )
                )}
              </datalist>
            )}
          </label>
        </div>

        <div
          style={{
            position:
              "relative",
          }}
        >
          <button
            type="button"
            className="receipt-upload"
            onClick={() =>
              setReceiptMenu(
                (v) => !v
              )
            }
          >
            <Camera
              size={18}
            />

            <span>
              <b>
                {receipt
                  ? "Receipt attached"
                  : "Attach receipt"}
              </b>

              <small>
                {receiptName ||
                  "Camera, gallery or file"}
              </small>
            </span>

            <ChevronDown
              size={16}
              style={{
                marginLeft:
                  "auto",
              }}
            />
          </button>

          {receiptMenu && (
            <div
              style={{
                position:
                  "absolute",
                left: 0,
                right: 0,
                bottom:
                  "calc(100% + 8px)",
                background:
                  "white",
                border:
                  "1px solid #e2e7e4",
                borderRadius: 12,
                padding: 6,
                boxShadow:
                  "0 12px 30px rgba(0,0,0,.12)",
                zIndex: 20,
              }}
            >
              <ReceiptOption
                icon={
                  <Camera
                    size={
                      18
                    }
                  />
                }
                label="Take photo"
                onClick={() =>
                  cameraRef.current?.click()
                }
              />

              <ReceiptOption
                icon={
                  <ImageIcon
                    size={
                      18
                    }
                  />
                }
                label="Choose from gallery"
                onClick={() =>
                  galleryRef.current?.click()
                }
              />

              <ReceiptOption
                icon={
                  <FileText
                    size={
                      18
                    }
                  />
                }
                label="Choose file"
                onClick={() =>
                  fileRef.current?.click()
                }
              />
            </div>
          )}

          <input
            ref={
              cameraRef
            }
            type="file"
            accept="image/*"
            capture="environment"
            onChange={
              handleReceipt
            }
            style={{
              display:
                "none",
            }}
          />

          <input
            ref={
              galleryRef
            }
            type="file"
            accept="image/*"
            onChange={
              handleReceipt
            }
            style={{
              display:
                "none",
            }}
          />

          <input
            ref={
              fileRef
            }
            type="file"
            accept="image/*,.pdf,.heic,.heif"
            onChange={
              handleReceipt
            }
            style={{
              display:
                "none",
            }}
          />
        </div>

        <div className="modal-actions">
          <button
            className="button secondary"
            onClick={
              onClose
            }
          >
            Cancel
          </button>

          <button
            className="button primary"
            onClick={save}
          >
            Save transaction
          </button>
        </div>
      </div>
    </div>
  );
}

function ReceiptOption({
  icon,
  label,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={
        onClick
      }
      style={{
        width:
          "100%",
        display:
          "flex",
        alignItems:
          "center",
        gap: 10,
        padding: 11,
        border: 0,
        borderRadius: 8,
        background:
          "transparent",
        cursor:
          "pointer",
        textAlign:
          "left",
      }}
    >
      {icon}

      <span>
        {label}
      </span>
    </button>
  );
}

/* =========================================================
   CSV IMPORT
========================================================= */

function ImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (
    items: Transaction[]
  ) => void;
}) {
  const [items, setItems] =
    useState<
      Transaction[]
    >([]);

  const [filename, setFilename] =
    useState("");

  const [error, setError] =
    useState("");

  const fileRef =
    useRef<HTMLInputElement>(
      null
    );

  const choose =
    () =>
      fileRef.current?.click();

  const handleFile =
    async (
      e: ChangeEvent<HTMLInputElement>
    ) => {
      const file =
        e.target
          .files?.[0];

      if (!file)
        return;

      setFilename(
        file.name
      );

      try {
        const parsed =
          parseCSV(
            await file.text()
          );

        if (!parsed.length) {
          setError(
            "No valid transaction rows were found. Make sure the CSV contains Date, Description and Amount columns."
          );

          return;
        }

        setError("");
        setItems(
          parsed
        );
      } catch {
        setError(
          "This CSV could not be read."
        );
      }
    };

  return (
    <div className="modal-backdrop">
      <div className="modal import-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">
              SAFE IMPORT
            </span>

            <h2>
              Import CSV
            </h2>
          </div>

          <button
            onClick={
              onClose
            }
          >
            <X />
          </button>
        </div>

        {!items.length ? (
          <div
            className="dropzone"
            onClick={
              choose
            }
          >
            <Upload
              size={28}
            />

            <h3>
              {filename ||
                "Choose a CSV file"}
            </h3>

            <p>
              Preview your
              transactions
              before they are
              added.
            </p>

            <button
              className="button secondary"
              type="button"
            >
              Browse files
            </button>

            <input
              ref={fileRef}
              type="file"
              accept=".csv,text/csv"
              onChange={
                handleFile
              }
              style={{
                display:
                  "none",
              }}
            />

            {error && (
              <p
                style={{
                  color:
                    "#a83218",
                  marginTop: 12,
                }}
              >
                {error}
              </p>
            )}
          </div>
        ) : (
          <>
            <div className="import-summary">
              <div>
                <b>
                  {filename}
                </b>

                <small>
                  {
                    items.length
                  }{" "}
                  valid rows
                  detected
                </small>
              </div>

              <span className="success-text">
                <CheckCircle2
                  size={
                    16
                  }
                />
                Ready to
                import
              </span>
            </div>

            <div className="import-preview">
              <div>
                Date
              </div>

              <div>
                Description
              </div>

              <div>
                Amount
              </div>

              <div>
                Type
              </div>

              {items
                .slice(
                  0,
                  8
                )
                .map(
                  (x) => (
                    <>
                      <span
                        key={`${x.id}-d`}
                      >
                        {x.date}
                      </span>

                      <span
                        key={`${x.id}-t`}
                      >
                        {
                          x.description
                        }
                      </span>

                      <span
                        key={`${x.id}-a`}
                      >
                        {x.amount.toLocaleString()}
                      </span>

                      <span
                        key={`${x.id}-y`}
                      >
                        {x.type}
                      </span>
                    </>
                  )
                )}
            </div>

            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => {
                  setItems(
                    []
                  );
                  setFilename(
                    ""
                  );
                }}
              >
                Choose another
              </button>

              <button
                className="button primary"
                onClick={() =>
                  onImport(
                    items
                  )
                }
              >
                Import{" "}
                {
                  items.length
                }{" "}
                transaction
                {items.length ===
                1
                  ? ""
                  : "s"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
