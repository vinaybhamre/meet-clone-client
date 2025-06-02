import { ReactNode } from "react";

interface IconButtonProps {
  icon: ReactNode;
}

const IconButton = ({ icon }: IconButtonProps) => {
  return (
    <div className="p-4 rounded-full bg-gray-700 flex items-center justify-center cursor-pointer hover:bg-gray-600 transition">
      {icon}
    </div>
  );
};

export default IconButton;
