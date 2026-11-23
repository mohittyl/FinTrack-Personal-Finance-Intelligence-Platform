
import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  X,
  Wallet,
  CalendarDays,
  Sparkles,
  ArrowUpRight,
  CheckCircle2,
  PiggyBank,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

const palettes = [
  {
    card: "bg-[#DDF0E4]",
    icon: "bg-[#C7E5D0]",
    text: "text-[#527B60]",
    track: "bg-[#C6DFCB]",
    progress: "#648D70",
  },
  {
    card: "bg-[#F9E5DC]",
    icon: "bg-[#F2D2C5]",
    text: "text-[#B87965]",
    track: "bg-[#F0D2C5]",
    progress: "#CA8A73",
  },
  {
    card: "bg-[#E9E5F8]",
    icon: "bg-[#D9D2F0]",
    text: "text-[#8174AD]",
    track: "bg-[#D8D1ED]",
    progress: "#9385BE",
  },
  {
    card: "bg-[#F2F0E4]",
    icon: "bg-[#E5E1CA]",
    text: "text-[#817B5D]",
    track: "bg-[#E4E0CD]",
    progress: "#A69B70",
  },
];

function Goals() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showMoneyForm, setShowMoneyForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [selectedGoal, setSelectedGoal] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    target_amount: "",
    saved_amount: "",
    target_date: "",
  });

  const [moneyAmount, setMoneyAmount] = useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/goals");
      setGoals(response.data);
    } catch (err) {
      console.error("Goals error:", err);
      setError(
        err.response?.data?.error || "Unable to load goals"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));

  const formatDate = (date) => {
    if (!date) return "-";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getSaved = (goal) =>
    Number(goal.saved_amount ?? goal.savedAmount ?? 0);

  const getTarget = (goal) =>
    Number(goal.target_amount ?? goal.targetAmount ?? 0);

  const getTargetDate = (goal) =>
    goal.target_date || goal.targetDate || "";

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingGoal(null);
    setError("");

    setFormData({
      title: "",
      target_amount: "",
      saved_amount: "",
      target_date: "",
    });

    setShowForm(true);
  };

  const openEditForm = (goal) => {
    setEditingGoal(goal);
    setError("");

    setFormData({
      title: goal.title || "",
      target_amount: getTarget(goal),
      saved_amount: getSaved(goal),
      target_date: getTargetDate(goal)
        ? getTargetDate(goal).slice(0, 10)
        : "",
    });

    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingGoal(null);

    setFormData({
      title: "",
      target_amount: "",
      saved_amount: "",
      target_date: "",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!formData.title.trim()) {
        setError("Please enter a goal name.");
        return;
      }

      if (
        !formData.target_amount ||
        Number(formData.target_amount) <= 0
      ) {
        setError("Please enter a valid target amount.");
        return;
      }

      if (
        formData.saved_amount !== "" &&
        Number(formData.saved_amount) < 0
      ) {
        setError("Saved amount cannot be negative.");
        return;
      }

      if (
        Number(formData.saved_amount || 0) >
        Number(formData.target_amount)
      ) {
        setError(
          "Saved amount cannot be greater than target amount."
        );
        return;
      }

      const payload = {
        title: formData.title.trim(),
        target_amount: Number(formData.target_amount),
        saved_amount: Number(formData.saved_amount || 0),
        target_date: formData.target_date || null,
      };

      if (editingGoal) {
        await api.put(`/goals/${editingGoal.id}`, payload);
      } else {
        await api.post("/goals", payload);
      }

      closeForm();
      await fetchGoals();
    } catch (err) {
      console.error("Save goal error:", err);
      setError(
        err.response?.data?.error || "Unable to save goal"
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this goal?"
    );

    if (!confirmed) return;

    try {
      setError("");
      await api.delete(`/goals/${id}`);
      await fetchGoals();
    } catch (err) {
      console.error("Delete goal error:", err);
      setError(
        err.response?.data?.error || "Unable to delete goal"
      );
    }
  };

  const openMoneyForm = (goal) => {
    setSelectedGoal(goal);
    setMoneyAmount("");
    setError("");
    setShowMoneyForm(true);
  };

  const closeMoneyForm = () => {
    setShowMoneyForm(false);
    setSelectedGoal(null);
    setMoneyAmount("");
  };

  const handleAddMoney = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!moneyAmount || Number(moneyAmount) <= 0) {
        setError("Please enter a valid amount.");
        return;
      }

      if (!selectedGoal) return;

      const currentSaved = getSaved(selectedGoal);
      const targetAmount = getTarget(selectedGoal);
      const newSavedAmount =
        currentSaved + Number(moneyAmount);

      if (newSavedAmount > targetAmount) {
        setError(
          `You can add only ${formatCurrency(
            targetAmount - currentSaved
          )} to this goal.`
        );
        return;
      }

      await api.patch(
        `/goals/${selectedGoal.id}/add-money`,
        {
          amount: Number(moneyAmount),
        }
      );

      closeMoneyForm();
      await fetchGoals();
    } catch (err) {
      console.error("Add money error:", err);
      setError(
        err.response?.data?.error || "Unable to add money"
      );
    }
  };

  const totalTarget = goals.reduce(
    (sum, goal) => sum + getTarget(goal),
    0
  );

  const totalSaved = goals.reduce(
    (sum, goal) => sum + getSaved(goal),
    0
  );

  const totalRemaining = Math.max(
    totalTarget - totalSaved,
    0
  );

  const overallProgress =
    totalTarget > 0
      ? Math.min((totalSaved / totalTarget) * 100, 100)
      : 0;

  const completedGoals = goals.filter(
    (goal) => getSaved(goal) >= getTarget(goal)
  ).length;

  return (
    <div className="min-h-screen bg-[#E9EDE5]">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <Navbar onMenuClick={() => setSidebarOpen(true)} />

      <main className="px-4 pb-10 pt-[96px] sm:px-6 lg:ml-[260px] lg:px-8 lg:pt-[104px]">
        <div className="mx-auto max-w-[1500px] rounded-[24px] border border-white/70 bg-[#FFFDF9] p-5 shadow-[0_12px_45px_rgba(50,65,45,0.08)] sm:p-7 lg:p-9">

          {/* HEADER */}
          <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[2px] text-[#87917F]">
                YOUR FUTURE, PLANNED
              </p>

              <h1 className="text-3xl font-semibold tracking-tight text-[#343A32]">
                Savings goals
              </h1>

              <p className="mt-2 max-w-xl text-sm text-[#8B8C81]">
                Small steps today, bigger possibilities tomorrow.
              </p>
            </div>

            <button
              onClick={openCreateForm}
              className="inline-flex items-center gap-2 rounded-xl bg-[#526B50] px-5 py-3 text-sm font-medium text-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-[#405B43]"
            >
              <Plus size={17} />
              Create a goal
            </button>
          </div>

          {/* ERROR */}
          {error && !showForm && !showMoneyForm && (
            <div className="mb-5 rounded-xl border border-[#F0D8CC] bg-[#F9E5DC] px-4 py-3 text-sm text-[#956F60]">
              {error}
            </div>
          )}

          {/* OVERVIEW */}
          <section className="mb-8">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-[#454B40]">
                Your savings overview
              </h2>

              <span className="text-[11px] text-[#9B9B90]">
                {completedGoals} of {goals.length} goals completed
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <div className="rounded-[20px] border border-[#CFE4D5] bg-[#DDF0E4] p-5 transition hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#637C68]">
                    Total target
                  </p>
                  <div className="rounded-xl bg-[#C7E5D0] p-2.5">
                    <Target size={19} className="text-[#527B60]" />
                  </div>
                </div>
                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#344B39]">
                  {formatCurrency(totalTarget)}
                </p>
                <p className="mt-1 text-[11px] text-[#738B76]">
                  What you're working towards
                </p>
              </div>

              <div className="rounded-[20px] border border-[#F0D8CC] bg-[#F9E5DC] p-5 transition hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#956F60]">
                    Total saved
                  </p>
                  <div className="rounded-xl bg-[#F2D2C5] p-2.5">
                    <PiggyBank size={19} className="text-[#B87965]" />
                  </div>
                </div>
                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#65483D]">
                  {formatCurrency(totalSaved)}
                </p>
                <p className="mt-1 text-[11px] text-[#A17C6E]">
                  Your savings so far
                </p>
              </div>

              <div className="rounded-[20px] border border-[#DCD9F0] bg-[#E9E5F8] p-5 transition hover:-translate-y-1">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-[#797198]">
                    Still to save
                  </p>
                  <div className="rounded-xl bg-[#D9D2F0] p-2.5">
                    <Wallet size={19} className="text-[#8174AD]" />
                  </div>
                </div>
                <p className="mt-5 text-[26px] font-semibold tracking-tight text-[#51466E]">
                  {formatCurrency(totalRemaining)}
                </p>
                <p className="mt-1 text-[11px] text-[#9288B2]">
                  Your remaining savings target
                </p>
              </div>
            </div>
          </section>

          {/* OVERALL PROGRESS */}
          {goals.length > 0 && (
            <section className="mb-8 rounded-[20px] border border-[#EAE8DF] bg-white p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-semibold text-[#444A40]">
                    Your savings journey
                  </h2>
                  <p className="mt-1 text-xs text-[#96958A]">
                    Every contribution brings you closer.
                  </p>
                </div>

                <span className="rounded-lg bg-[#DDF0E4] px-3 py-1.5 text-xs font-semibold text-[#527B60]">
                  {overallProgress.toFixed(0)}% achieved
                </span>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-[#F0EFE9]">
                <div
                  className="h-full rounded-full bg-[#789B7B] transition-all duration-700"
                  style={{ width: `${overallProgress}%` }}
                />
              </div>

              <div className="mt-3 flex justify-between text-xs text-[#929387]">
                <span>{formatCurrency(totalSaved)} saved</span>
                <span>{formatCurrency(totalTarget)} target</span>
              </div>
            </section>
          )}

          {/* GOALS */}
          <section>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-[#444A40]">
                  Your goals
                </h2>
                <p className="mt-1 text-xs text-[#96958A]">
                  The things you're saving for.
                </p>
              </div>

              <span className="text-xs text-[#929387]">
                {goals.length} {goals.length === 1 ? "goal" : "goals"}
              </span>
            </div>

            {loading ? (
              <div className="flex min-h-[250px] flex-col items-center justify-center rounded-[20px] border border-[#EAE8DF] bg-white">
                <div className="mb-4 h-9 w-9 animate-spin rounded-full border-[3px] border-[#DCE7DA] border-t-[#526B50]" />
                <p className="text-sm text-[#899184]">
                  Loading your goals...
                </p>
              </div>
            ) : goals.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-[#D9DED3] bg-white px-6 py-14 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#DDF0E4]">
                  <Target size={27} className="text-[#527B60]" />
                </div>

                <h3 className="mt-5 text-lg font-semibold text-[#343A32]">
                  Something worth saving for?
                </h3>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-[#8B8C81]">
                  Create your first goal. It could be a new laptop,
                  a holiday, an emergency fund or anything you dream of.
                </p>

                <button
                  onClick={openCreateForm}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#526B50] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#405B43]"
                >
                  <Plus size={17} />
                  Create your first goal
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {goals.map((goal, index) => {
                  const targetAmount = getTarget(goal);
                  const savedAmount = getSaved(goal);
                  const remaining = Math.max(
                    targetAmount - savedAmount,
                    0
                  );

                  const percentage =
                    targetAmount > 0
                      ? (savedAmount / targetAmount) * 100
                      : 0;

                  const progress = Math.min(percentage, 100);
                  const completed = savedAmount >= targetAmount;
                  const palette = palettes[index % palettes.length];
                  const targetDate = getTargetDate(goal);

                  return (
                    <article
                      key={goal.id}
                      className="group rounded-[20px] border border-black/[0.04] bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-[0_10px_25px_rgba(50,65,45,0.07)]"
                    >
                      {/* CARD HEADER */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className={`rounded-xl p-3 ${palette.icon}`}>
                            <Sparkles size={20} className={palette.text} />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-[#454C41]">
                              {goal.title}
                            </h3>
                            <p className="mt-1 text-[11px] text-[#96958A]">
                              {completed ? "Goal achieved" : "Savings goal"}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-1">
                          <button
                            onClick={() => openEditForm(goal)}
                            className="rounded-lg p-2 text-[#858A7D] transition hover:bg-[#F2F0E9] hover:text-[#526B50]"
                            title="Edit goal"
                            aria-label="Edit goal"
                          >
                            <Pencil size={15} />
                          </button>

                          <button
                            onClick={() => handleDelete(goal.id)}
                            className="rounded-lg p-2 text-[#A17C70] transition hover:bg-[#F9E5DC] hover:text-[#B45F4F]"
                            title="Delete goal"
                            aria-label="Delete goal"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      {/* CIRCULAR PROGRESS */}
                      <div className="my-7 flex items-center gap-5">
                        <div
                          className="relative flex h-[104px] w-[104px] shrink-0 items-center justify-center rounded-full"
                          style={{
                            background: `conic-gradient(${palette.progress} ${progress * 3.6}deg, #EEEDE7 0deg)`,
                          }}
                        >
                          <div className="flex h-[82px] w-[82px] flex-col items-center justify-center rounded-full bg-white">
                            <span className="text-xl font-semibold tracking-tight text-[#41483D]">
                              {progress.toFixed(0)}%
                            </span>
                            <span className="text-[9px] text-[#96958A]">
                              complete
                            </span>
                          </div>
                        </div>

                        <div className="min-w-0">
                          <p className="text-[11px] text-[#96958A]">
                            Saved so far
                          </p>
                          <p className="mt-1 break-words text-xl font-semibold text-[#41483D]">
                            {formatCurrency(savedAmount)}
                          </p>
                          <p className="mt-2 text-[11px] text-[#96958A]">
                            of {formatCurrency(targetAmount)}
                          </p>
                        </div>
                      </div>

                      {/* PROGRESS BAR */}
                      <div className={`h-2 overflow-hidden rounded-full ${palette.track}`}>
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${progress}%`,
                            backgroundColor: palette.progress,
                          }}
                        />
                      </div>

                      {/* GOAL DETAILS */}
                      <div className="mt-4 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-[10px] text-[#96958A]">
                            {completed ? "Completed" : "Still needed"}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-[#454C41]">
                            {formatCurrency(remaining)}
                          </p>
                        </div>

                        {targetDate && (
                          <div className="text-right">
                            <p className="text-[10px] text-[#96958A]">
                              Target date
                            </p>
                            <p className="mt-1 flex items-center justify-end gap-1 text-xs font-medium text-[#747A6E]">
                              <CalendarDays size={12} />
                              {formatDate(targetDate)}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* CARD FOOTER */}
                      <div className="mt-5 flex items-center justify-between border-t border-[#EFEEE8] pt-4">
                        {completed ? (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-[#648565]">
                            <CheckCircle2 size={15} />
                            Goal achieved
                          </span>
                        ) : (
                          <span className="text-xs text-[#929387]">
                            Keep it going
                          </span>
                        )}

                        {!completed && (
                          <button
                            onClick={() => openMoneyForm(goal)}
                            className="inline-flex items-center gap-1.5 rounded-lg bg-[#526B50] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#405B43]"
                          >
                            <Plus size={14} />
                            Add money
                            <ArrowUpRight size={13} />
                          </button>
                        )}
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

          <footer className="mt-8 flex flex-col items-center justify-between gap-2 border-t border-[#EAE8DF] pt-5 text-[10px] text-[#A0A092] sm:flex-row">
            <p>FinTrack · Personal Finance Intelligence</p>
            <p>One step closer to every goal.</p>
          </footer>
        </div>
      </main>

      {/* CREATE / EDIT GOAL MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#30372F]/40 p-4 backdrop-blur-[3px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeForm();
          }}
        >
          <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-[24px] border border-white/70 bg-[#FFFDF9] shadow-[0_20px_60px_rgba(30,40,30,0.18)]">
            <div className="flex items-start justify-between border-b border-[#EAE8DF] p-6">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#87917F]">
                  YOUR NEXT MILESTONE
                </p>

                <h2 className="text-xl font-semibold text-[#343A32]">
                  {editingGoal ? "Edit your goal" : "Create a goal"}
                </h2>

                <p className="mt-1 text-xs text-[#929387]">
                  Give your savings a direction.
                </p>
              </div>

              <button
                onClick={closeForm}
                className="rounded-xl bg-[#F1F0E9] p-2 text-[#73796B] transition hover:bg-[#E7E6DD]"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-[#F0D8CC] bg-[#F9E5DC] px-4 py-3 text-sm text-[#956F60]">
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs font-semibold text-[#596152]">
                  Goal name
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. New laptop"
                  className="w-full rounded-xl border border-[#E5E3D9] bg-white px-4 py-3 text-sm text-[#454C41] outline-none transition placeholder:text-[#B4B4A9] focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]"
                />
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-[#596152]">
                  Target amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#929387]">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="target_amount"
                    value={formData.target_amount}
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    placeholder="50000"
                    className="w-full rounded-xl border border-[#E5E3D9] bg-white py-3 pl-9 pr-4 text-sm text-[#454C41] outline-none transition placeholder:text-[#B4B4A9] focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-[#596152]">
                  Already saved
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#929387]">
                    ₹
                  </span>
                  <input
                    type="number"
                    name="saved_amount"
                    value={formData.saved_amount}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="w-full rounded-xl border border-[#E5E3D9] bg-white py-3 pl-9 pr-4 text-sm text-[#454C41] outline-none transition placeholder:text-[#B4B4A9] focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]"
                  />
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-[#596152]">
                  Target date <span className="font-normal text-[#A5A497]">(optional)</span>
                </label>
                <input
                  type="date"
                  name="target_date"
                  value={formData.target_date}
                  onChange={handleInputChange}
                  className="w-full rounded-xl border border-[#E5E3D9] bg-white px-4 py-3 text-sm text-[#454C41] outline-none transition focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]"
                />
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeForm}
                  className="rounded-xl border border-[#E5E3D9] bg-white px-5 py-3 text-sm font-medium text-[#73796B] transition hover:bg-[#F5F3EC]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#526B50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405B43]"
                >
                  {editingGoal ? "Update goal" : "Create goal"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD MONEY MODAL */}
      {showMoneyForm && selectedGoal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#30372F]/40 p-4 backdrop-blur-[3px]"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeMoneyForm();
          }}
        >
          <div className="w-full max-w-md overflow-hidden rounded-[24px] border border-white/70 bg-[#FFFDF9] shadow-[0_20px_60px_rgba(30,40,30,0.18)]">
            <div className="flex items-start justify-between border-b border-[#EAE8DF] p-6">
              <div>
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-[2px] text-[#87917F]">
                  KEEP THE MOMENTUM
                </p>
                <h2 className="text-xl font-semibold text-[#343A32]">
                  Add to your savings
                </h2>
                <p className="mt-1 text-xs text-[#929387]">
                  Contribute towards {selectedGoal.title}.
                </p>
              </div>

              <button
                onClick={closeMoneyForm}
                className="rounded-xl bg-[#F1F0E9] p-2 text-[#73796B] transition hover:bg-[#E7E6DD]"
                aria-label="Close form"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddMoney} className="p-6">
              {error && (
                <div className="mb-5 rounded-xl border border-[#F0D8CC] bg-[#F9E5DC] px-4 py-3 text-sm text-[#956F60]">
                  {error}
                </div>
              )}

              <div className="rounded-2xl bg-[#DDF0E4] p-5">
                <div className="flex items-center justify-between text-xs text-[#637C68]">
                  <span>Already saved</span>
                  <span className="font-semibold text-[#344B39]">
                    {formatCurrency(getSaved(selectedGoal))}
                  </span>
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-[#637C68]">
                  <span>Goal target</span>
                  <span className="font-semibold text-[#344B39]">
                    {formatCurrency(getTarget(selectedGoal))}
                  </span>
                </div>
              </div>

              <div className="mt-5">
                <label className="mb-2 block text-xs font-semibold text-[#596152]">
                  Amount to add
                </label>

                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[#929387]">
                    ₹
                  </span>
                  <input
                    type="number"
                    value={moneyAmount}
                    onChange={(e) => setMoneyAmount(e.target.value)}
                    min="0.01"
                    step="0.01"
                    placeholder="1000"
                    autoFocus
                    className="w-full rounded-xl border border-[#E5E3D9] bg-white py-3 pl-9 pr-4 text-sm text-[#454C41] outline-none transition placeholder:text-[#B4B4A9] focus:border-[#819A7A] focus:ring-2 focus:ring-[#DCE7DA]"
                  />
                </div>
              </div>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeMoneyForm}
                  className="rounded-xl border border-[#E5E3D9] bg-white px-5 py-3 text-sm font-medium text-[#73796B] transition hover:bg-[#F5F3EC]"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="rounded-xl bg-[#526B50] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#405B43]"
                >
                  Add money
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Goals;
