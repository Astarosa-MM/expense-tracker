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
  const monthly = expenses;
  const total = monthly.reduce((sum, e) => sum + e.amount_cents, 0);
  const visible = monthly;
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
    tr.append(actions); $('rows').append(tr);
  }

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
