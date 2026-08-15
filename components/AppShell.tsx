"use client";

import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
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
  LogOut,
  User,
  Image as ImageIcon,
  FileText,
} from "lucide-react";

import {
  demoTransactions,
  categories,
  customers,
  suppliers,
} from "./data";

import {
  Page,
  Transaction,
  TransactionType,
} from "./types";

type NavItem = {
  id: Page;
  label: string;
  icon: any;
};

const nav: NavItem[] = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: ReceiptText,
  },
  {
    id: "customers",
    label: "Customers",
    icon: Users,
  },
  {
    id: "suppliers",
    label: "Suppliers",
    icon: Truck,
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tags,
  },
  {
    id: "rules",
    label: "Rules",
    icon: WandSparkles,
  },
  {
    id: "insights",
    label: "Insights",
    icon: Lightbulb,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

const money = (n: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(n);

function getSession() {
  if (typeof window === "undefined") return null;

  try {
    const saved = localStorage.getItem("mc-session");
    if (!saved) return null;
    return JSON.parse(saved);
  } catch {
    return null;
  }
}

function getStorageKey(session: any) {
  if (!session?.id) return null;
  return `mc-transactions-${session.id}`;
}

export default function AppShell({
  initialPage = "dashboard",
}: {
  initialPage?: Page;
}) {
  const [page, setPage] = useState<Page>(initialPage);

  const [tx, setTx] = useState<Transaction[]>([]);

  const [addOpen, setAddOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [mobile, setMobile] = useState(false);

  const [session, setSession] = useState<any>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] =
    useState(false);

  /*
   * Authentication + user-specific transaction storage
   */
  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession) {
      window.location.replace("/login");
      return;
    }

    setSession(currentSession);

    const storageKey = getStorageKey(currentSession);

    if (storageKey) {
      const saved = localStorage.getItem(storageKey);

      if (saved) {
        try {
          setTx(JSON.parse(saved));
        } catch {
          setTx([]);
        }
      } else if (currentSession.id === "demo-user") {
        /*
         * Demo data is ONLY loaded when the user explicitly
         * selected "Continue with demo data".
         */
        setTx(demoTransactions);
      } else {
        /*
         * New accounts start empty.
         */
        setTx([]);
      }
    }

    setCheckingAuth(false);
  }, []);

  /*
   * Persist transactions separately for each account.
   */
  useEffect(() => {
    if (!session) return;

    const storageKey = getStorageKey(session);

    if (!storageKey) return;

    localStorage.setItem(
      storageKey,
      JSON.stringify(tx)
    );
  }, [tx, session]);

  const go = (p: Page) => {
    setPage(p);
    setMobile(false);
    setProfileOpen(false);
    setNotificationsOpen(false);

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

  const uncategorized = tx.filter(
    (x) => !x.category
  ).length;

  const missingReceipts = tx.filter(
    (x) => x.type === "Expense" && !x.receipt
  ).length;

  const logout = () => {
    localStorage.removeItem("mc-session");
    setSession(null);
    window.location.replace("/login");
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
        <div
          style={{
            fontSize: "14px",
            color: "#66706b",
          }}
        >
          Loading Money Clarity...
        </div>
      </main>
    );
  }

  if (!session) {
    return null;
  }

  const displayName =
    session.name ||
    "User";

  const businessName =
    session.business ||
    "My Business";

  return (
    <div className="app-layout">

      {/* SIDEBAR */}
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
            onClick={() => setMobile(false)}
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
              Small business
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
                Add categories to make
                your next insight more
                useful.
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

      {/* MAIN */}
      <main className="app-main">

        {/* HEADER */}
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

            {/* NOTIFICATIONS */}
            <div
              style={{
                position: "relative",
              }}
            >
              <button
                className="icon-btn"
                onClick={() => {
                  setNotificationsOpen(
                    !notificationsOpen
                  );
                  setProfileOpen(false);
                }}
                aria-label="Notifications"
              >
                <Bell size={18} />

                {(uncategorized +
                  missingReceipts) >
                  0 && <i />}
              </button>

              {notificationsOpen && (
                <div
                  className="header-dropdown"
                  style={{
                    position:
                      "absolute",
                    right: 0,
                    top:
                      "calc(100% + 10px)",
                    width: "300px",
                    zIndex: 100,
                    background:
                      "white",
                    border:
                      "1px solid #e5e9e6",
                    borderRadius:
                      "14px",
                    boxShadow:
                      "0 15px 40px rgba(0,0,0,.12)",
                    padding: "14px",
                  }}
                >
                  <div
                    style={{
                      display:
                        "flex",
                      justifyContent:
                        "space-between",
                      alignItems:
                        "center",
                      marginBottom:
                        "12px",
                    }}
                  >
                    <b>
                      Notifications
                    </b>

                    <button
                      onClick={() =>
                        setNotificationsOpen(
                          false
                        )
                      }
                      style={{
                        background:
                          "none",
                        border: 0,
                        cursor:
                          "pointer",
                      }}
                    >
                      <X size={16} />
                    </button>
                  </div>

                  {uncategorized >
                    0 && (
                    <div
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                        padding:
                          "10px 0",
                        borderBottom:
                          "1px solid #edf0ee",
                      }}
                    >
                      <AlertCircle
                        size={17}
                      />

                      <div>
                        <b
                          style={{
                            fontSize:
                              "13px",
                          }}
                        >
                          {
                            uncategorized
                          }{" "}
                          uncategorized
                          transactions
                        </b>

                        <p
                          style={{
                            margin:
                              "3px 0 0",
                            fontSize:
                              "12px",
                            color:
                              "#69736e",
                          }}
                        >
                          Add categories
                          to improve
                          your reports.
                        </p>
                      </div>
                    </div>
                  )}

                  {missingReceipts >
                    0 && (
                    <div
                      style={{
                        display:
                          "flex",
                        gap: "10px",
                        padding:
                          "10px 0",
                      }}
                    >
                      <ReceiptText
                        size={17}
                      />

                      <div>
                        <b
                          style={{
                            fontSize:
                              "13px",
                          }}
                        >
                          {
                            missingReceipts
                          }{" "}
                          receipts missing
                        </b>

                        <p
                          style={{
                            margin:
                              "3px 0 0",
                            fontSize:
                              "12px",
                            color:
                              "#69736e",
                          }}
                        >
                          Attach receipts
                          to your
                          expenses.
                        </p>
                      </div>
                    </div>
                  )}

                  {uncategorized ===
                    0 &&
                    missingReceipts ===
                      0 && (
                      <p
                        style={{
                          margin: 0,
                          fontSize:
                            "13px",
                          color:
                            "#69736e",
                        }}
                      >
                        You're all caught
                        up.
                      </p>
                    )}
                </div>
              )}
            </div>

            {/* PROFILE */}
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
                    !profileOpen
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

                <b>
                  {displayName}
                </b>

                <ChevronDown
                  size={14}
                />
              </button>

              {profileOpen && (
                <div
                  style={{
                    position:
                      "absolute",
                    right: 0,
                    top:
                      "calc(100% + 10px)",
                    width: "230px",
                    zIndex: 100,
                    background:
                      "white",
                    border:
                      "1px solid #e5e9e6",
                    borderRadius:
                      "14px",
                    boxShadow:
                      "0 15px 40px rgba(0,0,0,.12)",
                    padding: "8px",
                  }}
                >
                  <div
                    style={{
                      padding:
                        "10px",
                      borderBottom:
                        "1px solid #edf0ee",
                      marginBottom:
                        "5px",
                    }}
                  >
                    <b>
                      {displayName}
                    </b>

                    <small
                      style={{
                        display:
                          "block",
                        marginTop:
                          "3px",
                        color:
                          "#69736e",
                      }}
                    >
                      {session.email}
                    </small>
                  </div>

                  <button
                    onClick={() =>
                      go("settings")
                    }
                    style={{
                      width:
                        "100%",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "9px",
                      padding:
                        "10px",
                      border: 0,
                      background:
                        "transparent",
                      cursor:
                        "pointer",
                      textAlign:
                        "left",
                    }}
                  >
                    <User
                      size={16}
                    />
                    Profile & settings
                  </button>

                  <button
                    onClick={logout}
                    style={{
                      width:
                        "100%",
                      display:
                        "flex",
                      alignItems:
                        "center",
                      gap: "9px",
                      padding:
                        "10px",
                      border: 0,
                      background:
                        "transparent",
                      cursor:
                        "pointer",
                      textAlign:
                        "left",
                      color:
                        "#a83218",
                    }}
                  >
                    <LogOut
                      size={16}
                    />
                    Sign out
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <div className="page-wrap">

          {page ===
            "dashboard" && (
            <Dashboard
              tx={tx}
              revenue={revenue}
              expenses={expenses}
              net={net}
              onAdd={() =>
                setAddOpen(true)
              }
              onImport={() =>
                setImportOpen(true)
              }
            />
          )}

          {page ===
            "transactions" && (
            <Transactions
              tx={tx}
              onAdd={() =>
                setAddOpen(true)
              }
              onImport={() =>
                setImportOpen(true)
              }
              onDelete={(id) =>
                setTx((t) =>
                  t.filter(
                    (x) =>
                      x.id !== id
                  )
                )
              }
            />
          )}

          {page ===
            "customers" && (
            <EntityPage
              title="Customers"
              subtitle="See who drives your revenue."
              icon={<Users />}
              entities={
                customers
              }
              kind="revenue"
              tx={tx}
              onAdd={() => {}}
            />
          )}

          {page ===
            "suppliers" && (
            <EntityPage
              title="Suppliers"
              subtitle="Understand where your spending goes."
              icon={<Truck />}
              entities={
                suppliers
              }
              kind="spend"
              tx={tx}
              onAdd={() => {}}
            />
          )}

          {page ===
            "categories" && (
            <CategoryPage
              tx={tx}
            />
          )}

          {page ===
            "rules" && (
            <RulesPage />
          )}

          {page ===
            "insights" && (
            <InsightsPage
              tx={tx}
              revenue={revenue}
              expenses={expenses}
            />
          )}

          {page ===
            "settings" && (
            <SettingsPage
              session={session}
            />
          )}

        </div>
      </main>

      {/* MOBILE NAV */}
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
        >
          <MoreHorizontal />
          <span>More</span>
        </button>
      </div>

      {addOpen && (
        <AddTransaction
          onClose={() =>
            setAddOpen(false)
          }
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
          onClose={() =>
            setImportOpen(false)
          }
          onImport={(items) => {
            setTx((t) => [
              ...items.map(
                (x) => ({
                  ...x,
                  id: crypto.randomUUID(),
                })
              ),
              ...t,
            ]);

            setImportOpen(false);
          }}
        />
      )}

    </div>
  );
}


