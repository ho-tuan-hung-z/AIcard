import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CarCard from './CarCard';
import type { Car } from '../types';

interface CarCarouselProps {
  cars: Car[];
  onCarSelect: (car: Car) => void;
}

const CarCarousel: React.FC<CarCarouselProps> = ({ cars, onCarSelect }) => {
  const carouselRef = useRef<HTMLDivElement>(null);
  const { scrollXProgress } = useScroll({ container: carouselRef });

  return (
    <div
      ref={carouselRef}
      className="w-full overflow-x-auto flex snap-x snap-mandatory scroll-pl-6"
      style={{ scrollPaddingLeft: '5vw' }}
    >
      <div className="flex-shrink-0 w-[calc(5vw-1rem)]" />
      {cars.map((car, index) => {
        const start = index / cars.length;
        const end = (index + 1) / cars.length;
        const center = (start + end) / 2;
        
        const distance = useTransform(scrollXProgress, (pos) => Math.abs(pos - center));
        const scale = useTransform(distance, [0, 0.5], [1, 0.9]);
        const opacity = useTransform(distance, [0, 0.5], [1, 0.6]);

        return (
          <motion.div
            key={car.name + index}
            className="w-[80vw] md:w-[40vw] flex-shrink-0 snap-center px-2"
            style={{ scale, opacity }}
            onClick={() => onCarSelect(car)}
          >
            <CarCard car={car} />
          </motion.div>
        );
      })}
       <div className="flex-shrink-0 w-[calc(5vw-1rem)]" />
    </div>
  );
};

export default CarCarousel;
