import { useEffect, useState } from "react";

import {
  Plus,
  Pencil,
  Trash2,
  RefreshCw,
  CalendarDays,
  Wallet,
  CircleDollarSign,
} from "lucide-react";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import api from "../services/api";

function RecurringPayments() {
  const [sidebarOpen, setSidebarOpen] =
    useState(false);

  const [payments, setPayments] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [showModal, setShowModal] =
    useState(false);

  const [editingPayment, setEditingPayment] =
    useState(null);

  const [form, setForm] = useState({
    title: "",
    category: "",
    amount: "",
    frequency: "monthly",
    next_payment_date: "",
  });

  /*
  =====================================================
  FETCH PAYMENTS
  =====================================================
  */

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError("");

      const response =
        await api.get(
          "/recurring-payments"
        );

      setPayments(response.data);
    } catch (err) {
      console.error(
        "Recurring payments error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to load recurring payments"
      );
    } finally {
      setLoading(false);
    }
  };

  /*
  =====================================================
  FORM HANDLING
  =====================================================
  */

  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  /*
  =====================================================
  OPEN ADD MODAL
  =====================================================
  */

  const openAddModal = () => {
    setEditingPayment(null);

    setForm({
      title: "",
      category: "",
      amount: "",
      frequency: "monthly",
      next_payment_date: "",
    });

    setShowModal(true);
  };

  /*
  =====================================================
  OPEN EDIT MODAL
  =====================================================
  */

  const openEditModal = (payment) => {
    setEditingPayment(payment);

    setForm({
      title: payment.title || "",
      category: payment.category || "",
      amount: payment.amount || "",
      frequency:
        payment.frequency || "monthly",
      next_payment_date:
        payment.next_payment_date
          ? payment.next_payment_date.slice(0, 10)
          : "",
    });

    setShowModal(true);
  };

  /*
  =====================================================
  CLOSE MODAL
  =====================================================
  */

  const closeModal = () => {
    setShowModal(false);
    setEditingPayment(null);
  };

  /*
  =====================================================
  SUBMIT FORM
  =====================================================
  */

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const payload = {
        title: form.title.trim(),
        category: form.category.trim(),
        amount: Number(form.amount),
        frequency: form.frequency,
        next_payment_date:
          form.next_payment_date,
      };

      if (editingPayment) {
        await api.put(
          `/recurring-payments/${editingPayment.id}`,
          {
            ...payload,
            is_active:
              editingPayment.is_active,
          }
        );
      } else {
        await api.post(
          "/recurring-payments",
          payload
        );
      }

      closeModal();

      await fetchPayments();
    } catch (err) {
      console.error(
        "Save recurring payment error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to save recurring payment"
      );
    }
  };

  /*
  =====================================================
  DELETE PAYMENT
  =====================================================
  */

  const handleDelete = async (id) => {
    const confirmed =
      window.confirm(
        "Are you sure you want to delete this recurring payment?"
      );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(
        `/recurring-payments/${id}`
      );

      await fetchPayments();
    } catch (err) {
      console.error(
        "Delete payment error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to delete payment"
      );
    }
  };

  /*
  =====================================================
  TOGGLE PAYMENT
  =====================================================
  */

  const handleToggle = async (id) => {
    try {
      setError("");

      await api.patch(
        `/recurring-payments/${id}/toggle`
      );

      await fetchPayments();
    } catch (err) {
      console.error(
        "Toggle payment error:",
        err
      );

      setError(
        err.response?.data?.error ||
          "Unable to update payment status"
      );
    }
  };

  /*
  =====================================================
  FORMATTERS
  =====================================================
  */

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(Number(amount || 0));
  };

  const formatDate = (date) => {
    if (!date) {
      return "No date";
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

  const getFrequencyLabel = (
    frequency
  ) => {
    if (frequency === "weekly") {
      return "Weekly";
    }

    if (frequency === "yearly") {
      return "Yearly";
    }

    return "Monthly";
  };

  /*
  =====================================================
  SUMMARY
  =====================================================
  */

  const activePayments =
    payments.filter(
      (payment) =>
        payment.is_active
    );

  const inactivePayments =
    payments.filter(
      (payment) =>
        !payment.is_active
    );

  const monthlyRecurringAmount =
    activePayments.reduce(
      (total, payment) => {
        const amount =
          Number(payment.amount || 0);

        if (
          payment.frequency ===
          "monthly"
        ) {
          return total + amount;
        }

        if (
          payment.frequency ===
          "weekly"
        ) {
          return (
            total +
            amount * 52 / 12
          );
        }

        if (
          payment.frequency ===
          "yearly"
        ) {
          return (
            total +
            amount / 12
          );
        }

        return total;
      },
      0
    );

  /*
  =====================================================
  LOADING
  =====================================================
  */

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">

        <Sidebar
          isOpen={sidebarOpen}
          onClose={() =>
            setSidebarOpen(false)
          }
        />

        <Navbar
          onMenuClick={() =>
            setSidebarOpen(true)
          }
        />

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

          <div
            className="
              flex
              min-h-[55vh]
              items-center
              justify-center
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
                Loading recurring payments...
              </p>

            </div>

          </div>

        </main>

      </div>
    );
  }

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

        {/* =================================================
            HEADER
        ================================================== */}

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
              Regular payments
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
              Recurring Payments
            </h1>

            <p
              className="
                mt-1.5
                text-sm
                text-gray-500
              "
            >
              Keep track of subscriptions,
              bills and other regular payments.
            </p>

          </div>

          <button
            onClick={openAddModal}
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
              font-medium
              text-white
              transition
              hover:bg-green-700
              sm:w-auto
            "
          >

            <Plus size={18} />

            Add Payment

          </button>

        </div>

        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
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

        {/* =================================================
            SUMMARY CARDS
        ================================================== */}

        <div
          className="
            grid
            grid-cols-1
            gap-4
            sm:grid-cols-2
            xl:grid-cols-3
          "
        >

          {/* ACTIVE */}

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
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Active Payments
                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  {activePayments.length}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-green-50
                  p-2
                "
              >

                <RefreshCw
                  size={20}
                  className="text-green-600"
                />

              </div>

            </div>

          </div>

          {/* MONTHLY */}

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
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Monthly Commitment
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
                    monthlyRecurringAmount
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

                <Wallet
                  size={20}
                  className="text-gray-600"
                />

              </div>

            </div>

          </div>

          {/* INACTIVE */}

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
              "
            >

              <div>

                <p
                  className="
                    text-sm
                    text-gray-500
                  "
                >
                  Inactive
                </p>

                <p
                  className="
                    mt-2
                    text-2xl
                    font-bold
                    text-gray-900
                  "
                >
                  {inactivePayments.length}
                </p>

              </div>

              <div
                className="
                  rounded-lg
                  bg-gray-100
                  p-2
                "
              >

                <CircleDollarSign
                  size={20}
                  className="text-gray-600"
                />

              </div>

            </div>

          </div>

        </div>

        {/* =================================================
            PAYMENT LIST
        ================================================== */}

        <section
          className="
            mt-7
            overflow-hidden
            rounded-xl
            border
            border-gray-200
            bg-white
          "
        >

          <div
            className="
              border-b
              border-gray-200
              p-5
            "
          >

            <h2
              className="
                font-semibold
                text-gray-900
              "
            >
              Your recurring payments
            </h2>

            <p
              className="
                mt-1
                text-sm
                text-gray-500
              "
            >
              Manage your regular bills and
              subscriptions.
            </p>

          </div>

          {/* EMPTY */}

          {payments.length === 0 ? (

            <div
              className="
                px-5
                py-16
                text-center
              "
            >

              <CalendarDays
                size={34}
                className="
                  mx-auto
                  text-gray-400
                "
              />

              <h3
                className="
                  mt-4
                  font-semibold
                  text-gray-900
                "
              >
                No recurring payments yet
              </h3>

              <p
                className="
                  mx-auto
                  mt-1.5
                  max-w-md
                  text-sm
                  text-gray-500
                "
              >
                Add your regular bills,
                subscriptions or payments so
                you can keep track of them.
              </p>

              <button
                onClick={openAddModal}
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
                  font-medium
                  text-white
                  hover:bg-green-700
                "
              >

                <Plus size={17} />

                Add Payment

              </button>

            </div>

          ) : (

            <>

              {/* DESKTOP */}

              <div className="hidden md:block">

                <div
                  className="
                    grid
                    grid-cols-[1.5fr_1fr_1fr_1fr_120px]
                    gap-4
                    border-b
                    border-gray-200
                    bg-gray-50
                    px-5
                    py-3
                    text-xs
                    font-medium
                    uppercase
                    tracking-wide
                    text-gray-500
                  "
                >

                  <div>Payment</div>

                  <div>Amount</div>

                  <div>Frequency</div>

                  <div>Next Payment</div>

                  <div>Actions</div>

                </div>

                {payments.map(
                  (payment) => (
                    <div
                      key={payment.id}
                      className="
                        grid
                        grid-cols-[1.5fr_1fr_1fr_1fr_120px]
                        items-center
                        gap-4
                        border-b
                        border-gray-100
                        px-5
                        py-4
                        last:border-b-0
                      "
                    >

                      {/* PAYMENT */}

                      <div className="min-w-0">

                        <p
                          className="
                            truncate
                            text-sm
                            font-semibold
                            text-gray-900
                          "
                        >
                          {payment.title}
                        </p>

                        <p
                          className="
                            mt-1
                            truncate
                            text-xs
                            text-gray-500
                          "
                        >
                          {payment.category}
                        </p>

                      </div>

                      {/* AMOUNT */}

                      <div
                        className="
                          text-sm
                          font-semibold
                          text-gray-900
                        "
                      >
                        {formatCurrency(
                          payment.amount
                        )}
                      </div>

                      {/* FREQUENCY */}

                      <div>

                        <span
                          className="
                            inline-flex
                            rounded-md
                            bg-gray-100
                            px-2.5
                            py-1
                            text-xs
                            font-medium
                            text-gray-700
                          "
                        >
                          {getFrequencyLabel(
                            payment.frequency
                          )}
                        </span>

                      </div>

                      {/* DATE */}

                      <div
                        className="
                          text-sm
                          text-gray-600
                        "
                      >
                        {formatDate(
                          payment.next_payment_date
                        )}
                      </div>

                      {/* ACTIONS */}

                      <div
                        className="
                          flex
                          items-center
                          gap-1
                        "
                      >

                        <button
                          onClick={() =>
                            handleToggle(
                              payment.id
                            )
                          }
                          title={
                            payment.is_active
                              ? "Deactivate"
                              : "Activate"
                          }
                          className={`
                            rounded-md
                            p-2
                            transition
                            ${
                              payment.is_active
                                ? "text-green-600 hover:bg-green-50"
                                : "text-gray-400 hover:bg-gray-100"
                            }
                          `}
                        >
                          <RefreshCw
                            size={16}
                          />
                        </button>

                        <button
                          onClick={() =>
                            openEditModal(
                              payment
                            )
                          }
                          title="Edit"
                          className="
                            rounded-md
                            p-2
                            text-gray-500
                            hover:bg-gray-100
                            hover:text-gray-900
                          "
                        >
                          <Pencil
                            size={16}
                          />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              payment.id
                            )
                          }
                          title="Delete"
                          className="
                            rounded-md
                            p-2
                            text-gray-500
                            hover:bg-red-50
                            hover:text-red-600
                          "
                        >
                          <Trash2
                            size={16}
                          />
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

              {/* MOBILE */}

              <div className="divide-y divide-gray-100 md:hidden">

                {payments.map(
                  (payment) => (
                    <div
                      key={payment.id}
                      className="p-4"
                    >

                      <div
                        className="
                          flex
                          items-start
                          justify-between
                          gap-3
                        "
                      >

                        <div className="min-w-0">

                          <p
                            className="
                              truncate
                              text-sm
                              font-semibold
                              text-gray-900
                            "
                          >
                            {payment.title}
                          </p>

                          <p
                            className="
                              mt-1
                              text-xs
                              text-gray-500
                            "
                          >
                            {payment.category}
                          </p>

                        </div>

                        <span
                          className={`
                            shrink-0
                            rounded-md
                            px-2
                            py-1
                            text-xs
                            font-medium
                            ${
                              payment.is_active
                                ? "bg-green-50 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }
                          `}
                        >
                          {payment.is_active
                            ? "Active"
                            : "Inactive"}
                        </span>

                      </div>

                      <div
                        className="
                          mt-4
                          grid
                          grid-cols-2
                          gap-4
                        "
                      >

                        <div>

                          <p
                            className="
                              text-xs
                              text-gray-500
                            "
                          >
                            Amount
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              font-semibold
                              text-gray-900
                            "
                          >
                            {formatCurrency(
                              payment.amount
                            )}
                          </p>

                        </div>

                        <div>

                          <p
                            className="
                              text-xs
                              text-gray-500
                            "
                          >
                            Frequency
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              font-medium
                              text-gray-800
                            "
                          >
                            {getFrequencyLabel(
                              payment.frequency
                            )}
                          </p>

                        </div>

                        <div>

                          <p
                            className="
                              text-xs
                              text-gray-500
                            "
                          >
                            Next payment
                          </p>

                          <p
                            className="
                              mt-1
                              text-sm
                              font-medium
                              text-gray-800
                            "
                          >
                            {formatDate(
                              payment.next_payment_date
                            )}
                          </p>

                        </div>

                      </div>

                      <div
                        className="
                          mt-4
                          flex
                          items-center
                          justify-end
                          gap-2
                          border-t
                          border-gray-100
                          pt-3
                        "
                      >

                        <button
                          onClick={() =>
                            handleToggle(
                              payment.id
                            )
                          }
                          className="
                            rounded-md
                            border
                            border-gray-200
                            px-3
                            py-1.5
                            text-xs
                            font-medium
                            text-gray-600
                            hover:bg-gray-50
                          "
                        >
                          {payment.is_active
                            ? "Deactivate"
                            : "Activate"}
                        </button>

                        <button
                          onClick={() =>
                            openEditModal(
                              payment
                            )
                          }
                          className="
                            rounded-md
                            border
                            border-gray-200
                            p-2
                            text-gray-500
                            hover:bg-gray-50
                          "
                        >
                          <Pencil
                            size={15}
                          />
                        </button>

                        <button
                          onClick={() =>
                            handleDelete(
                              payment.id
                            )
                          }
                          className="
                            rounded-md
                            border
                            border-gray-200
                            p-2
                            text-gray-500
                            hover:bg-red-50
                            hover:text-red-600
                          "
                        >
                          <Trash2
                            size={15}
                          />
                        </button>

                      </div>

                    </div>
                  )
                )}

              </div>

            </>

          )}

        </section>

      </main>

      {/* ===================================================
          ADD / EDIT MODAL
      ==================================================== */}

      {showModal && (
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
          onMouseDown={(e) => {
            if (
              e.target === e.currentTarget
            ) {
              closeModal();
            }
          }}
        >

          <div
            className="
              max-h-[90vh]
              w-full
              max-w-lg
              overflow-y-auto
              rounded-xl
              bg-white
            "
          >

            {/* MODAL HEADER */}

            <div
              className="
                border-b
                border-gray-200
                px-5
                py-4
              "
            >

              <h2
                className="
                  font-semibold
                  text-gray-900
                "
              >
                {editingPayment
                  ? "Edit recurring payment"
                  : "Add recurring payment"}
              </h2>

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                Add the details of your regular
                payment.
              </p>

            </div>

            {/* FORM */}

            <form
              onSubmit={handleSubmit}
              className="space-y-4 p-5"
            >

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
                  Payment name
                </label>

                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Netflix"
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-green-600
                    focus:ring-1
                    focus:ring-green-600
                  "
                />

              </div>

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
                  value={form.category}
                  onChange={handleChange}
                  required
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
                    focus:border-green-600
                    focus:ring-1
                    focus:ring-green-600
                  "
                >

                  <option value="">
                    Select category
                  </option>

                  <option value="Bills">
                    Bills
                  </option>

                  <option value="Entertainment">
                    Entertainment
                  </option>

                  <option value="Education">
                    Education
                  </option>

                  <option value="Healthcare">
                    Healthcare
                  </option>

                  <option value="Shopping">
                    Shopping
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>

              {/* AMOUNT */}

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
                  Amount
                </label>

                <input
                  type="number"
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  placeholder="0"
                  min="1"
                  step="0.01"
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-green-600
                    focus:ring-1
                    focus:ring-green-600
                  "
                />

              </div>

              {/* FREQUENCY */}

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
                  Frequency
                </label>

                <select
                  name="frequency"
                  value={form.frequency}
                  onChange={handleChange}
                  required
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
                    focus:border-green-600
                    focus:ring-1
                    focus:ring-green-600
                  "
                >

                  <option value="weekly">
                    Weekly
                  </option>

                  <option value="monthly">
                    Monthly
                  </option>

                  <option value="yearly">
                    Yearly
                  </option>

                </select>

              </div>

              {/* DATE */}

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
                  Next payment date
                </label>

                <input
                  type="date"
                  name="next_payment_date"
                  value={
                    form.next_payment_date
                  }
                  onChange={handleChange}
                  required
                  className="
                    w-full
                    rounded-lg
                    border
                    border-gray-300
                    px-3
                    py-2.5
                    text-sm
                    outline-none
                    focus:border-green-600
                    focus:ring-1
                    focus:ring-green-600
                  "
                />

              </div>

              {/* BUTTONS */}

              <div
                className="
                  flex
                  flex-col-reverse
                  gap-2
                  border-t
                  border-gray-100
                  pt-4
                  sm:flex-row
                  sm:justify-end
                "
              >

                <button
                  type="button"
                  onClick={closeModal}
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
                    font-medium
                    text-white
                    hover:bg-green-700
                  "
                >
                  {editingPayment
                    ? "Save Changes"
                    : "Add Payment"}
                </button>

              </div>

            </form>

          </div>

        </div>
      )}

    </div>
  );
}

export default RecurringPayments;