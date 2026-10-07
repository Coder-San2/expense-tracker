import { useState, useEffect } from "react";

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    try {
      const saved = localStorage.getItem("expense_data");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [type, setType] = useState("expense");
  const [category, setCategory] = useState("Food");
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    localStorage.setItem("expense_data", JSON.stringify(transactions));
  }, [transactions]);

  const getCategoryIcon = (cat) => {
    switch (cat) {
      case "Food":
        return "🍔";
      case "Travel":
        return "🚗";
      case "Bills":
        return "💡";
      case "Salary":
        return "💼";
      case "Shopping":
        return "🛍️";
      default:
        return "📌";
    }
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim() || !amount || parseFloat(amount) <= 0) {
      alert("Krupa karun valid Title ani Amount taka!");
      return;
    }

    const newTx = {
      id: Date.now(),
      title: title.trim(),
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      }),
    };

    setTransactions((prev) => [newTx, ...prev]);
    setTitle("");
    setAmount("");
  };

  const handleDelete = (id) => {
    setTransactions((prev) => prev.filter((tx) => tx.id !== id));
  };

  const handleClearAll = () => {
    if (window.confirm("Sagli history delete karaychi aahe ka?")) {
      setTransactions([]);
    }
  };

  const exportToCSV = () => {
    if (transactions.length === 0) {
      alert("Download karayche data nahi aahe!");
      return;
    }

    const headers = "Title,Amount,Type,Category,Date\n";
    const rows = transactions
      .map((t) => `${t.title},${t.amount},${t.type},${t.category},${t.date}`)
      .join("\n");

    const blob = new Blob([headers + rows], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "Expense_Report.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const totalIncome = transactions
    .filter((tx) => tx.type === "income")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalExpense = transactions
    .filter((tx) => tx.type === "expense")
    .reduce((acc, tx) => acc + tx.amount, 0);

  const totalBalance = totalIncome - totalExpense;

  const expensePercentage =
    totalIncome > 0
      ? Math.min(Math.round((totalExpense / totalIncome) * 100), 100)
      : 0;

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch = tx.title.toLowerCase().includes(searchTerm.toLowerCase());
    if (filter === "income") return matchesSearch && tx.type === "income";
    if (filter === "expense") return matchesSearch && tx.type === "expense";
    return matchesSearch;
  });

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <header style={styles.header}>
          <h2 style={{ margin: 0 }}>Smart Expense Tracker</h2>
          <p style={{ margin: "4px 0 0", opacity: 0.8, fontSize: "14px" }}>
            Manage income & expenses cleanly
          </p>
          <button onClick={exportToCSV} style={styles.exportBtn}>
            Export CSV
          </button>
        </header>

        <div style={styles.balanceContainer}>
          <span style={{ fontSize: "14px", textTransform: "uppercase", letterSpacing: "1px", opacity: 0.9 }}>
            Current Balance
          </span>
          <h1 style={{ margin: "6px 0 15px", fontSize: "32px" }}>
            ₹{totalBalance.toLocaleString("en-IN")}
          </h1>

          <div style={styles.statsGrid}>
            <div style={{ ...styles.statBox, borderLeft: "4px solid #10b981" }}>
              <span style={styles.statLabel}>Total Income</span>
              <span style={{ ...styles.statValue, color: "#10b981" }}>
                +₹{totalIncome.toLocaleString("en-IN")}
              </span>
            </div>
            <div style={{ ...styles.statBox, borderLeft: "4px solid #f43f5e" }}>
              <span style={styles.statLabel}>Total Expense</span>
              <span style={{ ...styles.statValue, color: "#f43f5e" }}>
                -₹{totalExpense.toLocaleString("en-IN")}
              </span>
            </div>
          </div>

          {totalIncome > 0 && (
            <div style={{ marginTop: "15px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "4px" }}>
                <span>Budget Used</span>
                <span>{expensePercentage}%</span>
              </div>
              <div style={styles.progressBg}>
                <div
                  style={{
                    ...styles.progressBar,
                    width: `${expensePercentage}%`,
                    backgroundColor: expensePercentage > 85 ? "#f43f5e" : "#6366f1",
                  }}
                />
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleAdd} style={styles.form}>
          <h3 style={{ margin: "0 0 10px", fontSize: "16px", color: "#334155" }}>
            Add Transaction
          </h3>

          <div style={styles.formGroup}>
            <input
              type="text"
              placeholder="Title (e.g. Lunch, Petrol, Stipend)..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              style={styles.input}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="number"
              placeholder="Amount (₹)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={{ ...styles.input, flex: 1 }}
            />
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              style={{ ...styles.input, flex: 1, fontWeight: "600" }}
            >
              <option value="expense">🔴 Expense</option>
              <option value="income">🟢 Income</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={styles.input}
            >
              <option value="Food">🍔 Food & Dining</option>
              <option value="Travel">🚗 Travel & Fuel</option>
              <option value="Bills">💡 Bills & Utilities</option>
              <option value="Shopping">🛍️ Shopping</option>
              <option value="Salary">💼 Salary / Income</option>
              <option value="Other">📌 Other</option>
            </select>
          </div>

          <button type="submit" style={styles.submitBtn}>
            + Add Transaction
          </button>
        </form>

        <div style={{ marginTop: "25px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "16px", color: "#334155" }}>History</h3>
            {transactions.length > 0 && (
              <button onClick={handleClearAll} style={styles.clearBtn}>
                Clear All
              </button>
            )}
          </div>

          <div style={styles.filterGroup}>
            {["all", "income", "expense"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                style={{
                  ...styles.filterTab,
                  backgroundColor: filter === f ? "#6366f1" : "#f1f5f9",
                  color: filter === f ? "#fff" : "#64748b",
                }}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <input
            type="text"
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />

          <div style={{ maxHeight: "250px", overflowY: "auto" }}>
            {filteredTransactions.length === 0 ? (
              <p style={{ textAlign: "center", color: "#94a3b8", fontSize: "14px", padding: "15px" }}>
                No transactions found.
              </p>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  style={{
                    ...styles.listItem,
                    borderLeft: tx.type === "income" ? "4px solid #10b981" : "4px solid #f43f5e",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ fontSize: "20px" }}>{getCategoryIcon(tx.category)}</span>
                    <div>
                      <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "14px" }}>
                        {tx.title}
                      </div>
                      <div style={{ fontSize: "12px", color: "#94a3b8" }}>
                        {tx.category} • {tx.date}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span
                      style={{
                        fontWeight: "bold",
                        fontSize: "14px",
                        color: tx.type === "income" ? "#10b981" : "#f43f5e",
                      }}
                    >
                      {tx.type === "income" ? "+" : "-"}₹{tx.amount.toLocaleString("en-IN")}
                    </span>
                    <button onClick={() => handleDelete(tx.id)} style={styles.deleteIconBtn}>
                      ✕
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f8fafc",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "20px",
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
  },
  card: {
    width: "100%",
    maxWidth: "420px",
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.08)",
    padding: "24px",
    boxSizing: "border-box",
  },
  header: {
    textAlign: "center",
    marginBottom: "20px",
    color: "#1e293b",
  },
  balanceContainer: {
    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
    color: "#ffffff",
    borderRadius: "12px",
    padding: "18px",
    marginBottom: "20px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
  },
  statBox: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    padding: "10px 12px",
    borderRadius: "8px",
    display: "flex",
    flexDirection: "column",
  },
  statLabel: { fontSize: "11px", opacity: 0.7, textTransform: "uppercase" },
  statValue: { fontSize: "15px", fontWeight: "bold", marginTop: "2px" },
  progressBg: {
    width: "100%",
    height: "6px",
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: "3px",
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    transition: "width 0.3s ease",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    backgroundColor: "#f8fafc",
    padding: "14px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  formGroup: { width: "100%" },
  input: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
  },
  searchInput: {
    width: "100%",
    padding: "10px 12px",
    borderRadius: "6px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    boxSizing: "border-box",
    outline: "none",
    marginBottom: "10px",
  },
  submitBtn: {
    padding: "11px",
    backgroundColor: "#4338ca",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    fontWeight: "bold",
    cursor: "pointer",
    fontSize: "14px",
  },
  exportBtn: {
    marginTop: "12px",
    backgroundColor: "#0f766e",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    padding: "8px 12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  filterGroup: {
    display: "flex",
    gap: "6px",
    marginBottom: "10px",
  },
  filterTab: {
    flex: 1,
    padding: "6px",
    border: "none",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "600",
    cursor: "pointer",
  },
  listItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: "10px 12px",
    borderRadius: "8px",
    marginBottom: "8px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    border: "1px solid #f1f5f9",
  },
  deleteIconBtn: {
    background: "none",
    border: "none",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "14px",
    padding: "2px 6px",
  },
  clearBtn: {
    background: "none",
    border: "none",
    color: "#ef4444",
    fontSize: "12px",
    cursor: "pointer",
    fontWeight: "600",
  },
};
