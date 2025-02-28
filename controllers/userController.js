import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import dotenv from "dotenv";
dotenv.config();

// const createToken = (_id) => {
//   return jwt.sign({ user: { id: _id } }, process.env.JWT_SEC, {
//     expiresIn: "1h",
//   });
// };

const createUser = async (req, res) => {
  const { email, password, confirmPassword } = req.body;

  if (password !== confirmPassword) {
    return res.status(400).json({ msg: "Las contraseñas no coinciden" });
  }

  try {
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).json({ msg: "El usuario ya existe" });

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({ email, password: hashedPassword });
    await user.save();

    res.status(200).json({ msg: "Usuario registrado" });
  } catch (err) {
    res.status(500).json({ msg: "Error en el servidor", error: err.message });
  }
};

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ msg: "Usuario no encontrado" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: "Contraseña incorrecta" });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ token });
  } catch (err) {
    console.log(err);
    res.status(500).json({ msg: "Error en el servidor" });
  }
};

const getUserData = async (req, res) => {
  try {
    // const user = await User.findById(req.params.id);
    const { userId } = req.params;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }
    res.json({ id: user._id, name: user.name, email: user.email });
    const { password, __v, createdAt, updatedAt, ...userData } = user._doc;

    // res.status(200).json(userData);
  } catch (error) {
    console.error("Error recuperando usuario", error);
    res.status(500).json({ message: "Error en el servidor" });
  }
};

const updateUser = async (req, res) => {
  const { userId, email, password } = req.body;
  const user = await User.findByIdAndUpdate(userId);
  try {
    if (!user) {
      return res.status(400).json({ message: "Usuario no encontrado" });
    }
    // Verificar si el nuevo email ya está en uso por otro usuario
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res
          .status(400)
          .json({ message: "El correo electrónico ya está en uso" });
      }
      user.email = email;
    }
    // Actualizar campos del usuario
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    await user.save();
    res.status(200).json({ message: "Usuario actualizado con éxito", user });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Error actualizando el usuario" });
  }
};

export default {
  createUser,
  loginUser,
  getUserData,
  updateUser,
};