/* =========================================================
   DASHBOARD
========================================================= */

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
  const unc = tx.filter(
    (x) => !x.category
  ).length;

  const missing = tx.filter(
    (x) =>
      x.type === "Expense" &&
      !x.receipt
  ).length;

  return (
    <>
      <div className="title-row">

        <div>
          <h1>
            Good morning
            <span> 👋</span>
          </h1>

          <p>
            Here’s your money picture
            for this month.
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
          <button className="selected">
            This month
          </button>

          <button>
            Last month
          </button>

          <button>
            Last 3 months
          </button>
        </div>

        <button className="filter-btn">
          <SlidersHorizontal
            size={15}
          />
          Custom
        </button>

      </div>

      <div className="kpi-grid">

        {[
          [
            "REVENUE",
            revenue,
            true,
            ArrowUpRight,
          ],
          [
            "EXPENSES",
            expenses,
            false,
            ArrowUpRight,
          ],
          [
            "NET",
            net,
            net >= 0,
            ArrowUpRight,
          ],
          [
            "UNCATEGORIZED",
            unc,
            false,
            AlertCircle,
          ],
        ].map(
          ([
            label,
            value,
            positive,
            Icon,
          ]: any) => (
            <div
              className="kpi"
              key={label}
            >
              <div className="kpi-top">
                <span>
                  {label}
                </span>

                <Icon size={17} />
              </div>

              <strong>
                {label ===
                "UNCATEGORIZED"
                  ? value
                  : money(value)}
              </strong>

              <div
                className={
                  positive
                    ? "change positive"
                    : "change warning"
                }
              >
                {label ===
                "UNCATEGORIZED"
                  ? value > 0
                    ? "Action needed"
                    : "All clear"
                  : label === "NET"
                  ? value >= 0
                    ? "Positive"
                    : "Negative"
                  : "Current period"}
              </div>
            </div>
          )
        )}

      </div>

      <div className="dashboard-grid">

        <section className="panel chart-panel">

          <div className="panel-head">

            <div>
              <h3>
                Revenue vs expenses
              </h3>

              <p>
                Actual transaction
                values
              </p>
            </div>

            <span className="select">
              Last 6 months
            </span>

          </div>

          <RealLineChart tx={tx} />

        </section>

        <section className="panel action-panel">

          <div className="panel-head">

            <div>
              <h3>
                Action Needed
              </h3>

              <p>
                Things worth your
                attention
              </p>
            </div>

            <span className="count-pill">
              {unc + missing}
            </span>

          </div>

          <div className="action-list">

            {unc > 0 && (
              <Action
                icon={
                  <AlertCircle />
                }
                title={`${unc} transactions uncategorized`}
                text="Add categories to make your reports clearer."
              />
            )}

            {missing > 0 && (
              <Action
                icon={
                  <ReceiptText />
                }
                title={`${missing} receipts missing`}
                text="Attach receipts to your expenses."
              />
            )}

            {unc === 0 &&
              missing === 0 && (
                <Action
                  icon={
                    <CheckCircle2 />
                  }
                  title="Everything looks good"
                  text="No immediate actions are required."
                />
              )}

            <Action
              icon={
                <ArrowUpRight />
              }
              title="Review your spending"
              text="Use Insights to understand where your money is going."
            />

          </div>
        </section>

      </div>

      <div className="dashboard-grid lower">

        <section className="panel">

          <div className="panel-head">

            <div>
              <h3>
                Expense breakdown
              </h3>

              <p>
                Where your money went
              </p>
            </div>

            <button
              className="link-btn"
            >
              View all
            </button>

          </div>

          <ExpenseBars tx={tx} />

        </section>

        <section className="panel">

          <div className="panel-head">

            <div>
              <h3>
                Top customers
              </h3>

              <p>
                Revenue concentration
              </p>
            </div>

            <button
              className="link-btn"
            >
              View all
            </button>

          </div>

          <CustomerRows tx={tx} />

        </section>

      </div>

      <section className="recent panel">

        <div className="panel-head">

          <div>
            <h3>
              Recent transactions
            </h3>

            <p>
              Your latest money
              movements
            </p>
          </div>

          <button
            className="link-btn"
          >
            View transactions
          </button>

        </div>

        {tx.length === 0 ? (
          <EmptyTransactions />
        ) : (
          <MiniTransactions
            tx={tx.slice(0, 5)}
          />
        )}

      </section>
    </>
  );
}


