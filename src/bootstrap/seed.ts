import { CustomsDocumentType, ShipmentStatus } from '../shipments/domain';
import type { ShipmentSnapshot } from '../shipments/domain';
import type { ShipmentStore } from '../shipments/application/ports';

export const DEMO_SHIPMENT_ID = '11111111-1111-4111-8111-111111111111';
export const DEMO_EMPTY_CONTAINER_ID = '22222222-2222-4222-8222-222222222222';

export function seedStore(store: ShipmentStore, enabled: boolean): void {
  if (!enabled || store.get(DEMO_SHIPMENT_ID) !== undefined) {
    return;
  }

  store.save(DEMO_SHIPMENT);
}

export function isSeedEnabled(value: string | undefined): boolean {
  return value !== 'false';
}

export const DEMO_SHIPMENT: ShipmentSnapshot = {
  id: DEMO_SHIPMENT_ID,
  origin: 'Buenos Aires, Argentina',
  destination: 'Montevideo, Uruguay',
  status: ShipmentStatus.CREATED,
  containers: [
    {
      id: '22222222-2222-4222-8222-222222222221',
      reference: 'CONT-DEMO-001',
      items: [
        {
          id: '33333333-3333-4333-8333-333333333331',
          description: 'Repuestos industriales',
          quantity: 24,
        },
        {
          id: '33333333-3333-4333-8333-333333333332',
          description: 'Manual de operación',
          quantity: 24,
        },
      ],
    },
    {
      id: DEMO_EMPTY_CONTAINER_ID,
      reference: 'CONT-DEMO-002',
      items: [],
    },
  ],
  documents: [
    {
      id: '44444444-4444-4444-8444-444444444441',
      type: CustomsDocumentType.COMMERCIAL_INVOICE,
      reference: 'INV-DEMO-2026-001',
    },
    {
      id: '44444444-4444-4444-8444-444444444442',
      type: CustomsDocumentType.PACKING_LIST,
      reference: 'PL-DEMO-2026-001',
    },
  ],
};
