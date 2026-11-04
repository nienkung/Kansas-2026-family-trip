window.currentUser = null;
window.allProjects = {};
window.activeProjectId = null;
window.activeProjectData = null;

window.SUPER_ADMIN_EMAILS = [
  "moneynien@gmail.com",
  "robertcl.kung@ogilvy.com"
];

// 多幣別動態匯率
window.EXCHANGE_RATES = {
  TWD: 1.0,
  JPY: 0.21,
  USD: 32.0,
  EUR: 34.5,
  GBP: 41.0,
  KRW: 0.023,
  THB: 0.92
};

// 根據專案動態計算天數（例如：10天會產生 D0 ~ D10）
window.getDynamicProjectDays = function(projData) {
  let totalDays = 6;
  if (projData && projData.dates) {
    const match = projData.dates.match(/(\d+)\s*天/);
    if (match && match[1]) {
      totalDays = parseInt(match[1], 10);
    }
  }
  const daysList = ['D0'];
  for (let i = 1; i <= totalDays; i++) {
    daysList.push(`D${i}`);
  }
  return daysList;
};

window.convertToTWD = function(amount, currency) {
  const rate = window.EXCHANGE_RATES[currency] || 1.0;
  return amount * rate;
};

window.encodeEmail = function(email) { 
  return email ? email.replace(/\./g, '_').replace(/@/g, '_at_') : ''; 
};

window.switchView = function(viewId) {
  document.querySelectorAll('.page-view').forEach(v => v.classList.remove('active'));
  document.getElementById('view-' + viewId).classList.add('active');
};
