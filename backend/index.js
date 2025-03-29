import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import errorHandler from "./middlewares/error_handler.js";
import corsConfig from "./config/cors_config.js";
import fileRoute from "./routes/file_route.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors(corsConfig));
app.use(express.json());
app.use(morgan("dev"));
app.use(helmet());

// Routes
app.use("/api/v1/files", fileRoute);

// Error handler middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
