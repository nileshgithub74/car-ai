"use client";
import { useState } from "react";
import { Card, CardContent } from "./card";
import Image from "next/image";
import { CarIcon, Heart } from "lucide-react";
import { Button } from "./button";
import { Badge } from "./badge";
import { useRouter } from "next/navigation";

export interface Car {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number;
  images: string[];
  transmission: string;
  fuelType: string;
  bodyType: string;
  mileage: number;
  color: string;
  wishlisted: boolean;
}

interface CarsProps{
    car: Car
}


const CarCard :React.FC<CarsProps>= ({ car }) => {
  const [isSaved, setSaved] = useState(car.wishlisted);

  const  router = useRouter();





  return (
    <Card className="relative overflow-hidden hover:shadow-lg transition group py-0 ml-4 mr-4 bg-gradient-to-br from-cyan-50 to-rose-100 hover:bg-gradient-to-b hover:from-red-200 via-purple-200 to-green-200">
      <div className="relative h-48">
        {car.images && car.images.length > 0 ? (
          <div>
            <Image
              src={car.images[0]}
              alt={`${car.make} ${car.model}`}
              fill
              className="object-cover group-hover:scale-105 transition duration-300"
            />
          </div>
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <CarIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 bg-white/90 rounded-full p-1.5"
        onClick={() => setSaved(!isSaved)}
      >
        <Heart
          size={20}
          className={`transition-colors duration-300 ${
            isSaved ? "fill-red-500 text-red-500" : "fill-none text-gray-500"
          }`}
        />
      </Button>
      <CardContent className="p-4">
        <div className="flex flex-col mb-2">
          <h3 className="text-lg font-bold line-clamp-1">
            {car.make} {car.model}
          </h3>
          <span className="text-xl font-bold text-blue-500">
            {" "}
            ${car.price.toLocaleString()}
          </span>
        </div>

        <div className="text-gray-600 mb-2 flex items-center">
          <span>{car.year}</span>
          <span className="mx-2">.</span>
          <span>{car.year}</span>
          <span className="mx-2">.</span>
          <span>{car.fuelType}</span>
        </div>

        <div className="flex flex-wrap gap-1 mb-4">
          <Badge variant="outline" className="bg-gray-100">
            {car.bodyType}
          </Badge>

             <Badge variant="outline" className="bg-gray-100">
            {car.mileage.toLocaleString()} miles
          </Badge>

             <Badge variant="outline" className="bg-gray-100">
            {car.color}
          </Badge>




        </div>

        <div className="flex border rounded-4xl">
            <Button 
            
            className="flex-1 "
            onClick={()=> router.push("/cars/${car.id}")}
            >View car</Button>
        </div>


      </CardContent>
    </Card>
  );
};

export default CarCard;
