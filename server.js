const cluster = require("node:cluster");
const os = require("os");
const express = require("express");

const totalCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Primary process ${process.pid} is running`);

  // Fork workers
  for (let i = 0; i < totalCPUs; i++) {
    cluster.fork();
  }

  // Listen for worker exits
  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died`);
  });
} else {
  const app = express();
  const PORT = 3001;

//   only for delay the code
//   const performLongTask = async () => {
//     const start = Date.now();
//     console.log(`Task started by worker ${process.pid}...`);

//     // Simulate a long task
//     await new Promise((resolve) => setTimeout(resolve, 15000)); // 15 seconds delay

//     // Do some calculation
//     const result = Array.from({ length: 1000 }, (_, i) => i * i).reduce((a, b) => a + b, 0);

//     const end = Date.now();
//     console.log(`Task completed by worker ${process.pid} in ${(end - start) / 1000} seconds.`);
//     console.log(`Result of calculation: ${result}`);
//   };

  app.get("/", async (req, res) => {
    await performLongTask();
    return res.json({
      message: `Response from worker process ${process.pid}`,
    });
  });

  app.listen(PORT, () => {
    console.log(`Worker process ${process.pid} is listening on port ${PORT}`);
  });
}
