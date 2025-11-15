import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import ChatAssistant from "@/components/ChatAssistant";
import mensProduct1 from "@/assets/mens-product-1.jpg";
import mensProduct2 from "@/assets/mens-product-2.jpg";
import mensProduct3 from "@/assets/mens-product-3.jpg";

const menProducts = [
  {
    id: 1,
    image: mensProduct1,
    name: "Premium Black Blazer",
    price: "$599",
    category: "Tailoring"
  },
  {
    id: 2,
    image: mensProduct2,
    name: "Luxury Timepiece",
    price: "$1,299",
    category: "Accessories"
  },
  {
    id: 3,
    image: mensProduct3,
    name: "Designer Sneakers",
    price: "$399",
    category: "Footwear"
  },
  {
    id: 4,
    image: mensProduct1,
    name: "Classic Suit Jacket",
    price: "$699",
    category: "Tailoring"
  },
  {
    id: 5,
    image: mensProduct2,
    name: "Elegant Watch",
    price: "$899",
    category: "Accessories"
  },
  {
    id: 6,
    image: mensProduct3,
    name: "Casual Sneakers",
    price: "$299",
    category: "Footwear"
  }
];

const Men = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-4">Men's Collection</h1>
            <p className="text-xl text-muted-foreground">Curated essentials for the modern gentleman</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {menProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>

      <ChatAssistant />
    </div>
  );
};

export default Men;
