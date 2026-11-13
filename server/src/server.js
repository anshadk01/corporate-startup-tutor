import app from "./app.js";
import { connectDB } from "./config/db.js";

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(` Corporate-Startup AI Tutor Server (ENT 3805)`);
    console.log(` BML Munjal University`);
    console.log(` Running on: http://localhost:${PORT}`);
    console.log(`====================================================`);
  });
};

startServer();
