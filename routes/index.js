import express from "express";
import {
  createProduk,
  getAllProduk,
  getProdukByKode,
  updateProduk,
} from "../controllers/Produk.js";
import {
  login,
  register,
  resetPassword,
  updatePassword,
  verifyResetToken,
} from "../controllers/Users.js";
import {
  createLog,
  deleteLog,
  getAllLogs,
  getLogById,
  updateLog,
} from "../controllers/LogProduk.js";
import { authMiddleware } from "../middleware/auth.js";
import {
  createKategori,
  deleteKategori,
  getAllKategori,
  getKategoriById,
  updateKategori,
} from "../controllers/Kategori.js";
import { dashboard } from "../controllers/Dashboard.js";

const router = express.Router();

// log produk
router.post("/produk/log", createLog);
router.get("/produk/log", getAllLogs);
router.get("/produk/log/:id", getLogById);
router.put("/produk/log/:id", updateLog);
router.delete("/produk/log/:id", deleteLog);

// produk
router.post("/produk", authMiddleware, createProduk);
router.get("/produk", getAllProduk);
router.get("/produk/:kode", getProdukByKode);
router.put("/produk/:kode", updateProduk);

// dashboard
router.get("/dashboard", dashboard);

// Kategori
router.post("/kategori", createKategori);
router.get("/kategori", getAllKategori);
router.get("/kategori/:id", getKategoriById);
router.put("/kategori/:id", updateKategori);
router.delete("/kategori/:id", deleteKategori);

// Auth
router.post("/login", login);
router.post("/register", register);
router.post("/reset-password", resetPassword);
router.get("/verify-reset-token/:token", verifyResetToken);
router.put("/update-password", authMiddleware, updatePassword);

router.use((req, res) => {
  res.status(404);
  res.send("<h1>404 Not Found!!</h1>");
});

export default router;
