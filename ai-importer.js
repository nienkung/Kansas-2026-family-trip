window.GEMINI_API_KEY = "AQ.Ab8RN6Jm1WqV5XLvuKzv47r79fEDW42Tgfu7s-S2J8unBX607A";

window.openAiImportModal = function() {
  document.getElementById('aiImportModal').style.display = 'flex';
};

window.closeAiImportModal = function() {
  document.getElementById('aiImportModal').style.display = 'none';
};

window.processGeminiAIImport = async function() {
  const rawText = document.getElementById('aiImportInput').value.trim();
  if (!rawText) return alert('請輸入口語內容！');

  const submitBtn = document.getElementById('aiSubmitBtn');
  submitBtn.innerText = '🧠 Gemini AI 分析中...';
  submitBtn.disabled = true;

  const daysList = window.getDynamicProjectDays(window.activeProjectData);

  const systemPrompt = `你是一個旅遊隨手筆記解析器。請閱讀輸入並解析出【景點行程 (spots)】與【記帳明細 (expenses)】。
可使用的天數鍵值: ${JSON.stringify(daysList)}。

請嚴格輸出 JSON 格式:
{
  "spots": [{"day": "D1", "time": "19:00", "title": "名稱", "desc": "說明"}],
  "expenses": [{"day": "D1", "item": "品名", "amount": 1000, "currency": "JPY"}]
}`;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${window.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': window.GEMINI_API_KEY },
      body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: systemPrompt + "\n\n輸入:\n" + rawText }] }] })
    });

    const data = await response.json();
    let replyText = data.candidates[0].content.parts[0].text.trim().replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(replyText);

    if (parsed.expenses && parsed.expenses.length > 0) {
      const expensesRef = window.dbRef(window.db, `projects/${window.activeProjectId}/expenses`);
      parsed.expenses.forEach(exp => window.dbPush(expensesRef, { ...exp, timestamp: Date.now() }));
    }

    alert('🎉 Gemini AI 解析並寫入成功！');
    window.closeAiImportModal();
    window.renderExpenses();
  } catch (err) {
    alert('解析失敗: ' + err.message);
  } finally {
    submitBtn.innerText = '✨ Gemini AI 智慧理解寫入';
    submitBtn.disabled = false;
  }
};
