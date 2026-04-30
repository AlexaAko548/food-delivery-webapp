const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccount.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();
const Timestamp = admin.firestore.Timestamp;

// ─────────────────────────────────────────────
// 🔑 REAL FIREBASE AUTH UIDs
// ─────────────────────────────────────────────
const USERS = {
  karl: {
    uid: "1xhb7WvlZoaaHuLJyxESc50kILo2",
    email: "karl@email.com",
    username: "karlmedina",
  },
  juan: {
    uid: "Rjr9m7vm67fpVZDTeOe5kNynPdU2",
    email: "juan@email.com",
    username: "juandelacruz",
  },
};

// ─────────────────────────────────────────────
// 🍽️ MENU ITEMS — 5 per category
// Categories: "pasta" | "sandwiches" | "pastries" | "drinks"
// ─────────────────────────────────────────────
const menuItems = [

  // ── PASTA (5 items) ────────────────────────
  {
    id: "menuitem-001",
    category: "pasta",
    name: "Spaghetti Bolognese",
    description: "Classic Italian pasta with slow-simmered beef and tomato ragù, topped with Parmesan.",
    imageURL: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg?w=500",
    price: 249,
    limited: false,
  },
  {
    id: "menuitem-002",
    category: "pasta",
    name: "Creamy Carbonara",
    description: "Silky egg and pancetta sauce tossed with al dente spaghetti and cracked black pepper.",
    imageURL: "https://images.pexels.com/photos/5175537/pexels-photo-5175537.jpeg?w=500",
    price: 269,
    limited: true,
  },
  {
    id: "menuitem-003",
    category: "pasta",
    name: "Pesto Fusilli",
    description: "Spiral pasta tossed in homemade basil pesto with pine nuts and cherry tomatoes.",
    imageURL: "https://images.pexels.com/photos/1437267/pexels-photo-1437267.jpeg?w=500",
    price: 229,
    limited: false,
  },
  {
    id: "menuitem-013",
    category: "pasta",
    name: "Arrabbiata Penne",
    description: "Penne pasta in a fiery tomato and garlic sauce with fresh chili flakes and basil.",
    imageURL: "https://images.pexels.com/photos/3763847/pexels-photo-3763847.jpeg?w=500",
    price: 219,
    limited: false,
  },
  {
    id: "menuitem-014",
    category: "pasta",
    name: "Truffle Mushroom Linguine",
    description: "Linguine tossed in a rich truffle oil and wild mushroom sauce, finished with Pecorino.",
    imageURL: "https://images.pexels.com/photos/1527603/pexels-photo-1527603.jpeg?w=500",
    price: 299,
    limited: true,
  },

  // ── SANDWICHES (5 items) ───────────────────
  {
    id: "menuitem-004",
    category: "sandwiches",
    name: "Grilled Chicken Avocado Sandwich",
    description: "Grilled chicken breast with avocado, roasted peppers, and garlic aioli on toasted sourdough.",
    imageURL: "https://images.pexels.com/photos/1647163/pexels-photo-1647163.jpeg?w=500",
    price: 199,
    limited: false,
  },
  {
    id: "menuitem-005",
    category: "sandwiches",
    name: "Classic BLT",
    description: "Crispy bacon, fresh lettuce, and ripe tomato on toasted white bread with mayo.",
    imageURL: "https://images.pexels.com/photos/2983101/pexels-photo-2983101.jpeg?w=500",
    price: 169,
    limited: false,
  },
  {
    id: "menuitem-006",
    category: "sandwiches",
    name: "Tuna Melt",
    description: "Creamy tuna salad topped with melted cheddar on buttered sourdough, pressed to perfection.",
    imageURL: "https://images.pexels.com/photos/1600711/pexels-photo-1600711.jpeg?w=500",
    price: 179,
    limited: true,
  },
  {
    id: "menuitem-015",
    category: "sandwiches",
    name: "Pulled Pork Ciabatta",
    description: "Slow-cooked BBQ pulled pork piled high on a ciabatta roll with coleslaw and pickles.",
    imageURL: "https://images.pexels.com/photos/1639565/pexels-photo-1639565.jpeg?w=500",
    price: 209,
    limited: false,
  },
  {
    id: "menuitem-016",
    category: "sandwiches",
    name: "Caprese Panini",
    description: "Fresh mozzarella, heirloom tomatoes, and basil on pressed ciabatta with balsamic glaze.",
    imageURL: "https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?w=500",
    price: 189,
    limited: false,
  },

  // ── PASTRIES (5 items) ─────────────────────
  {
    id: "menuitem-007",
    category: "pastries",
    name: "Butter Croissant",
    description: "Flaky, golden croissant made with 100% pure butter. Best enjoyed warm.",
    imageURL: "https://images.pexels.com/photos/3892469/pexels-photo-3892469.jpeg?w=500",
    price: 89,
    limited: false,
  },
  {
    id: "menuitem-008",
    category: "pastries",
    name: "Chocolate Éclair",
    description: "Choux pastry filled with vanilla cream and topped with rich dark chocolate glaze.",
    imageURL: "https://images.pexels.com/photos/2067396/pexels-photo-2067396.jpeg?w=500",
    price: 109,
    limited: false,
  },
  {
    id: "menuitem-009",
    category: "pastries",
    name: "Cinnamon Danish",
    description: "Soft and flaky Danish pastry swirled with cinnamon sugar and drizzled with icing.",
    imageURL: "https://images.pexels.com/photos/1510659/pexels-photo-1510659.jpeg?w=500",
    price: 99,
    limited: true,
  },
  {
    id: "menuitem-017",
    category: "pastries",
    name: "Almond Bear Claw",
    description: "Buttery pastry filled with sweet almond frangipane and topped with sliced almonds.",
    imageURL: "https://images.pexels.com/photos/205961/pexels-photo-205961.jpeg?w=500",
    price: 115,
    limited: false,
  },
  {
    id: "menuitem-018",
    category: "pastries",
    name: "Strawberry Tart",
    description: "Crisp pastry shell filled with silky vanilla custard and topped with fresh strawberries.",
    imageURL: "https://images.pexels.com/photos/1126359/pexels-photo-1126359.jpeg?w=500",
    price: 129,
    limited: true,
  },

  // ── DRINKS (5 items) ───────────────────────
  {
    id: "menuitem-010",
    category: "drinks",
    name: "Fresh Mint Lemonade",
    description: "Freshly squeezed lemonade with a hint of mint, served over ice.",
    imageURL: "https://images.pexels.com/photos/2109099/pexels-photo-2109099.jpeg?w=500",
    price: 79,
    limited: false,
  },
  {
    id: "menuitem-011",
    category: "drinks",
    name: "Iced Caramel Latte",
    description: "Espresso shots poured over milk and ice, finished with housemade caramel syrup.",
    imageURL: "https://images.pexels.com/photos/3551717/pexels-photo-3551717.jpeg?w=500",
    price: 129,
    limited: false,
  },
  {
    id: "menuitem-012",
    category: "drinks",
    name: "Mango Fruit Shake",
    description: "Blended ripe Philippine mangoes with milk and a touch of honey. Seasonal special.",
    imageURL: "https://images.pexels.com/photos/1099680/pexels-photo-1099680.jpeg?w=500",
    price: 99,
    limited: true,
  },
  {
    id: "menuitem-019",
    category: "drinks",
    name: "Matcha Oat Milk Latte",
    description: "Premium ceremonial-grade matcha whisked with steamed oat milk. Hot or iced.",
    imageURL: "https://images.pexels.com/photos/4109743/pexels-photo-4109743.jpeg?w=500",
    price: 139,
    limited: false,
  },
  {
    id: "menuitem-020",
    category: "drinks",
    name: "Strawberry Basil Soda",
    description: "House-made strawberry syrup with fresh basil and sparkling water. Refreshing and light.",
    imageURL: "https://images.pexels.com/photos/1437318/pexels-photo-1437318.jpeg?w=500",
    price: 89,
    limited: true,
  },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function computeTotals(items) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const serviceFee = subtotal * 0.10;
  const grandTotal = subtotal + serviceFee;
  return { subtotal, serviceFee, grandTotal };
}

