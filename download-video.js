const https = require('https');
const fs = require('fs');

const url = "https://assets.mixkit.co/videos/preview/mixkit-earth-rotating-in-space-from-above-41589-large.mp4";
const file = fs.createWriteStream("earth.mp4");

const options = {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Referer': 'https://mixkit.co/',
    'Accept': 'video/webm,video/ogg,video/*;q=0.9,application/ogg;q=0.7,audio/*;q=0.6,*/*;q=0.5'
  }
};

https.get(url, options, function(response) {
  if(response.statusCode !== 200) {
     console.log("Failed: " + response.statusCode);
     return;
  }
  response.pipe(file);
  file.on('finish', function() {
    file.close();
    console.log("Download complete!");
  });
}).on('error', function(err) {
  console.log("Error: " + err.message);
});
