interface CustomDrawerProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

const CustomDrawer = ({ title, onClose, children }: CustomDrawerProps) => {
  return (
    <div
      className={`
    w-[400px]
    bg-white
    dark:bg-zinc-900
    text-black dark:text-white
    shadow-lg
    h-full
    flex
    flex-col
    rounded-md
    transition-transform duration-300 transform
    translate-x-0
  `}
    >
      <div className="flex justify-between items-center p-4 border-b border-zinc-300 dark:border-zinc-700">
        <h2 className="text-lg font-semibold capitalize">{title}</h2>
        <button
          onClick={onClose}
          className="text-sm text-blue-600 hover:underline"
        >
          Close
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </div>
  );
};

export default CustomDrawer;