function buildItem(menuItem, quantity) {
  return {
    id:          menuItem.id,
    name:        menuItem.name,
    description: menuItem.description,
    imageURL:    menuItem.imageURL,
    category:    menuItem.category,
    price:       menuItem.price,
    quantity,
  };
}

// ─────────────────────────────────────────────
// 📦 ORDERS — spread across all categories
// so Most Ordered has meaningful global tallies
// ─────────────────────────────────────────────
function buildOrders() {
  const menu = Object.fromEntries(menuItems.map((m) => [m.id, m]));

  const rawOrders = [
    // ── Karl's orders ───────────────────────
    {
      id: "order-001",
      user: USERS.karl,
      items: [
        buildItem(menu["menuitem-004"], 1), // Grilled Chicken Avocado Sandwich
        buildItem(menu["menuitem-010"], 2), // Fresh Mint Lemonade x2
      ],
      paymentMethod: "gcash",
      deliveryAddress: { street: "Pendatum Avenue", city: "General Santos City", zip: "9500" },
      status: "pending",
    },
    {
      id: "order-002",
      user: USERS.karl,
      items: [
        buildItem(menu["menuitem-001"], 2), // Spaghetti Bolognese x2
        buildItem(menu["menuitem-011"], 1), // Iced Caramel Latte
        buildItem(menu["menuitem-007"], 2), // Butter Croissant x2
      ],
      paymentMethod: "cash",
      deliveryAddress: { street: "Pendatum Avenue", city: "General Santos City", zip: "9500" },
      status: "delivered",
    },
    {
      id: "order-005",
      user: USERS.karl,
      items: [
        buildItem(menu["menuitem-002"], 1), // Creamy Carbonara
        buildItem(menu["menuitem-019"], 2), // Matcha Oat Milk Latte x2
        buildItem(menu["menuitem-009"], 1), // Cinnamon Danish
      ],
      paymentMethod: "mastercard",
      deliveryAddress: { street: "Pendatum Avenue", city: "General Santos City", zip: "9500" },
      status: "delivered",
    },

    // ── Juan's orders ────────────────────────
    {
      id: "order-003",
      user: USERS.juan,
      items: [
        buildItem(menu["menuitem-001"], 3), // Spaghetti Bolognese x3
        buildItem(menu["menuitem-012"], 2), // Mango Fruit Shake x2
      ],
      paymentMethod: "gcash",
      deliveryAddress: { street: "National Highway", city: "General Santos City", zip: "9500" },
      status: "delivered",
    },
    {
      id: "order-004",
      user: USERS.juan,
      items: [
        buildItem(menu["menuitem-004"], 2), // Grilled Chicken Avocado Sandwich x2
        buildItem(menu["menuitem-007"], 3), // Butter Croissant x3
        buildItem(menu["menuitem-011"], 1), // Iced Caramel Latte
      ],
      paymentMethod: "mastercard",
      deliveryAddress: { street: "National Highway", city: "General Santos City", zip: "9500" },
      status: "pending",
    },
    {
      id: "order-006",
      user: USERS.juan,
      items: [
        buildItem(menu["menuitem-005"], 2), // Classic BLT x2
        buildItem(menu["menuitem-018"], 1), // Strawberry Tart
        buildItem(menu["menuitem-020"], 2), // Strawberry Basil Soda x2
      ],
      paymentMethod: "gcash",
      deliveryAddress: { street: "National Highway", city: "General Santos City", zip: "9500" },
      status: "delivered",
    },
  ];

  return rawOrders.map(({ id, user, items, paymentMethod, deliveryAddress, status }) => {
    const { subtotal, serviceFee, grandTotal } = computeTotals(items);
    return {
      id,
      data: {
        uid: user.uid,
        items,
        subtotal,
        serviceFee,
        grandTotal,
        paymentMethod,
        deliveryAddress,
        status,
        createdAt: Timestamp.now(),
      },
    };
  });
}

