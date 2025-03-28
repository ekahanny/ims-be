import Produk from "../models/ProdukModel.js";
import LogProduk from "../models/LogProdukModel.js";
import { insertProduk } from "./Produk.js";

export const insertLog = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ msg: "Request body tidak boleh kosong" });
    }

    const {
      kode_produk,
      nama_produk,
      harga,
      stok,
      kategori,
      isProdukMasuk,
      tanggal,
    } = req.body;

    if (
      !kode_produk ||
      !nama_produk ||
      harga === undefined ||
      stok === undefined
    ) {
      return res.status(400).json({ msg: "Semua field harus diisi" });
    }

    let produkExists = await Produk.findOne({ kode_produk });

    if (!produkExists) {
      const newProduk = await insertProduk({
        kode_produk,
        nama_produk,
        harga,
        stok: 0,
        kategori,
        tanggal,
      });
      produkExists = newProduk;
    }

    if (!isProdukMasuk && stok > produkExists.stok) {
      return res.status(400).json({ msg: "Stok tidak cukup" });
    }

    const newStok = isProdukMasuk
      ? produkExists.stok + stok
      : produkExists.stok - stok;

    const updatedProduk = await Produk.findOneAndUpdate(
      { kode_produk },
      { stok: newStok },
      { new: true }
    );

    const newLog = new LogProduk({
      produk: updatedProduk._id,
      stok,
      isProdukMasuk,
      harga,
      tanggal,
    });

    await newLog.save();
    return res.status(201).json({ LogProduk: newLog });
  } catch (error) {
    console.error("Error di insertLog:", error);
    return res.status(500).json({ msg: "Server error" });
  }
};

export const createLog = async (req, res) => {
  try {
    await insertLog(req, res);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getAllLogs = async (req, res) => {
  try {
    const logs = await LogProduk.find()
      .populate({
        path: "produk",
        model: "Produk",
      })
      .lean()
      .exec();
    res.json({ LogProduk: logs });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const getLogById = async (req, res) => {
  try {
    const log = await LogProduk.findById(req.params.id).populate("produk");
    if (!log) {
      return res.status(404).json({ msg: "Log tidak ditemukan" });
    }
    res.json(log);
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const updateLog = async (req, res) => {
  try {
    // 1. Cari log berdasarkan ID yang diberikan di params
    const log = await LogProduk.findById(req.params.id);
    
    if (!log) {
      return res.status(404).json({ msg: "Log tidak ditemukan" });
    }

    // 2. Ambil ID produk dari log yang ditemukan
    const produkId = log.produk._id;

    // 3. Update data produk berdasarkan produkId
    const updatedProduk = await Produk.findByIdAndUpdate(
      produkId,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!updatedProduk) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    // 4. Update log dengan data yang baru
    const updatedLog = await LogProduk.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    res.json({ msg: "Log dan Produk berhasil diperbarui", updatedLog, updatedProduk });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};

export const deleteLog = async (req, res) => {
  try {
    const deletedLog = await LogProduk.findByIdAndDelete(req.params.id);
    if (!deletedLog) {
      return res.status(404).json({ msg: "Log tidak ditemukan" });
    }
    res.json({ msg: "Log berhasil dihapus", LogProduk: deletedLog });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};
