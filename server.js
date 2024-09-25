const http = require('http');
const request = require('request');
const fs = require('fs'); // Modul untuk filesystem

const logFilePath = 'log.log'; // Nama file log

// Fungsi untuk mendapatkan timestamp dalam waktu lokal
const getTimestamp = () => {
    const now = new Date();
    return now.toLocaleString('id-ID', {
        timeZone: 'Asia/Jakarta', // Atur sesuai dengan zona waktu yang diinginkan
        hour12: false // Gunakan format 24 jam
    });
};

const proxy = http.createServer((req, res) => {
    const url = req.url;

    // Mendekode URL
    const decodedUrl = decodeURIComponent(url);

    // Mengubah format menjadi sesuai harapan
    const formattedLog = decodedUrl
        .replace(/&/g, ' ')  // Ganti '&' dengan spasi
        .replace(/%20/g, ' ') // Ganti '%20' dengan spasi
        .replace(/\+/g, ' ') // Ganti '+' dengan spasi
        .replace(/%2C/g, ',') // Ganti '%2C' dengan ','
        .replace(/%3A/g, ':') // Ganti '%3A' dengan ':'
        .replace(/%2F/g, '/') // Ganti '%2F' dengan '/'
        .replace(/%3B/g, ';'); // Ganti '%3B' dengan ';'

    const timestamp = getTimestamp(); // Mendapatkan timestamp

    // Simpan log permintaan asli ke dalam file
    fs.appendFile(logFilePath, `[${timestamp}] Received request: ${formattedLog}\n`, (err) => {
        if (err) {
            console.error('Error writing to log file:', err);
        }
    });

    // Kirim permintaan ke server 1
    request('http://192.168.1.132:2394' + url)
        .pipe(res)
        .on('finish', () => {
            console.log(`[${timestamp}] Sent to Server 1`);
        });

    // Kirim permintaan ke server 2 dengan delay 1 detik
    setTimeout(() => {
        request('http://192.168.1.132:2395' + url, (error, response, body) => {
            if (error) {
                console.error('Error sending request to server 2:', error);
            } else {
                console.log(`[${timestamp}] Sent to Server 2`);
            }
        });
    }, 1000); // Delay 1 detik
});

proxy.listen(2393, () => {
    console.log('Proxy listening on port 2393');
});
