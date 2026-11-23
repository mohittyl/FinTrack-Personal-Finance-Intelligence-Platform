import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  CalendarDays,
  Wallet,
  CircleDollarSign,
  Repeat,
  X,
  ArrowUpRight,
  Sparkles,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const INITIAL_FORM = {
  title: "",
  category: "",
  amount: "",
  frequency: "monthly",
  next_payment_date: "",
};

const inputClass =
  "w-full rounded-xl border border-[#E5E3D9] bg-white px-3.5 py-3 text-sm text-[#454C41] outline-none transition placeholder:text-[#B4B4A9] focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]";

const labelClass = "mb-2 block text-xs font-semibold text-[#596152]";

function RecurringPayments() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [form, setForm] = useState(INITIAL_FORM);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await api.get("/recurring-payments");
      setPayments(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Recurring payments error:", err);
      setError(
        err.response?.data?.error ||
          "Unable to load recurring payments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
  };

  const openAddModal = () => {
    setEditingPayment(null);
    setForm({ ...INITIAL_FORM });
    setError("");
    setShowModal(true);
  };

  const openEditModal = (payment) => {
    setEditingPayment(payment);
    setForm({
      title: payment.title || "",
      category: payment.category || "",
      amount: payment.amount ?? "",
      frequency: payment.frequency || "monthly",
      next_payment_date: payment.next_payment_date
        ? String(payment.next_payment_date).slice(0, 10)
        : "",
    });
    setError("");
    setShowModal(true);
  };

  const closeModal = () => {
    if (saving) return;
    setShowModal(false);
    setEditingPayment(null);
    setForm({ ...INITIAL_FORM });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const amount = Number(form.amount);
    if (
      !form.title.trim() ||
      !form.category.trim() ||
      !Number.isFinite(amount) ||
      amount <= 0 ||
      !form.next_payment_date
    ) {
      setError("Please enter a name, category, valid amount and next payment date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        amount,
        frequency: form.frequency,
        next_payment_date: form.next_payment_date,
      };

      if (editingPayment) {
        await api.put(`/recurring-payments/${editingPayment.id}`, {
          ...payload,
          is_active: editingPayment.is_active,
        });
      } else {
        await api.post("/recurring-payments", payload);
      }

      setShowModal(false);
      setEditingPayment(null);
      await fetchPayments();
    } catch (err) {
      console.error("Save recurring payment error:", err);
      setError(
        err.response?.data?.error || "Unable to save recurring payment."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this recurring payment?"
      )
    ) {
      return;
    }

    try {
      setError("");
      await api.delete(`/recurring-payments/${id}`);
      await fetchPayments();
    } catch (err) {
      console.error("Delete payment error:", err);
      setError(err.response?.data?.error || "Unable to delete payment.");
    }
  };

  const handleToggle = async (id) => {
    try {
      setError("");
      await api.patch(`/recurring-payments/${id}/toggle`);
      await fetchPayments();
    } catch (err) {
      console.error("Toggle payment error:", err);
      setError(err.response?.data?.error || "Unable to update payment status.");
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatDate = (date) => {
    if (!date) return "No date";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "No date";
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getFrequencyLabel = (frequency) => {
    if (frequency === "weekly") return "Weekly";
    if (frequency === "yearly") return "Yearly";
    return "Monthly";
  };

  const activePayments = payments.filter((payment) => payment.is_active);
  const inactivePayments = payments.filter((payment) => !payment.is_active);

  const monthlyRecurringAmount = activePayments.reduce((total, payment) => {
    const amount = Number(payment.amount || 0);
    if (payment.frequency === "monthly") return total + amount;
    if (payment.frequency === "weekly") return total + (amount * 52) / 12;
    if (payment.frequency === "yearly") return total + amount / 12;
    return total;
  }, 0);

  const PageShell = ({ children }) => (
    <div className="min-h-screen bg-[#F8F7F1]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <Navbar onMenuClick={() => setSidebarOpen(true)} />
      <main className="min-h-screen px-4 pb-10 pt-20 sm:px-6 sm:pt-20 lg:ml-64 lg:px-8 lg:pt-24">
        <div className="mx-auto max-w-[1500px]">{children}</div>
      </main>
    </div>
  );

  if (loading) {
    return (
      <PageShell>
        <div className="flex min-h-[60vh] flex-col items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#E6E5D9] border-t-[#78866B]" />
          <p className="mt-4 text-sm text-[#85877C]">
            Loading recurring payments...
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <div className="mb-7 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-[#78866B]">
            <Sparkles size={15} />
            Stay ahead of regular expenses
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-[#343A32]">
            Recurring Payments
          </h1>
          <p className="mt-2 max-w-xl text-sm text-[#898B80]">
            Keep subscriptions, bills and regular payments organised in one place.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#526B50] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#405B43] sm:w-auto"
        >
          <Plus size={17} />
          Add payment
        </button>
      </div>

      {error && !showModal && (
        <div
          className="mb-5 flex items-start justify-between gap-3 rounded-xl border border-[#F0D8CC] bg-[#F9E5DC] px-4 py-3 text-sm text-[#956F60]"
          role="alert"
        >
          <span>{error}</span>
          <button
            onClick={() => setError("")}
            className="shrink-0 rounded-md p-1 hover:bg-white/50"
            aria-label="Dismiss error"
          >
            <X size={15} />
          </button>
        </div>
      )}

      <section
        aria-label="Recurring payment summary"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div className="rounded-[20px] border border-[#CFE4D5] bg-[#DDF0E4] p-5 transition hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#637C68]">
                Active payments
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#344B39]">
                {activePayments.length}
              </p>
              <p className="mt-2 text-xs text-[#738B76]">
                Currently being tracked
              </p>
            </div>
            <div className="rounded-xl bg-[#C7E5D0] p-3 text-[#527B60]">
              <RefreshCw size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#E7DFCB] bg-[#F5F0E3] p-5 transition hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#8A7958]">
                Monthly commitment
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#62543B]">
                {formatCurrency(monthlyRecurringAmount)}
              </p>
              <p className="mt-2 text-xs text-[#9B8B6B]">
                Estimated monthly equivalent
              </p>
            </div>
            <div className="rounded-xl bg-[#EDE4CF] p-3 text-[#9B8150]">
              <Wallet size={20} />
            </div>
          </div>
        </div>

        <div className="rounded-[20px] border border-[#DCD9F0] bg-[#E9E5F8] p-5 transition hover:-translate-y-0.5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium text-[#797198]">
                Inactive payments
              </p>
              <p className="mt-3 text-3xl font-semibold tracking-tight text-[#51466E]">
                {inactivePayments.length}
              </p>
              <p className="mt-2 text-xs text-[#9288B2]">
                Paused or deactivated
              </p>
            </div>
            <div className="rounded-xl bg-[#D9D2F0] p-3 text-[#8174AD]">
              <CircleDollarSign size={20} />
            </div>
          </div>
        </div>
      </section>

      <section className="mt-6 overflow-hidden rounded-[20px] border border-[#EAE8DF] bg-white">
        <div className="flex flex-col justify-between gap-2 border-b border-[#F0EEE8] p-5 sm:flex-row sm:items-center sm:px-6">
          <div>
            <h2 className="text-base font-semibold text-[#444A40]">
              Your recurring payments
            </h2>
            <p className="mt-1 text-sm text-[#96958A]">
              {payments.length} payment{payments.length === 1 ? "" : "s"} in your list
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#929387]">
            <CalendarDays size={15} />
            Review upcoming dates
          </div>
        </div>

        {payments.length === 0 ? (
          <div className="flex min-h-[330px] flex-col items-center justify-center px-5 py-14 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#F2F0E4] text-[#817B5D]">
              <CalendarDays size={28} />
            </div>
            <h3 className="mt-5 text-base font-semibold text-[#454C41]">
              No recurring payments yet
            </h3>
            <p className="mt-2 max-w-sm text-sm leading-6 text-[#929387]">
              Add your regular bills, subscriptions or payments to keep track
              of what is coming up.
            </p>
            <button
              onClick={openAddModal}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#526B50] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#405B43]"
            >
              <Plus size={16} />
              Add your first payment
            </button>
          </div>
        ) : (
          <>
            <div className="hidden md:block">
              <div className="grid grid-cols-[1.5fr_1fr_1fr_1fr_132px] gap-4 border-b border-[#F0EEE8] bg-[#FAF9F5] px-6 py-3.5 text-[10px] font-semibold uppercase tracking-wider text-[#929387]">
                <div>Payment</div>
                <div>Amount</div>
                <div>Frequency</div>
                <div>Next payment</div>
                <div className="text-right">Actions</div>
              </div>

              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="grid grid-cols-[1.5fr_1fr_1fr_1fr_132px] items-center gap-4 border-b border-[#F1EFE9] px-6 py-4 transition last:border-b-0 hover:bg-[#FCFBF8]"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F2EA] text-[#78866B]">
                      <Repeat size={18} />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#454C41]">
                        {payment.title}
                      </p>
                      <p className="mt-1 truncate text-xs text-[#929387]">
                        {payment.category}
                      </p>
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-[#41463C]">
                    {formatCurrency(payment.amount)}
                  </div>

                  <div>
                    <span className="inline-flex rounded-lg bg-[#F3F1EA] px-2.5 py-1.5 text-xs font-medium text-[#70786C]">
                      {getFrequencyLabel(payment.frequency)}
                    </span>
                  </div>

                  <div className="text-sm text-[#777A6E]">
                    {formatDate(payment.next_payment_date)}
                  </div>

                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => handleToggle(payment.id)}
                      title={payment.is_active ? "Deactivate" : "Activate"}
                      aria-label={payment.is_active ? "Deactivate payment" : "Activate payment"}
                      className={`rounded-lg p-2 transition ${
                        payment.is_active
                          ? "text-[#78866B] hover:bg-[#EEF2E9]"
                          : "text-[#A0A092] hover:bg-[#F2F0E9]"
                      }`}
                    >
                      <RefreshCw size={16} />
                    </button>
                    <button
                      onClick={() => openEditModal(payment)}
                      title="Edit"
                      aria-label="Edit payment"
                      className="rounded-lg p-2 text-[#858A7D] transition hover:bg-[#F2F0E9] hover:text-[#526B50]"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      title="Delete"
                      aria-label="Delete payment"
                      className="rounded-lg p-2 text-[#A17C70] transition hover:bg-[#F9E5DC] hover:text-[#B45F4F]"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="divide-y divide-[#F0EEE8] md:hidden">
              {payments.map((payment) => (
                <div key={payment.id} className="p-4 sm:p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F1F2EA] text-[#78866B]">
                        <Repeat size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-[#454C41]">
                          {payment.title}
                        </p>
                        <p className="mt-1 truncate text-xs text-[#929387]">
                          {payment.category}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                        payment.is_active
                          ? "bg-[#DDF0E4] text-[#527B60]"
                          : "bg-[#F1F0E9] text-[#85877C]"
                      }`}
                    >
                      {payment.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-3 gap-3">
                    <div>
                      <p className="text-[11px] text-[#99998F]">Amount</p>
                      <p className="mt-1 text-sm font-semibold text-[#41463C]">
                        {formatCurrency(payment.amount)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#99998F]">Frequency</p>
                      <p className="mt-1 text-sm font-medium text-[#55594E]">
                        {getFrequencyLabel(payment.frequency)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] text-[#99998F]">Next payment</p>
                      <p className="mt-1 text-sm font-medium text-[#55594E]">
                        {formatDate(payment.next_payment_date)}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-end gap-2 border-t border-[#F0EEE8] pt-3">
                    <button
                      onClick={() => handleToggle(payment.id)}
                      className="rounded-lg border border-[#E5E3D9] px-3 py-2 text-xs font-medium text-[#73796B] transition hover:bg-[#F5F3EC]"
                    >
                      {payment.is_active ? "Deactivate" : "Activate"}
                    </button>
                    <button
                      onClick={() => openEditModal(payment)}
                      aria-label="Edit payment"
                      className="rounded-lg border border-[#E5E3D9] p-2 text-[#858A7D] hover:bg-[#F5F3EC]"
                    >
                      <Pencil size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(payment.id)}
                      aria-label="Delete payment"
                      className="rounded-lg border border-[#E5E3D9] p-2 text-[#A17C70] hover:bg-[#F9E5DC]"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <footer className="mt-7 flex flex-col items-center justify-between gap-2 border-t border-[#EAE8DF] pt-5 text-[10px] text-[#A0A092] sm:flex-row">
        <p>FinTrack · Personal Finance Intelligence</p>
        <p>Plan ahead. Spend with clarity.</p>
      </footer>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#30372F]/40 p-4 backdrop-blur-[3px]"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <section className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-[24px] border border-white/70 bg-[#FFFDF9] shadow-[0_20px_60px_rgba(30,40,30,0.18)]">
            <div className="flex items-start justify-between border-b border-[#EAE8DF] p-6">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#87917F]">
                  REGULAR PAYMENTS
                </p>
                <h2 className="text-xl font-semibold text-[#343A32]">
                  {editingPayment ? "Edit recurring payment" : "Add recurring payment"}
                </h2>
                <p className="mt-1 text-xs text-[#929387]">
                  Enter the details of your regular payment.
                </p>
              </div>
              <button
                onClick={closeModal}
                disabled={saving}
                aria-label="Close form"
                className="rounded-xl bg-[#F1F0E9] p-2 text-[#73796B] transition hover:bg-[#E7E6DD] disabled:opacity-50"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5 p-6">
              {error && (
                <div
                  className="rounded-xl border border-[#F0D8CC] bg-[#F9E5DC] px-4 py-3 text-sm text-[#956F60]"
                  role="alert"
                >
                  {error}
                </div>
              )}

              <div>
                <label className={labelClass}>Payment name</label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Netflix subscription"
                  maxLength={150}
                  required
                  className={inputClass}
                />
              </div>

              <div>
                <label className={labelClass}>Category</label>
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="">Select category</option>
                  <option value="Bills">Bills</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Amount</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#929387]">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="amount"
                    value={form.amount}
                    onChange={handleChange}
                    placeholder="0"
                    min="0.01"
                    step="0.01"
                    required
                    className={`${inputClass} pl-9`}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Frequency</label>
                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  required
                  className={inputClass}
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              <div>
                <label className={labelClass}>Next payment date</label>
                <input
                  type="date"
                  name="next_payment_date"
                  value={form.next_payment_date}
                  onChange={handleChange}
                  required
                  className={inputClass}
                />
              </div>

              <div className="flex flex-col-reverse gap-3 border-t border-[#EAE8DF] pt-5 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl border border-[#E5E3D9] bg-white px-5 py-3 text-sm font-medium text-[#73796B] transition hover:bg-[#F5F3EC] disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#526B50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405B43] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && <RefreshCw size={15} className="animate-spin" />}
                  {saving
                    ? "Saving..."
                    : editingPayment
                      ? "Save changes"
                      : "Add payment"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </PageShell>
  );
}

export default RecurringPayments;