/* =========================================================
   REAL GRAPH
========================================================= */

function RealLineChart({
  tx,
}: {
  tx: Transaction[];
}) {
  const months = useMemo(() => {
    const now = new Date();

    const result: {
      label: string;
      key: string;
      revenue: number;
      expenses: number;
    }[] = [];

    for (
      let i = 5;
      i >= 0;
      i--
    ) {
      const d = new Date(
        now.getFullYear(),
        now.getMonth() - i,
        1
      );

      const year =
        d.getFullYear();

      const month =
        d.getMonth();

      const key = `${year}-${String(
        month + 1
      ).padStart(2, "0")}`;

      result.push({
        label: d.toLocaleDateString(
          "en-US",
          {
            month: "short",
          }
        ),
        key,
        revenue: 0,
        expenses: 0,
      });
    }

    tx.forEach((item) => {
      const d = new Date(
        item.date
      );

      const key = `${d.getFullYear()}-${String(
        d.getMonth() + 1
      ).padStart(2, "0")}`;

      const target =
        result.find(
          (x) => x.key === key
        );

      if (!target) return;

      if (
        item.type === "Income"
      ) {
        target.revenue +=
          item.amount;
      } else {
        target.expenses +=
          item.amount;
      }
    });

    return result;
  }, [tx]);

  const maxValue = Math.max(
    ...months.map((m) =>
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
    (width - paddingX * 2) /
    Math.max(
      months.length - 1,
      1
    );

  const getY = (value: number) =>
    height -
    paddingY -
    (value / maxValue) *
      (height - paddingY * 2);

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

  const hasData = tx.length > 0;

  return (
    <div className="line-chart">

      <div className="ylabels">

        <span>
          {money(maxValue)}
        </span>

        <span>
          {money(maxValue / 2)}
        </span>

        <span>
          {money(0)}
        </span>

      </div>

      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
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
          y1={getY(maxValue)}
          x2={width}
          y2={getY(maxValue)}
          stroke="#edf0ee"
        />

        {hasData && (
          <>
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
                <g key={m.key}>

                  <circle
                    cx={
                      paddingX +
                      i *
                        xStep
                    }
                    cy={getY(
                      m.revenue
                    )}
                    r="4"
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
                    r="3"
                    fill="white"
                    stroke="#b3401f"
                    strokeWidth="2"
                  />

                </g>
              )
            )}
          </>
        )}

      </svg>

      <div className="xlabels">
        {months.map(
          (m) => (
            <span key={m.key}>
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

      {!hasData && (
        <div
          style={{
            textAlign:
              "center",
            padding:
              "12px",
            fontSize:
              "13px",
            color:
              "#69736e",
          }}
        >
          Add transactions to
          see your money movement.
        </div>
      )}

    </div>
  );
}


/* =========================================================
   ACTION
========================================================= */

function Action({
  icon,
  title,
  text,
}: {
  icon: ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="action-item">

      <span className="action-icon">
        {icon}
      </span>

      <div>
        <b>{title}</b>
        <p>{text}</p>
      </div>

      <ChevronDown size={15} />

    </div>
  );
}


/* =========================================================
   EXPENSE BARS
========================================================= */

function ExpenseBars({
  tx,
}: {
  tx: Transaction[];
}) {
  const vals = categories
    .map((c) => ({
      c,
      v: tx
        .filter(
          (x) =>
            x.type ===
              "Expense" &&
            x.category === c
        )
        .reduce(
          (a, x) =>
            a + x.amount,
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

  if (vals.length === 0) {
    return (
      <div
        style={{
          padding:
            "20px 0",
          color:
            "#69736e",
          fontSize:
            "13px",
        }}
      >
        No expense data yet.
      </div>
    );
  }

  return (
    <div className="expense-bars">

      {vals.map((x) => (
        <div
          className="expense-row"
          key={x.c}
        >
          <div>
            <b>{x.c}</b>
            <span>
              {money(x.v)}
            </span>
          </div>

          <div className="bar-track">
            <i
              style={{
                width: `${
                  (x.v / max) *
                  100
                }%`,
              }}
            />
          </div>
        </div>
      ))}

    </div>
  );
}


/* =========================================================
   CUSTOMERS
========================================================= */

function CustomerRows({
  tx,
}: {
  tx: Transaction[];
}) {
  const vals = customers
    .map((c) => ({
      c,
      v: tx
        .filter(
          (x) =>
            x.type ===
              "Income" &&
            x.customer === c
        )
        .reduce(
          (a, x) =>
            a + x.amount,
          0
        ),
    }))
    .filter(
      (x) => x.v > 0
    )
    .sort(
      (a, b) =>
        b.v - a.v
    );

  if (vals.length === 0) {
    return (
      <div
        style={{
          padding:
            "20px 0",
          color:
            "#69736e",
          fontSize:
            "13px",
        }}
      >
        No customer revenue yet.
      </div>
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
              {x.c.slice(0, 1)}
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
              {money(x.v)}
            </strong>
          </div>
        )
      )}

    </div>
  );
}


/* =========================================================
   MINI TRANSACTIONS
========================================================= */

function MiniTransactions({
  tx,
}: {
  tx: Transaction[];
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
              x.type === "Income"
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
            {x.type === "Income"
              ? "+"
              : "-"}
            {money(x.amount)}
          </strong>

        </div>
      ))}

    </div>
  );
}


function EmptyTransactions() {
  return (
    <div
      style={{
        textAlign:
          "center",
        padding:
          "35px 20px",
        color:
          "#69736e",
      }}
    >
      <ReceiptText
        size={28}
        style={{
          marginBottom:
            "10px",
        }}
      />

      <p>
        No transactions yet.
      </p>

      <small>
        Add a transaction or
        import a CSV to get
        started.
      </small>
    </div>
  );
}


/* =========================================================
   TRANSACTIONS
========================================================= */

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
  const [q, setQ] =
    useState("");

  const [type, setType] =
    useState("All");

  const filtered =
    tx.filter(
      (x) =>
        (type === "All" ||
          x.type === type) &&
        (
          `${x.description} ${
            x.customer || ""
          } ${
            x.supplier || ""
          } ${
            x.category || ""
          }`
        )
          .toLowerCase()
          .includes(
            q.toLowerCase()
          )
    );

  return (
    <>
      <div className="title-row">

        <div>
          <h1>
            Transactions
          </h1>

          <p>
            Search, filter and
            manage every money
            movement.
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

      <div className="toolbar">

        <div className="search">
          <Search size={17} />

          <input
            value={q}
            onChange={(e) =>
              setQ(
                e.target.value
              )
            }
            placeholder="Search description, customer, supplier..."
          />
        </div>

        <div className="filter-tabs">

          {[
            "All",
            "Income",
            "Expense",
          ].map((t) => (
            <button
              className={
                type === t
                  ? "selected"
                  : ""
              }
              onClick={() =>
                setType(t)
              }
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
                )
              )}
            </b>
          </span>

        </div>

        <div className="tx-table">

          <div className="tx-head">
            <span>Date</span>
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
              Actions
            </span>
          </div>

          {filtered.map((x) => (
            <div
              className="tx-row"
              key={x.id}
            >

              <span>
                {new Date(
                  x.date
                ).toLocaleDateString(
                  "en-US",
                  {
                    month:
                      "short",
                    day: "numeric",
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
                {money(x.amount)}
              </strong>

              <button
                className="more"
                onClick={() =>
                  onDelete(x.id)
                }
                title="Delete transaction"
                aria-label="Delete transaction"
              >
                <Trash2 size={15} />
              </button>

            </div>
          ))}

          {filtered.length ===
            0 && (
            <EmptyTransactions />
          )}

        </div>
      </section>
    </>
  );
}


/* =========================================================
   ENTITY PAGE
========================================================= */

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
  icon: ReactNode;
  entities: string[];
  kind: "revenue" | "spend";
  tx: Transaction[];
  onAdd: () => void;
}) {
  return (
    <>
      <div className="title-row">

        <div>

          <div className="page-icon">
            {icon}
          </div>

          <h1>{title}</h1>

          <p>{subtitle}</p>

        </div>

        <button
          className="button primary"
          onClick={onAdd}
        >
          <Plus size={17} />
          Add{" "}
          {title
            .slice(0, -1)
            .toLowerCase()}
        </button>

      </div>

      <div className="entity-grid">

        {entities.map(
          (e, i) => {
            const total =
              tx
                .filter(
                  (x) =>
                    (kind ===
                    "revenue"
                      ? x.customer
                      : x.supplier) ===
                    e
                )
                .reduce(
                  (a, x) =>
                    a + x.amount,
                  0
                );

            return (
              <div
                className="entity-card"
                key={e}
              >
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
                    {kind ===
                    "revenue"
                      ? "Revenue"
                      : "Spend"}
                  </small>

                  <strong>
                    {money(total)}
                  </strong>
                </div>

                <ArrowUpRight
                  size={17}
                />
              </div>
            );
          }
        )}

      </div>
    </>
  );
}


/* =========================================================
   CATEGORY PAGE
========================================================= */

function CategoryPage({
  tx,
}: {
  tx: Transaction[];
}) {
  return (
    <>
      <div className="title-row">

        <div>
          <h1>
            Categories
          </h1>

          <p>
            Keep spending
            organized without a
            chart of accounts.
          </p>
        </div>

        <button className="button primary">
          <Plus size={17} />
          New category
        </button>

      </div>

      <div className="category-grid">

        {categories.map((c) => {

          const total =
            tx
              .filter(
                (x) =>
                  x.category === c
              )
              .reduce(
                (a, x) =>
                  a + x.amount,
                0
              );

          return (
            <div
              className="category-card"
              key={c}
            >
              <div className="category-dot" />

              <div>
                <b>{c}</b>

                <small>
                  {
                    tx.filter(
                      (x) =>
                        x.category ===
                        c
                    ).length
                  }{" "}
                  transactions
                </small>
              </div>

              <strong>
                {money(total)}
              </strong>
            </div>
          );
        })}

      </div>
    </>
  );
}


/* =========================================================
   RULES
========================================================= */

function RulesPage() {
  const rules = [
    [
      "Fuel",
      'Description contains "fuel"',
      "Fuel",
      "Enabled",
    ],
    [
      "Adobe",
      'Description contains "adobe"',
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
            Automate repetitive
            tagging while keeping
            every match visible.
          </p>
        </div>

        <button className="button primary">
          <Plus size={17} />
          Create rule
        </button>

      </div>

      <section className="panel rules-panel">

        {rules.map((r) => (
          <div
            className="rule-row"
            key={r[0]}
          >

            <div className="rule-trigger">

              <WandSparkles
                size={17}
              />

              <b>{r[0]}</b>

              <span>
                {r[1]}
              </span>

            </div>

            <span className="chip">
              {r[2]}
            </span>

            <span className="rule-enabled">
              <i /> {r[3]}
            </span>

            <MoreHorizontal
              size={18}
            />

          </div>
        ))}

      </section>
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
}: {
  tx: Transaction[];
  revenue: number;
  expenses: number;
}) {
  const uncategorized =
    tx.filter(
      (x) => !x.category
    ).length;

  const expenseCount =
    tx.filter(
      (x) =>
        x.type === "Expense"
    ).length;

  const receiptCount =
    tx.filter(
      (x) =>
        x.type ===
          "Expense" &&
        x.receipt
    ).length;

  const expenseCategories =
    categories
      .map((category) => ({
        category,
        amount:
          tx
            .filter(
              (x) =>
                x.type ===
                  "Expense" &&
                x.category ===
                  category
            )
            .reduce(
              (a, x) =>
                a + x.amount,
              0
            ),
      }))
      .filter(
        (x) =>
          x.amount > 0
      )
      .sort(
        (a, b) =>
          b.amount -
          a.amount
      );

  const topExpense =
    expenseCategories[0]
      ?.category ||
    "No data";

  const customerRevenue =
    customers
      .map((customer) => ({
        customer,
        amount:
          tx
            .filter(
              (x) =>
                x.type ===
                  "Income" &&
                x.customer ===
                  customer
            )
            .reduce(
              (a, x) =>
                a + x.amount,
              0
            ),
      }))
      .sort(
        (a, b) =>
          b.amount -
          a.amount
      );

  const topCustomer =
    customerRevenue[0]
      ?.amount
      ? customerRevenue[0]
          .customer
      : "No data";

  return (
    <>
      <div className="title-row">

        <div>

          <div className="eyebrow">
            WHAT CHANGED
          </div>

          <h1>Insights</h1>

          <p>
            Plain-language signals
            from your transactions.
          </p>

        </div>

        <button className="button secondary">
          This month
          <ChevronDown
            size={15}
          />
        </button>

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
                expenses
            )}{" "}
            this month.
          </h2>

          <p>
            Based on the
            transactions currently
            recorded in Money
            Clarity.
          </p>
        </div>

      </div>

      <div className="insight-grid">

        <Insight
          title="Expense concentration"
          value={topExpense}
          text={
            topExpense ===
            "No data"
              ? "Add expense transactions to identify your largest category."
              : `${topExpense} is your largest tracked expense category.`
          }
        />

        <Insight
          title="Customer concentration"
          value={topCustomer}
          text={
            topCustomer ===
            "No data"
              ? "Add income transactions with customers to see revenue concentration."
              : "This customer currently contributes the largest recorded revenue."
          }
        />

        <Insight
          title="Data quality"
          value={`${uncategorized} uncategorized`}
          text="Categorize these transactions to make your breakdown more reliable."
        />

        <Insight
          title="Receipt coverage"
          value={`${receiptCount}/${expenseCount}`}
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
        <ArrowUpRight
          size={14}
        />
      </button>

    </div>
  );
}


