import { Injectable } from '@nestjs/common';

import { BusinessRuleError, Shipment } from '../../../domain';
import type { ShipmentSnapshot } from '../../../domain';
import type { ShipmentSnapshotUpdater, ShipmentStore } from '../../../application/ports';

@Injectable()
export class InMemoryShipmentStore implements ShipmentStore {
  private readonly shipments = new Map<string, ShipmentSnapshot>();

  public get(shipmentId: string): ShipmentSnapshot | undefined {
    const snapshot = this.shipments.get(shipmentId);
    return snapshot === undefined ? undefined : cloneSnapshot(snapshot);
  }

  public save(snapshot: ShipmentSnapshot): void {
    const validated = Shipment.fromSnapshot(snapshot).toSnapshot();
    this.shipments.set(validated.id, cloneSnapshot(validated));
  }

  public update(
    shipmentId: string,
    updater: ShipmentSnapshotUpdater,
  ): ShipmentSnapshot | undefined {
    const current = this.shipments.get(shipmentId);
    if (current === undefined) {
      return undefined;
    }

    const candidate = updater(cloneSnapshot(current));
    if (candidate.id !== shipmentId) {
      throw new BusinessRuleError('shipment update cannot change the aggregate id');
    }

    const validated = Shipment.fromSnapshot(candidate).toSnapshot();
    this.shipments.set(validated.id, cloneSnapshot(validated));
    return cloneSnapshot(validated);
  }

  public clear(): void {
    this.shipments.clear();
  }
}

function cloneSnapshot(snapshot: ShipmentSnapshot): ShipmentSnapshot {
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
