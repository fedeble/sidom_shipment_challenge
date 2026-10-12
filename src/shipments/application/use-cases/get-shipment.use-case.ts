import type { ShipmentSnapshot } from '../../domain';
import { ShipmentNotFoundError } from '../errors';
import type { ShipmentStore } from '../ports';

export class GetShipmentUseCase {
  public constructor(private readonly store: ShipmentStore) {}

  public execute(shipmentId: string): ShipmentSnapshot {
    const shipment = this.store.get(shipmentId);
    if (shipment === undefined) {
      throw new ShipmentNotFoundError(shipmentId);
    }

    return shipment;
  }
}
