import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const PedidosSchema = mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      default: uuidv4,
    },
    id: {
      type: String,
      required: true,
    },
    description: { type: String, required: true },
    image: [{ url: String, public_id: String }],
    quantity: { type: String, required: true },
    time: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pendiente", "Procesando", "Enviado", "Entregado"],
      default: "Pendiente",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pedidos", PedidosSchema);
