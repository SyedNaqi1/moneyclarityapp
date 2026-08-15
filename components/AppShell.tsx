"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  ReceiptText,
  Users,
  Truck,
  Tags,
  WandSparkles,
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
} from "lucide-react";

import { demoTransactions, categories, customers, suppliers } from "./data";
import { Page, Transaction, TransactionType } from "./types";

const nav: { id: Page; label: string; icon: any }[] = [
  ["dashboard", "Dashboard", LayoutDashboard],
  ["transactions", "Transactions", ReceiptText],
  ["customers", "Customers", Users],
  ["suppliers", "Suppliers", Truck],
  ["categories", "Categories", Tags],
  ["rules", "Rules", WandSparkles],
  ["insights", "Insights", Lightbulb],
  ["settings", "Settings", Settings],
];

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

export default function AppShell({
  initialPage = "dashboard",
}: {
  initialPage?: Page;
}) {
  const [page, setPage] = useState<Page>(initialPage);
  const [tx, setTx] = useState<Transaction[]>(demoTransactions);
  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("mc-transactions");

    if (saved) {
      try {
        setTx(JSON.parse(saved));
      } catch {
        console.error("Unable to load saved transactions.");
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("mc-transactions", JSON.stringify(tx));
  }, [tx]);

  const go = (p: Page) => {
    setPage(p);
    setMobile(false);

    window.history.replaceState(
      {},
      "",
      p === "dashboard" ? "/dashboard" : `/${p}`
    );
  };

  const revenue = useMemo(
    () =>
      tx
        .filter((x) => x.type === "Income")
        .reduce((a, x) => a + x.amount, 0),
    [tx]
  );

  const expenses = useMemo(
    () =>
      tx
        .filter((x) => x.type === "Expense")
        .reduce((a, x) => a + x.amount, 0),
    [tx]
  );

  const net = revenue - expenses;

  return (
    <div className="app-layout">
      <aside className={`sidebar ${mobile ? "mobile-open" : ""}`}>
        <div className="side-brand">
          <Link href="/dashboard" className="brand">
            <span className="brand-mark">M</span>
            <span>
              Money <b>Clarity</b>
            </span>
          </Link>

          <button
            onClick={() => setMobile(false)}
            className="close-side"
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        <div className="business-switch">
          <div className="business-avatar">A</div>

          <div>
            <b>Acme Services</b>
            <small>Small business</small>
          </div>

          <ChevronDown size={15} />
        </div>

        <nav>
          {nav.map(([id, label, Icon]) => (
            <button
              className={page === id ? "active" : ""}
              onClick={() => go(id)}
              key={id}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="help-card">
            <Sparkles size={17} />

            <div>
              <b>Clarity tip</b>
              <p>
                Add categories to make your next insight more useful.
              </p>
            </div>
          </div>

          <button onClick={() => go("settings")}>
            <Settings size={17} />
            Settings
          </button>
        </div>
      </aside>

      <main className="app-main">
        <header className="app-header">
          <button
            className="mobile-trigger"
            onClick={() => setMobile(true)}
            aria-label="Open menu"
          >
            <Menu />
          </button>

          <div>
            <div className="crumb">
              Acme Services /{" "}
              <b>{nav.find((x) => x[0] === page)?.[1]}</b>
            </div>
          </div>

          <div className="header-actions">
            <button className="icon-btn" aria-label="Notifications">
              <Bell size={18} />
              <i />
            </button>

            <button className="profile">
              <span>NA</span>
              <b>Naqi</b>
              <ChevronDown size={14} />
            </button>
          </div>
        </header>

        <div className="page-wrap">
          {page === "dashboard" && (
            <Dashboard
              tx={tx}
              revenue={revenue}
              expenses={expenses}
              net={net}
              onAdd={() => setAddOpen(true)}
              onImport={() => setImportOpen(true)}
            />
          )}

          {page === "transactions" && (
            <Transactions
              tx={tx}
              onAdd={() => setAddOpen(true)}
              onImport={() => setImportOpen(true)}
              onDelete={(id) =>
                setTx((t) => t.filter((x) => x.id !== id))
              }
            />
          )}

          {page === "customers" && (
            <EntityPage
              title="Customers"
              subtitle="See who drives your revenue."
              icon={<Users />}
              entities={customers}
              kind="revenue"
              tx={tx}
              onAdd={() => {}}
            />
          )}

          {page === "suppliers" && (
            <EntityPage
              title="Suppliers"
              subtitle="Understand where your spending goes."
              icon={<Truck />}
              entities={suppliers}
              kind="spend"
              tx={tx}
              onAdd={() => {}}
            />
          )}

          {page === "categories" && <CategoryPage tx={tx} />}

          {page === "rules" && <RulesPage />}

          {page === "insights" && (
            <InsightsPage
              tx={tx}
              revenue={revenue}
              expenses={expenses}
            />
          )}

          {page === "settings" && <SettingsPage />}
        </div>
      </main>

      <div className="mobile-bottom">
        {nav.slice(0, 2).map(([id, label, Icon]) => (
          <button
            key={id}
            className={page === id ? "active" : ""}
            onClick={() => go(id)}
          >
            <Icon />
            <span>{label}</span>
          </button>
        ))}

        <button
          onClick={() => setAddOpen(true)}
          className="mobile-add"
          aria-label="Add transaction"
        >
          <Plus />
        </button>

        <button
          onClick={() => go("insights")}
          className={page === "insights" ? "active" : ""}
        >
          <Lightbulb />
          <span>Insights</span>
        </button>

        <button onClick={() => go("settings")}>
          <MoreHorizontal />
          <span>More</span>
        </button>
      </div>

      {addOpen && (
        <AddTransaction
          onClose={() => setAddOpen(false)}
          onSave={(x) => {
            setTx((t) => [
              {
                ...x,
                id: crypto.randomUUID(),
              },
              ...t,
            ]);

            setAddOpen(false);
          }}
        />
      )}

      {importOpen && (
        <ImportModal
          onClose={() => setImportOpen(false)}
          onImport={(items) => {
            setTx((t) => [
              ...items.map((x) => ({
                ...x,
                id: crypto.randomUUID(),
              })),
              ...t,
            ]);

            setImportOpen(false);
          }}
        />
      )}
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard({
  tx,
  revenue,
  expenses,
  net,
  onAdd,
  onImport,
}: {
  tx: Transaction[];
  revenue: number;
  expenses: number;
  net: number;
  onAdd: () => void;
  onImport: () => void;
}) {
  const unc = tx.filter((x) => !x.category).length;

  const missing = tx.filter(
    (x) => x.type === "Expense" && !x.receipt
  ).length;

  const kpis = [
    ["REVENUE", revenue, "+8.4%", true, ArrowUpRight],
    ["EXPENSES", expenses, "+3.2%", false, ArrowUpRight],
    ["NET", net, "+17.8%", true, ArrowUpRight],
    ["UNCATEGORIZED", unc, "Action needed", false, AlertCircle],
  ];

  return (
    <>
      <div className="title-row">
        <div>
          <h1>
            Good morning, Naqi <span>👋</span>
          </h1>

          <p>Here’s your money picture for August.</p>
        </div>

        <div className="row-actions">
          <button className="button secondary" onClick={onImport}>
            <Upload size={16} />
            Import CSV
          </button>

          <button className="button primary" onClick={onAdd}>
            <Plus size={17} />
            Add transaction
          </button>
        </div>
      </div>

      <div className="period-row">
        <div className="period-tabs">
          <button className="selected">This month</button>
          <button>Last month</button>
          <button>Last 3 months</button>
        </div>

        <button className="filter-btn">
          <SlidersHorizontal size={15} />
          Custom
        </button>
      </div>

      <div className="kpi-grid">
        {kpis.map(([label, val, change, pos, Icon]: any) => (
          <div className="kpi" key={label}>
            <div className="kpi-top">
              <span>{label}</span>
              <Icon size={17} />
            </div>

            <strong>
              {typeof val === "number" &&
              label !== "UNCATEGORIZED"
                ? money(val)
                : val}
            </strong>

            <div
              className={
                pos ? "change positive" : "change warning"
              }
            >
              {change}
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <section className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Revenue vs expenses</h3>
              <p>Monthly movement</p>
            </div>

            <button className="select">
              Last 6 months
              <ChevronDown size={14} />
            </button>
          </div>

          <LineChart />
        </section>

        <section className="panel action-panel">
          <div className="panel-head">
            <div>
              <h3>Action Needed</h3>
              <p>Things worth your attention</p>
            </div>

            <span className="count-pill">{unc + missing}</span>
          </div>

          <div className="action-list">
            <Action
              icon={<AlertCircle />}
              title={`${unc} transactions uncategorized`}
              text="Add categories to make your reports clearer."
            />

            <Action
              icon={<ArrowUpRight />}
              title="Fuel spending up 18%"
              text="Compared with the previous month."
            />

            <Action
              icon={<ReceiptText />}
              title={`${missing} receipts missing`}
              text="Attach receipts before tax time."
            />

            <Action
              icon={<CheckCircle2 />}
              title="CSV imports look healthy"
              text="No obvious duplicate batches detected."
            />
          </div>
        </section>
      </div>

      <div className="dashboard-grid lower">
        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Expense breakdown</h3>
              <p>Where your money went</p>
            </div>

            <button className="link-btn">View all</button>
          </div>

          <ExpenseBars tx={tx} />
        </section>

        <section className="panel">
          <div className="panel-head">
            <div>
              <h3>Top customers</h3>
              <p>Revenue concentration</p>
            </div>

            <button className="link-btn">View all</button>
          </div>

          <CustomerRows tx={tx} />
        </section>
      </div>

      <section className="recent panel">
        <div className="panel-head">
          <div>
            <h3>Recent transactions</h3>
            <p>Your latest money movements</p>
          </div>

          <button className="link-btn">View transactions</button>
        </div>

        <MiniTransactions tx={tx.slice(0, 5)} />
      </section>
    </>
  );
}

function Action({
  icon,
  title,
  text,
}: {
  icon: any;
  title: string;
  text: string;
}) {
  return (
    <div className="action-item">
      <span className="action-icon">{icon}</span>

      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>

      <ChevronDown size={15} />
    </div>
  );
}

function LineChart() {
  return (
    <div className="line-chart">
      <div className="ylabels">
        <span>$15k</span>
        <span>$10k</span>
        <span>$5k</span>
        <span>$0</span>
      </div>

      <svg
        viewBox="0 0 600 210"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="fill"
            x1="0"
            x2="0"
            y1="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="#1c8c7c"
              stopOpacity=".22"
            />

            <stop
              offset="100%"
              stopColor="#1c8c7c"
              stopOpacity="0"
            />
          </linearGradient>
        </defs>

        <path
          d="M0 150 C60 140 80 112 125 122 S200 88 250 105 S315 62 360 76 S420 94 465 60 S530 75 600 32 L600 210 L0 210Z"
          fill="url(#fill)"
        />

        <path
          d="M0 150 C60 140 80 112 125 122 S200 88 250 105 S315 62 360 76 S420 94 465 60 S530 75 600 32"
          fill="none"
          stroke="#1c8c7c"
          strokeWidth="3"
        />

        <path
          d="M0 175 C70 160 90 154 125 160 S200 140 250 155 S320 130 360 142 S420 126 465 138 S530 125 600 118"
          fill="none"
          stroke="#b3401f"
          strokeWidth="2"
          strokeDasharray="5 6"
        />
      </svg>

      <div className="xlabels">
        <span>Mar</span>
        <span>Apr</span>
        <span>May</span>
        <span>Jun</span>
        <span>Jul</span>
        <span>Aug</span>
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
    </div>
  );
}

function ExpenseBars({ tx }: { tx: Transaction[] }) {
  const vals = categories
    .map((c) => ({
      c,
      v: tx
        .filter(
          (x) => x.type === "Expense" && x.category === c
        )
        .reduce((a, x) => a + x.amount, 0),
    }))
    .filter((x) => x.v)
    .sort((a, b) => b.v - a.v)
    .slice(0, 5);

  const max = vals[0]?.v || 1;

  return (
    <div className="expense-bars">
      {vals.map((x) => (
        <div className="expense-row" key={x.c}>
          <div>
            <b>{x.c}</b>
            <span>{money(x.v)}</span>
          </div>

          <div className="bar-track">
            <i
              style={{
                width: `${(x.v / max) * 100}%`,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function CustomerRows({ tx }: { tx: Transaction[] }) {
  const vals = customers
    .map((c) => ({
      c,
      v: tx
        .filter(
          (x) => x.type === "Income" && x.customer === c
        )
        .reduce((a, x) => a + x.amount, 0),
    }))
    .filter((x) => x.v)
    .sort((a, b) => b.v - a.v);

  return (
    <div className="customer-rows">
      {vals.map((x, i) => (
        <div className="customer-row" key={x.c}>
          <span className="avatar">{x.c.slice(0, 1)}</span>

          <div>
            <b>{x.c}</b>
            <small>
              {i === 0
                ? "Top customer"
                : "Revenue contributor"}
            </small>
          </div>

          <strong>{money(x.v)}</strong>
        </div>
      ))}
    </div>
  );
}

function MiniTransactions({
  tx,
}: {
  tx: Transaction[];
}) {
  return (
    <div className="mini-transactions">
      {tx.map((x) => (
        <div className="mini-tx" key={x.id}>
          <span
            className={
              x.type === "Income"
                ? "tx-icon income"
                : "tx-icon expense"
            }
          >
            {x.type === "Income" ? (
              <ArrowDownRight />
            ) : (
              <ArrowUpRight />
            )}
          </span>

          <div>
            <b>{x.description}</b>
            <small>
              {x.date} · {x.category || "Uncategorized"}
            </small>
          </div>

          <strong
            className={
              x.type === "Income"
                ? "amount-income"
                : "amount-expense"
            }
          >
            {x.type === "Income" ? "+" : "-"}
            {money(x.amount)}
          </strong>
        </div>
      ))}
    </div>
  );
}

/* =========================
   TRANSACTIONS
========================= */

function Transactions({
  tx,
  onAdd,
  onImport,
  onDelete,
}: {
  tx: Transaction[];
  onAdd: () => void;
  onImport: () => void;
  onDelete: (id: string) => void;
}) {
  const [q, setQ] = useState("");
  const [type, setType] = useState("All");

  const filtered = tx.filter(
    (x) =>
      (type === "All" || x.type === type) &&
      `${x.description} ${x.customer || ""} ${
        x.supplier || ""
      } ${x.category || ""}`
        .toLowerCase()
        .includes(q.toLowerCase())
  );

  return (
    <>
      <div className="title-row">
        <div>
          <h1>Transactions</h1>
          <p>
            Search, filter and manage every money movement.
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

          <button className="button primary" onClick={onAdd}>
            <Plus size={17} />
            Add transaction
          </button>
        </div>
      </div>

      <div className="toolbar">
        <div className="search">
          <Search size={17} />

          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search description, customer, supplier..."
          />
        </div>

        <div className="filter-tabs">
          {["All", "Income", "Expense"].map((t) => (
            <button
              className={type === t ? "selected" : ""}
              onClick={() => setType(t)}
              key={t}
            >
              {t}
            </button>
          ))}
        </div>

        <button className="button ghost">
          <FileDown size={16} />
          Export CSV
        </button>
      </div>

      <section className="panel table-panel">
        <div className="table-summary">
          <span>{filtered.length} transactions</span>

          <span>
            Filtered total:{" "}
            <b>
              {money(
                filtered.reduce(
                  (a, x) =>
                    a +
                    (x.type === "Income"
                      ? x.amount
                      : -x.amount),
                  0
                )
              )}
            </b>
          </span>
        </div>

        <div className="tx-table">
          <div className="tx-head">
            <span>Date</span>
            <span>Description</span>
            <span>Category</span>
            <span>Method</span>
            <span>Amount</span>
            <span />
          </div>

          {filtered.map((x) => (
            <div className="tx-row" key={x.id}>
              <span>
                {new Date(x.date).toLocaleDateString(
                  "en-US",
                  {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  }
                )}
              </span>

              <div>
                <b>{x.description}</b>
                <small>
                  {x.customer || x.supplier || "—"}
                </small>
              </div>

              <span
                className={
                  x.category ? "chip" : "chip muted"
                }
              >
                {x.category || "Uncategorized"}
              </span>

              <span>{x.paymentMethod || "—"}</span>

              <strong
                className={
                  x.type === "Income"
                    ? "amount-income"
                    : "amount-expense"
                }
              >
                {x.type === "Income" ? "+" : "-"}
                {money(x.amount)}
              </strong>

              <button
                className="more"
                onClick={() => onDelete(x.id)}
                title="Delete"
                aria-label="Delete transaction"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

/* =========================
   CUSTOMERS / SUPPLIERS
========================= */

function EntityPage({
  title,
  subtitle,
  icon,
  entities,
  kind,
  tx,
  onAdd,
}: {
  title: string;
  subtitle: string;
  icon: any;
  entities: string[];
  kind: "revenue" | "spend";
  tx: Transaction[];
  onAdd: () => void;
}) {
  return (
    <>
      <div className="title-row">
        <div>
          <div className="page-icon">{icon}</div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>

        <button className="button primary" onClick={onAdd}>
          <Plus size={17} />
          Add {title.slice(0, -1).toLowerCase()}
        </button>
      </div>

      <div className="entity-grid">
        {entities.map((e, i) => {
          const total = tx
            .filter(
              (x) =>
                (kind === "revenue"
                  ? x.customer
                  : x.supplier) === e
            )
            .reduce((a, x) => a + x.amount, 0);

          return (
            <div className="entity-card" key={e}>
              <div className="entity-avatar">
                {e.slice(0, 1)}
              </div>

              <div className="entity-main">
                <b>{e}</b>
                <small>
                  {i === 0
                    ? "Most active"
                    : "Business partner"}
                </small>
              </div>

              <div className="entity-total">
                <small>
                  {kind === "revenue"
                    ? "Revenue"
                    : "Spend"}
                </small>

                <strong>{money(total)}</strong>
              </div>

              <ArrowUpRight size={17} />
            </div>
          );
        })}
      </div>
    </>
  );
}

/* =========================
   CATEGORIES
========================= */

function CategoryPage({ tx }: { tx: Transaction[] }) {
  return (
    <>
      <div className="title-row">
        <div>
          <h1>Categories</h1>
          <p>
            Keep spending organized without a chart of accounts.
          </p>
        </div>

        <button className="button primary">
          <Plus size={17} />
          New category
        </button>
      </div>

      <div className="category-grid">
        {categories.map((c) => {
          const total = tx
            .filter((x) => x.category === c)
            .reduce((a, x) => a + x.amount, 0);

          return (
            <div className="category-card" key={c}>
              <div className="category-dot" />

              <div>
                <b>{c}</b>
                <small>
                  {tx.filter((x) => x.category === c).length}{" "}
                  transactions
                </small>
              </div>

              <strong>{money(total)}</strong>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* =========================
   RULES
========================= */

function RulesPage() {
  const rules = [
    [
      "Fuel",
      "Description contains “fuel”",
      "Fuel",
      "Enabled",
    ],
    [
      "Adobe",
      "Description contains “adobe”",
      "Software",
      "Enabled",
    ],
    [
      "Metro Tools",
      "Supplier equals Metro Tools",
      "Tools",
      "Enabled",
    ],
  ];

  return (
    <>
      <div className="title-row">
        <div>
          <h1>Rules</h1>
          <p>
            Automate repetitive tagging while keeping every
            match visible.
          </p>
        </div>

        <button className="button primary">
          <Plus size={17} />
          Create rule
        </button>
      </div>

      <section className="panel rules-panel">
        {rules.map((r) => (
          <div className="rule-row" key={r[0]}>
            <div className="rule-trigger">
              <WandSparkles size={17} />
              <b>{r[0]}</b>
              <span>{r[1]}</span>
            </div>

            <span className="chip">{r[2]}</span>

            <span className="rule-enabled">
              <i /> {r[3]}
            </span>

            <MoreHorizontal size={18} />
          </div>
        ))}
      </section>
    </>
  );
}

/* =========================
   INSIGHTS
========================= */

function InsightsPage({
  tx,
  revenue,
  expenses,
}: {
  tx: Transaction[];
  revenue: number;
  expenses: number;
}) {
  return (
    <>
      <div className="title-row">
        <div>
          <div className="eyebrow">WHAT CHANGED</div>
          <h1>Insights</h1>
          <p>
            Plain-language signals from your transactions.
          </p>
        </div>

        <button className="button secondary">
          This month
          <ChevronDown size={15} />
        </button>
      </div>

      <div className="insight-hero">
        <div className="insight-spark">
          <Sparkles />
        </div>

        <div>
          <h2>
            Your net is {money(revenue - expenses)} this
            month.
          </h2>

          <p>
            Revenue is <b>8.4% higher</b> while expenses are
            up <b>3.2%</b>. Your business is generating more
            money than the previous period.
          </p>
        </div>
      </div>

      <div className="insight-grid">
        <Insight
          title="Expense concentration"
          value="Fuel"
          text="Fuel is your largest tracked expense category this month."
        />

        <Insight
          title="Customer concentration"
          value="Northstar Studio"
          text="Your top customer contributes the largest share of recorded revenue."
        />

        <Insight
          title="Data quality"
          value={`${tx.filter((x) => !x.category).length} uncategorized`}
          text="Categorize these transactions to make your breakdown more reliable."
        />

        <Insight
          title="Receipt coverage"
          value={`${tx.filter((x) => x.receipt).length}/${
            tx.filter((x) => x.type === "Expense").length
          }`}
          text="Recorded expenses with an attached receipt."
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
      <small>{title}</small>
      <h3>{value}</h3>
      <p>{text}</p>

      <button className="link-btn">
        Explore
        <ArrowUpRight size={14} />
      </button>
    </div>
  );
}

/* =========================
   SETTINGS
========================= */

function SettingsPage() {
  return (
    <>
      <div className="title-row">
        <div>
          <h1>Settings</h1>
          <p>
            Business profile, preferences and your data.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel settings-panel">
          <h3>Business profile</h3>

          <p className="panel-note">
            The basics used across your money picture.
          </p>

          <label>
            Business name
            <input defaultValue="Acme Services" />
          </label>

          <label>
            Currency
            <select defaultValue="USD">
              <option>USD — US Dollar</option>
              <option>PKR — Pakistani Rupee</option>
              <option>AUD — Australian Dollar</option>
            </select>
          </label>

          <label>
            Business type
            <select defaultValue="Consulting">
              <option>Consulting</option>
              <option>Retail</option>
              <option>Trades</option>
              <option>Services</option>
            </select>
          </label>

          <button className="button primary">
            Save changes
          </button>
        </section>

        <section className="panel settings-panel">
          <h3>Data & privacy</h3>

          <p className="panel-note">
            Your records should remain portable and traceable.
          </p>

          <button className="setting-action">
            <FileDown />

            <div>
              <b>Export all data</b>
              <small>
                Download your transactions as CSV.
              </small>
            </div>

            <ArrowUpRight />
          </button>

          <button className="setting-action">
            <Shield />

            <div>
              <b>Security</b>
              <small>
                Business-scoped data and secure sessions.
              </small>
            </div>

            <ArrowUpRight />
          </button>

          <button className="setting-action danger">
            <Trash2 />

            <div>
              <b>Delete account</b>
              <small>
                Permanently remove your workspace and data.
              </small>
            </div>

            <ArrowUpRight />
          </button>
        </section>
      </div>
    </>
  );
}

function Shield() {
  return <CheckCircle2 />;
}

/* =========================
   ADD TRANSACTION
========================= */

function AddTransaction({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (x: Transaction) => void;
}) {
  const [type, setType] =
    useState<TransactionType>("Expense");

  const [amount, setAmount] = useState("");
  const [desc, setDesc] = useState("");
  const [category, setCategory] = useState("Fuel");

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">QUICK ENTRY</span>
            <h2>Add transaction</h2>
          </div>

          <button onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <div className="type-toggle">
          <button
            className={
              type === "Income" ? "active income" : ""
            }
            onClick={() => setType("Income")}
          >
            Income
          </button>

          <button
            className={
              type === "Expense" ? "active expense" : ""
            }
            onClick={() => setType("Expense")}
          >
            Expense
          </button>
        </div>

        <label>
          Amount
          <input
            autoFocus
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            inputMode="decimal"
            placeholder="$0.00"
          />
        </label>

        <div className="form-grid">
          <label>
            Date
            <input
              type="date"
              defaultValue="2026-08-15"
            />
          </label>

          <label>
            Payment method
            <select defaultValue="Bank transfer">
              <option>Bank transfer</option>
              <option>Card</option>
              <option>Cash</option>
              <option>Other</option>
            </select>
          </label>
        </div>

        <label>
          Description
          <input
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="What was this for?"
          />
        </label>

        <div className="form-grid">
          <label>
            Category
            <select
              value={category}
              onChange={(e) =>
                setCategory(e.target.value)
              }
            >
              {categories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>

          <label>
            {type === "Income" ? "Customer" : "Supplier"}
            <input placeholder="Optional" />
          </label>
        </div>

        <button className="receipt-upload">
          <Camera size={18} />

          <span>
            <b>Attach receipt</b>
            <small>Photo or PDF · optional</small>
          </span>
        </button>

        <div className="modal-actions">
          <button
            className="button secondary"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="button primary"
            onClick={() =>
              onSave({
                id: "",
                date: "2026-08-15",
                amount: Number(amount) || 0,
                type,
                description:
                  desc || "Untitled transaction",
                category,
              })
            }
          >
            Save transaction
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================
   IMPORT CSV
========================= */

function ImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (x: Transaction[]) => void;
}) {
  const [step, setStep] = useState(1);

  return (
    <div className="modal-backdrop">
      <div className="modal import-modal">
        <div className="modal-head">
          <div>
            <span className="eyebrow">SAFE IMPORT</span>
            <h2>Import CSV</h2>
          </div>

          <button onClick={onClose} aria-label="Close">
            <X />
          </button>
        </div>

        <div className="import-steps">
          <span className={step >= 1 ? "active" : ""}>
            1 Upload
          </span>

          <span className={step >= 2 ? "active" : ""}>
            2 Preview
          </span>

          <span className={step >= 3 ? "active" : ""}>
            3 Commit
          </span>
        </div>

        {step === 1 ? (
          <div
            className="dropzone"
            onClick={() => setStep(2)}
          >
            <Upload size={28} />

            <h3>Drop a CSV here</h3>

            <p>or click to browse · max 10 MB</p>

            <button className="button secondary">
              Choose file
            </button>
          </div>
        ) : step === 2 ? (
          <>
            <div className="import-summary">
              <div>
                <b>August transactions.csv</b>
                <small>12 rows detected</small>
              </div>

              <span className="success-text">
                <CheckCircle2 size={16} />
                10 valid · 2 duplicates
              </span>
            </div>

            <div className="import-preview">
              <div>Date</div>
              <div>Description</div>
              <div>Amount</div>
              <div>Status</div>

              <span>Aug 14</span>
              <span>Website payment</span>
              <span>$2,800</span>
              <span className="success-text">
                Ready
              </span>

              <span>Aug 13</span>
              <span>Fuel — Shell</span>
              <span>$185</span>
              <span className="warning-text">
                Duplicate
              </span>

              <span>Aug 12</span>
              <span>Materials</span>
              <span>$950</span>
              <span className="success-text">
                Ready
              </span>
            </div>

            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setStep(1)}
              >
                Back
              </button>

              <button
                className="button primary"
                onClick={() => setStep(3)}
              >
                Review import
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="commit-card">
              <CheckCircle2 size={30} />

              <h3>Ready to import</h3>

              <p>
                10 rows will be added. 2 obvious duplicates
                will be skipped. The batch can be reversed
                later.
              </p>
            </div>

            <div className="modal-actions">
              <button
                className="button secondary"
                onClick={() => setStep(2)}
              >
                Back
              </button>

              <button
                className="button primary"
                onClick={() =>
                  onImport([
                    {
                      id: "",
                      date: "2026-08-15",
                      amount: 1250,
                      type: "Income",
                      description:
                        "Imported client payment",
                      customer: "Imported Customer",
                      category: "Consulting",
                      paymentMethod: "Bank transfer",
                    },
                  ])
                }
              >
                Commit import
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
