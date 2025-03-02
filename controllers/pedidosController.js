import mongoose from "mongoose";
import Pedidos from "../models/Pedidos.js";
import { uploadImage, deleteImage } from "../middlewares/cloudinary.js";
import fs from "node:fs";

// Función para crear un nuevo pedido
const createPedido = async (req, res) => {
  try {
    const { id, description, quantity, time } = req.body;

    if (!id || !description || !quantity || !time) {
      return res
        .status(400)
        .json({ message: "Todos los campos son obligatorios" });
    }

    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ message: "Debes subir al menos una imagen." });
    }

    const folderName = "pedidos_chekea";
    const images = [];

    for (const file of req.files) {
      try {
        const result = await uploadImage(file.path, folderName);
        images.push({ url: result.url, public_id: result.public_id });
        fs.unlinkSync(file.path);
      } catch (error) {
        console.error("Error al subir la imagen:", error);
        return res
          .status(500)
          .json({ error: "Error al subir la imagen a Cloudinary" });
      }
    }

    const newPedido = await Pedidos.create({
      id,
      description,
      quantity,
      time,
      image: images,
    });

    res.status(201).json(newPedido);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al crear el pedido" });
  }
};

// Función para obtener todos los pedidos
const getAllPedidos = async (req, res) => {
  try {
    const pedidos = await Pedidos.find().sort({ _id: -1 });
    res.status(200).json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los pedidos" });
  }
};

// Obtener un pedido por su ID generado automáticamente
const getPedidosByUserId = async (req, res) => {
  try {
    const { id } = req.params; // ID del usuario

    // Buscar todos los pedidos donde userId coincida con el id del usuario
    const pedidos = await Pedidos.find({ userId: id });

    if (!pedidos.length) {
      return res
        .status(404)
        .json({ message: "No se encontraron pedidos para este usuario" });
    }

    res.status(200).json(pedidos);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al obtener los pedidos" });
  }
};

// Actualizar un pedido por su ID generado automáticamente
const updatePedido = async (req, res) => {
  try {
    const { id } = req.params;
    const { description, quantity, time } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de pedido no válido" });
    }

    const existingPedido = await Pedidos.findById(id);
    if (!existingPedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Manejar imágenes
    let updatedImages = existingPedido.image;
    if (req.files && req.files.length > 0) {
      await Promise.all(
        existingPedido.image.map(async (image) => {
          try {
            await deleteImage(image.public_id);
          } catch (error) {
            console.error(
              `Error al eliminar la imagen con public_id: ${image.public_id}`,
              error
            );
          }
        })
      );

      const folderName = "pedidos_chekea";
      updatedImages = await Promise.all(
        req.files.map(async (file) => {
          const uploadResult = await uploadImage(file.path, folderName);
          fs.unlinkSync(file.path);
          return {
            url: uploadResult.url,
            public_id: uploadResult.public_id,
          };
        })
      );
    }

    // Actualizar pedido
    const updateData = { description, quantity, time, image: updatedImages };
    const updatedPedido = await Pedidos.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    res.status(200).json(updatedPedido);
  } catch (error) {
    console.error("Error al actualizar el pedido:", error.message);
    res
      .status(500)
      .json({ message: "Error interno del servidor", error: error.message });
  }
};

// Eliminar un pedido por su ID generado automáticamente
const deletePedido = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID de pedido no válido" });
    }

    const pedido = await Pedidos.findById(id);
    if (!pedido) {
      return res.status(404).json({ message: "Pedido no encontrado" });
    }

    // Eliminar imágenes de Cloudinary
    await Promise.all(
      pedido.image.map(async (image) => {
        await deleteImage(image.public_id);
      })
    );

    // Eliminar el pedido de la base de datos
    await Pedidos.findByIdAndDelete(id);
    res
      .status(200)
      .json({ message: "Pedido y sus imágenes eliminados correctamente" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error al eliminar el pedido" });
  }
};

export default {
  createPedido,
  getAllPedidos,
  updatePedido,
  deletePedido,
  getPedidosByUserId,
};