/* =========================================================
   SETTINGS
========================================================= */

function SettingsPage({
  session,
}: {
  session: any;
}) {
  return (
    <>
      <div className="title-row">

        <div>
          <h1>
            Settings
          </h1>

          <p>
            Business profile,
            preferences and your
            data.
          </p>
        </div>

      </div>

      <div className="settings-grid">

        <section className="panel settings-panel">

          <h3>
            Business profile
          </h3>

          <p className="panel-note">
            The basics used across
            your money picture.
          </p>

          <label>
            Business name

            <input
              defaultValue={
                session?.business ||
                ""
              }
            />
          </label>

          <label>
            Your name

            <input
              defaultValue={
                session?.name ||
                ""
              }
            />
          </label>

          <label>
            Email

            <input
              defaultValue={
                session?.email ||
                ""
              }
              type="email"
              disabled
            />
          </label>

          <label>
            Currency

            <select defaultValue="USD">
              <option>
                USD — US Dollar
              </option>

              <option>
                PKR — Pakistani Rupee
              </option>

              <option>
                AUD — Australian Dollar
              </option>
            </select>
          </label>

          <label>
            Business type

            <select defaultValue="Consulting">
              <option>
                Consulting
              </option>

              <option>
                Retail
              </option>

              <option>
                Trades
              </option>

              <option>
                Services
              </option>
            </select>
          </label>

          <button className="button primary">
            Save changes
          </button>

        </section>

        <section className="panel settings-panel">

          <h3>
            Data & privacy
          </h3>

          <p className="panel-note">
            Your records should remain
            portable and traceable.
          </p>

          <button className="setting-action">

            <FileDown />

            <div>
              <b>
                Export all data
              </b>

              <small>
                Download your
                transactions as CSV.
              </small>
            </div>

            <ArrowUpRight />

          </button>

          <button className="setting-action">

            <CheckCircle2 />

            <div>
              <b>
                Security
              </b>

              <small>
                Business-scoped data
                and secure sessions.
              </small>
            </div>

            <ArrowUpRight />

          </button>

          <button
            className="setting-action danger"
          >
            <Trash2 />

            <div>
              <b>
                Delete account
              </b>

              <small>
                Permanently remove
                your workspace and
                data.
              </small>
            </div>

            <ArrowUpRight />

          </button>

        </section>

      </div>
    </>
  );
}


