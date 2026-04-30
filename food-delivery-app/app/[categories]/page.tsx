"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Header from "../components/Header";
import CatBubble from "../components/CategorySidebar";
import CartSidebar from "../components/CartSidebar";
import { useCart } from "../../context/CartContext";
import { db } from "../../firebase/clientApp";
import { collection, getDocs, query, where } from "firebase/firestore";

const CATEGORIES = [
  { name: "Pasta", icon: "🍝" },
  { name: "Sandwiches", icon: "🥪" },
  { name: "Pastries", icon: "🥖" },
  { name: "Drinks", icon: "🥤" },
];

const HERO_IMAGES: Record<string, string> = {
  sandwiches: "https://media.houseandgarden.co.uk/photos/62977da831afd4e1e7dd7930/16:9/w_2560%2Cc_limit/JubileeRecipessandwiches_.jpg",
  pasta: "https://cdn.apartmenttherapy.info/image/upload/f_auto,q_auto:eco,c_fill,g_auto,w_1500,ar_3:2/k%2FPhoto%2FRecipes%2F2024-11-rigatoni-pasta%2Frigatoni-pasta-098",
  pastries: "https://static.cordonbleu.edu/Files/MediaFile/88425.jpg",
  drinks: "https://wowitsveggie.com/wp-content/uploads/2020/04/differenttypesofcofee-coffeedrinks.jpg",
};

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageURL?: string;
  category?: string;
}

