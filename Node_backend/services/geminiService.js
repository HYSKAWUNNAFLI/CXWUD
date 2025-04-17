const axios = require('axios'); 
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY?.trim();
const MODEL   = process.env.GEMINI_MODEL || 'models/gemini-1.5-flash';
const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

if (!API_KEY) throw new Error('❌ Missing GEMINI_API_KEY in .env');

exports.callGemini = async (text) => {
  const prompt = `
You are an AI meeting assistant. From the following meeting notes, extract all clearly assigned tasks.

Each task must include:
- task_name: short title of the task
- assignee_name: a person's full name (e.g., "Sophia Lee") that is **explicitly mentioned in the text** and is clearly responsible for the task. If no such name appears, return "Unassigned".
- deadline: (if any) in YYYY-MM-DD format. If not mentioned, return null.
- priority: Choose from HIGH, MEDIUM, or LOW based on urgency or keywords.

Return ONLY a valid JSON array without explanation or markdown.

Meeting Notes:
"""
${text}
"""
`;

  const url = `${BASE_URL}/${MODEL}:generateContent?key=${API_KEY}`;

  try {
    const response = await axios.post(url, {
      contents: [
        {
          parts: [{ text: prompt }]
        }
      ]
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    let raw = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '[]';

    // ✅ Loại bỏ markdown nếu có
    raw = raw.trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```/, '')
      .replace(/```$/, '')
      .trim();

    try {
      const parsed = JSON.parse(raw);

      // ✅ Chuẩn hóa key về assignee_name nếu Gemini trả nhầm key
      const standardizedTasks = parsed.map(task => ({
        task_name: task.task_name,
        assignee_name: task.assignee_name || task.assignee || 'Unassigned',
        deadline: task.deadline || null,
        priority: task.priority || 'MEDIUM'
      }));

      return { tasks: standardizedTasks, summary: '' };
    } catch (err) {
      console.warn('⚠️ Gemini returned invalid JSON:', raw);
      throw new Error('Gemini returned invalid JSON format');
    }
  } catch (err) {
    console.error('❌ Error calling Gemini:', err.response?.data || err.message);
    throw new Error('Failed to connect to Gemini API');
  }
};
