import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const PedidosSchema = mongoose.Schema(
  {
    id: {
      type: String,
      required: true,
      default: uuidv4, // Genera un UUID automáticamente
    },
    userId: {
      type: String, // Guarda el ID del usuario
      required: true,
    },
    description: { type: String, required: true },
    image: [{ url: String, public_id: String }],
    quantity: { type: String, required: true },
    time: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Pedidos", PedidosSchema);
