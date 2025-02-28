import mongoose from "mongoose";
import express from "express";
import cors from "cors";
import userRouter from "./routers/userRouter.js";
import pedidosRouter from "./routers/pedidosRouter.js";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { PORT } from "./middlewares/config.js";
import fs from "fs";

const app = express();
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Verificar si la carpeta 'public/uploads' existe, si no, crearla
const uploadDir = path.join(__dirname, "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(bodyParser.urlencoded({ extended: false }));

// Servir archivos estáticos desde el directorio "uploads"
app.use(express.static(uploadDir));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use("/", userRouter);
app.use("/", pedidosRouter);

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("Base de datos conectada"))
  .catch((err) => console.log(err));

app.listen(process.env.PORT || PORT, () => {
  console.log(`Node.js server started on port ${process.env.PORT || PORT}!`);
});
