import { insertProduk } from "./Produk.js";
import Produk from "../models/ProdukModel.js";
import LogProduk from "../models/LogProdukModel.js";

export const insertLog = async (req, res) => {
  try {
    // Cek apakah produk sudah ada
    let produkExists = await Produk.findOne({
      kode_produk: req.body.kode_produk,
    });

    // Jika produk tidak ada, buat produk baru
    if (!produkExists) {
      const newProduk = await insertProduk({
        kode_produk: req.body.kode_produk,
        nama_produk: req.body.nama_produk,
        harga: req.body.harga,
        stok: 0,
        kategori: req.body.kategori,
      });
      produkExists = newProduk;
    }

    // Cek stok jika isProdukMasuk false
    if (!req.body.isProdukMasuk && req.body.stok > produkExists.stok) {
      return res.status(400).json({ msg: "Stok tidak cukup" });
    }

    // Update stok produk
    const newStok = req.body.isProdukMasuk
      ? produkExists.stok + req.body.stok
      : produkExists.stok - req.body.stok;

    const updatedProduk = await Produk.findOneAndUpdate(
      { kode_produk: req.body.kode_produk },
      { stok: newStok },
      { new: true }
    );

    // Buat log produk baru
    const newLog = new LogProduk({
      Produk: updatedProduk._id,
      stok: req.body.stok,
      isProdukMasuk: req.body.isProdukMasuk,
      harga: req.body.harga,
      tanggal_masuk: req.body.tanggal_masuk || new Date(), // Gunakan tanggal_masuk dari request atau tanggal sekarang
    });

    await newLog.save();

    return res.status(201).json({ LogProduk: newLog });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ msg: "Server error" });
  }
};
