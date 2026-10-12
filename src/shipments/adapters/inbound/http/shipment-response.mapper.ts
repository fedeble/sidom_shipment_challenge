import type { ShipmentSnapshot } from '../../../domain';
import type { ShipmentResponseDto } from './dtos';

export function toShipmentResponse(snapshot: ShipmentSnapshot): ShipmentResponseDto {
  return {
    id: snapshot.id,
    origin: snapshot.origin,
    destination: snapshot.destination,
    status: snapshot.status,
    containers: snapshot.containers.map((container) => ({
      id: container.id,
      reference: container.reference,
      items: container.items.map((item) => ({
        id: item.id,
        description: item.description,
        quantity: item.quantity,
      })),
    })),
    documents: snapshot.documents.map((document) => ({
      id: document.id,
      type: document.type,
      reference: document.reference,
    })),
  };
}
