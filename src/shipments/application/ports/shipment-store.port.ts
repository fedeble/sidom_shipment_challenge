import type { ShipmentSnapshot } from '../../domain';
import type { ShipmentStatus } from '../../domain';

export type ShipmentSnapshotUpdater = (current: ShipmentSnapshot) => ShipmentSnapshot;

export interface ShipmentListQuery {
  readonly status?: ShipmentStatus;
  readonly limit: number;
  readonly size: number;
}

export interface ShipmentStore {
  get(shipmentId: string): ShipmentSnapshot | undefined;
  list(query: ShipmentListQuery): { data: ShipmentSnapshot[]; total: number };
  count(): number;
  save(shipment: ShipmentSnapshot): void;
  update(shipmentId: string, updater: ShipmentSnapshotUpdater): ShipmentSnapshot | undefined;
  clear(): void;
}
