"use client";
import Link from "next/link";
import { useMenu } from "../../hooks/useMenu";
import Image from "next/image";

export default function MenuPage() {
  const { menuItems, loading, error } = useMenu();

  if (loading) return <p>Loading menu...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!menuItems.length) return <p>No menu items found.</p>;

  return (
    <div className="min-h-screen bg-[#F8F5F1] p-8">
      <h1 className="text-4xl font-bold text-[#5c4033] mb-8 text-center">Menu</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {menuItems.map((item) => (
          <div key={item.id} className="bg-white border border-[#EAE0D5] rounded-2xl overflow-hidden hover:shadow-lg transition-shadow">
            {item.imageURL ? (
              <Image
                src={item.imageURL}
                alt={item.name}
                width={400}
                height={250}
                className="w-full h-48 object-cover"
              />
            ) : (
              <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-sm">No image</span>
              </div>
            )}
            <div className="p-4 text-center">
              <h3 className="text-lg font-semibold text-[#5c4033] mb-1">{item.name}</h3>
              <p className="text-gray-500 text-sm mb-2 line-clamp-2">{item.description}</p>
              <p className="text-xl font-bold text-[#5c4033]">₱{item.price}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}