import { createFileRoute } from '@tanstack/react-router';
import { Alerts } from '../components/Opname';
export const Route = createFileRoute('/alerts')({ component: Alerts });
