"use client";

const categories = ["All", "Appetizers", "Pasta", "Pizza", "Main Courses", "Salads", "Desserts", "Beverages"];

const menuItems = [
  { name: "Bruschetta", category: "Appetizers", price: "$8.99", prepTime: "10 min", available: true },
  { name: "Calamari Fritti", category: "Appetizers", price: "$12.99", prepTime: "12 min", available: true },
  { name: "Caprese Salad", category: "Appetizers", price: "$10.99", prepTime: "8 min", available: true },
  { name: "Garlic Bread", category: "Appetizers", price: "$5.99", prepTime: "5 min", available: true },
  { name: "Spaghetti Carbonara", category: "Pasta", price: "$16.99", prepTime: "15 min", available: true },
  { name: "Fettuccine Alfredo", category: "Pasta", price: "$14.99", prepTime: "12 min", available: true },
  { name: "Penne Arrabbiata", category: "Pasta", price: "$13.99", prepTime: "12 min", available: true },
  { name: "Lasagna Bolognese", category: "Pasta", price: "$18.99", prepTime: "20 min", available: true },
  { name: "Margherita Pizza", category: "Pizza", price: "$14.99", prepTime: "15 min", available: true },
  { name: "Pepperoni Pizza", category: "Pizza", price: "$16.99", prepTime: "15 min", available: true },
  { name: "Quattro Formaggi", category: "Pizza", price: "$17.99", prepTime: "15 min", available: false },
  { name: "Chicken Parmigiana", category: "Main Courses", price: "$19.99", prepTime: "20 min", available: true },
  { name: "Osso Buco", category: "Main Courses", price: "$28.99", prepTime: "25 min", available: true },
  { name: "Grilled Salmon", category: "Main Courses", price: "$24.99", prepTime: "18 min", available: true },
  { name: "Caesar Salad", category: "Salads", price: "$9.99", prepTime: "5 min", available: true },
  { name: "Arugula Salad", category: "Salads", price: "$10.99", prepTime: "5 min", available: true },
  { name: "Tiramisu", category: "Desserts", price: "$8.99", prepTime: "5 min", available: true },
  { name: "Panna Cotta", category: "Desserts", price: "$7.99", prepTime: "5 min", available: true },
  { name: "Cannoli", category: "Desserts", price: "$6.99", prepTime: "5 min", available: true },
  { name: "House Red Wine", category: "Beverages", price: "$9.99", prepTime: "1 min", available: true },
  { name: "Espresso", category: "Beverages", price: "$3.99", prepTime: "2 min", available: true },
];

export default function DemoMenuPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Menu</h1>
        <p className="text-sm text-muted-foreground mt-1">26 items across 8 categories</p>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((c, i) => (
          <span
            key={c}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
              i === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
            }`}
          >
            {c}
          </span>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <div key={item.name} className="border rounded-xl p-4 bg-card hover:border-primary/30 transition-colors">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="font-semibold text-sm">{item.name}</h3>
                <p className="text-xs text-muted-foreground">{item.category}</p>
              </div>
              <span className="text-lg font-bold text-primary">{item.price}</span>
            </div>
            <div className="flex items-center justify-between mt-3">
              <span className="text-xs text-muted-foreground">Prep: {item.prepTime}</span>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                item.available
                  ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
                  : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
              }`}>
                {item.available ? "Available" : "Unavailable"}
              </span>
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground text-center">Demo mode — showing sample data</p>
    </div>
  );
}