// ─────────────────────────────────────────────
// 🌱 SEED
// ─────────────────────────────────────────────
async function seed() {

  // 1. Addresses
  console.log("Seeding addresses...");
  const addresses = [
    {
      id: "address-karl",
      uid: USERS.karl.uid,
      label: "Home",
      street: "Pendatum Avenue",
      city: "General Santos City",
      barangay: "Dadiangas North",
      zip: "9500",
      latitude: 6.1433,
      longitude: 125.1929,
      isDefault: true,
      createdAt: Timestamp.now(),
    },
    {
      id: "address-juan",
      uid: USERS.juan.uid,
      label: "Home",
      street: "National Highway",
      city: "General Santos City",
      barangay: "Dadiangas East",
      zip: "9500",
      latitude: 6.1121,
      longitude: 125.1720,
      isDefault: true,
      createdAt: Timestamp.now(),
    },
  ];
  for (const { id, ...data } of addresses) {
    await db.collection("addresses").doc(id).set(data);
  }
  console.log("✅ addresses done");

  // 2. Menu items
  console.log("Seeding menu items...");
  for (const { id, ...data } of menuItems) {
    await db.collection("menu").doc(id).set(data);
  }
  console.log("✅ menu done");

  // 3. Orders
  console.log("Seeding orders...");
  const orders = buildOrders();
  for (const { id, data } of orders) {
    await db.collection("orders").doc(id).set(data);
  }
  console.log("✅ orders done");

  const limited = menuItems.filter(m => m.limited);
  console.log("\n🎉 Seeding complete! Summary:");
  console.log(`   Addresses : ${addresses.length}`);
  console.log(`   Menu      : ${menuItems.length} items (5 per category)`);
  console.log(`   Limited   : ${limited.map(m => m.name).join(", ")}`);
  console.log(`   Orders    : ${orders.length} total`);
  console.log("\nExpected homepage (logged in as Karl):");
  console.log("  Your Last Order   → Grilled Chicken Sandwich + Mint Lemonade (order-001)");
  console.log("  Limited Time Only → Creamy Carbonara, Truffle Mushroom Linguine, Tuna Melt,");
  console.log("                      Cinnamon Danish, Strawberry Tart, Mango Shake, Strawberry Basil Soda");
  console.log("  Most Ordered      → Spaghetti Bolognese (5×), Butter Croissant (5×), Grilled Chicken Sandwich (3×)");
  console.log("\nCategory pages:");
  console.log("  /pasta      → 5 items");
  console.log("  /sandwiches → 5 items");
  console.log("  /pastries   → 5 items");
  console.log("  /drinks     → 5 items");
}

seed().catch(console.error);