import { randomUUID } from 'node:crypto';

import { CargoItem, Shipment, type CargoItemSnapshot } from '../../domain';
import { ShipmentNotFoundError } from '../errors';
import type { ShipmentStore } from '../ports';

export interface AddCargoItemCommand {
  readonly shipmentId: string;
  readonly containerId: string;
  readonly description: string;
  readonly quantity: number;
}

export class AddCargoItemUseCase {
  public constructor(private readonly store: ShipmentStore) {}

  public execute(command: AddCargoItemCommand): CargoItemSnapshot {
    const item = CargoItem.create(randomUUID(), command.description, command.quantity);
    const updated = this.store.update(command.shipmentId, (current) =>
      Shipment.fromSnapshot(current).addCargoItem(command.containerId, item).toSnapshot(),
    );

    if (updated === undefined) {
      throw new ShipmentNotFoundError(command.shipmentId);
    }

    const addedItem = updated.containers
      .find((container) => container.id === command.containerId)
      ?.items.find((candidate) => candidate.id === item.id);
    if (addedItem === undefined) {
      throw new Error('Created cargo item was not found in the updated shipment');
    }

    return addedItem;
  }
}
