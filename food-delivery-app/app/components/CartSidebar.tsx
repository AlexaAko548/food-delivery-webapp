"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useCart } from "../../context/CartContext";
import { auth, db } from "../../firebase/clientApp";
import {
  collection, addDoc, serverTimestamp,
  query, where, getDocs,
} from "firebase/firestore";

interface Address {
  street: string;
  city: string;
  zip: string;
  latitude?: number;
  longitude?: number;
}

type PaymentMethod = "mastercard" | "gcash" | "cash" | null;
type OrderStatus = "idle" | "loading" | "success" | "failed" | "network_error";

const SERVICE_FEE_RATE = 0.10;

export default function CartSidebar() {
  const { cartItems, addToCart, removeFromCart, clearCart, totalAmount, cartOpen, setCartOpen } = useCart();

  const [userAddress, setUserAddress] = useState<Address | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [mapLat, setMapLat] = useState(10.3157);
  const [mapLng, setMapLng] = useState(123.8854);
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>(null);
  const [orderStatus, setOrderStatus] = useState<OrderStatus>("idle");
  const [geocodingError, setGeocodingError] = useState("");
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const searchDebounceRef = useRef<NodeJS.Timeout | null>(null);

  const serviceFee = totalAmount * SERVICE_FEE_RATE;
  const grandTotal = totalAmount + serviceFee;
  const hasSetup = userAddress !== null && selectedPayment !== null;

  // Reverse geocode coordinates to address using Nominatim
  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const data = await res.json();
      const addressData = data.address || {};
      return {
        street: `${addressData.house_number || ""} ${addressData.road || ""}`.trim() || "Unknown Street",
        city: addressData.city || addressData.town || addressData.village || "Unknown City",
        zip: addressData.postcode || "00000",
        latitude: lat,
        longitude: lng,
      };
    } catch (err) {
      console.error("Geocoding error:", err);
      return {
        street: `Latitude: ${lat.toFixed(4)}`,
        city: `Longitude: ${lng.toFixed(4)}`,
        zip: "00000",
        latitude: lat,
        longitude: lng,
      };
    }
  };

  // Handle address input change with debounced search
  const handleAddressInputChange = (value: string) => {
    setAddressInput(value);
    setGeocodingError("");
    
    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!value.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    setAddressLoading(true);
    searchDebounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(value)}&limit=5`
        );
        const data = await res.json();
        setSearchResults(data);
        setShowSearchResults(data.length > 0);
      } catch (err) {
        console.error("Search error:", err);
        setSearchResults([]);
        setShowSearchResults(false);
      } finally {
        setAddressLoading(false);
      }
    }, 500);
  };

  // Handle selecting an address from search results
  const handleSelectSearchResult = async (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    
    setMapLat(lat);
    setMapLng(lng);
    
    const addr = await reverseGeocode(lat, lng);
    setUserAddress(addr);
    setAddressInput("");
    setSearchResults([]);
    setShowSearchResults(false);
  };

  // Handle address input and geocode to map location
  const handleAddressSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput.trim() || searchResults.length === 0) return;
    
    await handleSelectSearchResult(searchResults[0]);
  };

  useEffect(() => {
    if (!cartOpen) return;
    const user = auth.currentUser;
    if (!user) return;
    setAddressLoading(true);
    getDocs(query(collection(db, "addresses"), where("uid", "==", user.uid)))
      .then((snap) => {
        if (!snap.empty) {
          const d = snap.docs[0].data();
          setUserAddress({ street: d.street, city: d.city, zip: d.zip });
        }
      })
      .finally(() => setAddressLoading(false));
  }, [cartOpen]);

  useEffect(() => {
    if (!showCheckout) {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      return;
    }
    const timer = setTimeout(() => {
      if (mapRef.current && !mapInstanceRef.current) {
        import("leaflet").then((L) => {
          delete (L.Icon.Default.prototype as any)._getIconUrl;
          L.Icon.Default.mergeOptions({
            iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
            iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
            shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
          });
          
          const map = L.map(mapRef.current!).setView([mapLat, mapLng], 14);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap contributors",
          }).addTo(map);
          
          const marker = L.marker([mapLat, mapLng], { draggable: true }).addTo(map);
          marker.bindPopup("Your delivery location").openPopup();
          markerRef.current = marker;
          
          // Handle marker drag to update location
          marker.on("dragend", async () => {
            const newLat = marker.getLatLng().lat;
            const newLng = marker.getLatLng().lng;
            setMapLat(newLat);
            setMapLng(newLng);
            const addr = await reverseGeocode(newLat, newLng);
            setUserAddress(addr);
            marker.setPopupContent(`${addr.street}, ${addr.city}`);
          });
          
          // Handle map click to place marker
          map.on("click", async (e: any) => {
            const newLat = e.latlng.lat;
            const newLng = e.latlng.lng;
            
            marker.setLatLng([newLat, newLng]);
            setMapLat(newLat);
            setMapLng(newLng);
            
            const addr = await reverseGeocode(newLat, newLng);
            setUserAddress(addr);
            marker.setPopupContent(`${addr.street}, ${addr.city}`);
            marker.openPopup();
          });
          
          mapInstanceRef.current = map;
        });
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [showCheckout, mapLat, mapLng]);

  // Update map when lat/lng changes
  useEffect(() => {
    if (!mapInstanceRef.current || !markerRef.current || !showCheckout) return;
    
    // Pan and zoom to new location
    mapInstanceRef.current.setView([mapLat, mapLng], 14);
    // Update marker position
    markerRef.current.setLatLng([mapLat, mapLng]);
  }, [mapLat, mapLng, showCheckout]);

  // Close search results when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Close if clicking outside the search input area
      if (!target.closest('input') && !target.closest('[role="button"]')) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [showSearchResults]);

  const handleConfirmOrder = async () => {
    const user = auth.currentUser;
    if (!user) return;
    setOrderStatus("loading");
    try {
      await addDoc(collection(db, "orders"), {
        uid: user.uid,
        items: cartItems,
        subtotal: totalAmount,
        serviceFee,
        grandTotal,
        paymentMethod: selectedPayment,
        deliveryAddress: userAddress,
        status: "pending",
        createdAt: serverTimestamp(),
      });
      setOrderStatus("success");
      clearCart();
      setSelectedPayment(null);
      setUserAddress(null);
      setAddressInput("");
      setSearchResults([]);
      setShowSearchResults(false);
    } catch (err: any) {
      if (err?.code === "unavailable" || err?.message?.includes("network")) {
        setOrderStatus("network_error");
      } else {
        setOrderStatus("failed");
      }
    }
  };

  if (!cartOpen) return null;

  return (
    <>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />

      <div className="fixed inset-0 z-50 flex">
        {/* Backdrop */}
        <div
          className="flex-1 bg-black/40 backdrop-blur-sm"
          onClick={() => { setCartOpen(false); setShowCheckout(false); setOrderStatus("idle"); }}
        />

        {/* Drawer */}
        <div className="w-full max-w-xl bg-[#F5EFE9] h-full shadow-2xl flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDD0C4]">
            <div className="flex items-center gap-3">
              {showCheckout ? (
                <button
                  onClick={() => { setShowCheckout(false); setOrderStatus("idle"); }}
                  className="text-[#5c4033] hover:text-[#3e2c22] font-semibold cursor-pointer flex items-center gap-1 text-sm"
                >← Back</button>
              ) : (
                <h2 className="text-lg font-bold text-[#5c4033]">Cart</h2>
              )}
            </div>
            <button
              onClick={() => { setCartOpen(false); setShowCheckout(false); setOrderStatus("idle"); }}
              className="text-gray-400 hover:text-gray-600 text-2xl leading-none cursor-pointer"
            >&times;</button>
          </div>

          {/* ── CART VIEW ── */}
          {!showCheckout && (
            <>
              <div className="px-6 pt-4 pb-1">
                <button
                  onClick={() => setCartOpen(false)}
                  className="text-[#5c4033] font-semibold text-sm flex items-center gap-1 hover:underline cursor-pointer"
                >← Add more to cart</button>
              </div>

              {cartItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center px-6">
                  <span className="text-5xl">🛒</span>
                  <p className="text-gray-400 font-medium">Your cart is empty.</p>
                  <p className="text-sm text-gray-300">Add some delicious items!</p>
                </div>
              ) : (
                <div className="flex-1 overflow-y-auto px-6">
                  {/* Table header */}
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 py-3 border-b border-[#C9B9A8] text-xs font-bold text-[#8A6B52] uppercase tracking-wide">
                    <span>Product</span>
                    <span className="text-center">Quantity</span>
                    <span className="text-center">Total Price</span>
                    <button
                      onClick={clearCart}
                      className="text-[#997855] hover:text-red-500 transition cursor-pointer font-bold"
                    >Clear all</button>
                  </div>

                  {/* Rows */}
                  <ul className="divide-y divide-[#DDD0C4]">
                    {cartItems.map((c) => (
                      <li key={c.id} className="grid grid-cols-[1fr_auto_auto_auto] gap-x-10 items-center py-4">
                        {/* Product */}
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#DDD0C4] shrink-0">
                            {c.imageURL
                              ? <Image src={c.imageURL} alt={c.name} width={48} height={48} className="w-full h-full object-cover" />
                              : <div className="w-full h-full flex items-center justify-center text-lg">🍽️</div>
                            }
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-[#3a2010] text-sm truncate">{c.name}</p>
                            {c.description && <p className="text-xs text-[#8A6B52] truncate">{c.description}</p>}
                          </div>
                        </div>

                        {/* Qty */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => removeFromCart(c.id)}
                            className="w-6 h-6 rounded-full bg-[#C9B9A8] text-[#5c4033] font-bold hover:bg-[#b5a090] transition flex items-center justify-center text-sm cursor-pointer"
                          >−</button>
                          <span className="w-5 text-center font-bold text-[#3a2010] text-sm">{c.quantity}</span>
                          <button
                            onClick={() => addToCart({ id: c.id, name: c.name, price: c.price, imageURL: c.imageURL, category: c.category, description: c.description })}
                            className="w-6 h-6 rounded-full bg-[#C9B9A8] text-[#5c4033] font-bold hover:bg-[#b5a090] transition flex items-center justify-center text-sm cursor-pointer"
                          >+</button>
                        </div>

                        {/* Price */}
                        <span className="font-bold text-[#3a2010] text-sm text-center">
                          ₱{(c.price * c.quantity).toFixed(2)}
                        </span>

                        {/* Remove row */}
                        <button
                          onClick={() => { for (let i = 0; i < c.quantity; i++) removeFromCart(c.id); }}
                          className="text-[#C9B9A8] hover:text-red-400 transition font-bold text-base cursor-pointer"
                        >×</button>
                      </li>
                    ))}
                  </ul>

                  {/* Fee breakdown */}
                  <div className="mt-2 pt-4 border-t border-[#C9B9A8] space-y-2 pb-4">
                    <div className="flex justify-between text-sm text-[#5c4033]">
                      <span>Subtotal</span>
                      <span className="font-semibold">₱{totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-[#5c4033]">
                      <span>Service Fee (10%)</span>
                      <span className="font-semibold">₱{serviceFee.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Cart footer */}
              {cartItems.length > 0 && (
                <div className="px-6 py-5 border-t border-[#C9B9A8] bg-[#EDE4D9] shrink-0">
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-bold text-[#3a2010]">Total:</span>
                    <span className="font-bold text-[#3a2010] text-xl">₱{grandTotal.toFixed(2)}</span>
                  </div>
                  <button
                    onClick={() => { setShowCheckout(true); setOrderStatus("idle"); }}
                    className="w-full py-3 bg-[#7a5c40] hover:bg-[#5c4033] text-white rounded-full font-bold text-base transition cursor-pointer"
                  >
                    {hasSetup ? "Confirm Order" : "Review Payment and Address"}
                  </button>
                  {addressLoading && (
                    <p className="text-center text-xs text-[#8A6B52] mt-2">Checking your address...</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* ── CHECKOUT VIEW ── */}
          {showCheckout && (
            <div className="flex-1 flex flex-col relative overflow-hidden">

              {/* Success modal */}
              {orderStatus === "success" && (
                <div className="absolute inset-0 bg-[#F5EFE9]/80 backdrop-blur-sm z-9999 flex items-center justify-center p-6">
                  <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-xs w-full">
                    <div className="text-5xl mb-3">✅</div>
                    <h3 className="text-xl font-bold text-[#3a2010] mb-2">Payment Successful</h3>
                    <p className="text-sm text-gray-500 mb-6">Thank you for ordering<br />Your food is now being prepared :)</p>
                    <button
                      onClick={() => { 
                        setCartOpen(false); 
                        setShowCheckout(false); 
                        setOrderStatus("idle");
                        setSelectedPayment(null);
                        setUserAddress(null);
                        setAddressInput("");
                        setSearchResults([]);
                        setShowSearchResults(false);
                      }}
                      className="w-full py-2 bg-[#7a5c40] hover:bg-[#5c4033] text-white rounded-full font-bold transition cursor-pointer"
                    >Return to Home</button>
                  </div>
                </div>
              )}

              {/* Failed modal */}
              {orderStatus === "failed" && (
                <div className="absolute inset-0 bg-[#F5EFE9]/80 backdrop-blur-sm z-10 flex items-center justify-center p-6">
                  <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-xs w-full">
                    <div className="text-5xl mb-3">❌</div>
                    <h3 className="text-xl font-bold text-[#3a2010] mb-2">Payment Failed</h3>
                    <p className="text-sm text-gray-500 mb-6">Your payment didn't go through :(<br />No charges were made. Try again?</p>
                    <button
                      onClick={() => setOrderStatus("idle")}
                      className="w-full py-2 bg-[#7a5c40] hover:bg-[#5c4033] text-white rounded-full font-bold transition cursor-pointer"
                    >Close</button>
                  </div>
                </div>
              )}

              {/* Network error modal */}
              {orderStatus === "network_error" && (
                <div className="absolute inset-0 bg-[#F5EFE9]/80 backdrop-blur-sm z-10 flex items-center justify-center p-6">
                  <div className="bg-white rounded-2xl shadow-xl p-8 text-center max-w-xs w-full">
                    <div className="text-5xl mb-3">🌐</div>
                    <h3 className="text-xl font-bold text-[#3a2010] mb-2">Network Error</h3>
                    <p className="text-sm text-gray-500 mb-6">We couldn't connect<br />Please try again in a moment :X</p>
                    <button
                      onClick={() => setOrderStatus("idle")}
                      className="w-full py-2 bg-[#7a5c40] hover:bg-[#5c4033] text-white rounded-full font-bold transition cursor-pointer"
                    >Close</button>
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-y-auto flex flex-col">
                <div className="px-6 py-5 flex-1 flex flex-col gap-6">

                {/* Delivery Address */}
                <div>
                  <h3 className="font-bold text-[#3a2010] text-base mb-3">Where should we deliver?</h3>
                  
                  {/* Address Input */}
                  <form onSubmit={handleAddressSearch} className="mb-4 relative">
                    <div className="flex gap-2">
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Search for your address..."
                          value={addressInput}
                          onChange={(e) => handleAddressInputChange(e.target.value)}
                          onFocus={() => addressInput.trim() && setShowSearchResults(true)}
                          className="w-full px-3 py-2 rounded-lg border border-[#C9B9A8] bg-white text-[#5c4033] placeholder:text-[#8A6B52] focus:outline-none focus:ring-2 focus:ring-[#7a5c40]"
                        />
                        
                        {/* Search Results Dropdown */}
                        {showSearchResults && searchResults.length > 0 && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#C9B9A8] rounded-lg shadow-lg z-50 max-h-64 overflow-y-auto">
                            {searchResults.map((result, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onClick={() => handleSelectSearchResult(result)}
                                className="w-full text-left px-4 py-2 hover:bg-[#F0E8E0] transition border-b border-[#EAE3D9] last:border-b-0"
                              >
                                <p className="font-semibold text-sm text-[#3a2010]">{result.name || result.display_name?.split(',')[0]}</p>
                                <p className="text-xs text-[#8A6B52] truncate">{result.display_name?.split(',').slice(1).join(',')}</p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSelectSearchResult(searchResults[0])}
                        disabled={addressLoading || searchResults.length === 0}
                        className="px-4 py-2 bg-[#7a5c40] hover:bg-[#5c4033] text-white rounded-lg font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {addressLoading ? "..." : "Go"}
                      </button>
                    </div>
                    {geocodingError && (
                      <p className="text-red-500 text-xs mt-2">{geocodingError}</p>
                    )}
                  </form>

                  {/* Current Address */}
                  {userAddress ? (
                    <div className="p-3 rounded-lg bg-[#E8E0D5] border border-[#C9B9A8] mb-3">
                      <p className="text-sm font-semibold text-[#5c4033] mb-1">Selected Location:</p>
                      <p className="text-sm text-[#5c4033]">
                        {userAddress.street}, {userAddress.city} {userAddress.zip}
                      </p>
                      {userAddress.latitude && userAddress.longitude && (
                        <p className="text-xs text-[#8A6B52] mt-1">
                          Coordinates: {userAddress.latitude.toFixed(4)}, {userAddress.longitude.toFixed(4)}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-red-500 mb-3 font-medium">No location selected. Click on the map or search for your address.</p>
                  )}

                  {/* Leaflet Map */}
                  <div
                    ref={mapRef}
                    className="w-full rounded-2xl overflow-hidden border border-[#C9B9A8] cursor-pointer z-0 relative"
                    style={{ height: "250px" }}
                    title="Click on the map to select your location"
                  />
                  <p className="mt-2 text-xs text-[#8A6B52]">💡 Click on the map to select location or drag the marker</p>
                </div>

                {/* Payment Method */}
                <div>
                  <h3 className="font-bold text-[#3a2010] text-base mb-3">Payment Method</h3>
                  <div className="flex flex-col gap-2">

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[#C9B9A8] bg-white cursor-pointer hover:border-[#7a5c40] transition">
                      <input type="radio" name="payment" value="mastercard" checked={selectedPayment === "mastercard"} onChange={() => setSelectedPayment("mastercard")} className="accent-[#7a5c40] cursor-pointer" />
                      <span className="text-lg">💳</span>
                      <div>
                        <p className="font-semibold text-[#3a2010] text-sm">Mastercard</p>
                        <p className="text-xs text-[#8A6B52]">37•••••••••465</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[#C9B9A8] bg-white cursor-pointer hover:border-[#7a5c40] transition">
                      <input type="radio" name="payment" value="gcash" checked={selectedPayment === "gcash"} onChange={() => setSelectedPayment("gcash")} className="accent-[#7a5c40] cursor-pointer" />
                      <span className="text-lg">📱</span>
                      <div>
                        <p className="font-semibold text-[#3a2010] text-sm">GCash</p>
                        <p className="text-xs text-[#8A6B52]">Link your GCash number</p>
                      </div>
                    </label>

                    <label className="flex items-center gap-3 p-3 rounded-xl border border-[#C9B9A8] bg-white cursor-pointer hover:border-[#7a5c40] transition">
                      <input type="radio" name="payment" value="cash" checked={selectedPayment === "cash"} onChange={() => setSelectedPayment("cash")} className="accent-[#7a5c40] cursor-pointer" />
                      <span className="text-lg">💵</span>
                      <div>
                        <p className="font-semibold text-[#3a2010] text-sm">Cash on Delivery</p>
                        <p className="text-xs text-[#8A6B52]">Pay when your order arrives</p>
                      </div>
                    </label>

                    <button className="flex items-center gap-3 p-3 rounded-xl border border-dashed border-[#C9B9A8] bg-transparent hover:border-[#7a5c40] transition cursor-pointer w-full text-left">
                      <span className="w-5 h-5 rounded-full border-2 border-[#7a5c40] flex items-center justify-center text-[#7a5c40] text-sm font-bold shrink-0">+</span>
                      <p className="text-sm text-[#5c4033] font-medium">Add a different payment method</p>
                    </button>
                  </div>
                </div>
              </div>

              {/* Checkout footer */}
              <div className="px-6 py-5 border-t border-[#C9B9A8] bg-[#EDE4D9] shrink-0">
                <div className="flex justify-between items-center mb-4">
                  <span className="font-bold text-[#3a2010]">Total:</span>
                  <span className="font-bold text-[#3a2010] text-xl">₱{grandTotal.toFixed(2)}</span>
                </div>
                <button
                  onClick={handleConfirmOrder}
                  disabled={!selectedPayment || orderStatus === "loading"}
                  className="w-full py-3 bg-[#7a5c40] hover:bg-[#5c4033] text-white rounded-full font-bold text-base transition disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  {orderStatus === "loading" ? "Placing Order..." : "Check out"}
                </button>
                {!selectedPayment && (
                  <p className="text-center text-xs text-[#8A6B52] mt-2">Please select a payment method to continue</p>
                )}
              </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}