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

    // Cari tanggal berapa suatu barang masuk pertama kali
    const firstInProdLog = await LogProduk.findOne({
      produk: produkExists._id,
      isProdukMasuk: true,
    }).sort({ tanggal: 1 });

    // Jika ini adalah log keluar dan ada log masuk sebelumnya
    if (!isProdukMasuk && firstInProdLog) {
      const inputDate = new Date(tanggal);
      const firstInDate = new Date(firstInProdLog.tanggal);

      if (inputDate < firstInDate) {
        return res.status(400).json({
          msg: `Tanggal keluar tidak boleh lebih awal dari tanggal masuk pertama (${firstInDate.toLocaleDateString()})`,
        });
      }
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

    // 2. Cari kode produk yang baru diperbaharui
    const produk = await Produk.findOne({ kode_produk: req.body.kode_produk });
    if (!produk) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    // 3. Update log dengan data yang baru
    const updatedLog = await LogProduk.findById(req.params.id);
    if (updatedLog.stok !== req.body.stok) {
      const selisih = updatedLog.stok - req.body.stok;
      if (updatedLog.isProdukMasuk) {
        produk.stok -= selisih;
      } else {
        produk.stok += selisih;
      }
      produk.save();
    }

    updatedLog.harga = req.body.harga;
    updatedLog.kode_produk = req.body.kode_produk;
    updatedLog.tanggal = req.body.tanggal;
    updatedLog.stok = req.body.stok;
    updatedLog.save();

    console.log("updated log: ", updatedLog);
    res.json({
      msg: "Log dan Produk berhasil diperbarui",
      updatedLog,
    });
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

    const produk = await Produk.findById(deletedLog.produk);
    if (!produk) {
      return res.status(404).json({ msg: "Produk tidak ditemukan" });
    }

    if (deletedLog.isProdukMasuk) {
      produk.stok -= deletedLog.stok;
    } else {
      produk.stok += deletedLog.stok;
    }
    produk.save();

    res.json({ msg: "Log berhasil dihapus", LogProduk: deletedLog });
  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: "Server error" });
  }
};