/* =========================================================
   ADD TRANSACTION
========================================================= */

function AddTransaction({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (
    x: Transaction
  ) => void;
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
    useState("Fuel");

  const [date, setDate] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [paymentMethod, setPaymentMethod] =
    useState(
      "Bank transfer"
    );

  const [party, setParty] =
    useState("");

  const [receipt, setReceipt] =
    useState(false);

  const [receiptMenu, setReceiptMenu] =
    useState(false);

  const [receiptName, setReceiptName] =
    useState("");

  const handleReceipt = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file =
      e.target.files?.[0];

    if (!file) return;

    setReceipt(true);
    setReceiptName(
      file.name
    );

    setReceiptMenu(false);
  };

  const save = () => {
    const numericAmount =
      Number(amount);

    if (
      !numericAmount ||
      numericAmount <= 0
    ) {
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
        category || undefined,
      paymentMethod,
      receipt,
      ...(type ===
      "Income"
        ? {
            customer:
              party ||
              undefined,
          }
        : {
            supplier:
              party ||
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
            onClick={onClose}
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
              setType("Income")
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
              setType("Expense")
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
                e.target.value
              )
            }
            inputMode="decimal"
            placeholder="$0.00"
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
                  e.target.value
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
                  e.target.value
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
                e.target.value
              )
            }
            placeholder="What was this for?"
          />
        </label>

        <div className="form-grid">

          <label>
            Category

            <select
              value={category}
              onChange={(e) =>
                setCategory(
                  e.target.value
                )
              }
            >
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
              value={party}
              onChange={(e) =>
                setParty(
                  e.target.value
                )
              }
              placeholder="Optional"
            />
          </label>

        </div>

        {/* RECEIPT UPLOAD */}

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
                !receiptMenu
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
                borderRadius:
                  "12px",
                padding:
                  "6px",
                boxShadow:
                  "0 12px 30px rgba(0,0,0,.12)",
                zIndex: 20,
              }}
            >

              {/* CAMERA */}
              <label
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  padding:
                    "11px",
                  cursor:
                    "pointer",
                  borderRadius:
                    "8px",
                }}
              >
                <Camera
                  size={18}
                />

                <span>
                  Take photo
                </span>

                <input
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
              </label>

              {/* GALLERY */}
              <label
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  padding:
                    "11px",
                  cursor:
                    "pointer",
                  borderRadius:
                    "8px",
                }}
              >
                <ImageIcon
                  size={18}
                />

                <span>
                  Choose from gallery
                </span>

                <input
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
              </label>

              {/* FILES */}
              <label
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  padding:
                    "11px",
                  cursor:
                    "pointer",
                  borderRadius:
                    "8px",
                }}
              >
                <FileText
                  size={18}
                />

                <span>
                  Choose file
                </span>

                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={
                    handleReceipt
                  }
                  style={{
                    display:
                      "none",
                  }}
                />
              </label>

            </div>
          )}

        </div>

        <div className="modal-actions">

          <button
            className="button secondary"
            onClick={onClose}
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


