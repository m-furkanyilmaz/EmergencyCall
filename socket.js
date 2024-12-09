const express = require('express');
const app = express();

const cors = require("cors");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const http = require('http');
const socketIo = require('socket.io');
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

const io = socketIo(server,{
  cors:{
    origin:"*",
    methods:["GET","POST"],
  }
});


app.use(cors({
  origin:"*",
  methods:["GET","POST"],
  allowedHeaders:['Content-Type'],
}));


io.on('connection', (socket) => {
  console.log('Yeni bir cihaz bağlandı');

  // Butona tıklanması olayını dinle
  socket.on('buttonClick', (color) => {
    console.log(`Butona tıklandı! Tıklanan renk: ${color}`);

    // Tüm bağlı cihazlara bildirim gönder
    io.emit('notification', color );
  });


app.get('/', (req, res) => {
  res.send('Socket.IO Sunucu Çalışıyor');
});

app.post('/buttonClick', (req, res) => {
  const { color } = req.body; // Buton rengi bilgisi
  console.log(`Backend'e gönderilen renk: ${color}`);
  
  // Burada gelen veriyi işleyebiliriz.
  // Örneğin, bu veriyi bağlı tüm cihazlara gönderelim:
  io.emit('notification',  color );

  // Backend'in başarılı bir şekilde veri aldığını bildiren yanıt
  res.json({ status: 'success', message: `Renk ${color} başarıyla alındı!` });
});


  // Bağlantı sonlandığında
  socket.on('disconnect', () => {
    console.log('Bir cihaz bağlantısı kesildi');
  });
});

// Sunucu başlatma
server.listen(PORT, () => {
  console.log(`Sunucu ${PORT} portunda çalışıyor`);
});