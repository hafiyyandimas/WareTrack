import { createFileRoute } from '@tanstack/react-router';
import { Reports } from '../components/Opname';
export const Route = createFileRoute('/reports')({ component: Reports });
