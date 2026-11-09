import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Wallet,
  X,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Budgets() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [budgets, setBudgets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);

  const [editingBudget, setEditingBudget] =
    useState(null);

  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  });

  const categories = [
    "Food",
    "Shopping",
    "Transport",
    "Education",
    "Entertainment",
    "Bills",
    "Healthcare",
    "Other",
  ];

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/budgets");

      setBudgets(response.data);
    } catch (err) {
      console.error("Budgets error:", err);

      setError(
        err.response?.data?.error ||
          "Unable to load budgets"
      );
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const getMonthName = (month) => {
    return new Date(
      2000,
      Number(month) - 1,
      1
    ).toLocaleString("en-IN", {
      month: "long",
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingBudget(null);

    setFormData({
      category: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });

    setError("");
    setShowForm(true);
  };

  const openEditForm = (budget) => {
    setEditingBudget(budget);

    setFormData({
      category: budget.category,
      amount: budget.amount,
      month: budget.month,
      year: budget.year,
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingBudget(null);

    setFormData({
      category: "",
      amount: "",
      month: new Date().getMonth() + 1,
      year: new Date().getFullYear(),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!formData.category) {
        setError("Please select a category.");
        return;
      }

      if (
        !formData.amount ||
        Number(formData.amount) <= 0
      ) {
        setError(
          "Please enter a valid budget amount."
        );
        return;
      }

      const payload = {
        category: formData.category,
        amount: Number(formData.amount),
        month: Number(formData.month),
        year: Number(formData.year),
      };

      if (editingBudget) {
        await api.put(
          `/budgets/${editingBudget.id}`,
          payload
        );
      } else {
        await api.post(
          "/budgets",
          payload
        );
      }

      closeForm();

      await fetchBudgets();
    } catch (err) {
      console.error(
        "Save budget error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to save budget"
      );
    }
  };

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this budget?"
    );

    if (!confirmed) return;

    try {
      setError("");

      await api.delete(`/budgets/${id}`);

      await fetchBudgets();
    } catch (err) {
      console.error(
        "Delete budget error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to delete budget"
      );
    }
  };

  const calculatePercentage = (
    spent,
    amount
  ) => {
    if (Number(amount) <= 0) return 0;

    return (
      (Number(spent || 0) /
        Number(amount)) *
      100
    );
  };

  const totalBudget = budgets.reduce(
    (sum, budget) =>
      sum + Number(budget.amount || 0),
    0
  );

  const totalSpent = budgets.reduce(
    (sum, budget) =>
      sum + Number(budget.spent || 0),
    0
  );

  const totalRemaining =
    totalBudget - totalSpent;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* SIDEBAR */}

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() =>
          setSidebarOpen(false)
        }
      />

      {/* NAVBAR */}

      <Navbar
        onMenuClick={() =>
          setSidebarOpen(true)
        }
      />

      {/* MAIN CONTENT */}

      <main
        className="
          p-4
          pt-20
          sm:p-6
          sm:pt-22
          lg:ml-64
          lg:p-8
          lg:pt-24
        "
      >

        {/* PAGE HEADER */}

        <div
          className="
            mb-7
            flex
            flex-col
            gap-4
            sm:flex-row
            sm:items-end
            sm:justify-between
          "
        >

          <div>

            <p
              className="
                mb-1
                text-sm
                font-medium
                text-green-600
              "
            >
              Spending plan
            </p>

            <h1
              className="
                text-2xl
                font-bold
                tracking-tight
                text-gray-900
                sm:text-3xl
              "
            >
              Budgets
            </h1>

            <p
              className="
                mt-1.5
                max-w-xl
                text-sm
                text-gray-500
              "
            >
              Set spending limits for different
              categories and see how much you have
              left.
            </p>

          </div>

          <button
            onClick={openCreateForm}
            className="
              inline-flex
              w-full
              items-center
              justify-center
              gap-2
              rounded-lg
              bg-green-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition
              hover:bg-green-700
              sm:w-auto
            "
          >
            <Plus size={18} />
            Add Budget
          </button>

        </div>

        {/* ERROR */}

        {error && !showForm && (
          <div
            className="
              mb-5
              rounded-lg
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              text-red-700
            "
          >
            {error}
          </div>
        )}

        {/* SUMMARY */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-3
          "
        >

          {/* TOTAL BUDGET */}

          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Total Budget
                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  {formatCurrency(
                    totalBudget
                  )}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-gray-100
                  p-2.5
                "
              >
                <Wallet
                  size={20}
                  className="text-gray-600"
                />
              </div>

            </div>

          </div>

          {/* TOTAL SPENT */}

          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Total Spent
                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  {formatCurrency(
                    totalSpent
                  )}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-gray-100
                  p-2.5
                "
              >
                <span
                  className="
                    text-lg
                    font-bold
                    text-gray-600
                  "
                >
                  ₹
                </span>
              </div>

            </div>

          </div>

          {/* REMAINING */}

          <div
            className="
              rounded-xl
              border
              border-gray-200
              bg-white
              p-5
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Remaining
                </p>

                <p
                  className={`
                    mt-2
                    text-2xl
                    font-bold
                    ${
                      totalRemaining >= 0
                        ? "text-green-600"
                        : "text-red-600"
                    }
                  `}
                >
                  {formatCurrency(
                    totalRemaining
                  )}
                </p>

              </div>

              <div
                className={`
                  rounded-lg
                  p-2.5
                  ${
                    totalRemaining >= 0
                      ? "bg-green-50"
                      : "bg-red-50"
                  }
                `}
              >
                <Wallet
                  size={20}
                  className={
                    totalRemaining >= 0
                      ? "text-green-600"
                      : "text-red-600"
                  }
                />
              </div>

            </div>

          </div>

        </div>

        {/* BUDGET SECTION */}

        <section className="mt-7">

          <div
            className="
              mb-4
              flex
              items-center
              justify-between
            "
          >

            <div>

              <h2
                className="
                  text-lg
                  font-semibold
                  text-gray-900
                "
              >
                Your budgets
              </h2>

              <p
                className="
                  mt-0.5
                  text-sm
                  text-gray-500
                "
              >
                Track your spending limits.
              </p>

            </div>

            {budgets.length > 0 && (
              <span
                className="
                  text-sm
                  text-gray-500
                "
              >
                {budgets.length}{" "}
                {budgets.length === 1
                  ? "budget"
                  : "budgets"}
              </span>
            )}

          </div>

          {/* LOADING */}

          {loading ? (

            <div
              className="
                rounded-xl
                border
                border-gray-200
                bg-white
                p-10
              "
            >

              <div className="text-center">

                <div
                  className="
                    mx-auto
                    mb-3
                    h-8
                    w-8
                    animate-spin
                    rounded-full
                    border-4
                    border-gray-200
                    border-t-green-600
                  "
                />

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Loading budgets...
                </p>

              </div>

            </div>

          ) : budgets.length === 0 ? (

            /* EMPTY STATE */

            <div
              className="
                rounded-xl
                border
                border-dashed
                border-gray-300
                bg-white
                px-6
                py-12
                text-center
              "
            >

              <div
                className="
                  mx-auto
                  flex
                  h-12
                  w-12
                  items-center
                  justify-center
                  rounded-xl
                  bg-gray-100
                "
              >

                <Wallet
                  size={24}
                  className="text-gray-500"
                />

              </div>

              <h3
                className="
                  mt-4
                  text-base
                  font-semibold
                  text-gray-900
                "
              >
                No budgets yet
              </h3>

              <p
                className="
                  mx-auto
                  mt-1.5
                  max-w-md
                  text-sm
                  leading-6
                  text-gray-500
                "
              >
                Create your first budget to set
                a spending limit for food, shopping,
                transport or other categories.
              </p>

              <button
                onClick={openCreateForm}
                className="
                  mt-5
                  inline-flex
                  items-center
                  gap-2
                  rounded-lg
                  bg-green-600
                  px-4
                  py-2.5
                  text-sm
                  font-semibold
                  text-white
                  hover:bg-green-700
                "
              >
                <Plus size={18} />
                Create your first budget
              </button>

            </div>

          ) : (

            /* BUDGET CARDS */

            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {budgets.map((budget) => {

                const amount =
                  Number(
                    budget.amount || 0
                  );

                const spent =
                  Number(
                    budget.spent || 0
                  );

                const remaining =
                  amount - spent;

                const percentage =
                  calculatePercentage(
                    spent,
                    amount
                  );

                const isOverBudget =
                  spent > amount;

                const progress =
                  Math.min(
                    percentage,
                    100
                  );

                return (
                  <div
                    key={budget.id}
                    className="
                      rounded-xl
                      border
                      border-gray-200
                      bg-white
                      p-5
                      transition
                      hover:border-gray-300
                    "
                  >

                    {/* CARD HEADER */}

                    <div
                      className="
                        flex
                        items-start
                        justify-between
                        gap-3
                      "
                    >

                      <div className="min-w-0">

                        <h3
                          className="
                            truncate
                            text-base
                            font-semibold
                            text-gray-900
                          "
                        >
                          {budget.category}
                        </h3>

                        <p
                          className="
                            mt-1
                            text-xs
                            text-gray-500
                          "
                        >
                          {getMonthName(
                            budget.month
                          )}{" "}
                          {budget.year}
                        </p>

                      </div>

                      <div
                        className="
                          flex
                          shrink-0
                          items-center
                          gap-1
                        "
                      >

                        <button
                          onClick={() =>
                            openEditForm(
                              budget
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            hover:bg-gray-100
                            hover:text-gray-900
                          "
                          title="Edit budget"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              budget.id
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            hover:bg-red-50
                            hover:text-red-600
                          "
                          title="Delete budget"
                        >
                          <Trash2 size={16} />
                        </button>

                      </div>

                    </div>

                    {/* AMOUNTS */}

                    <div
                      className="
                        mt-5
                        flex
                        items-end
                        justify-between
                      "
                    >

                      <div>

                        <p
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          Spent
                        </p>

                        <p
                          className="
                            mt-1
                            text-xl
                            font-bold
                            text-gray-900
                          "
                        >
                          {formatCurrency(
                            spent
                          )}
                        </p>

                      </div>

                      <div className="text-right">

                        <p
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          Limit
                        </p>

                        <p
                          className="
                            mt-1
                            text-sm
                            font-semibold
                            text-gray-700
                          "
                        >
                          {formatCurrency(
                            amount
                          )}
                        </p>

                      </div>

                    </div>

                    {/* PROGRESS */}

                    <div className="mt-5">

                      <div
                        className="
                          flex
                          items-center
                          justify-between
                          text-xs
                        "
                      >

                        <span
                          className={
                            isOverBudget
                              ? "font-medium text-red-600"
                              : "text-gray-500"
                          }
                        >
                          {percentage.toFixed(0)}%
                          {" "}used
                        </span>

                        <span
                          className={
                            isOverBudget
                              ? "font-medium text-red-600"
                              : "text-gray-500"
                          }
                        >
                          {isOverBudget
                            ? `${formatCurrency(
                                Math.abs(
                                  remaining
                                )
                              )} over`
                            : `${formatCurrency(
                                remaining
                              )} left`}
                        </span>

                      </div>

                      <div
                        className="
                          mt-2
                          h-2
                          overflow-hidden
                          rounded-full
                          bg-gray-100
                        "
                      >

                        <div
                          className={`
                            h-full
                            rounded-full
                            transition-all
                            ${
                              isOverBudget
                                ? "bg-red-500"
                                : "bg-green-600"
                            }
                          `}
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* STATUS */}

                    <div
                      className="
                        mt-4
                        border-t
                        border-gray-100
                        pt-3
                      "
                    >

                      <p
                        className={`
                          text-xs
                          ${
                            isOverBudget
                              ? "font-medium text-red-600"
                              : "text-gray-500"
                          }
                        `}
                      >
                        {isOverBudget
                          ? "You have exceeded this budget."
                          : `${formatCurrency(
                              remaining
                            )} available to spend`}
                      </p>

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </main>

      {/* ADD / EDIT MODAL */}

      {showForm && (
        <div
          className="
            fixed
            inset-0
            z-50
            flex
            items-center
            justify-center
            bg-black/40
            p-4
          "
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-md
              overflow-y-auto
              rounded-xl
              bg-white
              shadow-xl
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                flex
                items-start
                justify-between
                border-b
                border-gray-200
                p-5
              "
            >

              <div>

                <h2
                  className="
                    text-lg
                    font-semibold
                    text-gray-900
                  "
                >
                  {editingBudget
                    ? "Edit Budget"
                    : "Add Budget"}
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Set a spending limit for a category.
                </p>

              </div>

              <button
                onClick={closeForm}
                className="
                  rounded-lg
                  p-2
                  text-gray-500
                  hover:bg-gray-100
                "
              >
                <X size={19} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="p-5"
            >

              {error && (
                <div
                  className="
                    mb-4
                    rounded-lg
                    border
                    border-red-200
                    bg-red-50
                    px-3
                    py-2.5
                    text-sm
                    text-red-700
                  "
                >
                  {error}
                </div>
              )}

              {/* CATEGORY */}

              <div>

                <label
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Category
                </label>

                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    bg-white
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-green-500
                    focus:ring-2
                    focus:ring-green-100
                  "
                >

                  <option value="">
                    Select category
                  </option>

                  {categories.map(
                    (category) => (
                      <option
                        key={category}
                        value={category}
                      >
                        {category}
                      </option>
                    )
                  )}

                </select>

              </div>

              {/* AMOUNT */}

              <div className="mt-4">

                <label
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Budget Amount
                </label>

                <div className="relative">

                  <span
                    className="
                      absolute
                      left-3
                      top-1/2
                      -translate-y-1/2
                      text-sm
                      text-gray-500
                    "
                  >
                    ₹
                  </span>

                  <input
                    type="number"
                    name="amount"
                    min="1"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="5000"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-8
                      py-2.5
                      text-sm
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-100
                    "
                  />

                </div>

              </div>

              {/* MONTH + YEAR */}

              <div
                className="
                  mt-4
                  grid
                  grid-cols-2
                  gap-4
                "
              >

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    Month
                  </label>

                  <select
                    name="month"
                    value={formData.month}
                    onChange={handleInputChange}
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      bg-white
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-100
                    "
                  >

                    {Array.from(
                      { length: 12 },
                      (_, index) => (
                        <option
                          key={index + 1}
                          value={index + 1}
                        >
                          {getMonthName(
                            index + 1
                          )}
                        </option>
                      )
                    )}

                  </select>

                </div>

                <div>

                  <label
                    className="
                      mb-1.5
                      block
                      text-sm
                      font-medium
                      text-gray-700
                    "
                  >
                    Year
                  </label>

                  <input
                    type="number"
                    name="year"
                    min="2020"
                    max="2100"
                    value={formData.year}
                    onChange={handleInputChange}
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-3
                      py-2.5
                      text-sm
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-100
                    "
                  />

                </div>

              </div>

              {/* ACTIONS */}

              <div
                className="
                  mt-6
                  flex
                  flex-col-reverse
                  gap-3
                  sm:flex-row
                  sm:justify-end
                "
              >

                <button
                  type="button"
                  onClick={closeForm}
                  className="
                    rounded-lg
                    border
                    border-gray-300
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-gray-700
                    hover:bg-gray-50
                  "
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="
                    rounded-lg
                    bg-green-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    hover:bg-green-700
                  "
                >
                  {editingBudget
                    ? "Update Budget"
                    : "Create Budget"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default Budgets;