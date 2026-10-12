import { CustomsDocumentType, ShipmentStatus } from './constants';

export interface CargoItemSnapshot {
  readonly id: string;
  readonly description: string;
  readonly quantity: number;
}

export interface ContainerSnapshot {
  readonly id: string;
  readonly reference: string;
  readonly items: readonly CargoItemSnapshot[];
}

export interface CustomsDocumentSnapshot {
  readonly id: string;
  readonly type: CustomsDocumentType;
  readonly reference: string;
}

export interface ShipmentSnapshot {
  readonly id: string;
  readonly origin: string;
  readonly destination: string;
  readonly status: ShipmentStatus;
  readonly containers: readonly ContainerSnapshot[];
  readonly documents: readonly CustomsDocumentSnapshot[];
}
