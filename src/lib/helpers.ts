export interface Car {
  id: string | number;
  make: string;
  model: string;
  year: number | string;
  color?: string;
  bodyType?: string;
  fuelType?: string;
  price?: number | string;
  mileage?: number;
  transmission?: string;
  description?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

// Define a separate type for serialized car
export type SerializedCar = Omit<Car, "price" | "createdAt" | "updatedAt"> & {
  price: number;
  createdAt?: string;
  updatedAt?: string;
  wishlisted: boolean;
};

export const serializeCarData = (
  car: Car,
  wishlisted: boolean = false
): SerializedCar => {
  return {
    ...car,
    price: car.price ? parseFloat(car.price.toString()) : 0,
    createdAt: car.createdAt instanceof Date ? car.createdAt.toISOString() : car.createdAt,
    updatedAt: car.updatedAt instanceof Date ? car.updatedAt.toISOString() : car.updatedAt,
    wishlisted,
  };
};
