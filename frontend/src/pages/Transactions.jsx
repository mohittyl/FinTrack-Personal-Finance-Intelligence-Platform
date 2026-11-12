import { useEffect, useState } from "react";
import { Download, Pencil, Plus, Trash2, X } from "lucide-react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const pageSize = 10;

function emptyForm() {
  return { title: "", category: "", type: "expense", amount: "", transaction_date: new Date().toLocaleDateString("en-CA") };
}

function Transactions() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("all");
  const [category, setCategory] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  function queryParams() {
    let sortColumn = "date";
    let order = "desc";
    if (sortBy === "date-asc") order = "asc";
    else if (sortBy === "amount-high") sortColumn = "amount";
    else if (sortBy === "amount-low") { sortColumn = "amount"; order = "asc"; }
    else if (sortBy === "title-az") { sortColumn = "title"; order = "asc"; }
    else if (sortBy === "title-za") sortColumn = "title";
    return { search, type, category, dateFrom, dateTo, sortBy: sortColumn, order };
  }

  async function loadTransactions() {
    try {
      setLoading(true);
      setError("");
      const params = queryParams();
      params.page = page;
      params.limit = pageSize;
      const response = await api.get("/transactions", { params });
      setTransactions(response.data);
      setTotal(Number(response.headers["x-total-count"] || 0));
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load transactions");
    } finally {
      setLoading(false);
    }
  }

  async function loadCategories() {
    try {
      const response = await api.get("/transactions/categories");
      setCategories(response.data);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load categories");
    }
  }

  useEffect(() => { loadTransactions(); }, [search, type, category, dateFrom, dateTo, sortBy, page]);
  useEffect(() => { loadCategories(); }, []);

  function changeFilter(setter, value) {
    setter(value);
    setPage(1);
  }

  function clearFilters() {
    setSearch("");
    setType("all");
    setCategory("all");
    setDateFrom("");
    setDateTo("");
    setSortBy("date-desc");
    setPage(1);
  }

  function money(value) {
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 2 }).format(Number(value || 0));
  }

  function dateText(value) {
    const parts = String(value).slice(0, 10).split("-");
    if (parts.length !== 3) return value || "-";
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function addForm() {
    setEditingId(null);
    setFormData(emptyForm());
    setError("");
    setShowForm(true);
  }

  function editForm(item) {
    setEditingId(item.id);
    setFormData({ title: item.title, category: item.category, type: item.type, amount: String(item.amount), transaction_date: String(item.transaction_date).slice(0, 10) });
    setError("");
    setShowForm(true);
  }

  function closeForm() {
    if (saving) return;
    setShowForm(false);
    setEditingId(null);
    setFormData(emptyForm());
    setError("");
  }

  async function saveTransaction(event) {
    event.preventDefault();
    const amount = Number(formData.amount);
    if (
      !formData.title.trim() ||
      !formData.category.trim() ||
      isNaN(amount) ||
      amount <= 0 ||
      amount > 9999999999.99 ||
      !formData.transaction_date
    ) {
      setError("Enter a title, category, valid amount and date.");
      return;
    }

    const isEditing = editingId !== null;
    const item = { title: formData.title.trim(), category: formData.category.trim(), type: formData.type, amount, transaction_date: formData.transaction_date };
    try {
      setSaving(true);
      setError("");
      if (isEditing) await api.put("/transactions/" + editingId, item);
      else await api.post("/transactions", item);
      setShowForm(false);
      setEditingId(null);
      await loadCategories();

      // New transactions are sorted newest first, so show page one after adding.
      if (!isEditing && page > 1) {
        setPage(1);
      } else {
        await loadTransactions();
      }
    } catch (err) {
      setError(err.response?.data?.error || "Unable to save transaction");
    } finally {
      setSaving(false);
    }
  }

  async function deleteTransaction(id) {
    if (!window.confirm("Delete this transaction?")) return;
    try {
      await api.delete("/transactions/" + id);
      if (transactions.length === 1 && page > 1) setPage(page - 1);
      else await loadTransactions();
      await loadCategories();
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete transaction");
    }
  }

  async function exportCSV() {
    try {
      const response = await api.get("/transactions/export", { params: queryParams(), responseType: "blob" });
      const fileUrl = URL.createObjectURL(new Blob([response.data], { type: "text/csv;charset=utf-8" }));
      const link = document.createElement("a");
      link.href = fileUrl;
      link.download = "transactions.csv";
      link.click();
      URL.revokeObjectURL(fileUrl);
    } catch (err) {
      setError(err.response?.data?.error || "Unable to export transactions");
    }
  }

  let income = 0;
  let expenses = 0;
  for (let i = 0; i < transactions.length; i += 1) {
    if (transactions[i].type === "income") income += Number(transactions[i].amount);
    else expenses += Number(transactions[i].amount);
  }
  let totalPages = Math.ceil(total / pageSize);
  if (totalPages < 1) totalPages = 1;

  return (
    <div className="transactions-page">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="transactions-content">
        <header className="transactions-heading"><div><p className="transactions-eyebrow">Money activity</p><h1>Transactions</h1><p className="transactions-subtitle">Keep track of your income and expenses.</p></div><button className="button button-primary" onClick={addForm}><Plus size={18} /> Add Transaction</button></header>
        {error && !showForm && <div className="transactions-error">{error}</div>}
        <section className="summary-grid">
          <SummaryCard label="Income on this page" value={money(income)} color="green" />
          <SummaryCard label="Expenses on this page" value={money(expenses)} color="red" />
          <SummaryCard label="Page balance" value={money(income - expenses)} color="blue" />
        </section>
        <section className="history-section">
          <div className="history-heading"><div><h2>Transaction history</h2><p>{total} transaction(s)</p></div><button className="button button-secondary" onClick={exportCSV} disabled={!total}><Download size={16} /> Export CSV</button></div>
          <div className="transaction-controls">
            <input type="search" placeholder="Search title or category" value={search} onChange={(e) => changeFilter(setSearch, e.target.value)} />
            <select value={type} onChange={(e) => changeFilter(setType, e.target.value)}><option value="all">All types</option><option value="income">Income</option><option value="expense">Expense</option></select>
            <select value={category} onChange={(e) => changeFilter(setCategory, e.target.value)}><option value="all">All categories</option>{categories.map((name) => <option key={name} value={name}>{name}</option>)}</select>
            <label>From <input type="date" value={dateFrom} onChange={(e) => changeFilter(setDateFrom, e.target.value)} /></label>
            <label>To <input type="date" value={dateTo} onChange={(e) => changeFilter(setDateTo, e.target.value)} /></label>
            <select value={sortBy} onChange={(e) => changeFilter(setSortBy, e.target.value)}><option value="date-desc">Newest first</option><option value="date-asc">Oldest first</option><option value="amount-high">Amount: high to low</option><option value="amount-low">Amount: low to high</option><option value="title-az">Title: A to Z</option><option value="title-za">Title: Z to A</option></select>
            <button className="button button-secondary" onClick={clearFilters}>Clear filters</button>
          </div>
          <div className="transaction-table-wrap">
            {loading ? <p className="transactions-message">Loading transactions...</p> : transactions.length === 0 ? <p className="transactions-message">No transactions found.</p> : (
              <table className="transaction-table"><thead><tr><th>Title</th><th>Category</th><th>Type</th><th>Date</th><th>Amount</th><th>Actions</th></tr></thead><tbody>
                {transactions.map((item) => <tr key={item.id}><td>{item.title}</td><td>{item.category}</td><td><span className={`type-label ${item.type}`}>{item.type}</span></td><td>{dateText(item.transaction_date)}</td><td className={`amount ${item.type}`}>{money(item.amount)}</td><td className="row-actions"><button title="Edit" onClick={() => editForm(item)}><Pencil size={16} /></button><button title="Delete" onClick={() => deleteTransaction(item.id)}><Trash2 size={16} /></button></td></tr>)}
              </tbody></table>
            )}
          </div>
          {!loading && total > 0 && <div className="pagination"><span>Showing {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, total)} of {total}</span><div><button disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button><span>Page {page} of {totalPages}</span><button disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button></div></div>}
        </section>
      </main>
      {showForm && <div className="modal-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) closeForm(); }}><section className="transaction-modal"><div className="modal-heading"><div><h2>{editingId ? "Edit Transaction" : "Add Transaction"}</h2><p>Enter the transaction details.</p></div><button className="icon-button" onClick={closeForm} disabled={saving}><X size={20} /></button></div><form onSubmit={saveTransaction}>{error && <p className="form-error">{error}</p>}<label>Type<select value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Title<input maxLength={150} required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} /></label><label>Category<input maxLength={100} required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} /></label><label>Amount<input type="number" min="0.01" max="9999999999.99" step="0.01" required value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} /></label><label>Date<input type="date" required value={formData.transaction_date} onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })} /></label><div className="modal-actions"><button type="button" className="button button-secondary" onClick={closeForm} disabled={saving}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? "Saving..." : editingId ? "Save Changes" : "Add Transaction"}</button></div></form></section></div>}
    </div>
  );
}

function SummaryCard({ label, value, color }) {
  return <article className={`summary-card ${color}`}><p>{label}</p><strong>{value}</strong></article>;
}

export default Transactions;
