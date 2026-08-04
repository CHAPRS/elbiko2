'use client';

import { useState, useEffect } from 'react';

interface Bike {
  id: number;
  name: string;
  status: 'FREE' | 'RENTED' | 'MAINTENANCE';
  speed: string;
  range: string;
  motor: string;
  isWaterproof: boolean;
}

export function useHomeLogic() {
  const [bikes, setBikes] = useState<Bike[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedBike, setSelectedBike] = useState<Bike | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  useEffect(() => {
    async function loadBikes() {
      try {
        const res = await fetch('/api/admin/bikes');
        if (res.ok) {
          const data = await res.json();
          setBikes(data);
        }
      } catch (err) {
        console.error('Ошибка сети бэкенда', err);
      }
    }
    loadBikes();
  }, []);

  const handleBookingSubmit = (e: any) => {
    e.preventDefault();
    if (!clientName || !clientPhone || !selectedBike) return;

    const messageText = 'Новая заявка на аренду!\n\n' +
      '👤 Клиент: ' + clientName + '\n' +
      '📞 Телефон: ' + clientPhone + '\n' +
      '🚲 Велосипед: ' + selectedBike.name + '\n' +
      '⚡ Мотор: ' + selectedBike.motor + '\n' +
      '☔ Аквазащита: ' + (selectedBike.isWaterproof ? 'Да' : 'Нет');

    const telegramUrl = 'https://telegram.me' + encodeURIComponent(messageText);
    window.open(telegramUrl, '_blank');

    setTimeout(() => {
      setClientName('');
      setClientPhone('');
      setIsModalOpen(false);
      setSelectedBike(null);
    }, 100);
  };

  const name1 = (bikes && bikes[0]) ? bikes[0].name : 'Monster Long Range PRO';
  const speed1 = (bikes && bikes[0]) ? bikes[0].speed : 'до 50 км/ч';
  const range1 = (bikes && bikes[0]) ? bikes[0].range : 'до 80 км';
  const motor1 = (bikes && bikes[0]) ? bikes[0].motor : '500W';
  const status1 = (bikes && bikes[0]) ? bikes[0].status : 'FREE';

  const name2 = (bikes && bikes[1]) ? bikes[1].name : 'Monster Heavy Duty';
  const speed2 = (bikes && bikes[1]) ? bikes[1].speed : 'до 45 км/ч';
  const range2 = (bikes && bikes[1]) ? bikes[1].range : 'до 70 км';
  const motor2 = (bikes && bikes[1]) ? bikes[1].motor : '450W';
  const status2 = (bikes && bikes[1]) ? bikes[1].status : 'FREE';

  const name3 = (bikes && bikes[2]) ? bikes[2].name : 'Monster Eco Delivery';
  const speed3 = (bikes && bikes[2]) ? bikes[2].speed : 'до 40 км/ч';
  const range3 = (bikes && bikes[2]) ? bikes[2].range : 'до 60 км';
  const motor3 = (bikes && bikes[2]) ? bikes[2].motor : '350W';
  const status3 = (bikes && bikes[2]) ? bikes[2].status : 'FREE';

  const bikeObj1 = (bikes && bikes[0]) ? bikes[0] : { id: 1, name: name1, speed: speed1, range: range1, motor: motor1, isWaterproof: true, status: status1 };
  const bikeObj2 = (bikes && bikes[1]) ? bikes[1] : { id: 2, name: name2, speed: speed2, range: range2, motor: motor2, isWaterproof: true, status: status2 };
  const bikeObj3 = (bikes && bikes[2]) ? bikes[2] : { id: 3, name: name3, speed: speed3, range: range3, motor: motor3, isWaterproof: false, status: status3 };

  return {
    isModalOpen,
    setIsModalOpen,
    selectedBike,
    setSelectedBike,
    clientName,
    setClientName,
    clientPhone,
    setClientPhone,
    handleBookingSubmit,
    name1, speed1, range1, motor1, status1, bikeObj1,
    name2, speed2, range2, motor2, status2, bikeObj2,
    name3, speed3, range3, motor3, status3, bikeObj3
  };
}
