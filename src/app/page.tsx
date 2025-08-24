import CarCard from "@/components/ui/car-card";
import HomeSearch from "@/components/ui/home-search";
import { featuredCars } from "@/lib/data";
import React from "react";

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

      <section className="py-13">
        <div>
          <div>
            <h2>Featured Cars</h2>
            <button className="border rounded-sm border-teal-400 ">
              View All
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCars.map((car) => {
              return <CarCard key={car.id}  car={car} />;
            })}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
