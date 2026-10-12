import { InMemoryShipmentStore } from '../shipments/adapters/outbound/in-memory/in-memory-shipment.store';
import { DEMO_EMPTY_CONTAINER_ID, DEMO_SHIPMENT_ID, isSeedEnabled, seedStore } from './seed';

describe('demo seed', () => {
  it('loads the fixture once and keeps the operation idempotent', () => {
    const store = new InMemoryShipmentStore();

    seedStore(store, true);
    const first = store.get(DEMO_SHIPMENT_ID);
    seedStore(store, true);

    expect(first?.containers).toHaveLength(2);
    expect(
      first?.containers.find((container) => container.id === DEMO_EMPTY_CONTAINER_ID)?.items,
    ).toEqual([]);
    expect(store.get(DEMO_SHIPMENT_ID)).toEqual(first);
  });

  it('does not load the fixture when disabled', () => {
    const store = new InMemoryShipmentStore();

    seedStore(store, false);

    expect(store.get(DEMO_SHIPMENT_ID)).toBeUndefined();
  });

  it.each([
    [undefined, true],
    ['true', true],
    ['false', false],
  ])('interprets SEED_ENABLED=%s as %s', (value, expected) => {
    expect(isSeedEnabled(value)).toBe(expected);
  });
});
