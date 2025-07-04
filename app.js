import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import contactsRouter from "./routes/contactsRouter.js";
import authRouter from "./routes/authRouter.js";
import { connectToDatabase } from "./db/connection.js";
import sequelize from "./db/connection.js";

const app = express();

app.use(morgan("tiny"));
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/contacts", contactsRouter);

app.use((_, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  const { status = 500, message = "Server error" } = err;
  res.status(status).json({ message });
});

const startServer = async () => {
  try {
    await connectToDatabase();
    await sequelize.sync({ alter: true });

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server is running. Use our API on port: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
