window.renderItineraryFromJSON = function(data) {
  const container = document.getElementById('itineraryContainer');
  if (!container) return;

  const daysList = window.getDynamicProjectDays(window.activeProjectData);
  let html = '';

  daysList.forEach((dayKey, idx) => {
    if (dayKey === 'D0') return;
    const day = (data && data[dayKey]) ? data[dayKey] : { title: `Day ${dayKey.replace('D','')}`, spots: [] };

    html += `
      <div class="card ${idx === 1 ? 'open' : ''}">
        <div class="card-header" onclick="this.parentElement.classList.toggle('open')">
          <div>
            <div class="card-title">${day.title || 'Day ' + dayKey.replace('D','')}</div>
            <div class="card-subtitle">${day.subtitle || ''}</div>
          </div>
          <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke-width="2.5"><path d="M19 9l-7 7-7-7"/></svg>
        </div>
        <div class="card-content">
          ${day.spots ? day.spots.map(spot => `
            <div class="spot-card">
              ${spot.time ? `<span class="spot-time">⏰ ${spot.time}</span>` : ''}
              <div class="spot-title">${spot.title}</div>
              <div class="spot-desc">${spot.desc}</div>
            </div>
          `).join('') : '<div style="font-size:13px; color:var(--sub-text);">尚無景點</div>'}
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
};

window.switchProjectTab = function(tabName) {
  document.querySelectorAll('#view-project .tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-subcontent').forEach(sub => sub.classList.remove('active'));
  
  const targetSub = document.getElementById('subtab-' + tabName);
  if (targetSub) targetSub.classList.add('active');
};
