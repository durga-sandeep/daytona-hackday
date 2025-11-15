import Navigation from "@/components/Navigation";
import ProductCard from "@/components/ProductCard";
import ChatAssistant from "@/components/ChatAssistant";
import womensProduct1 from "@/assets/womens-product-1.jpg";
import womensProduct2 from "@/assets/womens-product-2.jpg";
import womensProduct3 from "@/assets/womens-product-3.jpg";

const womenProducts = [
  {
    id: 1,
    image: womensProduct1,
    name: "Designer Handbag",
    price: "$899",
    category: "Accessories"
  },
  {
    id: 2,
    image: womensProduct2,
    name: "Evening Gown",
    price: "$1,299",
    category: "Dresses"
  },
  {
    id: 3,
    image: womensProduct3,
    name: "Classic Heels",
    price: "$499",
    category: "Footwear"
  },
  {
    id: 4,
    image: womensProduct1,
    name: "Luxury Clutch",
    price: "$699",
    category: "Accessories"
  },
  {
    id: 5,
    image: womensProduct2,
    name: "Cocktail Dress",
    price: "$799",
    category: "Dresses"
  },
  {
    id: 6,
    image: womensProduct3,
    name: "Elegant Pumps",
    price: "$399",
    category: "Footwear"
  }
];

const Women = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      <div className="pt-24 pb-12 px-6">
        <div className="container mx-auto">
          <div className="mb-12 text-center">
            <h1 className="text-5xl font-bold text-foreground mb-4">Women's Collection</h1>
            <p className="text-xl text-muted-foreground">Timeless elegance meets modern sophistication</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {womenProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>
        </div>
      </div>

      <ChatAssistant />
    </div>
  );
};

export default Women;
