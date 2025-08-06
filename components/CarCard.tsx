import React from 'react';
import { motion } from 'framer-motion';
import type { Car } from '../types';

interface CarCardProps {
  car: Car;
}

const CarCard: React.FC<CarCardProps> = ({ car }) => {
  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)' }}
      className="rounded-card overflow-hidden relative aspect-[4/3] cursor-pointer shadow-custom"
    >
      <img src={car.imageUrl} alt={car.name} className="w-full h-full object-cover" />
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent p-4 flex flex-col justify-end">
        <p className="font-mono text-sm text-accent/80">{car.year}年 / {car.mileage.toLocaleString()} km</p>
        <h3 className="font-heading text-lg font-bold text-accent truncate">{car.name}</h3>
        <p className="font-heading text-2xl font-bold text-primary">{car.price.toLocaleString()}万円</p>
      </div>
    </motion.div>
  );
};

export default CarCard;
