import Navbar from "@/components/custom/Navbar";
import SignupForm from "@/components/custom/SignupForm";

const Signup = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className=" flex-1 overflow-y-auto flex flex-col xl:px-16 xl:gap-24 xl:flex-row items-center justify-center xl:justify-between">
        <section className=" w-full md:w-1/2">{/* <Hero /> */}</section>

        <section className=" w-1/2 flex items-center justify-center">
          <div className="w-full">
            <h2 className="text-6xl font-semibold pb-16">Sign Up</h2>
            <SignupForm />
          </div>
        </section>
      </main>
    </div>
  );
};

export default Signup;
