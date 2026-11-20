// MEMBER 2: transactions page
let editId = null, currentPage = 1, totalPages = 1;

function filterQuery() {
  const p = new URLSearchParams({
    q: $("fQ").value, type: $("fType").value, category: $("fCategory").value,
    from: $("fFrom").value, to: $("fTo").value, sort: $("fSort").value,
  });
  for (const [k, v] of [...p]) if (!v) p.delete(k);
  return p;
}

async function loadTransactions() {
  try {
    const p = filterQuery();
    p.set("page", currentPage);
    const data = await api("/api/transactions?" + p);
    totalPages = data.pages;
    $("pageInfo").textContent = `Page ${data.page} of ${data.pages} (${data.total} records)`;
    $("tList").innerHTML = data.items.length
      ? data.items.map((t) => `
        <tr>
          <td>${new Date(t.date).toLocaleDateString()}</td>
          <td>${esc(t.title)}</td>
          <td>${esc(t.category)}</td>
          <td class="${t.type}-text">${t.type === "income" ? "+" : "-"}${money(t.amount)}</td>
          <td>
            <button class="del" onclick='startEdit(${JSON.stringify(t).replace(/'/g, "&#39;")})'>✏️</button>
            <button class="del" onclick="deleteTransaction(${t.id})">🗑️</button>
          </td>
        </tr>`).join("")
      : `<tr><td colspan="5">No transactions found</td></tr>`;
  } catch (e) { toast(e.message); }
}

function startEdit(t) {
  editId = t.id;
  $("tTitle").value = t.title; $("tAmount").value = t.amount; $("tType").value = t.type;
  $("tCategory").value = t.category; $("tDate").value = t.date.slice(0, 10);
  $("formTitle").textContent = "Edit Transaction"; $("tSave").textContent = "Update";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function resetForm() {
  editId = null;
  $("tTitle").value = ""; $("tAmount").value = ""; $("tDate").value = today();
  $("formTitle").textContent = "Add Transaction"; $("tSave").textContent = "Add";
}

async function deleteTransaction(id) {
  if (!confirm("Delete this transaction?")) return;
  try { await api("/api/transactions/" + id, "DELETE"); toast("Deleted"); loadTransactions(); } catch (e) { toast(e.message); }
}

$("tSave").onclick = async () => {
  const body = {
    title: $("tTitle").value, amount: $("tAmount").value, type: $("tType").value,
    category: $("tCategory").value, date: $("tDate").value,
  };
  try {
    if (editId) await api("/api/transactions/" + editId, "PUT", body);
    else await api("/api/transactions", "POST", body);
    $("tMsg").textContent = "";
    toast(editId ? "Updated" : "Added");
    resetForm();
    loadTransactions();
  } catch (e) { $("tMsg").textContent = e.message; }
};

$("fApply").onclick = () => { currentPage = 1; loadTransactions(); };
$("prevBtn").onclick = () => { if (currentPage > 1) { currentPage--; loadTransactions(); } };
$("nextBtn").onclick = () => { if (currentPage < totalPages) { currentPage++; loadTransactions(); } };

$("fExport").onclick = async () => {
  const res = await fetch("/api/transactions/export?" + filterQuery(), { headers: { Authorization: "Bearer " + token } });
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "transactions.csv";
  a.click();
};

pages.transactions = () => { if (!$("tDate").value) $("tDate").value = today(); loadTransactions(); };
