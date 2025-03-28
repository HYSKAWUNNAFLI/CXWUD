const axios = require("axios");

exports.callNLP = async (text) => {
  // URL microservice
  const url = "http://localhost:5001/extract-tasks";
  const res = await axios.post(url, { text });
  return res.data; // { meeting_date, tasks: [...] }
};
