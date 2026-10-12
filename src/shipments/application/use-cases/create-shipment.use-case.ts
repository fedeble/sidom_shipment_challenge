import { randomUUID } from 'node:crypto';

import {
  Container,
  CustomsDocument,
  Shipment,
  type CustomsDocumentType,
  type ShipmentSnapshot,
} from '../../domain';
import type { ShipmentStore } from '../ports';

export interface CreateShipmentCommand {
  readonly origin: string;
  readonly destination: string;
  readonly containers: readonly { readonly reference: string }[];
  readonly documents: readonly {
    readonly type: CustomsDocumentType;
    readonly reference: string;
  }[];
}

export class CreateShipmentUseCase {
  public constructor(private readonly store: ShipmentStore) {}

  public execute(command: CreateShipmentCommand): ShipmentSnapshot {
    const shipment = Shipment.create({
      id: randomUUID(),
      origin: command.origin,
      destination: command.destination,
      containers: command.containers.map((container) =>
        Container.create(randomUUID(), container.reference),
      ),
      documents: command.documents.map((document) =>
        CustomsDocument.create(randomUUID(), document.type, document.reference),
      ),
    });

    const snapshot = shipment.toSnapshot();
    this.store.save(snapshot);
    return this.store.get(snapshot.id) ?? snapshot;
  }
}
