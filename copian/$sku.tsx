import { createFileRoute } from '@tanstack/react-router';
import { ProductDetail } from '../../components/Products';
export const Route = createFileRoute('/products/$sku')({
  component: function ProductDetailPage() {
    const { sku } = Route.useParams();
    return <ProductDetail sku={sku} />;
  },
});
