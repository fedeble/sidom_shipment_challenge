import type { ShipmentSnapshot } from '../../domain';

export type ShipmentSnapshotUpdater = (current: ShipmentSnapshot) => ShipmentSnapshot;

export interface ShipmentStore {
  get(shipmentId: string): ShipmentSnapshot | undefined;
  save(shipment: ShipmentSnapshot): void;
  update(shipmentId: string, updater: ShipmentSnapshotUpdater): ShipmentSnapshot | undefined;
  clear(): void;
}