/* =========================================================
   CSV IMPORT
========================================================= */

function ImportModal({
  onClose,
  onImport,
}: {
  onClose: () => void;
  onImport: (
    x: Transaction[]
  ) => void;
}) {
  const [step, setStep] =
    useState(1);

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
            onClick={onClose}
          >
            <X />
          </button>

        </div>

        <div className="import-steps">

          <span
            className={
              step >= 1
                ? "active"
                : ""
            }
          >
            1 Upload
          </span>

          <span
            className={
              step >= 2
                ? "active"
                : ""
            }
          >
            2 Preview
          </span>

          <span
            className={
              step >= 3
                ? "active"
                : ""
            }
          >
            3 Commit
          </span>

        </div>

        {step === 1 ? (
          <div
            className="dropzone"
            onClick={() =>
              setStep(2)
            }
          >
            <Upload
              size={28}
            />

            <h3>
              Drop a CSV here
            </h3>

            <p>
              or click to browse ·
              max 10 MB
            </p>

            <button className="button secondary">
              Choose file
            </button>
          </div>
        ) : step === 2 ? (
          <>
            <div className="import-summary">

              <div>
                <b>
                  August
                  transactions.csv
                </b>

                <small>
                  12 rows detected
                </small>
              </div>

              <span className="success-text">
                <CheckCircle2
                  size={16}
                />
                10 valid · 2
                duplicates
              </span>

            </div>

            <div className="import-preview">

              <div>Date</div>
              <div>
                Description
              </div>
              <div>
                Amount
              </div>
              <div>
                Status
              </div>

              <span>
                Aug 14
              </span>

              <span>
                Website payment
              </span>

              <span>
                $2,800
              </span>

              <span className="success-text">
                Ready
              </span>

              <span>
                Aug 13
              </span>

              <span>
                Fuel — Shell
              </span>

              <span>
                $185
              </span>

              <span className="warning-text">
                Duplicate
              </span>

              <span>
                Aug 12
              </span>

              <span>
                Materials
              </span>

              <span>
                $950
              </span>

              <span className="success-text">
                Ready
              </span>

            </div>

            <div className="modal-actions">

              <button
                className="button secondary"
                onClick={() =>
                  setStep(1)
                }
              >
                Back
              </button>

              <button
                className="button primary"
                onClick={() =>
                  setStep(3)
                }
              >
                Review import
              </button>

            </div>
          </>
        ) : (
          <>
            <div className="commit-card">

              <CheckCircle2
                size={30}
              />

              <h3>
                Ready to import
              </h3>

              <p>
                10 rows will be
                added. 2 obvious
                duplicates will be
                skipped.
              </p>

            </div>

            <div className="modal-actions">

              <button
                className="button secondary"
                onClick={() =>
                  setStep(2)
                }
              >
                Back
              </button>

              <button
                className="button primary"
                onClick={() =>
                  onImport([
                    {
                      id: "",
                      date: new Date()
                        .toISOString()
                        .slice(
                          0,
                          10
                        ),
                      amount: 1250,
                      type: "Income",
                      description:
                        "Imported client payment",
                      customer:
                        "Imported Customer",
                      category:
                        "Consulting",
                      paymentMethod:
                        "Bank transfer",
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
