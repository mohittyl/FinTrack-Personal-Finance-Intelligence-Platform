import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  Target,
  X,
  Wallet,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function Goals() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [goals, setGoals] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showForm, setShowForm] =
    useState(false);

  const [showMoneyForm, setShowMoneyForm] =
    useState(false);

  const [editingGoal, setEditingGoal] =
    useState(null);

  const [selectedGoal, setSelectedGoal] =
    useState(null);

  const [formData, setFormData] = useState({
    title: "",
    target_amount: "",
    saved_amount: "",
    target_date: "",
  });

  const [moneyAmount, setMoneyAmount] =
    useState("");

  useEffect(() => {
    fetchGoals();
  }, []);

  /*
    GET GOALS
  */

  const fetchGoals = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get("/goals");

      setGoals(response.data);
    } catch (err) {
      console.error(
        "Goals error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to load goals"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    FORMAT CURRENCY
  */

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  /*
    FORMAT DATE
  */

  const formatDate = (date) => {
    if (!date) {
      return "-";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  /*
    INPUT CHANGE
  */

  const handleInputChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
    OPEN CREATE FORM
  */

  const openCreateForm = () => {
    setEditingGoal(null);

    setFormData({
      title: "",
      target_amount: "",
      saved_amount: "",
      target_date: "",
    });

    setError("");

    setShowForm(true);
  };

  /*
    OPEN EDIT FORM
  */

  const openEditForm = (goal) => {
    setEditingGoal(goal);

    setFormData({
      title: goal.title || "",
      target_amount:
        goal.target_amount ||
        goal.targetAmount ||
        "",
      saved_amount:
        goal.saved_amount ??
        goal.savedAmount ??
        "",
      target_date:
        goal.target_date ||
        goal.targetDate ||
        "",
    });

    setError("");

    setShowForm(true);
  };

  /*
    CLOSE FORM
  */

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

  /*
    CREATE / UPDATE GOAL
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (!formData.title.trim()) {
        setError(
          "Please enter a goal name."
        );
        return;
      }

      if (
        !formData.target_amount ||
        Number(formData.target_amount) <= 0
      ) {
        setError(
          "Please enter a valid target amount."
        );
        return;
      }

      if (
        formData.saved_amount !== "" &&
        Number(formData.saved_amount) < 0
      ) {
        setError(
          "Saved amount cannot be negative."
        );
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
        target_amount: Number(
          formData.target_amount
        ),
        saved_amount: Number(
          formData.saved_amount || 0
        ),
        target_date:
          formData.target_date || null,
      };

      if (editingGoal) {
        await api.put(
          `/goals/${editingGoal.id}`,
          payload
        );
      } else {
        await api.post(
          "/goals",
          payload
        );
      }

      closeForm();

      await fetchGoals();
    } catch (err) {
      console.error(
        "Save goal error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to save goal"
      );
    }
  };

  /*
    DELETE GOAL
  */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this goal?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/goals/${id}`
      );

      await fetchGoals();
    } catch (err) {
      console.error(
        "Delete goal error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to delete goal"
      );
    }
  };

  /*
    OPEN ADD MONEY FORM
  */

  const openMoneyForm = (goal) => {
    setSelectedGoal(goal);

    setMoneyAmount("");

    setError("");

    setShowMoneyForm(true);
  };

  /*
    CLOSE ADD MONEY FORM
  */

  const closeMoneyForm = () => {
    setShowMoneyForm(false);

    setSelectedGoal(null);

    setMoneyAmount("");
  };

  /*
    ADD MONEY
  */

  const handleAddMoney = async (e) => {
    e.preventDefault();

    try {
      setError("");

      if (
        !moneyAmount ||
        Number(moneyAmount) <= 0
      ) {
        setError(
          "Please enter a valid amount."
        );
        return;
      }

      if (!selectedGoal) {
        return;
      }

      const currentSaved =
        Number(
          selectedGoal.saved_amount ??
            selectedGoal.savedAmount ??
            0
        );

      const targetAmount =
        Number(
          selectedGoal.target_amount ??
            selectedGoal.targetAmount ??
            0
        );

      const newSavedAmount =
        currentSaved +
        Number(moneyAmount);

      if (
        newSavedAmount >
        targetAmount
      ) {
        setError(
          `You can add only ${formatCurrency(
            targetAmount -
              currentSaved
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
      console.error(
        "Add money error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to add money"
      );
    }
  };

  /*
    CALCULATIONS
  */

  const totalTarget = goals.reduce(
    (sum, goal) =>
      sum +
      Number(
        goal.target_amount ??
          goal.targetAmount ??
          0
      ),
    0
  );

  const totalSaved = goals.reduce(
    (sum, goal) =>
      sum +
      Number(
        goal.saved_amount ??
          goal.savedAmount ??
          0
      ),
    0
  );

  const totalRemaining = Math.max(
    totalTarget - totalSaved,
    0
  );

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

      {/* MAIN */}

      <main
        className="
          p-4
          pt-20
          sm:p-6
          sm:pt-20
          lg:ml-64
          lg:p-8
          lg:pt-24
        "
      >

        {/* PAGE HEADER */}

        <div
          className="
            mb-6
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
              Savings plan
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
              Goals
            </h1>

            <p
              className="
                mt-1.5
                text-sm
                text-gray-500
              "
            >
              Set savings goals and track your
              progress over time.
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
            Add Goal
          </button>

        </div>

        {/* ERROR */}

        {error &&
          !showForm &&
          !showMoneyForm && (
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

        {/* =====================================================
            SUMMARY
        ====================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-3
          "
        >

          {/* TOTAL TARGET */}

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
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Total Target
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
                    totalTarget
                  )}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-gray-100
                  p-2
                "
              >

                <Target
                  size={20}
                  className="text-gray-600"
                />

              </div>

            </div>

          </div>

          {/* TOTAL SAVED */}

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
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Total Saved
                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-green-600
                  "
                >
                  {formatCurrency(
                    totalSaved
                  )}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-green-50
                  p-2
                "
              >

                <Wallet
                  size={20}
                  className="text-green-600"
                />

              </div>

            </div>

          </div>

          {/* TOTAL REMAINING */}

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
                items-start
                justify-between
                gap-3
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Total Remaining
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
                    totalRemaining
                  )}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-gray-100
                  p-2
                "
              >

                <Target
                  size={20}
                  className="text-gray-600"
                />

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            GOALS SECTION
        ====================================================== */}

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
                Your goals
              </h2>

              <p
                className="
                  mt-0.5
                  text-sm
                  text-gray-500
                "
              >
                Track your progress toward each goal.
              </p>

            </div>

            {goals.length > 0 && (
              <span
                className="
                  text-sm
                  text-gray-500
                "
              >
                {goals.length}{" "}
                {goals.length === 1
                  ? "goal"
                  : "goals"}
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
                  Loading goals...
                </p>

              </div>

            </div>

          ) : goals.length === 0 ? (

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

                <Target
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
                No savings goals yet
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
                Create a goal for something you're
                saving toward, like a laptop, trip,
                emergency fund or education.
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

                Create your first goal

              </button>

            </div>

          ) : (

            /* GOAL CARDS */

            <div
              className="
                grid
                grid-cols-1
                gap-4
                md:grid-cols-2
                xl:grid-cols-3
              "
            >

              {goals.map((goal) => {

                const targetAmount =
                  Number(
                    goal.target_amount ??
                      goal.targetAmount ??
                      0
                  );

                const savedAmount =
                  Number(
                    goal.saved_amount ??
                      goal.savedAmount ??
                      0
                  );

                const remaining =
                  Math.max(
                    targetAmount -
                      savedAmount,
                    0
                  );

                const percentage =
                  targetAmount > 0
                    ? (savedAmount /
                        targetAmount) *
                      100
                    : 0;

                const progress =
                  Math.min(
                    percentage,
                    100
                  );

                const completed =
                  savedAmount >=
                  targetAmount;

                const targetDate =
                  goal.target_date ||
                  goal.targetDate;

                return (
                  <div
                    key={goal.id}
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

                    {/* HEADER */}

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
                          {goal.title}
                        </h3>

                        {targetDate && (
                          <p
                            className="
                              mt-1
                              text-xs
                              text-gray-500
                            "
                          >
                            Target:{" "}
                            {formatDate(
                              targetDate
                            )}
                          </p>
                        )}

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
                              goal
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            hover:bg-gray-100
                            hover:text-gray-900
                          "
                          title="Edit goal"
                        >
                          <Pencil size={16} />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              goal.id
                            )
                          }
                          className="
                            rounded-lg
                            p-2
                            text-gray-500
                            hover:bg-red-50
                            hover:text-red-600
                          "
                          title="Delete goal"
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
                          Saved
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
                            savedAmount
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
                          Target
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
                            targetAmount
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
                          className="
                            font-medium
                            text-gray-600
                          "
                        >
                          {Math.min(
                            percentage,
                            100
                          ).toFixed(0)}
                          % complete
                        </span>

                        <span
                          className="
                            text-gray-500
                          "
                        >
                          {completed
                            ? "Completed"
                            : `${formatCurrency(
                                remaining
                              )} left`}
                        </span>

                      </div>

                      <div
                        className="
                          mt-2
                          h-2.5
                          overflow-hidden
                          rounded-full
                          bg-gray-100
                        "
                      >

                        <div
                          className="
                            h-full
                            rounded-full
                            bg-green-600
                            transition-all
                          "
                          style={{
                            width: `${progress}%`,
                          }}
                        />

                      </div>

                    </div>

                    {/* FOOTER */}

                    <div
                      className="
                        mt-4
                        flex
                        items-center
                        justify-between
                        gap-3
                        border-t
                        border-gray-100
                        pt-3
                      "
                    >

                      {completed ? (

                        <p
                          className="
                            text-xs
                            font-medium
                            text-green-600
                          "
                        >
                          Goal completed 🎉
                        </p>

                      ) : (

                        <p
                          className="
                            text-xs
                            text-gray-500
                          "
                        >
                          {formatCurrency(
                            remaining
                          )}{" "}
                          remaining
                        </p>

                      )}

                      {!completed && (
                        <button
                          onClick={() =>
                            openMoneyForm(
                              goal
                            )
                          }
                          className="
                            inline-flex
                            items-center
                            gap-1.5
                            rounded-lg
                            bg-green-600
                            px-3
                            py-2
                            text-xs
                            font-semibold
                            text-white
                            hover:bg-green-700
                          "
                        >
                          <Plus size={15} />
                          Add Money
                        </button>
                      )}

                    </div>

                  </div>
                );
              })}

            </div>

          )}

        </section>

      </main>

      {/* =====================================================
          CREATE / EDIT GOAL MODAL
      ====================================================== */}

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

            {/* HEADER */}

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
                  {editingGoal
                    ? "Edit Goal"
                    : "Add Goal"}
                </h2>

                <p
                  className="
                    mt-1
                    text-sm
                    text-gray-500
                  "
                >
                  Set a target and start tracking your savings.
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
                <X size={20} />
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

              {/* TITLE */}

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
                  Goal Name
                </label>

                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. New Laptop"
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    text-sm
                    text-gray-900
                    outline-none
                    focus:border-green-500
                    focus:ring-2
                    focus:ring-green-100
                  "
                />

              </div>

              {/* TARGET AMOUNT */}

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
                  Target Amount
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
                    name="target_amount"
                    value={
                      formData.target_amount
                    }
                    onChange={handleInputChange}
                    min="1"
                    step="0.01"
                    placeholder="50000"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-8
                      py-2.5
                      text-sm
                      text-gray-900
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-100
                    "
                  />

                </div>

              </div>

              {/* SAVED AMOUNT */}

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
                  Already Saved
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
                    name="saved_amount"
                    value={
                      formData.saved_amount
                    }
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0"
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-8
                      py-2.5
                      text-sm
                      text-gray-900
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-100
                    "
                  />

                </div>

              </div>

              {/* TARGET DATE */}

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
                  Target Date
                  <span
                    className="
                      ml-1
                      font-normal
                      text-gray-400
                    "
                  >
                    (optional)
                  </span>
                </label>

                <input
                  type="date"
                  name="target_date"
                  value={
                    formData.target_date
                  }
                  onChange={handleInputChange}
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    text-sm
                    text-gray-900
                    outline-none
                    focus:border-green-500
                    focus:ring-2
                    focus:ring-green-100
                  "
                />

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
                  {editingGoal
                    ? "Update Goal"
                    : "Create Goal"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

      {/* =====================================================
          ADD MONEY MODAL
      ====================================================== */}

      {showMoneyForm &&
        selectedGoal && (
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
                w-full
                max-w-md
                rounded-xl
                bg-white
                shadow-xl
              "
            >

              {/* HEADER */}

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
                    Add Money
                  </h2>

                  <p
                    className="
                      mt-1
                      text-sm
                      text-gray-500
                    "
                  >
                    Add money to{" "}
                    <span className="font-medium text-gray-700">
                      {selectedGoal.title}
                    </span>
                  </p>

                </div>

                <button
                  onClick={closeMoneyForm}
                  className="
                    rounded-lg
                    p-2
                    text-gray-500
                    hover:bg-gray-100
                  "
                >
                  <X size={20} />
                </button>

              </div>

              {/* FORM */}

              <form
                onSubmit={handleAddMoney}
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

                {/* CURRENT PROGRESS */}

                <div
                  className="
                    mb-5
                    rounded-lg
                    bg-gray-50
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      text-sm
                    "
                  >

                    <span className="text-gray-500">
                      Current saved
                    </span>

                    <span className="font-semibold text-gray-900">
                      {formatCurrency(
                        selectedGoal.saved_amount ??
                          selectedGoal.savedAmount ??
                          0
                      )}
                    </span>

                  </div>

                  <div
                    className="
                      mt-2
                      flex
                      items-center
                      justify-between
                      text-sm
                    "
                  >

                    <span className="text-gray-500">
                      Target
                    </span>

                    <span className="font-semibold text-gray-900">
                      {formatCurrency(
                        selectedGoal.target_amount ??
                          selectedGoal.targetAmount ??
                          0
                      )}
                    </span>

                  </div>

                </div>

                {/* AMOUNT */}

                <label
                  className="
                    mb-1.5
                    block
                    text-sm
                    font-medium
                    text-gray-700
                  "
                >
                  Amount to add
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
                    value={moneyAmount}
                    onChange={(e) =>
                      setMoneyAmount(
                        e.target.value
                      )
                    }
                    min="1"
                    step="0.01"
                    placeholder="1000"
                    autoFocus
                    className="
                      w-full
                      rounded-lg
                      border
                      border-gray-300
                      px-8
                      py-2.5
                      text-sm
                      text-gray-900
                      outline-none
                      focus:border-green-500
                      focus:ring-2
                      focus:ring-green-100
                    "
                  />

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
                    onClick={closeMoneyForm}
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
                    Add Money
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