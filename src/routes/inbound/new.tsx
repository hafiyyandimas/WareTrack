import { createFileRoute } from '@tanstack/react-router';
import { InboundForm } from '../../components/Inbound';
export const Route = createFileRoute('/inbound/new')({ component: InboundForm });
