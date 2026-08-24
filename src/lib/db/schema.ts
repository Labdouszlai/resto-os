import {
  pgTable,
  uuid,
  text,
  timestamp,
  boolean,
  integer,
  numeric,
  date,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { InferSelectModel, InferInsertModel } from "drizzle-orm";

// =============================================================================
// Better Auth Tables
// =============================================================================

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
});

export const accounts = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  password: text("password"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// =============================================================================
// Restaurant & Organization
// =============================================================================

export const restaurants = pgTable("restaurants", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logo: text("logo"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  country: text("country"),
  currency: text("currency").notNull().default("USD"),
  taxRate: numeric("tax_rate").notNull().default("0"),
  timezone: text("timezone"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const branches = pgTable("branches", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  address: text("address"),
  phone: text("phone"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const members = pgTable(
  "members",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    role: text("role").notNull(),
    branchId: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("members_user_restaurant_idx").on(
      table.userId,
      table.restaurantId
    ),
  ]
);

// =============================================================================
// Employees
// =============================================================================

export const employees = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id").references(() => branches.id, {
    onDelete: "set null",
  }),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  role: text("role").notNull(),
  position: text("position"),
  status: text("status").notNull().default("active"),
  hireDate: date("hire_date"),
  salary: numeric("salary"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("employees_restaurant_id_idx").on(table.restaurantId),
]);

// =============================================================================
// Customers
// =============================================================================

export const customers = pgTable(
  "customers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    address: text("address"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("customers_restaurant_id_idx").on(table.restaurantId),
    index("customers_email_idx").on(table.email),
  ]
);

// =============================================================================
// Tables (Dining)
// =============================================================================

export const tables = pgTable("tables", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  branchId: uuid("branch_id")
    .notNull()
    .references(() => branches.id, { onDelete: "cascade" }),
  number: text("number").notNull(),
  capacity: integer("capacity").notNull(),
  status: text("status").notNull().default("available"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("tables_restaurant_id_idx").on(table.restaurantId),
  index("tables_branch_id_idx").on(table.branchId),
]);

// =============================================================================
// Reservations
// =============================================================================

export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    tableId: uuid("table_id").references(() => tables.id, {
      onDelete: "set null",
    }),
    date: date("date").notNull(),
    time: text("time").notNull(),
    partySize: integer("party_size").notNull(),
    status: text("status").notNull().default("pending"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("reservations_restaurant_id_idx").on(table.restaurantId),
    index("reservations_date_idx").on(table.date),
    index("reservations_status_idx").on(table.status),
  ]
);

// =============================================================================
// Menu
// =============================================================================

export const menuCategories = pgTable("menu_categories", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  sortOrder: integer("sort_order").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
}, (table) => [
  index("menu_categories_restaurant_id_idx").on(table.restaurantId),
]);

export const modifiers = pgTable("modifiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  price: numeric("price").notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const menuItems = pgTable(
  "menu_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => menuCategories.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    description: text("description"),
    price: numeric("price").notNull(),
    image: text("image"),
    preparationTime: integer("preparation_time"),
    isAvailable: boolean("is_available").notNull().default(true),
    taxRate: numeric("tax_rate").notNull().default("0"),
    cost: numeric("cost").notNull().default("0"),
    sku: text("sku"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("menu_items_restaurant_id_idx").on(table.restaurantId),
    index("menu_items_category_id_idx").on(table.categoryId),
  ]
);

