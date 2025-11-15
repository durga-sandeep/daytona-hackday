import { Card } from "@/components/ui/card";

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  category: string;
}

const ProductCard = ({ image, name, price, category }: ProductCardProps) => {
  return (
    <Card className="group overflow-hidden border-border hover:shadow-[var(--shadow-elegant)] transition-all duration-500">
      <div className="relative aspect-square overflow-hidden bg-card">
        <img
          src={image}
          alt={name}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      </div>
      <div className="p-4 space-y-2">
        <p className="text-sm text-muted-foreground uppercase tracking-wide">{category}</p>
        <h3 className="font-semibold text-foreground">{name}</h3>
        <p className="text-accent font-bold">{price}</p>
      </div>
    </Card>
  );
};

export default ProductCard;
