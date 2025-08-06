import type { Car } from '../types';
import carData from '../data.json';

// Helper function to parse price from total_price_show field (e.g., "40万円" -> 40, "70.7万円" -> 70.7)
const parsePriceFromShow = (priceShow: string): number => {
  if (!priceShow) return 0;
  const match = priceShow.match(/(\d+(?:\.\d+)?)万円/);
  return match ? parseFloat(match[1]) : 0;
};

// Transform function to convert JSON car data to app's Car interface
export function transformCarData(jsonCar: any): Car {
  const carName = `${jsonCar.maker_name} ${jsonCar.car_model_name}`;
  const gradeInfo = jsonCar.grade1 ? ` ${jsonCar.grade1}` : '';
  
  return {
    name: carName + gradeInfo,
    year: parseInt(jsonCar.model_year),
    mileage: jsonCar.mileage,
    price: parsePriceFromShow(jsonCar.total_price_show), // Use total_price_show instead of calculating
    imageUrl: jsonCar.photo_files?.[0] || `https://picsum.photos/seed/${jsonCar.code}/800/600`,
    specs: {
      engine: jsonCar.engine_type === 'ハイブリッド' ? 
        `${jsonCar.displacement || 0}cc ハイブリッド` : 
        `${jsonCar.displacement || 0}cc ${jsonCar.engine_type || 'ガソリン'}`,
      size: `${jsonCar.door || 4}ドア・${jsonCar.person || 4}人乗り`,
      safety: jsonCar.equip_names ? 
        jsonCar.equip_names.filter((eq: string) => 
          eq.includes('エアバッグ') || eq.includes('ABS') || eq.includes('横滑り') || eq.includes('衝突')
        ).slice(0, 3).join(', ') || '基本安全装備' : '基本安全装備'
    },
    isFavorite: false
  };
}

// Get all cars from JSON data
export function getAllCars(): Car[] {
  return carData.response.docs.map(transformCarData);
}

// Get cars by maker
export function getCarsByMaker(makerName: string): Car[] {
  return carData.response.docs
    .filter((car: any) => car.maker_name === makerName)
    .map(transformCarData);
}

// Get cars by price range (in man-yen)
export function getCarsByPriceRange(minPrice: number, maxPrice: number): Car[] {
  return carData.response.docs
    .filter((car: any) => {
      const priceInManYen = parsePriceFromShow(car.total_price_show);
      return priceInManYen >= minPrice && priceInManYen <= maxPrice;
    })
    .map(transformCarData);
}

// Get cars by year range
export function getCarsByYear(minYear: number, maxYear?: number): Car[] {
  return carData.response.docs
    .filter((car: any) => {
      const year = parseInt(car.model_year);
      return year >= minYear && (maxYear ? year <= maxYear : true);
    })
    .map(transformCarData);
}

// Get unique makers from the data
export function getUniqueMakers(): string[] {
  const makers = new Set<string>();
  carData.response.docs.forEach((car: any) => {
    if (car.maker_name) {
      makers.add(car.maker_name);
    }
  });
  return Array.from(makers).sort();
}

// Get unique models by maker
export function getModelsByMaker(makerName: string): string[] {
  const models = new Set<string>();
  carData.response.docs
    .filter((car: any) => car.maker_name === makerName)
    .forEach((car: any) => {
      if (car.car_model_name) {
        models.add(car.car_model_name);
      }
    });
  return Array.from(models).sort();
}

// Get sample cars for recommendations
export function getSampleCars(count: number = 10): Car[] {
  const shuffled = [...carData.response.docs].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count).map(transformCarData);
}

// Search cars by multiple criteria
export function searchCars(criteria: {
  maker?: string;
  model?: string;
  minYear?: number;
  maxYear?: number;
  minPrice?: number;
  maxPrice?: number;
  maxMileage?: number;
  bodyType?: string;
}): Car[] {
  return carData.response.docs
    .filter((car: any) => {
      if (criteria.maker && car.maker_name !== criteria.maker) return false;
      if (criteria.model && car.car_model_name !== criteria.model) return false;
      if (criteria.minYear && parseInt(car.model_year) < criteria.minYear) return false;
      if (criteria.maxYear && parseInt(car.model_year) > criteria.maxYear) return false;
      
      const priceInManYen = parsePriceFromShow(car.total_price_show);
      if (criteria.minPrice && priceInManYen < criteria.minPrice) return false;
      if (criteria.maxPrice && priceInManYen > criteria.maxPrice) return false;
      
      if (criteria.maxMileage && car.mileage > criteria.maxMileage) return false;
      if (criteria.bodyType && car.body_type_name !== criteria.bodyType) return false;
      
      return true;
    })
    .map(transformCarData);
} 