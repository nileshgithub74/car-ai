import CarCard from "@/components/ui/car-card";
import HomeSearch from "@/components/ui/home-search";
import { bodyTypes, featuredCars } from "@/lib/data";
import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Car, ChevronRight } from "lucide-react";
import Image from "next/image";
import { carMakes } from "@/lib/data";

const Home = () => {
  return (
    <div className="pt-20 flex flex-col">
      {/* her0 */}
      <section className="relative py-16 md:py-28 dotted-background">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <h1 className="bg-gradient-to-br from-rose-500 to-green-400 font-extrabold tracking-tighter pr-2 pb-2 text-transparent bg-clip-text text-5xl md:text-8xl">
              Find your Dream Car{" "}
              <span className="bg-gradient-to-bl from-cyan-400 to-red-400 text-transparent bg-clip-text text-5xl md:text-8xl m-4">
                With Vehiql AI
              </span>
            </h1>
            <p className="text-gray-300 mb-8 mt-3 max-w-2xl mx-auto">
              {" "}
              Advanced Ai car search and test drive from thousand of vehicles.
            </p>
          </div>

          {/* Search */}
          <HomeSearch />
        </div>
      </section>

      {/* featured cars */}

      <section className="py-12 bg-gray-200/50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold ">Featured Cars</h2>
            <Button variant="ghost" className="flext items-center " asChild>
              <Link href="/cars">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1">
            {featuredCars.map((car) => {
              return <CarCard key={car.id} car={car} />;
            })}
          </div>
        </div>
      </section>

      {/* browse by makes */}

      <section className="py-12 bg-yellow-100/40">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold ">Browsed By Makes</h2>
            <Button variant="ghost" className="flext items-center " asChild>
              <Link href="/cars">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 ">
            {carMakes.map((make) => (
              <Link
                key={make.name}
                href={`/cars?make=${make.name}`}
                className="bg-white rounded-lg shadow p-4 text-center hover:shadow-md transition cursor-pointer"
              >
                <div className=" w-32 h-32 mx-4 mb-2 relative">
                  <Image
                    src={make.image}
                    alt={make.name}
                    fill
                    style={{ objectFit: "contain" }}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* //why chose us */}
      <section className="py-16 bg-teal-100/35">
        <div className="container mx-auto px-4 ">
          <h2 className="text-2xl text-center font-bold mb-12">
            Why choose Our Platform
          </h2>

          {/* grid layout */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 */}
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Wide Selection</h3>
              <p className="text-gray-600">
                Thousands of verified vehicles from trusted dealerships and
                private sellers.
              </p>
            </div>

            {/* Card 2 */}
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">AI Powered Search</h3>
              <p className="text-gray-600">
                Quickly find cars with advanced AI search and filters.
              </p>
            </div>

            {/* Card 3 */}
            <div className="text-center">
              <div className="bg-blue-100 text-blue-700 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Car className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Trusted Platform</h3>
              <p className="text-gray-600">
                Buy confidently with verified dealers and secure listings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* // browse by bodytype */}

      
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold ">Browsed By Body Types</h2>
            <Button variant="ghost" className="flext items-center " asChild>
              <Link href="/cars">
                View All
                <ChevronRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {bodyTypes.map((type) => (
              <Link
                key={type.name}
                href={`/cars?bodyType=${type.name}`}
                className="relative group cursor-pointer"
              >
                <div className=" overflow-hidden rounded-lg flex justify-end h-28 mb-4 relative">
                  <Image
                    src={type.image}
                    alt={type.name}
                    fill
                    className="object-cover group-hover:scale-105 transiton duration-300"
                  />
                </div>

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex rounded-lg items-end">
                  <h3 className="text-white text-md font-bold pl-4 pb-5 ">{type.name}</h3>
                </div>



              </Link>
            ))}
          </div>
        </div>
      </section>




    </div>
  );
};

export default Home;
