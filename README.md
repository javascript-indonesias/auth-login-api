# Net Ninja Node.js Auth Tutorial (JWT)

Hasil latihan ulang membuat sistem login dan signup dengan sistem JSON Web Token atau JWT. Dibuat berdasarkan dasar tutorial dari latihan Node JS Auth Tutorial channel Youtube Net Ninja, yang dapat dilihat pada link  playlist ini [Net Ninja Node JS Auth Tutorial Link](https://www.youtube.com/playlist?list=PL4cUxeGkcC9iqqESP8335DA5cRFp8loyp).

Pada latihan ulang ini, dilakukan optimasi dengan memindahkan proses komputasi berat ke Worker Thread Node JS. Proses komputasi yang dimaksud adalah hashing password dengan Argon dan Bcrypt, dan melakukan Sign JWT serta Verify JWT. Dimana proses tersebut biasanya menghambat "single thread" Node JS jika trafik atau request sudah banyak.

Jangan lupa untuk membuat file Environment Variables dengan nama ```.env``` agar aplikasi ini dapat berjalan. Untuk parameter yang ada di dalam variabel ```.env``` , silahkan lihat file ```sample-env.txt```.

Kerangka project ini dibuat dengan menggunakan basis Express Simple Boiler Plate yang dapat diunduh pada [link Github berikut](https://github.com/javascript-indonesias/ExpressSimpleBoilerPlate).

## Instalasi

Silahkan lakukan clone project ini dengan cara mengunduh dari menu Code > Zip di halaman Github ini. Atau lakukan dengan melakukan Git Clone project dengan perintah :

```sh
git clone -b master -o github --depth 1 --single-branch https://github.com/javascript-indonesias/auth-login-api.git
```

Setelah melakukan clone project atau download project kerangka ini, jalankan perintah ```npm install``` di dalam folder project tersebut.

## Penggunaan Development dan Debug

Pastikan di komputer anda telah terpasang Node JS versi 12.x atau yang lebih baru. Clone atau download project ini dengan menggunakan Git ke komputer lokal.

- Kemudian jalankan Perintah `npm install` .
- Untuk menjalankan proses debug atau development, jalankan perintah `npm run start-babel`. Di dalam folder `/src/index.js` terdapat fungsi melakukan Clustering proses Node JS. Non aktifkan atau berikan comment // pada fungsi clustering tersebut, jika proses Clustering membuat perangkat dan proses development terasa berat, atau tidak dibutuhkan ketika proses development.

## Penggunaan Production

Dalam pembuatan mode production, terdapat dua pilihan. Pilihan pertama yaitu melakukan build dengan Babel Compiler, dan pilihan kedua melakukan build dengan Webpack.

 **_Production dengan Babel Compiler_**

- Untuk proses **_Production dengan Babel Compiler_** , jalankan perintah `npm run build-babel` . Hasil dari build akan menghasilkan folder ```/dist``` .

- Untuk menguji hasil build di folder `/dist` , jalankan perintah `npm run start-babel` .

- Jika ingin deploy ke server, gunakan hasil build di folder `/dist` tersebut. Jangan lupa untuk konfigurasi `.env` dan instalasi package yang dibutuhkan di `package.json` .

 **_Production dengan Webpack_**

- Jalankan perintah `npm run build-prod` untuk membuat bundle file project yang ada di folder `/src` menjadi satu bundle file JavaScript yang sudah di minify.

- Hasil build mode Webpack akan menghasilkan file-file yang terdapat di folder `/bundle`.

- Untuk menguji hasil build mode Webpack ini, jalankan perintah `npm run debug-prod`.

- Jika ingin digunakan untuk deploy ke server, gunakan hasil build di folder `/bundle` ini. Jangan lupa untuk konfigurasi `.env` dan instalasi package yang dibutuhkan di `package.json` . Setelah konfigurasi dua hal tersebut, jalankan file `server.bundle.js` dengan PM2, Nodemon, atau Forever JS.

## Persyaratan Opsional Lainnya

Pastikan plugin ESLint dan Prettier telah terpasang di VS Code. Kemudian tambahkan konfigurasi ini di dalam file `settings.json` di setelan milik VS Code. File konfigurasi dapat diakses dengan menu File > Preferences > Settings. Kemudian klik tanda tombol di pojok kanan atas yang bertuliskan Open Settings (JSON).

```json
"editor.formatOnSave": true,
"[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
},
"[typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
},
"editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
}
```

Dengan penambahan baris konfigurasi VS Code di atas, VS Code akan melakukan formatting kode JavaScript ketika melakukan penyimpanan. Dan jangan lupa, pemrograman dengan VS Code semakin seru dengan  menggunakan [Mayukai Theme](https://marketplace.visualstudio.com/items?itemName=GulajavaMinistudio.mayukaithemevsc) dan [Iosevka Mayukai Font](https://github.com/Iosevka-Mayukai/Iosevka-Mayukai). Selamat mencoba.
