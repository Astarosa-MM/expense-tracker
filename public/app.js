import { api } from './api.js';
const $ = id => document.getElementById(id);
const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];
const money = cents => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
const today = new Date();
const localDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
$('month').value = localDate.slice(0, 7);
$('date').value = localDate;
for (const category of categories) {
  $('category').add(new Option(category, category));
  $('filter').add(new Option(category, category));
}
let expenses = [], budget = null, editing = null, refreshId = 0;
const status = (message, error = false) => { $('status').textContent = message; $('status').classList.toggle('error', error); };
function resetForm() {
  editing = null; $('expense-form').reset(); $('date').value = localDate;
  $('form-title').textContent = 'Add an expense'; $('save-expense').textContent = 'Add expense ↗'; $('cancel').hidden = true;
}
function render() {
  const monthly = expenses.filter(e => e.date.slice(0, 7) === $('month').value);
  const total = monthly.reduce((sum, e) => sum + e.amount_cents, 0);
  $('total').textContent = money(total);
  $('count').textContent = `${monthly.length} expense${monthly.length === 1 ? '' : 's'} this month`;
  const visible = monthly.filter(e => !$('filter').value || e.category === $('filter').value);
  $('rows').replaceChildren(); $('empty').hidden = visible.length > 0;
  for (const expense of visible) {
    const tr = document.createElement('tr');
    const description = document.createElement('td');
    const name = document.createElement('strong'); name.textContent = expense.description;
    const category = document.createElement('small'); category.textContent = expense.category;
    description.append(name, category); tr.append(description);
    for (const text of [expense.date, money(expense.amount_cents)]) {
      const td = document.createElement('td'); td.textContent = text; tr.append(td);
    }
    const actions = document.createElement('td'); actions.className = 'actions';
    const edit = document.createElement('button'); edit.textContent = 'Edit'; edit.setAttribute('aria-label', `Edit ${expense.description}`);
    edit.onclick = () => {
      editing = expense.id; $('description').value = expense.description; $('amount').value = (expense.amount_cents / 100).toFixed(2);
      $('date').value = expense.date; $('category').value = expense.category;
      $('form-title').textContent = 'Edit expense'; $('save-expense').textContent = 'Save changes'; $('cancel').hidden = false; $('description').focus();
    };
    const remove = document.createElement('button'); remove.textContent = 'Delete'; remove.setAttribute('aria-label', `Delete ${expense.description}`);
    remove.onclick = async () => {
      if (!confirm(`Delete “${expense.description}”?`)) return;
      remove.disabled = true;
      try { await api.remove(expense.id); if (editing === expense.id) resetForm(); await refresh('Expense deleted.'); }
      catch (error) { status(error.message, true); remove.disabled = false; }
    };
    actions.append(edit, remove); tr.append(actions); $('rows').append(tr);
  }
  $('breakdown').replaceChildren();
  for (const category of categories) {
    const amount = monthly.filter(e => e.category === category).reduce((sum, e) => sum + e.amount_cents, 0);
    if (!amount) continue;
    const row = document.createElement('div'); row.className = 'category-row';
    const label = document.createElement('div'); label.textContent = `${category} · ${money(amount)}`;
    const meter = document.createElement('meter'); meter.min = 0; meter.max = total; meter.value = amount; meter.setAttribute('aria-label', `${category} share of monthly spending`);
    row.append(label, meter); $('breakdown').append(row);
  }
  if (!total) $('breakdown').textContent = 'Your spending breakdown will appear here.';
}
async function refresh(message = 'Connected • Your expenses are saved on the server.') {
  const requestId = ++refreshId;
  try {
    const newExpenses = await api.list();
    if (requestId !== refreshId) return;
    expenses = newExpenses;
    render(); status(message);
  } catch (error) { if (requestId === refreshId) status(`Could not load data: ${error.message}`, true); }
}
$('expense-form').onsubmit = async event => {
  event.preventDefault(); $('save-expense').disabled = true;
  try {
    await api.save({ description: $('description').value, amount_cents: Math.round(Number($('amount').value) * 100), date: $('date').value, category: $('category').value }, editing);
    const month = $('date').value.slice(0, 7); resetForm(); $('month').value = month; $('filter').value = '';
    await refresh('Expense saved.');
  } catch (error) { status(error.message, true); }
  finally { $('save-expense').disabled = false; }
};
$('cancel').onclick = resetForm;
$('month').onchange = () => { if ($('month').value) { status('Loading month…'); refresh(); } };
$('filter').onchange = render;
refresh();