export const menuItemModifiers = pgTable("menu_item_modifiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  modifierId: uuid("modifier_id")
    .notNull()
    .references(() => modifiers.id, { onDelete: "cascade" }),
  isRequired: boolean("is_required").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =============================================================================
// Ingredients & Recipes
// =============================================================================

export const suppliers = pgTable("suppliers", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  company: text("company"),
  email: text("email"),
  phone: text("phone"),
  address: text("address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const ingredients = pgTable(
  "ingredients",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    sku: text("sku").notNull(),
    unit: text("unit").notNull(),
    currentStock: numeric("current_stock").notNull().default("0"),
    minimumStock: numeric("minimum_stock").notNull().default("0"),
    costPerUnit: numeric("cost_per_unit").notNull().default("0"),
    supplierId: uuid("supplier_id").references(() => suppliers.id, {
      onDelete: "set null",
    }),
    expirationDate: date("expiration_date"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("ingredients_restaurant_id_idx").on(table.restaurantId),
  ]
);

export const recipes = pgTable("recipes", {
  id: uuid("id").defaultRandom().primaryKey(),
  restaurantId: uuid("restaurant_id")
    .notNull()
    .references(() => restaurants.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("recipes_restaurant_id_idx").on(table.restaurantId),
  index("recipes_menu_item_id_idx").on(table.menuItemId),
]);

export const recipeItems = pgTable("recipe_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  recipeId: uuid("recipe_id")
    .notNull()
    .references(() => recipes.id, { onDelete: "cascade" }),
  ingredientId: uuid("ingredient_id")
    .notNull()
    .references(() => ingredients.id, { onDelete: "cascade" }),
  quantity: numeric("quantity").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =============================================================================
// Purchase Orders
// =============================================================================

export const purchaseOrders = pgTable(
  "purchase_orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    supplierId: uuid("supplier_id")
      .notNull()
      .references(() => suppliers.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("draft"),
    total: numeric("total").notNull().default("0"),
    tax: numeric("tax").notNull().default("0"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("purchase_orders_restaurant_id_idx").on(table.restaurantId),
    index("purchase_orders_status_idx").on(table.status),
  ]
);

export const purchaseOrderItems = pgTable("purchase_order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  purchaseOrderId: uuid("purchase_order_id")
    .notNull()
    .references(() => purchaseOrders.id, { onDelete: "cascade" }),
  ingredientId: uuid("ingredient_id")
    .notNull()
    .references(() => ingredients.id, { onDelete: "cascade" }),
  quantity: numeric("quantity").notNull(),
  unitCost: numeric("unit_cost").notNull(),
  subtotal: numeric("subtotal").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("purchase_order_items_po_id_idx").on(table.purchaseOrderId),
]);

// =============================================================================
// Inventory
// =============================================================================

export const inventoryMovements = pgTable(
  "inventory_movements",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    ingredientId: uuid("ingredient_id")
      .notNull()
      .references(() => ingredients.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    quantity: numeric("quantity").notNull(),
    referenceId: uuid("reference_id"),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("inventory_movements_restaurant_id_idx").on(table.restaurantId),
    index("inventory_movements_ingredient_id_idx").on(table.ingredientId),
    index("inventory_movements_type_idx").on(table.type),
  ]
);

// =============================================================================
// Orders
// =============================================================================

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id")
      .notNull()
      .references(() => branches.id, { onDelete: "cascade" }),
    tableId: uuid("table_id").references(() => tables.id, {
      onDelete: "set null",
    }),
    customerId: uuid("customer_id").references(() => customers.id, {
      onDelete: "set null",
    }),
    orderNumber: text("order_number").notNull(),
    type: text("type").notNull(),
    status: text("status").notNull().default("draft"),
    subtotal: numeric("subtotal").notNull(),
    tax: numeric("tax").notNull(),
    discount: numeric("discount").notNull().default("0"),
    total: numeric("total").notNull(),
    notes: text("notes"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("orders_restaurant_id_idx").on(table.restaurantId),
    index("orders_branch_id_idx").on(table.branchId),
    index("orders_status_idx").on(table.status),
    index("orders_created_at_idx").on(table.createdAt),
    index("orders_order_number_idx").on(table.orderNumber),
  ]
);

export const orderItems = pgTable("order_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderId: uuid("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  menuItemId: uuid("menu_item_id")
    .notNull()
    .references(() => menuItems.id, { onDelete: "cascade" }),
  quantity: integer("quantity").notNull(),
  price: numeric("price").notNull(),
  subtotal: numeric("subtotal").notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
}, (table) => [
  index("order_items_order_id_idx").on(table.orderId),
]);

export const orderItemModifiers = pgTable("order_item_modifiers", {
  id: uuid("id").defaultRandom().primaryKey(),
  orderItemId: uuid("order_item_id")
    .notNull()
    .references(() => orderItems.id, { onDelete: "cascade" }),
  modifierId: uuid("modifier_id")
    .notNull()
    .references(() => modifiers.id, { onDelete: "cascade" }),
  price: numeric("price").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// =============================================================================
// Payments
// =============================================================================

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    amount: numeric("amount").notNull(),
    method: text("method").notNull(),
    status: text("status").notNull().default("pending"),
    reference: text("reference"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("payments_restaurant_id_idx").on(table.restaurantId),
    index("payments_order_id_idx").on(table.orderId),
    index("payments_status_idx").on(table.status),
  ]
);

// =============================================================================
// Expenses
// =============================================================================

export const expenses = pgTable(
  "expenses",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    branchId: uuid("branch_id").references(() => branches.id, {
      onDelete: "set null",
    }),
    title: text("title").notNull(),
    category: text("category").notNull(),
    amount: numeric("amount").notNull(),
    date: date("date").notNull(),
    paymentMethod: text("payment_method").notNull().default("cash"),
    description: text("description"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    index("expenses_restaurant_id_idx").on(table.restaurantId),
    index("expenses_date_idx").on(table.date),
    index("expenses_category_idx").on(table.category),
  ]
);

// =============================================================================
// Notifications
// =============================================================================

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    restaurantId: uuid("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, {
      onDelete: "cascade",
    }),
    title: text("title").notNull(),
    message: text("message").notNull(),
    type: text("type").notNull(),
    isRead: boolean("is_read").notNull().default(false),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("notifications_restaurant_id_idx").on(table.restaurantId),
    index("notifications_user_id_idx").on(table.userId),
    index("notifications_is_read_idx").on(table.isRead),
  ]
);

