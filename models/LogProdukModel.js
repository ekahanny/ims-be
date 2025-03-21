import mongoose from "mongoose";
const { Schema } = mongoose;

const logProdukSchema = new Schema({
  Produk: {
    type: Schema.Types.ObjectId,
    ref: "Produk",
    required: true,
  },
  tanggal: {
    type: Date,
    default: Date.now,
  },
  harga: {
    type: Number,
    unsigned: true,
  },
  stok: {
    type: Number,
    required: true,
  },
  isProdukMasuk: {
    type: Boolean,
    required: true,
  },
});

const LogProduk = mongoose.model("LogProduk", logProdukSchema);

export default LogProduk;
