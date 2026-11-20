// MEMBER 3: budgets + savings goals
async function loadBudgets() {
  try {
    const month = $("bMonth").value;
    const list = await api("/api/budgets?month=" + month);
    $("bList").innerHTML = list.length
      ? list.map((b) => {
          const pct = Math.round((b.spent / b.limit) * 100);
          const color = pct > 100 ? "#dc2626" : pct > 80 ? "#f59e0b" : "#16a34a";
          return `
          <div class="bar-row">
            <div class="between"><b>${esc(b.category)}</b>
              <span>${money(b.spent)} / ${money(b.limit)} (${pct}%)
              <button class="del" onclick="deleteBudget(${b.id})">🗑️</button></span></div>
            <div class="bar-bg"><div class="bar" style="width:${Math.min(pct, 100)}%;background:${color}"></div></div>
            ${pct > 100 ? '<small class="error">⚠️ Budget cross ho gaya!</small>' : ""}
          </div>`;
        }).join("")
      : "<p class='muted'>No budgets set for this month.</p>";
  } catch (e) { toast(e.message); }
}

async function loadGoals() {
  try {
    const list = await api("/api/goals");
    $("gList").innerHTML = list.length
      ? list.map((g) => {
          const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
          return `
          <div class="bar-row">
            <div class="between"><b>${esc(g.title)}</b>
              <span>${money(g.saved)} / ${money(g.target)} (${pct}%)
              <button class="del" onclick="addToGoal(${g.id})">➕</button>
              <button class="del" onclick="deleteGoal(${g.id})">🗑️</button></span></div>
            <div class="bar-bg"><div class="bar" style="width:${pct}%"></div></div>
            ${pct >= 100 ? "<small>🎉 Goal complete!</small>" : ""}
          </div>`;
        }).join("")
      : "<p class='muted'>No goals yet.</p>";
  } catch (e) { toast(e.message); }
}

async function deleteBudget(id) { await api("/api/budgets/" + id, "DELETE"); loadBudgets(); }
async function deleteGoal(id) { if (confirm("Delete goal?")) { await api("/api/goals/" + id, "DELETE"); loadGoals(); } }
async function addToGoal(id) {
  const amount = prompt("How much do you want to add?");
  if (!amount) return;
  try { await api(`/api/goals/${id}/add`, "PATCH", { amount }); loadGoals(); } catch (e) { toast(e.message); }
}

$("bSave").onclick = async () => {
  try {
    await api("/api/budgets", "PUT", { category: $("bCategory").value, limit: $("bLimit").value, month: $("bMonth").value });
    $("bMsg").textContent = ""; $("bLimit").value = ""; loadBudgets();
  } catch (e) { $("bMsg").textContent = e.message; }
};
$("gSave").onclick = async () => {
  try {
    await api("/api/goals", "POST", { title: $("gTitle").value, target: $("gTarget").value });
    $("gMsg").textContent = ""; $("gTitle").value = ""; $("gTarget").value = ""; loadGoals();
  } catch (e) { $("gMsg").textContent = e.message; }
};
$("bMonth").onchange = loadBudgets;

pages.budgets = () => { if (!$("bMonth").value) $("bMonth").value = thisMonth(); loadBudgets(); loadGoals(); };
