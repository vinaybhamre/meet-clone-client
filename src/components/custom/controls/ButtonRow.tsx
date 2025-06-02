import {
  Hand,
  MoreVertical,
  ScreenShare,
  Smile,
  Subtitles,
} from "lucide-react";
import IconButton from "./IconButton";

const ButtonsRow = () => {
  return (
    <div className="flex gap-3 items-center">
      <IconButton icon={<Subtitles className="text-white w-6 h-6" />} />
      <IconButton icon={<Smile className="text-white w-6 h-6" />} />
      <IconButton icon={<ScreenShare className="text-white w-6 h-6" />} />
      <IconButton icon={<Hand className="text-white w-6 h-6" />} />
      <IconButton icon={<MoreVertical className="text-white w-6 h-6" />} />
    </div>
  );
};

export default ButtonsRow;
