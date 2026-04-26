import { createFileRoute } from '@tanstack/react-router';
import { Products } from '../../components/Products';
export const Route = createFileRoute('/products/')({ component: Products });
