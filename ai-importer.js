window.GEMINI_API_KEY = "AQ.Ab8RN6IYFcamWmCMTz_620vncxoR71LJYLJRi0h-UuyBU4YhTQ";

window.openAiImportModal = function() {
  const modal = document.getElementById('aiImportModal');
  if (modal) modal.style.display = 'flex';
};

window.closeAiImportModal = function() {
  const modal = document.getElementById('aiImportModal');
  if (modal) modal.style.display = 'none';
};

window.processGeminiAIImport = async function() {
  const inputElem = document.getElementById('aiImportInput');
  const rawText = inputElem ? inputElem.value.trim() : '';

  if (!rawText) return alert('請輸入隨手筆記或口語內容！');

  const submitBtn = document.getElementById('aiSubmitBtn');
  if (submitBtn) {
    submitBtn.innerText = '🧠 Gemini AI 分析中...';
    submitBtn.disabled = true;
  }

  const daysList = (typeof window.getDynamicProjectDays === 'function') 
    ? window.getDynamicProjectDays(window.activeProjectData) 
    : ['D1', 'D2', 'D3', 'D4', 'D5', 'D6'];

  const systemPrompt = `你是一個專業旅遊隨手筆記解析器。請閱讀輸入並解析出【景點行程 (spots)】與【記帳明細 (expenses)】。
可使用的天數鍵值: ${JSON.stringify(daysList)}。

請嚴格輸出 JSON 格式：
{
  "spots": [{"day": "D1", "time": "19:00", "title": "名稱", "desc": "說明"}],
  "expenses": [{"day": "D1", "item": "品名", "amount": 1000, "currency": "JPY"}]
}`;

  try {
    // 依官方建議改用 gemini-3.8-flash 模型 Endpoint
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${window.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'x-goog-api-key': window.GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt + "\n\n使用者輸入:\n" + rawText }]
          }
        ]
      })
    });

    const data = await response.json();

    if (data.error) {
      throw new Error(`Google API 回應錯誤 (${data.error.code}): ${data.error.message}`);
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error("API 未回傳有效分析結果，請稍後重試！");
    }

    let replyText = data.candidates[0].content.parts[0].text.trim();
    replyText = replyText.replace(/```json/gi, '').replace(/```/g, '').trim();

    const parsed = JSON.parse(replyText);

    let spotCount = 0;
    let expCount = 0;

    // 同步寫入行程
    if (parsed.spots && parsed.spots.length > 0 && window.activeProjectId) {
      if (!window.activeProjectData.itinerary) window.activeProjectData.itinerary = {};
      parsed.spots.forEach(spot => {
        const dKey = spot.day || 'D1';
        if (!window.activeProjectData.itinerary[dKey]) {
          window.activeProjectData.itinerary[dKey] = { title: dKey, spots: [] };
        }
        if (!window.activeProjectData.itinerary[dKey].spots) {
          window.activeProjectData.itinerary[dKey].spots = [];
        }
        window.activeProjectData.itinerary[dKey].spots.push({
          time: spot.time || '',
          title: spot.title || '景點',
          desc: spot.desc || ''
        });
        spotCount++;
      });
      if (window.dbSet && window.dbRef) {
        window.dbSet(window.dbRef(window.db, `projects/${window.activeProjectId}/itinerary`), window.activeProjectData.itinerary);
      }
    }

    // 同步寫入記帳
    if (parsed.expenses && parsed.expenses.length > 0 && window.activeProjectId) {
      parsed.expenses.forEach(exp => {
        if (window.dbPush && window.dbRef) {
          const expensesRef = window.dbRef(window.db, `projects/${window.activeProjectId}/expenses`);
          window.dbPush(expensesRef, { ...exp, timestamp: Date.now() });
          expCount++;
        }
      });
    }

    alert(`🎉 解析成功！已同步新增 ${spotCount} 個行程景點與 ${expCount} 筆記帳！`);
    if (inputElem) inputElem.value = '';
    window.closeAiImportModal();

    if (typeof window.renderItineraryFromJSON === 'function') window.renderItineraryFromJSON(window.activeProjectData.itinerary);
    if (typeof window.renderExpenses === 'function') window.renderExpenses();

  } catch (err) {
    console.error("AI 解析錯誤:", err);
    alert('解析失敗：' + err.message);
  } finally {
    if (submitBtn) {
      submitBtn.innerText = '✨ Gemini AI 智慧理解寫入';
      submitBtn.disabled = false;
    }
  }
};

