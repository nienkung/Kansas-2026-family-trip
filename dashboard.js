window.addEventListener('DOMContentLoaded', () => {
  const timer = setInterval(() => {
    if (window.auth && window.onAuthStateChanged) {
      clearInterval(timer);
      window.initFirebaseAuthListener();
    }
  }, 100);
});

window.initFirebaseAuthListener = function() {
  window.onAuthStateChanged(window.auth, (user) => {
    if (user) {
      window.currentUser = { name: user.displayName || '錢粘', email: user.email };
      document.getElementById('dashUserName').innerText = `${window.currentUser.name}`;
      window.initFirebaseProjectsSync();
    } else {
      window.currentUser = null;
      window.switchView('login');
    }
  });
};

window.handleGoogleLogin = function() {
  window.signInWithPopup(window.auth, window.googleProvider).catch((err) => alert('登入失敗: ' + err.message));
};

window.handleLogout = function() {
  window.signOut(window.auth).then(() => window.switchView('login'));
};

window.initFirebaseProjectsSync = function() {
  const projRef = window.dbRef(window.db, 'projects');
  window.dbOnValue(projRef, (snapshot) => {
    window.allProjects = snapshot.val() || {};
    window.renderDashboardProjects();
  });
};

window.renderDashboardProjects = function() {
  const grid = document.getElementById('projectGridList');
  if (!grid) return;
  const entries = Object.entries(window.allProjects);
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

  document.getElementById('activeProjectTitle').innerText = window.activeProjectData.title;
  window.renderItineraryFromJSON(window.activeProjectData.itinerary);
  window.updateExpenseFormOptions();
  window.renderExpenses();
  window.switchView('project');
};

window.navigateToDashboard = function() {
  window.activeProjectId = null;
  window.switchView('dashboard');
};
