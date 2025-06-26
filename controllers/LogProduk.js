import Produk from "../models/ProdukModel.js";
import LogProduk from "../models/LogProdukModel.js";
import { insertProduk } from "./Produk.js";
import Stok from "../models/StokModel.js";

export const insertLog = async (req, res) => {
  try {
    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({ msg: "Request body tidak boleh kosong" });
    }

    const createdBy = req.userId;

    if (!createdBy) {
      return res.status(401).json({ msg: "User tidak terautentikasi" });
    }

    let {
      kode_produk,
      nama_produk,
      harga,
      stok,
      kategori,
      isProdukMasuk,
      tanggal,
      tanggalKadaluarsa,
    } = req.body;

    if (
      !kode_produk ||
      !nama_produk ||
      harga === undefined ||
      stok === undefined ||
      !tanggal ||
      (isProdukMasuk && !tanggalKadaluarsa) // Pastikan tanggalKadaluarsa tidak kosong
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
        createdBy,
      });
      produkExists = newProduk;
    }

    // Handle stok masuk/keluar
    if (!isProdukMasuk) {
      const stoks = await Stok.find({
        produk: produkExists._id,
        stok: { $gt: 0 },
        tanggalKadaluarsa: { $gte: new Date() },
      }).sort({ tanggalKadaluarsa: 1 });

      let totalStok = stoks.reduce((total, stok) => total + stok.stok, 0);
      if (totalStok < stok) {
        return res.status(400).json({
          msg: "Stok tidak mencukupi",
        });
      }

      if (stoks.length > 0) {
        let index = 0;
        while (stok > 0) {
          if (stoks[index].stok >= stok) {
            stoks[index].stok -= stok;
            stok = 0;
            await stoks[index].save();
            break;
          } else {
            stok -= stoks[index].stok;
            stoks[index].stok = 0;
            await stoks[index].save();
            index++;
            if (index >= stoks.length) {
              return res.status(400).json({
                msg: "Stok tidak cukup untuk mengurangi",
              });
            }
          }
        }
      }
    } else {
      const existingStok = await Stok.findOne({
        produk: produkExists._id,
        tanggalKadaluarsa: tanggalKadaluarsa,
      });

      if (existingStok) {
        existingStok.stok += stok;
        await existingStok.save();
      } else {
        const newStokEntry = new Stok({
          produk: produkExists._id,
          stok: stok,
          tanggalKadaluarsa: tanggalKadaluarsa,
          createdBy,
        });
        await newStokEntry.save();
      }
    }

    // Buat log produk - TAMBAHKAN tanggalKadaluarsa di sini
    const newLog = new LogProduk({
      produk: produkExists._id,
      stok,
      isProdukMasuk,
      harga,
      tanggal,
      tanggalKadaluarsa,
      createdBy,
    });

    await newLog.save();
    return res.status(201).json({
      LogProduk: newLog,
      message: "Log produk berhasil disimpan",
    });
  } catch (error) {
    console.error("Error di insertLog:", error);
    return res.status(500).json({
      msg: "Server error",
      error: error.message,
    });
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
