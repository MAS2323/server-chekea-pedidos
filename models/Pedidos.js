import mongoose from "mongoose";
import { v4 as uuidv4 } from "uuid";

const PedidosSchema = mongoose.Schema(
  {
    description: { type: String, required: true },
    image: [{ url: String, public_id: String }],
    quantity: { type: String, required: true },
    time: { type: String, required: true },
    userid: {
      type: String,
      default: uuidv4,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pedidos", PedidosSchema);
