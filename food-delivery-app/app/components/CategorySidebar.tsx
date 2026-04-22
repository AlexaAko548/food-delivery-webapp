"use client";
import Link from "next/link";

type Category = {
  name: string;
  icon: string;
};

export default function CategoryBubbles({
  categories,
  currentCategory,
}: {
  categories: Category[];
  currentCategory?: string;
}) {

  const visibleCategories = categories.filter(
    (cat) => cat.name.toLowerCase() !== currentCategory?.toLowerCase()
  );

  return (
    <div className="flex flex-wrap justify-center gap-6 md:gap-10">

      {/* Home Bubble */}
      <Link
        href="/home"
        className="flex flex-col items-center gap-2 group cursor-pointer"
      >
        <div className="w-12 h-12 rounded-full bg-[#DCD1C4] border-2 border-white/20 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 group-hover:bg-white transition-all">
          🏠
        </div>
        <span className="text-white text-sm font-semibold drop-shadow-md group-hover:text-[#DCD1C4] transition-colors">
          Home
        </span>
      </Link>

      {visibleCategories.map((cat, index) => (
        <Link
          key={index}
          href={`/${cat.name.toLowerCase()}`}
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div className="w-12 h-12 rounded-full bg-[#DCD1C4] border-2 border-white/20 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 group-hover:bg-white transition-all">
            {cat.icon}
          </div>

          <span className="text-white text-sm font-semibold drop-shadow-md group-hover:text-[#DCD1C4] transition-colors">
            {cat.name}
          </span>
        </Link>
      ))}
    </div>
  );
}