import { createFileRoute } from '@tanstack/react-router';
import { OutboundForm } from '../../components/Inbound';
export const Route = createFileRoute('/outbound/new')({ component: OutboundForm });
