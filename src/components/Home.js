/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react'
import { Locations } from '../data/locations';
import Select from 'react-select';
import axios from 'axios';
import "../css/home.css";
import io from "socket.io-client";



// const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || 'http://10.41.32.90:4000';

const SOCKET_SERVER_URL = process.env.REACT_APP_SOCKET_SERVER_URL || 'http://10.141.20.6:4000';

const socket = io(SOCKET_SERVER_URL);

function Home() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [unitValue, setUnitValue] = useState("");
  const codeColors = [{label:"BEYAZ",value:"white"},{label:"MAVİ",value:"#007FFF"},{label:"PEMBE",value:"pink"},{label:"KIRMIZI",value:"red"}];
  const [clickedButton, setClickedButton] = useState("BEYAZ");
  const [buttonBgColor, setButtonBgColor] = useState('white');
  const [notification, setNotification] = useState("");
  const [audio] = useState(new Audio("/alarmclock.mp3"));
  const [publicVapidKey, setPublicVapidKey] = useState(null);
  const [subscription, setSubscription] = useState(null);


  const openModal = async (event,color) => {
    setButtonBgColor(color.value);
    setClickedButton(color.label);
    setIsModalOpen(true); 
    color = [color.label,unitValue,color.value];
    console.log(unitValue,color);
    try {
      // const response = await axios.post(`http://10.41.32.90:4000/buttonClick`,{
      //   color:color,
      // });
      const response = await axios.post(`http://10.141.20.6:4000/buttonClick`,{
        color:color,
      });
      console.log(response.data);
    } catch(error) {
      console.error("Backend'e veri gönderme hatası:",error);
    }

    socket.emit('buttonClick',color);
    if(subscription){
      socket.emit('sendNotification',subscription,color);
    }
  };

  useEffect(()=>{

    fetch('http://10.141.20.6:4000/vapid-public-key')
    .then((response) => response.json())
    .then((dataVapid) => {
      setPublicVapidKey(dataVapid.publicVapidKey);
    })
    .catch((error) => {
      console.error('Public VAPID Key alınamadı:',error);
    });
    subscribeUser();
  },[]);

  const subscribeUser = async () => {
      if ('serviceWorker' in navigator) {
      //  navigator.serviceWorker.ready.then(function (registration) {
      //   // Push bildirimlerine abone olma
      //   registration.pushManager.subscribe({
      //     userVisibleOnly: true,
      //     applicationServerKey: urlBase64ToUint8Array(publicVapidKey), 
      //   }).then(function (sub) {
      //     console.log('User subscribed to push notifications:', sub);
      //     setSubscription(sub);
      //     // Sunucuya abone bilgilerini gönderme
      //     socket.emit('subscribe', sub);
      //   }).catch(function (error) {
      //     console.error('Push subscription failed:', error);
      //   });
      // });
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          const registration = await navigator.serviceWorker.register('service-worker.js');

          // Push Manager ile abone olma
          console.log(publicVapidKey);
          const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
          });

          // Backend'e abone bilgilerini gönder
          await fetch('http://10.141.20.6:4000/subscribe', {
            method: 'POST',
            body: JSON.stringify(subscription),
            headers: {
              'Content-Type': 'application/json',
            },
          });

          setSubscription(subscription);
          console.log('User subscribed:', subscription);
        }
      } catch (err) {
        console.error('Error during subscription:', err);
      }
    }
  }


  useEffect(()=>{
    socket.on('notification',(data) => {
      setNotification(data);
      console.log(data);
      new Notification('Yeni Bildirim',{body : data.message});
      setClickedButton(data[0]);
      setUnitValue(data[1]);
      setButtonBgColor(data[2]);
      setIsModalOpen(true);

      // Sunucudan gelen bildirimleri al
    socket.on('sendNotification', (message) => {
      console.log('New Notification:', message);
      // Tarayıcıda bildirim gösterme
      if (Notification.permission === 'granted') {
        new Notification('Yeni Bildirim', {
          body: message,
          // icon: icon,
        });
      }
    });

      audio.loop = true;
      audio.play();
    });

    return () => {
      socket.off('notification');
      socket.off('sendNotification');
    };
  },[audio]);

  const closeModal = () => {
    audio.pause();
    setIsModalOpen(false);
  };

  function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\\-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
 
  return (
    <>
    <div className='container my-5'>
      <h1 className='text-center' style={{ marginBottom:"40px"}}>BULUNDUĞUNUZ BİRİMİ SEÇİN</h1>
       <Select
        className="basic-single"
        classNamePrefix="select"
        defaultValue={Locations[0]}
        isSearchable={true}
        isClearable={true}
        name="locs"
        options={Locations}
        onChange={(choice) => setUnitValue(choice)}
      />
      <div className='buttonsDiv mt-5 d-flex justify-content-between'>
        <div onClick={(e) => openModal(e,codeColors[0])} className='buttonDiv d-flex justify-content-center align-items-center' style={{backgroundColor:`${codeColors[0].value}`,border:"1px solid gray"}}><strong>Beyaz Kod Bildir!</strong></div>
        <div onClick={(e) => openModal(e,codeColors[1])} className='buttonDiv d-flex justify-content-center align-items-center' style={{backgroundColor:`${codeColors[1].value}`}}><strong>Mavi Kod Bildir!</strong></div>
        <div onClick={(e) => openModal(e,codeColors[2])} className='buttonDiv d-flex justify-content-center align-items-center' style={{backgroundColor:`${codeColors[2].value}`}}><strong>Pembe Kod Bildir!</strong></div>
        <div onClick={(e) => openModal(e,codeColors[3])} className='buttonDiv d-flex justify-content-center align-items-center' style={{backgroundColor:`${codeColors[3].value}`}}><strong>Kırmızı Kod Bildir!</strong></div>
      </div>
      {isModalOpen && notification && (
        <div 
          style={{
            position: 'fixed',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
          onClick={closeModal} 
        >
          <div className='popUp d-flex flex-column justify-content-between align-items-center'
            style={{
              backgroundColor: buttonBgColor,
              padding: '20px',
              borderRadius: '8px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              minWidth: '200px',
            }}
            onClick={(e) => e.stopPropagation()} 
          >
            <h1> ACİL DURUM BİLDİRİMİ </h1>
            <h2>{clickedButton} KOD</h2>
            <h3 style={{
              animation: 'blink 2s infinite', 
              fontWeight: 'bold',
              color: '#f00',
            }}>{unitValue.label}</h3>
            <h3>DAHİLİ NO:{unitValue.value}</h3>
            <button className='btn btn-warning' onClick={closeModal}>Kapat</button>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

export default Home