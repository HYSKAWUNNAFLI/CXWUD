// cài npm i docx-pdf parse-pdf... (tùy) 
const fs = require("fs");
const path = require("path");

exports.parseFileContent = async (filePath) => {
  // Tạm thời mock: đọc plain text
  // Thực tế tuỳ định dạng => parse
  const absPath = path.resolve(filePath);
  return fs.readFileSync(absPath, "utf8");
};
