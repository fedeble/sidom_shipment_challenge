import type { ShipmentSnapshot } from '../../domain';
import type { ShipmentListQuery, ShipmentStore } from '../ports';

export interface ListShipmentsResult {
  readonly data: ShipmentSnapshot[];
  readonly total: number;
}

export class ListShipmentsUseCase {
  public constructor(private readonly store: ShipmentStore) {}

  public execute(query: ShipmentListQuery): ListShipmentsResult {
    return this.store.list(query);
  }
}
