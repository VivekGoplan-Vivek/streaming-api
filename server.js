const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.post("/api/v1/runs", (req, res) => {
  const { input } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  const message = `Streaming response for: ${input}`;
  let index = 0;

  const interval = setInterval(() => {
    if (index < message.length) {
      res.write(`data: ${message[index]}\n\n`);
      index++;
    } else {
      res.write(`data: [DONE]\n\n`);
      clearInterval(interval);
      res.end();
    }
  }, 50);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
