"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Header from "../components/Header";
import CatBubble from "../components/CategorySidebar";

const CATEGORIES = [
  { name: "Pasta", icon: "🍝" },
  { name: "Sandwiches", icon: "🥪" },
  { name: "Pastries", icon: "🥖" },
  { name: "Drinks", icon: "🥤" },
];

// Mapping the category names to your specific URLs
const HERO_IMAGES: Record<string, string> = {
  sandwiches: "https://media.houseandgarden.co.uk/photos/62977da831afd4e1e7dd7930/16:9/w_2560%2Cc_limit/JubileeRecipessandwiches_.jpg",
  pasta: "https://cdn.apartmenttherapy.info/image/upload/f_auto,q_auto:eco,c_fill,g_auto,w_1500,ar_3:2/k%2FPhoto%2FRecipes%2F2024-11-rigatoni-pasta%2Frigatoni-pasta-098",
  pastries: "https://static.cordonbleu.edu/Files/MediaFile/88425.jpg",
  meals: "https://m.media-amazon.com/images/S/assets.wholefoodsmarket.com//content/57/85/7a61e4d94a80ace0a3a0a50b03d4/2025-wfm-cen-novb-ee-thanksgiving-family-meals-wfmonsite-homepage-content-split._TTW_._CR0,0,1320,990_._SR900,675_._QL100_.jpg",
  drinks: "https://wowitsveggie.com/wp-content/uploads/2020/04/differenttypesofcofee-coffeedrinks.jpg",
};

export default function CategoryPage() {
  const params = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get current category from URL
  const currentCategory = (params?.categories as string) || "";
  
  // Select the image based on the category, fallback to your default '/top.webp' if not found
  const bgImage = HERO_IMAGES[currentCategory.toLowerCase()] || "/top.webp";

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col relative">
      
      {/* 1. Dynamic Hero Section */}
      <section className="relative h-[50vh] w-full bg-[#3a3028] flex items-center justify-center overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-overlay transition-all duration-700"
          style={{ backgroundImage: `url('${bgImage}')` }}
        ></div>
        
        {/* Transparent Header with Toggle */}
        <Header onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="relative z-10 text-center mt-10">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg capitalize tracking-tight">
            {currentCategory.toUpperCase()}
          </h1>

          <p className="text-[#DCD1C4] mt-2 font-medium tracking-wide">
            Explore our best {currentCategory} selection
          </p>  

        <div className="mt-8">
            <CatBubble
            currentCategory={currentCategory} 
            categories={CATEGORIES} 
            />
        </div>
        </div>
      </section>

      <div className="flex flex-1 relative">

        {/* 3. Main Items Grid */}
        <main className="flex-1 p-8 md:p-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder for Food Cards */}
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-64 bg-[#E7E2DE] rounded-3xl border border-[#D4C8BA]/40 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-[#DCD1C4] rounded-full mb-4 animate-pulse"></div>
                <p className="italic text-[#8A6B52] font-medium">Delicious {currentCategory} item coming soon...</p>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}