// =============================================================================
// TypeScript Types
// =============================================================================

// Auth
export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type Session = InferSelectModel<typeof sessions>;
export type NewSession = InferInsertModel<typeof sessions>;

export type Account = InferSelectModel<typeof accounts>;
export type NewAccount = InferInsertModel<typeof accounts>;

// Restaurant & Organization
export type Restaurant = InferSelectModel<typeof restaurants>;
export type NewRestaurant = InferInsertModel<typeof restaurants>;

export type Branch = InferSelectModel<typeof branches>;
export type NewBranch = InferInsertModel<typeof branches>;

export type Member = InferSelectModel<typeof members>;
export type NewMember = InferInsertModel<typeof members>;

// Employees
export type Employee = InferSelectModel<typeof employees>;
export type NewEmployee = InferInsertModel<typeof employees>;

// Customers
export type Customer = InferSelectModel<typeof customers>;
export type NewCustomer = InferInsertModel<typeof customers>;

// Tables & Reservations
export type Table = InferSelectModel<typeof tables>;
export type NewTable = InferInsertModel<typeof tables>;

export type Reservation = InferSelectModel<typeof reservations>;
export type NewReservation = InferInsertModel<typeof reservations>;

// Menu
export type MenuCategory = InferSelectModel<typeof menuCategories>;
export type NewMenuCategory = InferInsertModel<typeof menuCategories>;

export type Modifier = InferSelectModel<typeof modifiers>;
export type NewModifier = InferInsertModel<typeof modifiers>;

export type MenuItem = InferSelectModel<typeof menuItems>;
export type NewMenuItem = InferInsertModel<typeof menuItems>;

export type MenuItemModifier = InferSelectModel<typeof menuItemModifiers>;
export type NewMenuItemModifier = InferInsertModel<typeof menuItemModifiers>;

// Ingredients & Recipes
export type Supplier = InferSelectModel<typeof suppliers>;
export type NewSupplier = InferInsertModel<typeof suppliers>;

export type Ingredient = InferSelectModel<typeof ingredients>;
export type NewIngredient = InferInsertModel<typeof ingredients>;

export type Recipe = InferSelectModel<typeof recipes>;
export type NewRecipe = InferInsertModel<typeof recipes>;

export type RecipeItem = InferSelectModel<typeof recipeItems>;
export type NewRecipeItem = InferInsertModel<typeof recipeItems>;

// Purchase Orders
export type PurchaseOrder = InferSelectModel<typeof purchaseOrders>;
export type NewPurchaseOrder = InferInsertModel<typeof purchaseOrders>;

export type PurchaseOrderItem = InferSelectModel<typeof purchaseOrderItems>;
export type NewPurchaseOrderItem = InferInsertModel<typeof purchaseOrderItems>;

// Inventory
export type InventoryMovement = InferSelectModel<typeof inventoryMovements>;
export type NewInventoryMovement = InferInsertModel<typeof inventoryMovements>;

// Orders
export type Order = InferSelectModel<typeof orders>;
export type NewOrder = InferInsertModel<typeof orders>;

export type OrderItem = InferSelectModel<typeof orderItems>;
export type NewOrderItem = InferInsertModel<typeof orderItems>;

export type OrderItemModifier = InferSelectModel<typeof orderItemModifiers>;
export type NewOrderItemModifier = InferInsertModel<typeof orderItemModifiers>;

// Payments
export type Payment = InferSelectModel<typeof payments>;
export type NewPayment = InferInsertModel<typeof payments>;

// Expenses
export type Expense = InferSelectModel<typeof expenses>;
export type NewExpense = InferInsertModel<typeof expenses>;

// Notifications
export type Notification = InferSelectModel<typeof notifications>;
export type NewNotification = InferInsertModel<typeof notifications>;
