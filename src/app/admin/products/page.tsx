import { ProductManager } from "@/components/admin/product-manager";
import { getProducts } from "@/lib/data";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await getProducts();
  return <ProductManager initialProducts={products} />;
}
