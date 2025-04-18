import mongoose from "mongoose";
const { Schema } = mongoose;

const logProdukSchema = new Schema({
  produk: {
    type: Schema.Types.ObjectId,
    ref: "Produk",
    required: true,
  },
  tanggal: {
    type: Date,
  },
  harga: {
    type: Number,
    min: 0,
  },
  stok: {
    type: Number,
    required: true,
    min: 0,
  },
  isProdukMasuk: {
    type: Boolean,
    required: true,
  },
  createdAt: { type: Date, default: Date.now },
});

const LogProduk = mongoose.model("LogProduk", logProdukSchema);

export default LogProduk;
