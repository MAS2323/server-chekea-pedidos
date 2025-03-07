import express from "express";
import upload from "../middlewares/multerConfig.js";
import pedidosController from "../controllers/pedidosController.js";

const router = express.Router();

router.post(
  "/pedidos",
  upload.array("images", 5),
  pedidosController.createPedido
);
router.get("/usuarios-con-pedidos", pedidosController.getUsersWithPedidos);
router.patch("/pedidos/:id/status", pedidosController.updatePedidoStatus);
router.get("/pedido/:id", pedidosController.getPedidoById);
router.get("/pedidos", pedidosController.getAllPedidos);
router.get("/pedidos/:id", pedidosController.getPedidosByUserId);
router.put(
  "/pedidos/:id",
  upload.array("images", 5),
  pedidosController.updatePedido
);
router.delete("/pedidos/:id", pedidosController.deletePedido);

export default router;
