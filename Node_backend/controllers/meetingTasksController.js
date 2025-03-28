const { callNLP } = require("../utils/nlpClient");
const { Task } = require("../models");
const { createTrelloCard } = require("../utils/trelloClient");
// Hoặc import dxClanClient nếu cần

exports.analyzeMeeting = async (req, res) => {
  const { text } = req.body;
  try {
    // 1) Gọi Python NLP
    const data = await callNLP(text);
    // data = { meeting_date, tasks: [ {task_name, assignee, due_date} ] }
    
    // 2) Tuỳ ý: Tạo record Task trong DB
    // (Ví dụ, chỉ lưu tạm, user sẽ phê duyệt sau)
    // for (const t of data.tasks) {
    //   await Task.create({
    //     task_name: t.task_name,
    //     assignee: t.assignee,
    //     deadline: t.due_date,
    //     assignedById: req.user.id
    //   });
    // }

    // 3) Gửi sang Trello (nếu muốn auto-tạo):
    // for (const t of data.tasks) {
    //   await createTrelloCard(t.task_name, t.assignee, t.due_date);
    // }

    // 4) Render ra view
    res.render("users/meeting_tasks", {
      meeting_date: data.meeting_date,
      tasks: data.tasks
    });
  } catch (error) {
    console.error("NLP error:", error);
    res.status(500).send("Error analyzing meeting text");
  }
};
