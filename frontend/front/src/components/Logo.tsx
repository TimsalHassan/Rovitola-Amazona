import { Utensils } from "lucide-react";

interface LogoProps {
    className?: string
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div className={`flex items-center gap-2 group ${className || ""}`}>
      {/* <div className="w-9 h-9 bg-gradient-to-b from-amber-500 via-amber-400 to-amber-500 rounded-lg flex items-center justify-center shadow-[inset_0px_0px_1px] group-hover:bg-amber-400 transition-colors">
        <Utensils size={20} className="text-gray-100" />
      </div> */}
      <div className='size-12 overflow-hidden border-px border-black bg-gradient-to-b from-neutral-900 via-neutral-800 to-neutral-900 rounded-xl flex items-center justify-center shadow-[inset_0px_0px_4px] shadow-md group-hover:bg-amber-400 transition-colors'>
        <img src='/favicon.png' alt='Logo' className='w-full h-full object-cover' />
      </div>
      <div className="flex flex-col leading-none">
        <span className="text-white font-bold text-sm tracking-tight">
          Ravintola
        </span>
        <span className="text-amber-400 font-bold text-sm tracking-wide">
          Amazona
        </span>
      </div>
    </div>
  );
};

export default Logo;
