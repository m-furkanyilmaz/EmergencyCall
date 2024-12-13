const webPush = require("web-push");
const express = require('express');
const app = express();
const path = require("path");
const cors = require("cors");
const http = require('http');

const socketIo = require('socket.io');
const server = http.createServer(app);

const PORT = process.env.PORT || 4000;

const vapidVeys = webPush.generateVAPIDKeys();
const publicVapidKey = vapidVeys.publicKey;

let subscriptions = [];

webPush.setVapidDetails(
'mailto:furkankdh@outlook.com',
vapidVeys.publicKey,
vapidVeys.privateKey
);

app.use(express.json());

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

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'build', 'index.html'));
// });

app.get('/vapid-public-key',(req,res)=>{
  res.json({publicVapidKey});
});

app.post('/subscribe', (req, res) => {
  const subscription = req.body;
  
  // Geçici bellekte (dizi) abonelik ekleyin
  subscriptions.push(subscription);
  
  res.status(200).json({ message: 'Subscribed successfully!' });
});

io.on('connection', (socket) => {
  console.log('Yeni bir cihaz bağlandı');

  // Butona tıklanması olayını dinle
  socket.on('buttonClick', (color) => {
    console.log(`Butona tıklandı! Tıklanan renk: ${color}`);

    // Tüm bağlı cihazlara bildirim gönder
    io.emit('notification', color );
  });

  socket.on('subscribe', (subscription) => {
    subscriptions.push(subscription);
    console.log('User subscribed:', subscription.endpoint);
  });

  socket.on('sendNotification',(color) =>{
    subscriptions.forEach((subscription) => {
      console.log("RENK BİLGİSİ:",color);
    const payload = JSON.stringify({
      title: 'Yeni Bildirim',
      body: "color",
    });
    webPush.sendNotification(subscription,payload)
  .then(response=> {
    console.log('Push notification sent:',response);
  })
  .catch(error => {
    console.log('Error sending push notification',error);
  });
    });
});
  
  app.use(express.static(path.join(__dirname,"build")));

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