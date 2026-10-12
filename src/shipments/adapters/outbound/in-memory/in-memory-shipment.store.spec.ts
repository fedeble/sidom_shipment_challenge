import { InMemoryShipmentStore } from './in-memory-shipment.store';
import { CustomsDocumentType, ShipmentStatus } from '../../../domain';
import type { ShipmentSnapshot } from '../../../domain';

const shipment: ShipmentSnapshot = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  origin: 'Origin',
  destination: 'Destination',
  status: ShipmentStatus.CREATED,
  containers: [
    {
      id: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      reference: 'CONT-001',
      items: [],
    },
  ],
  documents: [
    {
      id: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      type: CustomsDocumentType.COMMERCIAL_INVOICE,
      reference: 'INV-001',
    },
    {
      id: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      type: CustomsDocumentType.PACKING_LIST,
      reference: 'PL-001',
    },
  ],
};

describe('InMemoryShipmentStore', () => {
  it('returns defensive deep copies', () => {
    const store = new InMemoryShipmentStore();
    store.save(shipment);

    const returned = store.get(shipment.id);
    expect(returned).toBeDefined();
    const mutable = returned as unknown as {
      containers: Array<{ items: Array<{ description: string }> }>;
    };
    const firstContainer = mutable.containers[0];
    expect(firstContainer).toBeDefined();
    firstContainer?.items.push({ description: 'local mutation' });

    expect(store.get(shipment.id)?.containers[0]?.items).toHaveLength(0);
  });

  it('does not write an invalid replacement', () => {
    const store = new InMemoryShipmentStore();
    store.save(shipment);
    const invalid = {
      ...shipment,
      containers: [],
    } as unknown as ShipmentSnapshot;

    expect(() => store.save(invalid)).toThrow();
    expect(store.get(shipment.id)).toEqual(shipment);
  });

  it('updates atomically through a synchronous updater', () => {
    const store = new InMemoryShipmentStore();
    store.save(shipment);

    const updated = store.update(shipment.id, (current) => ({
      ...current,
      origin: 'Updated origin',
    }));

    expect(updated?.origin).toBe('Updated origin');
    expect(store.get(shipment.id)?.origin).toBe('Updated origin');
  });

  it('returns undefined for an unknown shipment', () => {
    const store = new InMemoryShipmentStore();

    expect(store.get('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')).toBeUndefined();
    expect(
      store.update('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee', (current) => current),
    ).toBeUndefined();
  });

  it('does not allow an update to change the aggregate id', () => {
    const store = new InMemoryShipmentStore();
    store.save(shipment);

    expect(() =>
      store.update(shipment.id, (current) => ({
        ...current,
        id: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
      })),
    ).toThrow();
    expect(store.get(shipment.id)).toEqual(shipment);
    expect(store.get('eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee')).toBeUndefined();
  });
});
