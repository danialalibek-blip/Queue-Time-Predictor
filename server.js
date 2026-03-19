const app = require("./app");

const port = Number(process.env.PORT || 4000);

app.listen(port, () => {
  // Minimal log for local MVP boot.
  console.log(`Queue Time Predictor API listening on http://localhost:${port}`);
});
