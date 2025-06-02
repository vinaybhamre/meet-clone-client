import firstSlide from "@/assets/first_slide.svg";
import secondSlide from "@/assets/second_slide.svg";
import thirdSlide from "@/assets/third_slide.svg";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../ui/carousel";

const CarouselDeck = () => {
  return (
    <Carousel className=" w-full max-w-sm pb-40 md:pb-0">
      <CarouselContent>
        <CarouselItem>
          <div className=" flex flex-col justify-center items-center gap-4 mt-32">
            <img src={firstSlide} alt="" />

            <div className=" flex flex-col items-center justify-center text-center gap-2 flex-1">
              <h2 className=" text-xl sm:text-4xl font-medium">
                Get a link you can share
              </h2>
              <p className=" text-sm sm:text-xl">
                Click new meeting to get a link you can send to people you want
                to meet with
              </p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className=" flex flex-col justify-center items-center gap-4 mt-32">
            <img src={secondSlide} alt="" />

            <div className=" flex flex-col items-center justify-center text-center gap-2 flex-1">
              <h2 className=" text-xl sm:text-4xl font-medium">Plan ahead</h2>
              <p className=" text-sm sm:text-xl">
                Click new meeting to schedule meetings in Google Calendar and
                send invites to participants
              </p>
            </div>
          </div>
        </CarouselItem>
        <CarouselItem>
          <div className=" flex flex-col justify-center items-center gap-4 mt-32">
            <img src={thirdSlide} alt="" />

            <div className=" flex flex-col items-center justify-center text-center gap-2 flex-1">
              <h2 className=" text-xl sm:text-4xl font-medium">
                Your meeting is safe
              </h2>
              <p className=" text-sm sm:text-xl">
                No one can join a meeting unless invited or admitted by the host
              </p>
            </div>
          </div>
        </CarouselItem>
      </CarouselContent>
      <CarouselPrevious />
      <CarouselNext />
    </Carousel>
  );
};

export default CarouselDeck;
