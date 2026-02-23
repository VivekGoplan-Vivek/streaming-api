const express = require("express");
const cors = require("cors");

const app = express();
// Permissive CORS for any client/project and preflight handling
const corsOptions = {
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};
app.use(cors(corsOptions));
app.use(express.json());
// Serve a simple frontend from / (optional)
app.use(express.static('public'));
app.options('/api/v1/runs', cors(corsOptions));
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

app.post("/api/v1/runs", (req, res) => {
  const { input } = req.body;

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  // Disable buffering in some proxies (nginx, Heroku routers)
  res.setHeader('X-Accel-Buffering', 'no');
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  const message = `Streaming response for: ${input}`;
  let index = 0;

  // Send an initial comment to try to kick proxies into streaming mode
  res.write(':ok\n\n');
  if (typeof res.flush === 'function') res.flush();

  const interval = setInterval(() => {
    if (index < message.length) {
      const chunk = { content: message[index]  ,chunkType:"chunk"};
      // ensure each SSE message ends with a double newline (`\n\n`)
      res.write(`data: ${JSON.stringify(chunk)}\n\n`);
      if (typeof res.flush === 'function') res.flush();
      index++;
    } else {
      res.write(`data: ${JSON.stringify({ content: '[DONE]' })}\n\n`);
      if (typeof res.flush === 'function') res.flush();
      clearInterval(interval);
      res.end();
    }
  }, 50);
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
