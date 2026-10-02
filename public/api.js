// This is the file to link for the assignment's remote-server access requirement.
// Relative URLs call the same server hosting the page, locally or after deployment.
async function request(path, method = 'GET', data) {
  const response = await fetch(`/api${path}`, {
    method,
    headers: data === undefined ? {} : { 'Content-Type': 'application/json' },
    body: data === undefined ? undefined : JSON.stringify(data)
  });
  const payload = await response.json();
  if (!response.ok) throw new Error(payload.error || 'Request failed.');
  return payload;
}
export const api = {
  list: () => request('/expenses'),
  save: (data, id) => request(id ? `/expenses/${id}` : '/expenses', id ? 'PUT' : 'POST', data),
  remove: id => request(`/expenses/${id}`, 'DELETE'),
  budget: month => request(`/budgets/${month}`),
  saveBudget: (month, amount_cents) => request(`/budgets/${month}`, 'PUT', { amount_cents })
};
