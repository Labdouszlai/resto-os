import "dotenv/config";
import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { v4 as uuid } from "uuid";
import { hashPassword } from "better-auth/crypto";
import { subDays, subHours, subMinutes, format } from "date-fns";
import * as schema from "../lib/db/schema";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set in environment variables");
  process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client, { schema });

// ─── Fixed UUIDs ─────────────────────────────────────────────────────────────
const RESTAURANT_ID = "a1b2c3d4-e5f6-7890-abcd-ef1234567890";
const USER_ID = "b2c3d4e5-f6a7-8901-bcde-f12345678901";
const BRANCH_1 = "c3d4e5f6-a7b8-9012-cdef-123456789012";
const BRANCH_2 = "d4e5f6a7-b8c9-0123-defa-234567890123";
const BRANCH_3 = "e5f6a7b8-c9d0-1234-efab-345678901234";

function log(msg: string) {
  console.log(`> ${msg}`);
}

function daysAgo(n: number): Date {
  return subDays(new Date(), n);
}

function hoursAgo(n: number): Date {
  return subHours(new Date(), n);
}

function minsAgo(n: number): Date {
  return subMinutes(new Date(), n);
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomItems<T>(arr: T[], count: number): T[] {
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function money(n: number): string {
  return n.toFixed(2);
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEED DATA
// ═══════════════════════════════════════════════════════════════════════════════

async function seed() {
  console.log("\n🌱 Seeding database...\n");

  // ─── 1. Restaurant ──────────────────────────────────────────────────────────
  log("Creating restaurant...");
  await db.insert(schema.restaurants).values({
    id: RESTAURANT_ID,
    name: "La Bella Cucina",
    slug: "la-bella-cucina",
    phone: "+1-555-0100",
    email: "info@labellacucina.com",
    address: "123 Main Street",
    city: "New York",
    country: "US",
    currency: "USD",
    taxRate: "0.08",
    timezone: "America/New_York",
  });

  // ─── 2. User ────────────────────────────────────────────────────────────────
  log("Creating user...");
  const hashedPassword = await hashPassword("demo1234");
  await db.insert(schema.users).values({
    id: USER_ID,
    name: "Marco Rossi",
    email: "demo@restoos.com",
    emailVerified: true,
    image: null,
  });

  // ─── 3. Account (auth credentials) ──────────────────────────────────────────
  log("Creating auth account...");
  await db.insert(schema.accounts).values({
    id: uuid(),
    accountId: "demo@restoos.com",
    providerId: "credential",
    userId: USER_ID,
    password: hashedPassword,
  });

  // ─── 4. Member (owner) ─────────────────────────────────────────────────────
  log("Creating member...");
  await db.insert(schema.members).values({
    id: uuid(),
    userId: USER_ID,
    restaurantId: RESTAURANT_ID,
    role: "owner",
    branchId: BRANCH_1,
  });

  // ─── 5. Branches ───────────────────────────────────────────────────────────
  log("Creating branches...");
  await db.insert(schema.branches).values([
    {
      id: BRANCH_1,
      restaurantId: RESTAURANT_ID,
      name: "Downtown",
      address: "123 Main Street, New York, NY 10001",
      phone: "+1-555-0100",
      isActive: true,
    },
    {
      id: BRANCH_2,
      restaurantId: RESTAURANT_ID,
      name: "Midtown",
      address: "456 Park Avenue, New York, NY 10022",
      phone: "+1-555-0200",
      isActive: true,
    },
    {
      id: BRANCH_3,
      restaurantId: RESTAURANT_ID,
      name: "Brooklyn",
      address: "789 Atlantic Ave, Brooklyn, NY 11217",
      phone: "+1-555-0300",
      isActive: true,
    },
  ]);

  // ─── 6. Menu Categories ─────────────────────────────────────────────────────
  log("Creating menu categories...");
  const categoryData = [
    { name: "Appetizers", description: "Start your meal right", sortOrder: 0 },
    { name: "Pasta", description: "Handmade Italian pasta", sortOrder: 1 },
    { name: "Pizza", description: "Wood-fired Neapolitan pizza", sortOrder: 2 },
    { name: "Main Courses", description: "Hearty entrées", sortOrder: 3 },
    { name: "Salads", description: "Fresh garden salads", sortOrder: 4 },
    { name: "Desserts", description: "Sweet endings", sortOrder: 5 },
    { name: "Beverages", description: "Drinks and cocktails", sortOrder: 6 },
    { name: "Sides", description: "Perfect accompaniments", sortOrder: 7 },
  ];

  const categoryIds: string[] = [];
  for (const cat of categoryData) {
    const id = uuid();
    categoryIds.push(id);
    await db.insert(schema.menuCategories).values({
      id,
      restaurantId: RESTAURANT_ID,
      name: cat.name,
      description: cat.description,
      sortOrder: cat.sortOrder,
      isActive: true,
    });
  }

  // ─── 7. Modifiers ───────────────────────────────────────────────────────────
  log("Creating modifiers...");
  const modifierData = [
    { name: "Extra Cheese", price: "1.50" },
    { name: "Extra Sauce", price: "0.75" },
    { name: "Gluten-Free", price: "2.00" },
    { name: "Spicy", price: "0.00" },
    { name: "No Onions", price: "0.00" },
    { name: "Add Egg", price: "1.00" },
    { name: "Truffle Oil", price: "3.00" },
    { name: "Large Size", price: "4.00" },
  ];

  const modifierIds: string[] = [];
  for (const mod of modifierData) {
    const id = uuid();
    modifierIds.push(id);
    await db.insert(schema.modifiers).values({
      id,
      restaurantId: RESTAURANT_ID,
      name: mod.name,
      price: mod.price,
    });
  }

  // ─── 8. Menu Items ──────────────────────────────────────────────────────────
  log("Creating menu items...");

  interface MenuItemSeed {
    categoryIndex: number;
    name: string;
    description: string;
    price: string;
    cost: string;
    prepTime: number;
  }

  const menuItemSeeds: MenuItemSeed[] = [
    // Appetizers
    { categoryIndex: 0, name: "Bruschetta", description: "Toasted bread with fresh tomatoes, basil, and garlic", price: "8.99", cost: "2.50", prepTime: 10 },
    { categoryIndex: 0, name: "Calamari Fritti", description: "Crispy fried calamari with marinara sauce", price: "12.99", cost: "4.00", prepTime: 12 },
    { categoryIndex: 0, name: "Caprese Salad", description: "Fresh mozzarella, tomatoes, and basil drizzled with balsamic", price: "10.99", cost: "3.50", prepTime: 8 },
    { categoryIndex: 0, name: "Garlic Bread", description: "Warm bread with garlic butter and herbs", price: "5.99", cost: "1.00", prepTime: 5 },
    // Pasta
    { categoryIndex: 1, name: "Spaghetti Carbonara", description: "Classic pasta with pancetta, egg, pecorino, and black pepper", price: "16.99", cost: "4.50", prepTime: 15 },
    { categoryIndex: 1, name: "Fettuccine Alfredo", description: "Creamy parmesan sauce with fresh fettuccine", price: "14.99", cost: "3.50", prepTime: 12 },
    { categoryIndex: 1, name: "Penne Arrabbiata", description: "Spicy tomato sauce with garlic and red chili", price: "13.99", cost: "3.00", prepTime: 12 },
    { categoryIndex: 1, name: "Lasagna Bolognese", description: "Layers of pasta, meat sauce, béchamel, and mozzarella", price: "18.99", cost: "5.50", prepTime: 20 },
    // Pizza
    { categoryIndex: 2, name: "Margherita Pizza", description: "San Marzano tomatoes, fresh mozzarella, basil", price: "14.99", cost: "3.50", prepTime: 15 },
    { categoryIndex: 2, name: "Pepperoni Pizza", description: "Classic pepperoni with mozzarella and tomato sauce", price: "16.99", cost: "4.00", prepTime: 15 },
    { categoryIndex: 2, name: "Quattro Formaggi", description: "Four cheese pizza with mozzarella, gorgonzola, fontina, parmigiano", price: "17.99", cost: "5.00", prepTime: 15 },
    // Main Courses
    { categoryIndex: 3, name: "Chicken Parmigiana", description: "Breaded chicken breast with marinara and melted mozzarella", price: "19.99", cost: "6.00", prepTime: 20 },
    { categoryIndex: 3, name: "Osso Buco", description: "Braised veal shank in white wine and vegetables", price: "28.99", cost: "10.00", prepTime: 25 },
    { categoryIndex: 3, name: "Grilled Salmon", description: "Atlantic salmon with lemon butter and seasonal vegetables", price: "24.99", cost: "8.00", prepTime: 18 },
    { categoryIndex: 3, name: "Veal Marsala", description: "Veal cutlets in Marsala wine sauce with mushrooms", price: "26.99", cost: "9.00", prepTime: 20 },
    // Salads
    { categoryIndex: 4, name: "Caesar Salad", description: "Romaine lettuce, parmesan, croutons, Caesar dressing", price: "9.99", cost: "2.50", prepTime: 5 },
    { categoryIndex: 4, name: "Arugula Salad", description: "Arugula, cherry tomatoes, shaved parmesan, lemon vinaigrette", price: "10.99", cost: "2.50", prepTime: 5 },
    // Desserts
    { categoryIndex: 5, name: "Tiramisu", description: "Classic Italian dessert with mascarpone, espresso, and cocoa", price: "8.99", cost: "2.50", prepTime: 5 },
    { categoryIndex: 5, name: "Panna Cotta", description: "Creamy vanilla custard with berry compote", price: "7.99", cost: "2.00", prepTime: 5 },
    { categoryIndex: 5, name: "Cannoli", description: "Crispy pastry shells filled with sweet ricotta cream", price: "6.99", cost: "1.50", prepTime: 5 },
    // Beverages
    { categoryIndex: 6, name: "House Red Wine", description: "Glass of Montepulciano d'Abruzzo", price: "9.99", cost: "2.00", prepTime: 1 },
    { categoryIndex: 6, name: "Sparkling Water", description: "San Pellegrino 500ml", price: "4.99", cost: "0.75", prepTime: 1 },
    { categoryIndex: 6, name: "Espresso", description: "Double shot Italian espresso", price: "3.99", cost: "0.50", prepTime: 2 },
    // Sides
    { categoryIndex: 7, name: "French Fries", description: "Crispy golden fries with parmesan", price: "5.99", cost: "1.00", prepTime: 8 },
    { categoryIndex: 7, name: "Sauteed Vegetables", description: "Seasonal vegetables in olive oil and garlic", price: "6.99", cost: "2.00", prepTime: 8 },
    { categoryIndex: 7, name: "Risotto", description: "Creamy arborio rice with parmesan and butter", price: "7.99", cost: "2.00", prepTime: 10 },
  ];

  const menuItems: { id: string; categoryIndex: number; price: string; name: string }[] = [];

  for (const item of menuItemSeeds) {
    const id = uuid();
    menuItems.push({ id, categoryIndex: item.categoryIndex, price: item.price, name: item.name });
    await db.insert(schema.menuItems).values({
      id,
      restaurantId: RESTAURANT_ID,
      categoryId: categoryIds[item.categoryIndex],
      name: item.name,
      description: item.description,
      price: item.price,
      preparationTime: item.prepTime,
      isAvailable: true,
      taxRate: "0.08",
      cost: item.cost,
      sku: `SKU-${menuItems.length.toString().padStart(4, "0")}`,
    });
  }

  // ─── 9. Menu Item Modifiers ─────────────────────────────────────────────────
  log("Creating menu item modifiers...");
  for (const item of menuItems) {
    const applicableMods = randomItems(modifierIds, Math.floor(Math.random() * 3) + 1);
    for (const modId of applicableMods) {
      await db.insert(schema.menuItemModifiers).values({
        id: uuid(),
        menuItemId: item.id,
        modifierId: modId,
        isRequired: false,
      });
    }
  }

  // ─── 10. Customers ──────────────────────────────────────────────────────────
  log("Creating customers...");
  const customerNames = [
    "Alice Johnson", "Bob Smith", "Carol White", "David Brown", "Emma Davis",
    "Frank Miller", "Grace Wilson", "Henry Moore", "Ivy Taylor", "Jack Anderson",
    "Karen Thomas", "Leo Jackson", "Mia Martin", "Noah Garcia", "Olivia Martinez",
    "Paul Robinson", "Quinn Clark", "Riley Rodriguez", "Sophia Lewis", "Tom Lee",
    "Uma Walker", "Victor Hall", "Wendy Allen", "Xavier Young", "Yara King",
    "Zach Wright", "Amber Lopez", "Brian Hill", "Clara Scott", "Derek Green",
  ];

  const customerIds: string[] = [];
  for (let i = 0; i < customerNames.length; i++) {
    const id = uuid();
    customerIds.push(id);
    const firstName = customerNames[i].split(" ")[0].toLowerCase();
    await db.insert(schema.customers).values({
      id,
      restaurantId: RESTAURANT_ID,
      name: customerNames[i],
      email: `${firstName}${i + 1}@example.com`,
      phone: `+1-555-${(1000 + i).toString().slice(-4)}`,
      address: `${100 + i} Oak Street, New York, NY 100${(i % 10).toString().padStart(2, "0")}`,
      notes: null,
    });
  }

  // ─── 11. Employees ──────────────────────────────────────────────────────────
  log("Creating employees...");
  const employeeData = [
    { name: "Antonio Bianchi", role: "manager", position: "General Manager", salary: "55000" },
    { name: "Maria Conti", role: "server", position: "Head Server", salary: "35000" },
    { name: "Luca Ferrari", role: "chef", position: "Head Chef", salary: "60000" },
    { name: "Sofia Romano", role: "server", position: "Server", salary: "28000" },
    { name: "Giovanni Ricci", role: "chef", position: "Sous Chef", salary: "45000" },
    { name: "Isabella Marino", role: "server", position: "Server", salary: "28000" },
    { name: "Marco Colombo", role: "bartender", position: "Head Bartender", salary: "32000" },
    { name: "Giulia Moretti", role: "host", position: "Hostess", salary: "26000" },
    { name: "Alessandro Barbieri", role: "chef", position: "Line Cook", salary: "30000" },
    { name: "Francesca Galli", role: "server", position: "Server", salary: "28000" },
    { name: "Matteo Fontana", role: "dishwasher", position: "Dishwasher", salary: "22000" },
    { name: "Chiara Rizzo", role: "server", position: "Server", salary: "28000" },
    { name: "Davide Lombardi", role: "chef", position: "Pastry Chef", salary: "38000" },
    { name: "Elena Serra", role: "cashier", position: "Cashier", salary: "25000" },
    { name: "Roberto Neri", role: "delivery", position: "Delivery Driver", salary: "24000" },
  ];

  const employeeIds: string[] = [];
  for (const emp of employeeData) {
    const id = uuid();
    employeeIds.push(id);
    const firstName = emp.name.split(" ")[0].toLowerCase();
    await db.insert(schema.employees).values({
      id,
      restaurantId: RESTAURANT_ID,
      branchId: randomItem([BRANCH_1, BRANCH_2, BRANCH_3]),
      name: emp.name,
      email: `${firstName}@labellacucina.com`,
      phone: `+1-555-${(2000 + employeeIds.length).toString().slice(-4)}`,
      role: emp.role,
      position: emp.position,
      status: "active",
      hireDate: format(daysAgo(Math.floor(Math.random() * 365) + 30), "yyyy-MM-dd"),
      salary: emp.salary,
    });
  }

  // ─── 12. Suppliers ──────────────────────────────────────────────────────────
  log("Creating suppliers...");
  const supplierData = [
    { name: "Tony's Meats", company: "Tony's Premium Meats Inc.", email: "orders@tonysmeats.com", phone: "+1-555-3001", address: "100 Butcher Lane, Bronx, NY" },
    { name: "Fresh Farms", company: "Fresh Farms Produce Co.", email: "sales@freshfarms.com", phone: "+1-555-3002", address: "200 Green Road, Queens, NY" },
    { name: "Ocean Delights", company: "Ocean Delights Seafood", email: "info@oceandelights.com", phone: "+1-555-3003", address: "50 Harbor St, Brooklyn, NY" },
    { name: "Italian Imports", company: "Italian Specialty Imports", email: "orders@italianimports.com", phone: "+1-555-3004", address: "300 Olive Ave, Manhattan, NY" },
    { name: "Dairy Direct", company: "Dairy Direct Co.", email: "wholesale@dairydirect.com", phone: "+1-555-3005", address: "400 Milk Street, Staten Island, NY" },
    { name: "Beverage World", company: "Beverage World Distributors", email: "sales@beverageworld.com", phone: "+1-555-3006", address: "500 Vine Street, Hoboken, NJ" },
  ];

  const supplierIds: string[] = [];
  for (const sup of supplierData) {
    const id = uuid();
    supplierIds.push(id);
    await db.insert(schema.suppliers).values({
      id,
      restaurantId: RESTAURANT_ID,
      name: sup.name,
      company: sup.company,
      email: sup.email,
      phone: sup.phone,
      address: sup.address,
      notes: null,
    });
  }

  // ─── 13. Ingredients ────────────────────────────────────────────────────────
  log("Creating ingredients...");
  const ingredientData = [
    { name: "All-Purpose Flour", sku: "ING-0001", unit: "kg", currentStock: "50", minimumStock: "20", costPerUnit: "1.20", supplierIndex: 3 },
    { name: "San Marzano Tomatoes", sku: "ING-0002", unit: "can", currentStock: "100", minimumStock: "30", costPerUnit: "3.50", supplierIndex: 3 },
    { name: "Fresh Mozzarella", sku: "ING-0003", unit: "kg", currentStock: "25", minimumStock: "10", costPerUnit: "8.00", supplierIndex: 4 },
    { name: "Parmigiano Reggiano", sku: "ING-0004", unit: "kg", currentStock: "15", minimumStock: "5", costPerUnit: "22.00", supplierIndex: 4 },
    { name: "Extra Virgin Olive Oil", sku: "ING-0005", unit: "L", currentStock: "30", minimumStock: "10", costPerUnit: "12.00", supplierIndex: 3 },
    { name: "Fresh Basil", sku: "ING-0006", unit: "bunch", currentStock: "20", minimumStock: "10", costPerUnit: "2.00", supplierIndex: 1 },
    { name: "Pancetta", sku: "ING-0007", unit: "kg", currentStock: "10", minimumStock: "5", costPerUnit: "15.00", supplierIndex: 0 },
    { name: "Chicken Breast", sku: "ING-0008", unit: "kg", currentStock: "20", minimumStock: "10", costPerUnit: "7.00", supplierIndex: 0 },
    { name: "Atlantic Salmon", sku: "ING-0009", unit: "kg", currentStock: "8", minimumStock: "5", costPerUnit: "18.00", supplierIndex: 2 },
    { name: "Veal Shank", sku: "ING-0010", unit: "kg", currentStock: "6", minimumStock: "3", costPerUnit: "20.00", supplierIndex: 0 },
    { name: "Arborio Rice", sku: "ING-0011", unit: "kg", currentStock: "40", minimumStock: "15", costPerUnit: "4.00", supplierIndex: 3 },
    { name: "Penne Pasta", sku: "ING-0012", unit: "kg", currentStock: "35", minimumStock: "15", costPerUnit: "2.50", supplierIndex: 3 },
    { name: "Fettuccine Pasta", sku: "ING-0013", unit: "kg", currentStock: "30", minimumStock: "15", costPerUnit: "2.50", supplierIndex: 3 },
    { name: "Spaghetti Pasta", sku: "ING-0014", unit: "kg", currentStock: "45", minimumStock: "20", costPerUnit: "2.00", supplierIndex: 3 },
    { name: "Heavy Cream", sku: "ING-0015", unit: "L", currentStock: "20", minimumStock: "8", costPerUnit: "5.00", supplierIndex: 4 },
    { name: "Eggs", sku: "ING-0016", unit: "dozen", currentStock: "25", minimumStock: "10", costPerUnit: "3.50", supplierIndex: 4 },
    { name: "Mascarpone", sku: "ING-0017", unit: "kg", currentStock: "10", minimumStock: "5", costPerUnit: "9.00", supplierIndex: 4 },
    { name: "Marsala Wine", sku: "ING-0018", unit: "bottle", currentStock: "12", minimumStock: "5", costPerUnit: "14.00", supplierIndex: 5 },
    { name: "San Pellegrino", sku: "ING-0019", unit: "bottle", currentStock: "48", minimumStock: "20", costPerUnit: "1.50", supplierIndex: 5 },
    { name: "Montepulciano Wine", sku: "ING-0020", unit: "bottle", currentStock: "24", minimumStock: "10", costPerUnit: "8.00", supplierIndex: 5 },
    { name: "Black Peppercorns", sku: "ING-0021", unit: "kg", currentStock: "5", minimumStock: "2", costPerUnit: "10.00", supplierIndex: 3 },
    { name: "Garlic", sku: "ING-0022", unit: "kg", currentStock: "8", minimumStock: "3", costPerUnit: "6.00", supplierIndex: 1 },
    { name: "Mushrooms", sku: "ING-0023", unit: "kg", currentStock: "12", minimumStock: "5", costPerUnit: "7.00", supplierIndex: 1 },
    { name: "Romaine Lettuce", sku: "ING-0024", unit: "head", currentStock: "30", minimumStock: "15", costPerUnit: "1.50", supplierIndex: 1 },
    { name: "Arugula", sku: "ING-0025", unit: "kg", currentStock: "10", minimumStock: "5", costPerUnit: "5.00", supplierIndex: 1 },
  ];

  const ingredientIds: string[] = [];
  for (const ing of ingredientData) {
    const id = uuid();
    ingredientIds.push(id);
    await db.insert(schema.ingredients).values({
      id,
      restaurantId: RESTAURANT_ID,
      name: ing.name,
      sku: ing.sku,
      unit: ing.unit,
      currentStock: ing.currentStock,
      minimumStock: ing.minimumStock,
      costPerUnit: ing.costPerUnit,
      supplierId: supplierIds[ing.supplierIndex],
      expirationDate: format(daysAgo(-90), "yyyy-MM-dd"),
    });
  }

  // ─── 14. Recipes ────────────────────────────────────────────────────────────
  log("Creating recipes...");
  // Link some menu items to ingredients via recipes
  const recipeMenuIndices = [4, 8, 11, 13, 17]; // Carbonara, Margherita, Chicken Parm, Salmon, Tiramisu
  const recipeIngredientSets: number[][] = [
    [13, 6, 15, 3, 20], // Carbonara: spaghetti, pancetta, eggs, parmigiano, peppercorns
    [0, 1, 2, 5, 4],    // Margherita: flour, tomatoes, mozzarella, basil, olive oil
    [7, 1, 2, 14, 4],   // Chicken Parm: chicken, tomatoes, mozzarella, cream, olive oil
    [8, 4, 5, 24],      // Salmon: salmon, olive oil, basil, arugula
    [16, 14, 15],       // Tiramisu: mascarpone, cream, eggs
  ];

  const recipeIds: string[] = [];
  for (let i = 0; i < recipeMenuIndices.length; i++) {
    const recipeId = uuid();
    recipeIds.push(recipeId);
    await db.insert(schema.recipes).values({
      id: recipeId,
      restaurantId: RESTAURANT_ID,
      menuItemId: menuItems[recipeMenuIndices[i]].id,
    });

    for (const ingIdx of recipeIngredientSets[i]) {
      await db.insert(schema.recipeItems).values({
        id: uuid(),
        recipeId,
        ingredientId: ingredientIds[ingIdx],
        quantity: money(Math.random() * 2 + 0.25),
      });
    }
  }

  // ─── 15. Tables ─────────────────────────────────────────────────────────────
  log("Creating tables...");
  const tableIds: string[] = [];
  const branchIds = [BRANCH_1, BRANCH_2, BRANCH_3];
  for (let i = 1; i <= 15; i++) {
    const id = uuid();
    tableIds.push(id);
    await db.insert(schema.tables).values({
      id,
      restaurantId: RESTAURANT_ID,
      branchId: branchIds[(i - 1) % 3],
      number: i.toString(),
      capacity: randomItem([2, 2, 4, 4, 4, 6, 6, 8]),
      status: "available",
    });
  }

  // ─── 16. Reservations ──────────────────────────────────────────────────────
  log("Creating reservations...");
  const reservationStatuses = ["confirmed", "pending", "cancelled", "completed"];
  for (let i = 0; i < 12; i++) {
    const daysOffset = Math.floor(Math.random() * 14) - 7;
    const resDate = daysAgo(-daysOffset);
    await db.insert(schema.reservations).values({
      id: uuid(),
      restaurantId: RESTAURANT_ID,
      branchId: randomItem(branchIds),
      customerId: randomItem(customerIds),
      tableId: randomItem(tableIds),
      date: format(resDate, "yyyy-MM-dd"),
      time: randomItem(["12:00", "12:30", "13:00", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30"]),
      partySize: randomItem([2, 2, 3, 4, 4, 5, 6]),
      status: randomItem(reservationStatuses),
      notes: i % 3 === 0 ? "Birthday celebration" : i % 5 === 0 ? "Window seat preferred" : null,
    });
  }

  // ─── 17. Orders + Order Items + Payments ────────────────────────────────────
  log("Creating orders (120 orders over 30 days)...");

  const orderTypes = ["dine_in", "takeout", "delivery"];
  const orderStatuses = ["completed", "completed", "completed", "completed", "completed", "completed", "cancelled", "pending"];
  const paymentMethods = ["cash", "credit_card", "debit_card", "credit_card", "credit_card"];

  const totalOrders = 120;
  let orderCount = 0;
  let orderItemCount = 0;
  let paymentCount = 0;

  for (let i = 0; i < totalOrders; i++) {
    const dayOffset = Math.floor((i / totalOrders) * 30);
    const hourOffset = Math.floor(Math.random() * 14) + 10;
    const minuteOffset = Math.floor(Math.random() * 60);
    const orderDate = minsAgo(dayOffset * 1440 + hourOffset * 60 + minuteOffset);

    const orderType = randomItem(orderTypes);
    const orderStatus = randomItem(orderStatuses);
    const orderId = uuid();

    const numItems = Math.floor(Math.random() * 4) + 1;
    const selectedItems = randomItems(menuItems, numItems);

    let subtotal = 0;
    const orderItemsData: {
      id: string;
      orderId: string;
      menuItemId: string;
      quantity: number;
      price: string;
      subtotal: string;
    }[] = [];

    for (const mi of selectedItems) {
      const qty = Math.floor(Math.random() * 3) + 1;
      const price = parseFloat(mi.price);
      const itemSubtotal = price * qty;
      subtotal += itemSubtotal;

      const orderItemId = uuid();
      orderItemsData.push({
        id: orderItemId,
        orderId,
        menuItemId: mi.id,
        quantity: qty,
        price: mi.price,
        subtotal: money(itemSubtotal),
      });
    }

    const tax = parseFloat(money(subtotal * 0.08));
    const discount = i % 10 === 0 ? parseFloat(money(subtotal * 0.1)) : 0;
    const total = parseFloat(money(subtotal + tax - discount));

    await db.insert(schema.orders).values({
      id: orderId,
      restaurantId: RESTAURANT_ID,
      branchId: randomItem(branchIds),
      tableId: orderType === "dine_in" ? randomItem(tableIds) : null,
      customerId: randomItem(customerIds),
      orderNumber: `ORD-${(i + 1).toString().padStart(3, "0")}`,
      type: orderType,
      status: orderStatus,
      subtotal: money(subtotal),
      tax: money(tax),
      discount: money(discount),
      total: money(total),
      notes: i % 7 === 0 ? "Extra napkins requested" : null,
      createdAt: orderDate,
      updatedAt: orderDate,
    });

    for (const oi of orderItemsData) {
      await db.insert(schema.orderItems).values({
        ...oi,
        createdAt: orderDate,
      });
      orderItemCount++;

      if (Math.random() > 0.6) {
        const applicableMods = randomItems(modifierIds, Math.floor(Math.random() * 2) + 1);
        for (const modId of applicableMods) {
          await db.insert(schema.orderItemModifiers).values({
            id: uuid(),
            orderItemId: oi.id,
            modifierId: modId,
            price: modifierData[modifierIds.indexOf(modId)].price,
            createdAt: orderDate,
          });
        }
      }
    }

    if (orderStatus === "completed" && Math.random() > 0.15) {
      await db.insert(schema.payments).values({
        id: uuid(),
        restaurantId: RESTAURANT_ID,
        orderId,
        amount: money(total),
        method: randomItem(paymentMethods),
        status: "completed",
        reference: `PAY-${(paymentCount + 1).toString().padStart(4, "0")}`,
        createdAt: orderDate,
        updatedAt: orderDate,
      });
      paymentCount++;
    }

    orderCount++;
    if ((i + 1) % 30 === 0) log(`  ...${i + 1}/${totalOrders} orders created`);
  }

  // ─── 18. Expenses ──────────────────────────────────────────────────────────
  log("Creating expenses...");
  const expenseData = [
    { title: "Rent - Downtown", category: "rent", amount: "4500.00", daysBack: 28, method: "bank_transfer" },
    { title: "Rent - Midtown", category: "rent", amount: "5200.00", daysBack: 28, method: "bank_transfer" },
    { title: "Rent - Brooklyn", category: "rent", amount: "3800.00", daysBack: 28, method: "bank_transfer" },
    { title: "Electricity Bill", category: "utilities", amount: "890.00", daysBack: 25, method: "bank_transfer" },
    { title: "Water Bill", category: "utilities", amount: "320.00", daysBack: 25, method: "bank_transfer" },
    { title: "Gas Bill", category: "utilities", amount: "450.00", daysBack: 24, method: "bank_transfer" },
    { title: "Kitchen Equipment Repair", category: "maintenance", amount: "750.00", daysBack: 20, method: "credit_card" },
    { title: "Pest Control Service", category: "maintenance", amount: "200.00", daysBack: 18, method: "cash" },
    { title: "Staff Training Program", category: "training", amount: "1200.00", daysBack: 15, method: "credit_card" },
    { title: "Cleaning Supplies", category: "supplies", amount: "350.00", daysBack: 14, method: "cash" },
    { title: "Table Linens Purchase", category: "supplies", amount: "600.00", daysBack: 12, method: "credit_card" },
    { title: "POS System Subscription", category: "technology", amount: "199.00", daysBack: 10, method: "credit_card" },
    { title: "Internet Service", category: "technology", amount: "150.00", daysBack: 10, method: "bank_transfer" },
    { title: "Marketing - Instagram Ads", category: "marketing", amount: "500.00", daysBack: 8, method: "credit_card" },
    { title: "Marketing - Local Flyers", category: "marketing", amount: "250.00", daysBack: 7, method: "cash" },
    { title: "Insurance Premium", category: "insurance", amount: "1800.00", daysBack: 5, method: "bank_transfer" },
    { title: "License Renewal", category: "licenses", amount: "400.00", daysBack: 4, method: "bank_transfer" },
    { title: "Staff Party", category: "miscellaneous", amount: "950.00", daysBack: 3, method: "credit_card" },
    { title: "Music Licensing", category: "miscellaneous", amount: "120.00", daysBack: 2, method: "credit_card" },
    { title: "Parking Permits", category: "miscellaneous", amount: "200.00", daysBack: 1, method: "cash" },
  ];

  for (const exp of expenseData) {
    await db.insert(schema.expenses).values({
      id: uuid(),
      restaurantId: RESTAURANT_ID,
      branchId: randomItem(branchIds),
      title: exp.title,
      category: exp.category,
      amount: exp.amount,
      date: format(daysAgo(exp.daysBack), "yyyy-MM-dd"),
      paymentMethod: exp.method,
      description: null,
    });
  }

  // ─── 19. Purchase Orders ───────────────────────────────────────────────────
  log("Creating purchase orders...");
  const poStatuses = ["completed", "completed", "pending", "draft", "completed"];
  const purchaseOrderIds: string[] = [];

  const poConfigs = [
    { supplierIndex: 0, ingredientIndices: [6, 7, 9], status: "completed", daysBack: 25 },
    { supplierIndex: 1, ingredientIndices: [5, 21, 22, 23, 24], status: "completed", daysBack: 20 },
    { supplierIndex: 2, ingredientIndices: [8], status: "completed", daysBack: 15 },
    { supplierIndex: 3, ingredientIndices: [0, 1, 11, 12, 13], status: "pending", daysBack: 5 },
    { supplierIndex: 4, ingredientIndices: [2, 3, 14, 15, 16], status: "draft", daysBack: 1 },
    { supplierIndex: 5, ingredientIndices: [17, 18, 19], status: "completed", daysBack: 10 },
  ];

  for (const po of poConfigs) {
    const poId = uuid();
    purchaseOrderIds.push(poId);

    let poTotal = 0;
    for (const ingIdx of po.ingredientIndices) {
      const unitCost = parseFloat(ingredientData[ingIdx].costPerUnit);
      const qty = Math.floor(Math.random() * 20) + 5;
      const subtotal = unitCost * qty;
      poTotal += subtotal;

      await db.insert(schema.purchaseOrderItems).values({
        id: uuid(),
        purchaseOrderId: poId,
        ingredientId: ingredientIds[ingIdx],
        quantity: qty.toString(),
        unitCost: money(unitCost),
        subtotal: money(subtotal),
      });
    }

    const poTax = poTotal * 0.08;
    await db.insert(schema.purchaseOrders).values({
      id: poId,
      restaurantId: RESTAURANT_ID,
      supplierId: supplierIds[po.supplierIndex],
      status: po.status,
      total: money(poTotal),
      tax: money(poTax),
      notes: null,
      createdAt: daysAgo(po.daysBack),
      updatedAt: daysAgo(po.daysBack),
    });
  }

  // ─── 20. Inventory Movements ───────────────────────────────────────────────
  log("Creating inventory movements...");
  for (let i = 0; i < 25; i++) {
    const ingIdx = Math.floor(Math.random() * ingredientIds.length);
    const mType = i < 10 ? "purchase" : randomItem(["usage", "waste", "adjustment"]);
    const qty = mType === "purchase" ? (Math.random() * 50 + 10) : (Math.random() * 5 + 0.5);

    await db.insert(schema.inventoryMovements).values({
      id: uuid(),
      restaurantId: RESTAURANT_ID,
      ingredientId: ingredientIds[ingIdx],
      type: mType,
      quantity: money(qty),
      referenceId: mType === "purchase" ? randomItem(purchaseOrderIds) : null,
      notes: mType === "waste" ? "Spoilage" : mType === "adjustment" ? "Inventory count correction" : null,
      createdAt: daysAgo(Math.floor(Math.random() * 30)),
    });
  }

  // ─── 21. Notifications ─────────────────────────────────────────────────────
  log("Creating notifications...");
  const notificationData = [
    { title: "Low Stock Alert", message: "Fresh Mozzarella is below minimum stock level", type: "warning", daysBack: 0 },
    { title: "New Order Received", message: "Order ORD-120 from Dine-in", type: "info", daysBack: 0 },
    { title: "Payment Received", message: "Payment of $45.99 received for Order ORD-119", type: "success", daysBack: 0 },
    { title: "Employee Shift Change", message: "Maria Conti swapped shift with Sofia Romano for tomorrow", type: "info", daysBack: 1 },
    { title: "Reservation Confirmed", message: "Party of 6 confirmed for Saturday at 7:30 PM", type: "success", daysBack: 1 },
    { title: "Low Stock Alert", message: "Atlantic Salmon is below minimum stock level", type: "warning", daysBack: 2 },
    { title: "Weekly Revenue Report", message: "Last week's revenue: $28,450.00", type: "info", daysBack: 3 },
    { title: "Order Cancelled", message: "Order ORD-085 was cancelled by customer", type: "warning", daysBack: 4 },
    { title: "Maintenance Scheduled", message: "HVAC maintenance scheduled for Friday", type: "info", daysBack: 5 },
    { title: "New Supplier Added", message: "Beverage World Distributors has been added as a supplier", type: "success", daysBack: 7 },
    { title: "Monthly Expense Summary", message: "Total expenses this month: $19,379.00", type: "info", daysBack: 10 },
    { title: "License Expiring Soon", message: "Health inspection license expires in 30 days", type: "warning", daysBack: 12 },
  ];

  for (const notif of notificationData) {
    await db.insert(schema.notifications).values({
      id: uuid(),
      restaurantId: RESTAURANT_ID,
      userId: USER_ID,
      title: notif.title,
      message: notif.message,
      type: notif.type,
      isRead: notif.daysBack > 5,
      createdAt: daysAgo(notif.daysBack),
    });
  }

  // ─── Final Summary ──────────────────────────────────────────────────────────
  console.log("\n✅ Seed completed successfully!\n");
  console.log("📊 Summary:");
  console.log(`   Restaurant:   1 (La Bella Cucina)`);
  console.log(`   User:         1 (demo@restoos.com)`);
  console.log(`   Branches:     3`);
  console.log(`   Categories:   ${categoryIds.length}`);
  console.log(`   Modifiers:    ${modifierIds.length}`);
  console.log(`   Menu Items:   ${menuItems.length}`);
  console.log(`   Customers:    ${customerIds.length}`);
  console.log(`   Employees:    ${employeeIds.length}`);
  console.log(`   Suppliers:    ${supplierIds.length}`);
  console.log(`   Ingredients:  ${ingredientIds.length}`);
  console.log(`   Recipes:      ${recipeIds.length}`);
  console.log(`   Tables:       ${tableIds.length}`);
  console.log(`   Reservations: 12`);
  console.log(`   Orders:       ${orderCount}`);
  console.log(`   Order Items:  ${orderItemCount}`);
  console.log(`   Payments:     ${paymentCount}`);
  console.log(`   Expenses:     ${expenseData.length}`);
  console.log(`   Purchase Orders: ${poConfigs.length}`);
  console.log(`   Inventory Movements: 25`);
  console.log(`   Notifications: ${notificationData.length}`);
  console.log("\n🔑 Auth Credentials:");
  console.log("   Email:    demo@restoos.com");
  console.log("   Password: demo1234\n");

  await client.end();
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
