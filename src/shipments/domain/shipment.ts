import { CargoItem } from './cargo-item';
import {
  CustomsDocumentType,
  MAX_CONTAINERS,
  MAX_ORIGIN_DESTINATION_LENGTH,
  ShipmentStatus,
} from './constants';
import { BusinessRuleError, ContainerNotFoundError } from './errors';
import { Container } from './container';
import { CustomsDocument } from './customs-document';
import { ShipmentSnapshot } from './snapshots';
import { requiredText, uuidV4 } from './validation';

export interface NewShipment {
  readonly id: string;
  readonly origin: string;
  readonly destination: string;
  readonly containers: readonly Container[];
  readonly documents: readonly CustomsDocument[];
}

export class Shipment {
  private constructor(
    public readonly id: string,
    public readonly origin: string,
    public readonly destination: string,
    public readonly status: ShipmentStatus,
    private readonly containerEntities: readonly Container[],
    private readonly documentEntities: readonly CustomsDocument[],
  ) {}

  public static create(input: NewShipment): Shipment {
    const containers = [...input.containers];
    const documents = [...input.documents];

    if (containers.length < 1 || containers.length > MAX_CONTAINERS) {
      throw new BusinessRuleError(
        `shipment.containers must contain between 1 and ${MAX_CONTAINERS} items`,
      );
    }

    validateDocuments(documents);

    return new Shipment(
      uuidV4(input.id, 'shipment.id'),
      requiredText(input.origin, 'shipment.origin', MAX_ORIGIN_DESTINATION_LENGTH),
      requiredText(input.destination, 'shipment.destination', MAX_ORIGIN_DESTINATION_LENGTH),
      ShipmentStatus.CREATED,
      containers,
      documents,
    );
  }

  public static fromSnapshot(snapshot: ShipmentSnapshot): Shipment {
    return Shipment.create({
      id: snapshot.id,
      origin: snapshot.origin,
      destination: snapshot.destination,
      containers: snapshot.containers.map((container) => Container.fromSnapshot(container)),
      documents: snapshot.documents.map((document) => CustomsDocument.fromSnapshot(document)),
    });
  }

  public get containers(): readonly Container[] {
    return this.containerEntities;
  }

  public get documents(): readonly CustomsDocument[] {
    return this.documentEntities;
  }

  public addCargoItem(containerId: string, item: CargoItem): Shipment {
    const containerIndex = this.containerEntities.findIndex(
      (container) => container.id === containerId,
    );
    if (containerIndex === -1) {
      throw new ContainerNotFoundError(containerId);
    }

    const currentContainer = this.containerEntities[containerIndex];
    if (currentContainer === undefined) {
      throw new ContainerNotFoundError(containerId);
    }

    const updatedContainers = [...this.containerEntities];
    updatedContainers[containerIndex] = currentContainer.addItem(item);

    return new Shipment(
      this.id,
      this.origin,
      this.destination,
      this.status,
      updatedContainers,
      this.documentEntities,
    );
  }

  public toSnapshot(): ShipmentSnapshot {
    return {
      id: this.id,
      origin: this.origin,
      destination: this.destination,
      status: this.status,
      containers: this.containerEntities.map((container) => container.toSnapshot()),
      documents: this.documentEntities.map((document) => document.toSnapshot()),
    };
  }
}

function validateDocuments(documents: readonly CustomsDocument[]): void {
  if (documents.length !== 2) {
    throw new BusinessRuleError('shipment.documents must contain exactly two documents');
  }

  const types = documents.map((document) => document.type);
  const hasInvoice = types.includes(CustomsDocumentType.COMMERCIAL_INVOICE);
  const hasPackingList = types.includes(CustomsDocumentType.PACKING_LIST);
  if (!hasInvoice || !hasPackingList || new Set(types).size !== 2) {
    throw new BusinessRuleError(
      'shipment.documents must contain one COMMERCIAL_INVOICE and one PACKING_LIST',
    );
  }
}
