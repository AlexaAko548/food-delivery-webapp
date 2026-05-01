"use client";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../firebase/clientApp";
import {
  collection, getDocs, query, orderBy,
  where, limit,
} from "firebase/firestore";
import Header from "../components/Header";
import CartSidebar from "../components/CartSidebar";
import { useCart } from "../../context/CartContext";

const CATEGORIES = [
  { name: "Pasta", icon: "🍝" },
  { name: "Sandwiches", icon: "🥪" },
  { name: "Pastries", icon: "🥖" },
  { name: "Drinks", icon: "🥤" },
];

interface MenuItem {
  id: string;
  name: string;
  description: string;
  price: number;
  imageURL?: string;
  category?: string;
  limited?: boolean;
}

interface PopupItem extends MenuItem {}

export default function HomePage() {
  const router = useRouter();
  const { setCartOpen, totalItems, addToCart } = useCart();

  const [loading, setLoading] = useState(true);
  const [lastOrderItems, setLastOrderItems] = useState<MenuItem[]>([]);
  const [limitedItems, setLimitedItems] = useState<MenuItem[]>([]);
  const [mostOrderedItems, setMostOrderedItems] = useState<MenuItem[]>([]);
  const [popupItem, setPopupItem] = useState<PopupItem | null>(null);
  const [popupQty, setPopupQty] = useState(1);
  const [allMenuItems, setAllMenuItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      let allMenu: MenuItem[] = [];
      try {
        const menuSnap = await getDocs(query(collection(db, "menu"), orderBy("name")));
        allMenu = menuSnap.docs.map((d) => ({ id: d.id, ...d.data() })) as MenuItem[];
        setAllMenuItems(allMenu);
      } catch (err) {
        console.error("Error fetching menu:", err);
      }

      try {
        const ordersQ = query(
          collection(db, "orders"),
          where("uid", "==", user.uid),
          orderBy("createdAt", "desc")
          // limit(1) has been removed to fetch all past orders
        );
        const ordersSnap = await getDocs(ordersQ);
        
        if (!ordersSnap.empty) {
          // Use a Map to deduplicate items by their ID
          const uniqueItems = new Map<string, MenuItem>();
          
          ordersSnap.docs.forEach((doc) => {
            const orderData = doc.data();
            const items = orderData.items || [];
            
            items.forEach((item: MenuItem) => {
              // Only add the item if we haven't already added it from a newer order
              if (!uniqueItems.has(item.id)) {
                uniqueItems.set(item.id, item);
              }
            });
          });

          // Convert the Map values back to an array and set state
          setLastOrderItems(Array.from(uniqueItems.values()));
        }
      } catch (err: any) {
        console.error("Error fetching past orders (composite index missing?):", err?.message || err);
      }

      try {
        const limited = allMenu.filter((item) => item.limited === true);
        setLimitedItems(limited);
      } catch (err) {
        console.error("Error filtering limited items:", err);
      }

      try {
        const allOrdersSnap = await getDocs(collection(db, "orders"));
        const countMap: Record<string, number> = {};
        allOrdersSnap.docs.forEach((doc) => {
          const items = doc.data().items || [];
          items.forEach((item: MenuItem & { quantity: number }) => {
            countMap[item.id] = (countMap[item.id] || 0) + (item.quantity || 1);
          });
        });

        const sorted = [...allMenu]
          .filter((item) => countMap[item.id] > 0) 
          .sort((a, b) => (countMap[b.id] || 0) - (countMap[a.id] || 0))
          .slice(0, 3);
        setMostOrderedItems(sorted);
      } catch (err) {
        console.error("Error fetching most ordered (check Firestore rules):", err);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const openPopup = (item: MenuItem) => {
    setPopupItem(item);
    setPopupQty(1);
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
    setPopupItem(null);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      setIsSearching(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setIsSearching(false);
  };

  const getFilteredItems = () => {
    const query = searchQuery.toLowerCase().trim();
    return allMenuItems.filter(
      (item) =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category?.toLowerCase().includes(query)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F9FAFB] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-[#DCD1C4] border-t-[#6A4423] rounded-full animate-spin"></div>
          <p className="text-[#6A4423] font-bold animate-pulse">Loading your cravings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] flex flex-col">

      <CartSidebar />

      {/* Item Popup */}
      {popupItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setPopupItem(null)} />
          <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden z-10">
            <div className="relative h-56 w-full bg-[#EAE0D5]">
              {popupItem.imageURL ? (
                <Image src={popupItem.imageURL} alt={popupItem.name} fill sizes="(max-width: 768px) 100vw, 448px" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-6xl">🍽️</div>
              )}
              <button
                onClick={() => setPopupItem(null)}
                className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 shadow-md text-lg"
              >×</button>
            </div>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-[#5c4033] mb-1">{popupItem.name}</h2>
              <p className="text-xl font-bold text-[#8A6B52] mb-3">₱{popupItem.price}</p>
              <p className="text-sm text-gray-500 mb-6 leading-relaxed">{popupItem.description || "No description available."}</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-[#F8F5F1] rounded-2xl px-4 py-2">
                  <button onClick={() => setPopupQty((q) => Math.max(1, q - 1))} className="w-7 h-7 rounded-full bg-[#EAE0D5] text-[#5c4033] font-bold hover:bg-[#d4c5b2] transition flex items-center justify-center">−</button>
                  <span className="font-bold text-[#5c4033] w-5 text-center">{popupQty}</span>
                  <button onClick={() => setPopupQty((q) => q + 1)} className="w-7 h-7 rounded-full bg-[#5c4033] text-white font-bold hover:bg-[#3e2c22] transition flex items-center justify-center">+</button>
                </div>
                <button
                  onClick={handleAddFromPopup}
                  className="flex-1 py-3 bg-[#5c4033] text-white rounded-2xl font-bold hover:bg-[#3e2c22] transition"
                >
                  Add to Cart · ₱{(popupItem.price * popupQty).toFixed(0)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative h-[65vh] min-h-[500px] w-full bg-[#3a3028] flex flex-col items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-overlay" style={{ backgroundImage: "url('/top.webp')" }} />
        <Header />
        <div className="relative z-10 w-full max-w-4xl px-4 flex flex-col items-center mt-12">
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-8 text-center drop-shadow-md">
            What are you craving today?
          </h1>
          <div className="flex w-full max-w-2xl gap-3 mb-12">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-[#8A6B52]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input 
                type="text" 
                placeholder="Pasta? Bread? Something sweet?" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-12 pr-4 py-4 rounded-full bg-[#E7E2DE] text-[#5C3A21] placeholder:text-[#8A6B52] focus:outline-none focus:ring-4 focus:ring-[#6A4423]/50 transition-all font-medium" 
              />
            </div>
            <button 
              onClick={handleSearch}
              className="px-8 py-4 bg-[#997855] hover:bg-[#745b40] text-white rounded-full font-bold shadow-lg transition-colors"
            >
              Search
            </button>
          </div>
          <div className="flex flex-wrap justify-center gap-6 md:gap-10">
            {CATEGORIES.map((cat, index) => (
              <Link key={index} href={`/${cat.name.toLowerCase()}`} className="flex flex-col items-center gap-2 group cursor-pointer">
                <div className="w-16 h-16 rounded-full bg-[#DCD1C4] border-2 border-white/20 flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 group-hover:bg-white transition-all">{cat.icon}</div>
                <span className="text-white text-sm font-semibold drop-shadow-md group-hover:text-[#DCD1C4] transition-colors">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Your Last Order */}
      {!isSearching && (
      <section className="w-full bg-[#E7E2DE] rounded-b-4xl shadow-lg">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-bold text-[#6A4423]">Your Last Order</h2>
            {lastOrderItems.length > 0 && (
              <button
                onClick={() => lastOrderItems.forEach((item) => addToCart({ id: item.id, name: item.name, price: item.price, imageURL: item.imageURL, category: item.category, description: item.description }))}
                className="text-sm font-semibold text-[#8A6B52] hover:text-[#5C3A21] underline decoration-1 transition-colors"
              >
                Add all to basket
              </button>
            )}
          </div>
          {lastOrderItems.length === 0 ? (
            <p className="text-[#8A6B52] italic">No previous orders yet. Start ordering!</p>
          ) : (
            <div className="grid grid-flow-col auto-cols-[85%] md:auto-cols-[calc(33.333%-1rem)] gap-6 overflow-x-auto snap-x snap-mandatory pb-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D4C8BA] [&::-webkit-scrollbar-thumb]:rounded-full">
              {lastOrderItems.map((item, i) => (
                <div key={i} className="snap-start h-full">
                  <FoodCard item={item} onOpen={() => openPopup(item)} />
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Limited Time Only */}
      {!isSearching && (
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="text-2xl font-bold text-[#6A4423] mb-6 text-center tracking-wide uppercase">Limited Time Only</h2>
        {limitedItems.length === 0 ? (
          <p className="text-center text-[#8A6B52] italic">No limited items right now.</p>
        ) : (
          <div className="grid grid-flow-col auto-cols-[85%] md:auto-cols-[calc(33.333%-1rem)] gap-6 overflow-x-auto snap-x snap-mandatory pb-6 [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#D4C8BA] [&::-webkit-scrollbar-thumb]:rounded-full">
            {limitedItems.map((item) => (
              <div key={item.id} className="snap-start h-full">
                <FoodCard item={item} onOpen={() => openPopup(item)} badge="Limited" />
              </div>
            ))}
          </div>
        )}
      </section>
      )}

      {/* Most Ordered */}
      {!isSearching && (
      <section className="w-full bg-[#E7E2DE] rounded-t-4xl shadow-[0_-7px_6px_-1px_rgba(0,0,0,0.1)]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <h2 className="text-2xl font-bold text-[#6A4423] mb-6">Most Ordered</h2>
          {mostOrderedItems.length === 0 ? (
            <p className="text-[#8A6B52] italic">No order data yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
              {mostOrderedItems.map((item) => (
                <FoodCard key={item.id} item={item} onOpen={() => openPopup(item)} />
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Search Results */}
      {isSearching && (
      <section className="w-full bg-gradient-to-b from-[#E7E2DE] to-[#F9FAFB]">
        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-[#6A4423] mb-1">Search Results</h2>
              <p className="text-[#8A6B52]">Found {getFilteredItems().length} item{getFilteredItems().length !== 1 ? 's' : ''} for "{searchQuery}"</p>
            </div>
            <button 
              onClick={clearSearch}
              className="px-6 py-2 bg-[#997855] hover:bg-[#745b40] text-white rounded-full font-semibold transition-colors"
            >
              Clear Search
            </button>
          </div>

          {getFilteredItems().length === 0 ? (
            <div className="text-center py-12">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-xl font-medium text-[#5C3A21] mb-2">No items found</p>
              <p className="text-[#8A6B52]">Try searching with different keywords</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getFilteredItems().map((item) => (
                <FoodCard key={item.id} item={item} onOpen={() => openPopup(item)} />
              ))}
            </div>
          )}
        </div>
      </section>
      )}

      {/* Footer */}
      <footer className="w-full bg-[#3a3028] text-[#DCD1C4] py-10 mt-auto">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-2xl font-bold text-white">UsCafe</span>
            <p className="text-sm opacity-80">
              &copy; {new Date().getFullYear()} UsCafe Inc. All rights reserved.
            </p>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Contact Us</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FoodCard({ item, onOpen, badge }: { item: MenuItem; onOpen: () => void; badge?: string }) {
  return (
    <div onClick={onOpen} className="h-full bg-white rounded-2xl overflow-hidden shadow-sm border border-[#D4C8BA] flex flex-col hover:shadow-md transition-shadow cursor-pointer relative">
      {badge && (
        <span className="absolute top-3 left-3 z-10 bg-[#997855] text-white text-xs font-bold px-2 py-1 rounded-full">{badge}</span>
      )}
      <div className="h-48 bg-[#EAE0D5] shrink-0 relative overflow-hidden">
        {item.imageURL ? (
          <Image src={item.imageURL} alt={item.name} fill sizes="(max-width: 768px) 85vw, (max-width: 1200px) 33vw, 320px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#997855]/50 font-medium">image</div>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-[#5C3A21]">{item.name}</h3>
          <span className="font-bold text-[#8A6B52] shrink-0 ml-2">₱{item.price}</span>
        </div>
        <p className="text-xs text-[#8A6B52] line-clamp-2 mt-auto">{item.description}</p>
      </div>
    </div>
  );
}