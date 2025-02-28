import { Router } from "express";
import userController from "../controllers/userController.js";
import authenticateToken from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/register", userController.createUser);
router.get("/user/:userId", authenticateToken, userController.getUserData);
router.put("/user/:userId", userController.updateUser);
router.post("/login", userController.loginUser);

export default router;
