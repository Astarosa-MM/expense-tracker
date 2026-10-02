import { api } from './api.js';
const $ = id => document.getElementById(id);
const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];
const categoryColors = { Food: '#ac87cb', Transport: '#7c9cca', Shopping: '#d1a779', Bills: '#8177bc', Health: '#87b6ad', Entertainment: '#cd8fa7', Other: '#9a9aaa' };
const categorySymbols = { Food: '◒', Transport: '↗', Shopping: '◇', Bills: '▤', Health: '＋', Entertainment: '♫', Other: '·' };
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
const status = (message, error = false) => { $('status').textContent = message; $('status').classList.toggle('error', error); $('status').classList.toggle('sr-only', !error); };
function resetForm() {
  editing = null; $('expense-form').reset(); $('date').value = localDate;
  $('form-title').textContent = 'Add an expense'; $('save-expense').textContent = 'Add expense ↗'; $('cancel').hidden = true;
}
function render() {
  const monthly = expenses.filter(e => e.date.slice(0, 7) === $('month').value);
  const total = monthly.reduce((sum, e) => sum + e.amount_cents, 0);
  $('total').textContent = money(total);
  $('count').textContent = `${monthly.length} expense${monthly.length === 1 ? '' : 's'} this month`;
  $('budget-value').textContent = budget === null ? 'Not set' : money(budget);
  $('remaining').textContent = budget === null ? '—' : money(budget - total);
  $('remaining').classList.toggle('error', budget !== null && total > budget);
  $('budget-note').textContent = budget === null ? 'Set a budget to start planning.' : total > budget ? 'Over budget. Time to reassess.' : 'A little breathing room.';
  const visible = monthly.filter(e => !$('filter').value || e.category === $('filter').value);
  $('rows').replaceChildren(); $('empty').hidden = visible.length > 0;
  for (const expense of visible) {
    const tr = document.createElement('tr');
    const description = document.createElement('td');
    const name = document.createElement('strong'); name.textContent = expense.description;
    const category = document.createElement('small'); category.textContent = expense.category;
    const wrapper = document.createElement('div'); wrapper.className = 'expense-description';
    const icon = document.createElement('span'); icon.className = 'category-icon'; icon.textContent = categorySymbols[expense.category]; icon.style.setProperty('--category-color', categoryColors[expense.category]); icon.setAttribute('aria-hidden', 'true');
    const copy = document.createElement('div'); copy.className = 'description-copy'; copy.append(name, category);
    wrapper.append(icon, copy); description.append(wrapper); tr.append(description);
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
  $('chart-total').textContent = money(total);
  const chartStops = []; let chartPercent = 0; const chartLabels = [];
  for (const category of categories) {
    const amount = monthly.filter(e => e.category === category).reduce((sum, e) => sum + e.amount_cents, 0);
    if (!amount) continue;
    const row = document.createElement('div'); row.className = 'category-row';
    row.style.setProperty('--category-color', categoryColors[category]);
    const label = document.createElement('div');
    const labelName = document.createElement('span'); labelName.textContent = category;
    const labelAmount = document.createElement('strong'); labelAmount.textContent = money(amount);
    label.append(labelName, labelAmount);
    const nextPercent = chartPercent + amount / total * 100;
    chartStops.push(`${categoryColors[category]} ${chartPercent}% ${nextPercent}%`); chartPercent = nextPercent;
    chartLabels.push(`${category}: ${money(amount)}`);
    const meter = document.createElement('meter'); meter.min = 0; meter.max = total; meter.value = amount; meter.setAttribute('aria-label', `${category} share of monthly spending`);
    row.append(label, meter); $('breakdown').append(row);
  }
  $('category-chart').style.background = total ? `conic-gradient(${chartStops.join(',')})` : '#eeebf4';
  $('category-chart').setAttribute('aria-label', total ? `Monthly spending: ${chartLabels.join('; ')}` : 'No spending this month');
  if (!total) $('breakdown').textContent = 'Your spending breakdown will appear here.';
}
async function refresh(message = 'Your expenses are up to date.') {
  const requestId = ++refreshId;
  try {
    const [newExpenses, newBudget] = await Promise.all([api.list(), api.budget($('month').value)]);
    if (requestId !== refreshId) return;
    expenses = newExpenses; budget = newBudget.amount_cents;
    $('budget').value = budget === null ? '' : (budget / 100).toFixed(2);
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
$('budget-form').onsubmit = async event => {
  event.preventDefault(); const button = event.submitter; button.disabled = true;
  try { await api.saveBudget($('month').value, Math.round(Number($('budget').value) * 100)); await refresh('Budget saved.'); }
  catch (error) { status(error.message, true); }
  finally { button.disabled = false; }
};
$('cancel').onclick = resetForm;
$('month').onchange = () => { if ($('month').value) { status('Loading month…'); refresh(); } };
$('filter').onchange = render;
refresh();

// Fetch the rate through our backend; amounts and expenses stay in the app.
$('conversion-form').onsubmit = async event => {
  event.preventDefault();
  const amount = Number($('foreign-amount').value);
  const currency = $('foreign-currency').value;
  const result = $('conversion-result');
  const button = $('convert-button');
  button.disabled = true;
  $('foreign-amount').disabled = true; $('foreign-currency').disabled = true;
  result.classList.remove('error');
  result.textContent = 'Fetching reference rate…';
  try {
    const data = await api.exchangeRate(currency);
    const converted = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount * data.rate);
    result.textContent = `${amount.toLocaleString('en-US')} ${currency} ≈ ${converted} USD · 1 ${currency} = ${data.rate} USD · Rate date: ${data.date} · ${data.source}`;
  } catch (error) {
    result.textContent = error.message;
    result.classList.add('error');
  } finally {
    button.disabled = false;
    $('foreign-amount').disabled = false; $('foreign-currency').disabled = false;
  }
};
for (const id of ['foreign-amount', 'foreign-currency']) {
  $(id).oninput = () => {
    $('conversion-result').textContent = 'Press Get exchange rate to convert these values.';
    $('conversion-result').classList.remove('error');
  };
}
