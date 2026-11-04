window.updateExpenseFormOptions = function() {
  const daysList = window.getDynamicProjectDays(window.activeProjectData);
  
  const expDaySelect = document.getElementById('expDay');
  if (expDaySelect) {
    expDaySelect.innerHTML = daysList.map(day => `
      <option value="${day}">${day === 'D0' ? 'D0 (預付項目)' : 'Day ' + day.replace('D', '')}</option>
    `).join('');
  }

  const expCurrencySelect = document.getElementById('expCurrency');
  if (expCurrencySelect) {
    const currencies = [
      { code: 'JPY', name: '💴 JPY - 日圓' },
      { code: 'TWD', name: 'NT$ TWD - 新台幣' },
      { code: 'USD', name: '💵 USD - 美金' },
      { code: 'EUR', name: '💶 EUR - 歐元' }
    ];
    expCurrencySelect.innerHTML = currencies.map(c => `
      <option value="${c.code}">${c.name}</option>
    `).join('');
  }
};

window.saveExpense = function(e) {
  e.preventDefault();
  const day = document.getElementById('expDay').value;
  const item = document.getElementById('expItem').value.trim();
  const amount = parseFloat(document.getElementById('expAmount').value);
  const currency = document.getElementById('expCurrency').value;

  if (!item || isNaN(amount)) return;

  const newExpense = { day, item, amount, currency, timestamp: Date.now() };
  const expensesRef = window.dbRef(window.db, `projects/${window.activeProjectId}/expenses`);
  window.dbPush(expensesRef, newExpense).then(() => {
    document.getElementById('expItem').value = '';
    document.getElementById('expAmount').value = '';
  });
};

window.renderExpenses = function() {
  const container = document.getElementById('expenseDayList');
  if (!container || !window.activeProjectData) return;

  const expenses = window.activeProjectData.expenses || {};
  const daysList = window.getDynamicProjectDays(window.activeProjectData);

  let html = '';
  let totalGroupTWD = 0;

  daysList.forEach(day => {
    const items = Object.entries(expenses).filter(([id, data]) => data.day === day);
    let dayTotalTWD = 0;
    items.forEach(([id, data]) => {
      const twd = window.convertToTWD(data.amount || 0, data.currency || 'JPY');
      dayTotalTWD += twd;
      totalGroupTWD += twd;
    });

    html += `
      <div class="card ${items.length > 0 ? 'open' : ''}">
        <div class="card-header" onclick="this.parentElement.classList.toggle('open')">
          <div>
            <div class="card-title">${day === 'D0' ? 'D0 預付' : day + ' 明細'}</div>
            <div class="card-subtitle">小計：約 TWD $${Math.round(dayTotalTWD).toLocaleString()}</div>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg>
        </div>
        <div class="card-content">
          ${items.map(([id, data]) => `
            <div class="expense-item">
              <div class="expense-info"><div class="expense-title">${data.item}</div></div>
              <div class="expense-amount">${data.currency === 'JPY' ? '¥' : '$'}${data.amount} ${data.currency}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  document.getElementById('totalGroupExpense').innerText = `TWD $${Math.round(totalGroupTWD).toLocaleString()}`;
};