export default function CategoryPage() {
  const params = useParams();
  const currentCategory = (params?.categories as string) || "";

  const { addToCart } = useCart();

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [popupItem, setPopupItem] = useState<MenuItem | null>(null);
  const [popupQty, setPopupQty] = useState(1);
  const [addedMsg, setAddedMsg] = useState(false);

  const bgImage = HERO_IMAGES[currentCategory.toLowerCase()] || "/top.webp";

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      try {
        const q = query(
          collection(db, "menu"),
          where("category", "==", currentCategory.toLowerCase())
        );
        const snap = await getDocs(q);
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() })) as MenuItem[];
        setMenuItems(items);
      } catch (err) {
        console.error("Error fetching category items:", err);
      } finally {
        setLoading(false);
      }
    }
    if (currentCategory) fetchItems();
  }, [currentCategory]);

  const openPopup = (item: MenuItem) => {
    setPopupItem(item);
    setPopupQty(1);
    setAddedMsg(false);
  };

  const handleAddFromPopup = () => {
    if (!popupItem) return;
    for (let i = 0; i < popupQty; i++) {
      addToCart({
        id: popupItem.id,
        name: popupItem.name,
        price: popupItem.price,
        imageURL: popupItem.imageURL,
        category: popupItem.category,
        description: popupItem.description,
      });
    }
    setAddedMsg(true);
    setTimeout(() => setPopupItem(null), 800);
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col relative">

      {/* Global Cart Sidebar */}
      <CartSidebar />

      {/* Item Popup — Foodpanda-style */}
      {popupItem && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPopupItem(null)} />
          <div className="relative bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl w-full sm:max-w-md z-10 overflow-hidden max-h-[90vh] flex flex-col">
            {/* Food Image — tall like Foodpanda */}
            <div className="relative h-64 w-full bg-[#EAE0D5] shrink-0">
{popupItem.imageURL ? (
                <Image src={popupItem.imageURL} alt={popupItem.name} fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-7xl">🍽️</div>
              )}
              <button
                onClick={() => setPopupItem(null)}
                className="absolute top-3 right-3 w-9 h-9 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-900 shadow-lg text-xl font-bold"
              >×</button>
            </div>

            {/* Details */}
            <div className="p-6 overflow-y-auto flex-1">
              <h2 className="text-2xl font-bold text-[#3a2010] mb-1">{popupItem.name}</h2>
              <p className="text-xl font-bold text-[#5c4033] mb-4">₱{popupItem.price}</p>
              <p className="text-sm text-gray-500 leading-relaxed mb-6">
                {popupItem.description || "A delicious item from our kitchen, freshly prepared just for you."}
              </p>
            </div>

            {/* Sticky bottom: qty + add to cart */}
            <div className="px-6 pb-6 pt-3 border-t border-[#EAE0D5] bg-white shrink-0">
              <div className="flex items-center gap-4">
                {/* Quantity */}
                <div className="flex items-center gap-3 bg-[#F8F5F1] rounded-2xl px-4 py-3 border border-[#EAE0D5]">
                  <button
                    onClick={() => setPopupQty((q) => Math.max(1, q - 1))}
                    className="w-7 h-7 rounded-full bg-[#EAE0D5] text-[#5c4033] font-bold hover:bg-[#d4c5b2] transition flex items-center justify-center text-lg"
                  >−</button>
                  <span className="font-bold text-[#5c4033] w-6 text-center text-lg">{popupQty}</span>
                  <button
                    onClick={() => setPopupQty((q) => q + 1)}
                    className="w-7 h-7 rounded-full bg-[#5c4033] text-white font-bold hover:bg-[#3e2c22] transition flex items-center justify-center text-lg"
                  >+</button>
                </div>

                {/* Add to Cart button */}
                <button
                  onClick={handleAddFromPopup}
                  className={`flex-1 py-3 rounded-2xl font-bold text-base transition ${
                    addedMsg
                      ? "bg-green-500 text-white"
                      : "bg-[#5c4033] hover:bg-[#3e2c22] text-white"
                  }`}
                >
                  {addedMsg ? "✓ Added!" : `Add to Cart · ₱${(popupItem.price * popupQty).toFixed(0)}`}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[50vh] w-full bg-[#3a3028] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-50 mix-blend-overlay transition-all duration-700"
          style={{ backgroundImage: `url('${bgImage}')` }}
        />
        <Header onToggleSidebar={() => {}} />

        <div className="relative z-10 text-center mt-10">
          <h1 className="text-5xl font-extrabold text-white drop-shadow-lg capitalize tracking-tight">
            {currentCategory.toUpperCase()}
          </h1>
          <p className="text-[#DCD1C4] mt-2 font-medium tracking-wide">
            Explore our best {currentCategory} selection
          </p>
          <div className="mt-8">
            <CatBubble currentCategory={currentCategory} categories={CATEGORIES} />
          </div>
        </div>
      </section>

      {/* Items Grid */}
      <main className="flex-1 p-8 md:p-12">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="w-10 h-10 border-4 border-[#DCD1C4] border-t-[#6A4423] rounded-full animate-spin" />
          </div>
        ) : menuItems.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🍽️</p>
            <p className="text-[#8A6B52] font-medium text-lg">No items found for "{currentCategory}"</p>
            <p className="text-sm text-gray-400 mt-1">Check back soon — more items are coming!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menuItems.map((item) => (
              <div
                key={item.id}
                onClick={() => openPopup(item)}
                className="bg-white rounded-3xl overflow-hidden border border-[#EAE0D5] shadow-sm hover:shadow-lg transition-shadow cursor-pointer group"
              >
<div className="relative h-52 bg-[#EAE0D5] overflow-hidden">
                  {item.imageURL ? (
                    <Image
                      src={item.imageURL}
                      alt={item.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-5xl">🍽️</div>
                  )}
                </div>
                <div className="p-5">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-lg text-[#3a2010]">{item.name}</h3>
                    <span className="font-bold text-[#5c4033] shrink-0 ml-2">₱{item.price}</span>
                  </div>
                  <p className="text-sm text-gray-400 line-clamp-2">{item.description}</p>
                  <div className="mt-4 flex items-center gap-2 text-[#8A6B52] text-sm font-medium group-hover:text-[#5c4033] transition-colors">
                    <span>Tap to order</span>
                    <span>→</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}