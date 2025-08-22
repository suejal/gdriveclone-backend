import express from "express";
import cors from "cors";
import helmet from "helmet";
import routes from "./routes/index.js";
import { PORT } from "./config/env.js";
import authRoutes from "./routes/auth.routes.js";
import meRoutes from "./routes/me.routes.js";
import filesRoutes from "./routes/files.routes.js";
import foldersRoutes from "./routes/folders.routes.js";
import permissionsRoutes from "./routes/permissions.routes.js";
import searchRoutes from "./routes/search.routes.js";
import trashRoutes from "./routes/trash.routes.js";
import sharesRoutes from "./routes/shares.routes.js";
import publicRoutes from "./routes/public.routes.js";
import moveRoutes from "./routes/move.routes.js";

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json({ limit: "10mb" }));
app.use("/api/auth", authRoutes);
app.use("/api/me", meRoutes);
app.use("/api/files", filesRoutes);
app.use("/api/folders", foldersRoutes);
app.use("/api/permissions", permissionsRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/trash", trashRoutes);
app.use("/api/shares", sharesRoutes);
app.use("/", publicRoutes);
app.use("/api/move", moveRoutes);

app.use("/api", routes);

app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});