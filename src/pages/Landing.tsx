import CarouselDeck from "@/components/custom/CarouselDeck";
import Hero from "@/components/custom/Hero";
import Navbar from "@/components/custom/Navbar";

const Landing = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className=" flex-1 overflow-y-auto flex flex-col xl:px-16 xl:gap-24 xl:flex-row items-center justify-center xl:justify-between">
        <section className=" w-full md:w-1/2">
          <Hero />
        </section>

        {/* Right side: Carousel */}
        <section className=" w-1/2 flex items-center justify-center">
          <CarouselDeck />
        </section>
      </main>
    </div>
  );
};

export default Landing;
