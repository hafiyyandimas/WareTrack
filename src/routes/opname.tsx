import { createFileRoute } from '@tanstack/react-router';
import { Opname } from '../components/Opname';
export const Route = createFileRoute('/opname')({ component: Opname });
