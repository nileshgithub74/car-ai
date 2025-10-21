import { getCarById } from "@/action/car-listing";
import { CarDetails } from "./_component/car-details";
import { notFound } from "next/navigation";
import type { SerializedCar } from "@/lib/helpers";

type TestDriveInfo = {
  userTestDrive?: { id: string; status: string; bookingDate: string } | null;
  dealership?: {
    address?: string;
    phone?: string;
    email?: string;
    workingHours?: Array<{
      dayOfWeek: string;
      isOpen: boolean;
      openTime: string;
      closeTime: string;
    }>;
  } | null;
};

type CarWithTestDrive = SerializedCar & {
  status: string;
  images: string[];
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  seats?: number;
  description: string;
  testDriveInfo: TestDriveInfo;
};

// Local type aligned with `CarDetails` component expectations
type ComponentCar = {
  id: string;
  make: string;
  model: string;
  year: number;
  price: number;
  mileage: number;
  fuelType: string;
  transmission: string;
  bodyType: string;
  color: string;
  seats?: number;
  description: string;
  status: string;
  images: string[];
  wishlisted?: boolean;
};

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await getCarById(id);

  if (!result.success || !result.data) {
    return {
      title: "Car Not Found | Vehiql",
      description: "The requested car could not be found",
    };
  }

  const car = result.data as CarWithTestDrive;

  return {
    title: `${car.year} ${car.make} ${car.model} | Vehiql`,
    description: car.description.substring(0, 160),
    openGraph: {
      images: car.images?.[0] ? [car.images[0]] : [],
    },
  };
}

export default async function CarDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  // Fetch car details
  const { id } = await params;
  const result = await getCarById(id);

  // If car not found, show 404
  if (!result.success || !result.data) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-12">
      {(() => {
        const car = result.data as unknown as CarWithTestDrive;
        const componentCar: ComponentCar = {
          id: String(car.id),
          make: String(car.make),
          model: String(car.model),
          year: Number(car.year),
          price: Number(car.price),
          mileage: Number(car.mileage),
          fuelType: String(car.fuelType),
          transmission: String(car.transmission),
          bodyType: String(car.bodyType),
          color: String(car.color),
          seats: car.seats === undefined || car.seats === null ? undefined : Number(car.seats),
          description: String(car.description),
          status: String(car.status),
          images: Array.isArray(car.images) ? car.images : [],
          wishlisted: Boolean(car.wishlisted),
        };
        return <CarDetails car={componentCar} testDriveInfo={car.testDriveInfo} />;
      })()}
    </div>
  );
}
