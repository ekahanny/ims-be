import express from "express";
import {
  createProduk,
  deleteProduk,
  getAllProduk,
  getProdukById,
  getProdukByKode,
  updateProduk,
} from "../controllers/Produk.js";
import {
  getUser,
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
// router.get("/produk/:kode", getProdukByKode);
router.get("/produk/:id", getProdukById);
router.put("/produk/:id", updateProduk);
router.delete("/produk/:id", deleteProduk);

// dashboard
router.get("/dashboard", dashboard);

// Kategori
router.post("/kategori", createKategori);
router.get("/kategori", getAllKategori);
router.get("/kategori/:id", getKategoriById);
router.put("/kategori/:id", updateKategori);
router.delete("/kategori/:id", deleteKategori);

// Auth
router.get("/user", getUser);
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
