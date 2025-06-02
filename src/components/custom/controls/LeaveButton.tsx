import { Phone } from "lucide-react";

interface LeaveButtonProps {
  onLeave: () => void;
}

const LeaveButton = ({ onLeave }: LeaveButtonProps) => {
  // const handleLeave = () => {
  //   // TODO: handle actual leave call logic
  //   console.log("Leaving call...");
  // };

  return (
    <button
      onClick={onLeave}
      className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 cursor-pointer rounded-full flex items-center justify-center transition"
    >
      <Phone className="w-8 h-8 rotate-135" />
    </button>
  );
};

export default LeaveButton;
