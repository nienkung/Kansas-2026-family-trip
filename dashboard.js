window.addEventListener('DOMContentLoaded', () => {
  // 安全等待 Firebase Auth 載入完成
  const checkAuthTimer = setInterval(() => {
    if (window.auth && window.onAuthStateChanged) {
      clearInterval(checkAuthTimer);
      window.initFirebaseAuthListener();
    }
  }, 100);
});

window.initFirebaseAuthListener = function() {
  try {
    window.onAuthStateChanged(window.auth, (user) => {
      if (user) {
        window.currentUser = { name: user.displayName || '錢粘', email: user.email };
        const nameElem = document.getElementById('dashUserName');
        if (nameElem) nameElem.innerText = window.currentUser.name;
        window.initFirebaseProjectsSync();
      } else {
        window.currentUser = null;
        window.switchView('login');
      }
    });
  } catch (err) {
    console.error("Auth 監聽初始化失敗:", err);
  }
};

window.handleGoogleLogin = function() {
  if (!window.auth || !window.googleProvider || !window.signInWithPopup) {
    alert('系統登入模組載入中，請稍候 2 秒再試一次！');
    return;
  }

  // 執行 Google 登入並處理彈窗被阻擋問題
  window.signInWithPopup(window.auth, window.googleProvider)
    .then((result) => {
      console.log("登入成功:", result.user);
    })
    .catch((err) => {
      console.error("Google 登入失敗:", err);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        alert('登入視窗已被瀏覽器阻擋！請使用 Safari / Chrome 開啟本頁，並關閉「阻擋快顯視窗」設定。');
      } else {
        alert('登入失敗: ' + err.message);
      }
    });
};

window.handleLogout = function() {
  if (window.auth && window.signOut) {
    window.signOut(window.auth).then(() => window.switchView('login'));
  }
};

window.initFirebaseProjectsSync = function() {
  if (!window.db || !window.dbRef || !window.dbOnValue) return;
  const projRef = window.dbRef(window.db, 'projects');
  window.dbOnValue(projRef, (snapshot) => {
    window.allProjects = snapshot.val() || {};
    window.renderDashboardProjects();
  });
};

window.renderDashboardProjects = function() {
  const grid = document.getElementById('projectGridList');
  if (!grid) return;
  const entries = Object.entries(window.allProjects || {});
  grid.innerHTML = entries.map(([id, p]) => `
    <div class="project-card" onclick="enterProject('${id}')">
      <div class="project-header">
        <div>
          <div class="project-name">${p.title}</div>
          <div class="project-dates">📅 ${p.dates}</div>
        </div>
      </div>
    </div>
  `).join('');
};

window.enterProject = function(projectId) {
  window.activeProjectId = projectId;
  window.activeProjectData = window.allProjects[projectId];
  if (!window.activeProjectData) return;

  const titleElem = document.getElementById('activeProjectTitle');
  if (titleElem) titleElem.innerText = window.activeProjectData.title;
  
  if (window.renderItineraryFromJSON) window.renderItineraryFromJSON(window.activeProjectData.itinerary);
  if (window.updateExpenseFormOptions) window.updateExpenseFormOptions();
  if (window.renderExpenses) window.renderExpenses();
  window.switchView('project');
};

window.navigateToDashboard = function() {
  window.activeProjectId = null;
  window.switchView('dashboard');
};
