# Dokumentasi Server Back End API
Sebelum menjalankan server backend, alangkah baiknya mengikuti hal-hal berikut agar server berjalan dengan lancar, aman, nyaman dan damai. Langkah-langkah ini diperuntukkan untuk yang baru menggunakan, jika ada command atau tools yang sudah pernah diinstal silakan abaikan langkah tersebut.

## Menginstall Database MongoDB

Pastikan sudah menginstall MongoDB Servernya. Jika server MongoDB belum terinstall, bisa mengunduh file server dan menginstall di komputer masing-masing. Untuk link download file server MongoDB bisa klik [link berikut ini](https://www.mongodb.com/try/download/community).

## Konfigurasi Menginstall Live Server Node.JS
Pada langkah ini digunakan untuk bisa menjalankan file JS agar ketika terjadi perubahan kita tidak usah unutk mematikan server lalu menjalankan file tersebut kembali. Disini saya menggunakan tools **[nodemon](https://nodemon.io/)**. Silakan bisa baca-baca dokumentasi resmi dari nodemon itu sendiri, disini saya akan menjelaskan cara-cara instalasinya :

```bash
npm install -g nodemon
```

Setelah menjalankan perintah diatas pada terminal, silakan merestart terminal dengan cara close terminal lalu buka terminal lagi. Untuk mengecek apakah **nodemon** sudah terinstall pada komputer, kita bisa membuka terminal dan mengetikkan perintah :

```bash
nodemon -v
```

Jika setelah menjalankan perintah tersebut muncul dari versi nodemonnya, itu artinya nodemon sudah terinstall pada komputer kita, tapi jika belum artinya komputer tidak membaca nodemon yang sudah kita install, silakan pergi ke environment variabel pada komputer windows dan masukkan path dari nodemon itu sendiri lalu restart komputer.

## Menjalankan File Utama Server
Untuk bisa menjalankan server backend secara local, kita bisa menjalankan perintah ``nodemon app``, tapi sebelum kita menjalankan file tersebut silakan ikuti langkah-langkah berikut ini :

```bash
npm install
```

Perintah tersebut akan mengunduh semua dependensi yang digunakan pada server. Setelah mengunduh semua dependensi, kita bisa menjalankan file ``seeder.js`` untuk menambahkan data dummy ke dalam database MongoDB.

```bash
node seeder
```

Setelah menjalankan perintah tersebut dan tidak keluar dari proses running, cukup ketik <kbd>Ctrl</kbd> + <kbd>C</kbd> maka proses running akan keluar.

Sekarang kita bisa menjalankan file utama server backend menggunakan **nodemon**, kalian bisa mengetikkan perintah ini di terminal.

```bash
nodemon app
```

Maka server backend akan berjalan secara live di localhost:{port}. Dengan menggunakan nodemon, ketika ada perubahan kode yang terjadi kita tidak perlu mematikan server dan menjalankan file server lagi. Dan untuk bisa mematikan server kalian bisa mengetikkan <kbd>Ctrl</kbd> + <kbd>C</kbd>.