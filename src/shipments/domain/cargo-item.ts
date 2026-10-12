import { MAX_ITEM_DESCRIPTION_LENGTH, MAX_ITEM_QUANTITY } from './constants';
import { CargoItemSnapshot } from './snapshots';
import { positiveInteger, requiredText, uuidV4 } from './validation';

export class CargoItem {
  private constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly quantity: number,
  ) {}

  public static create(id: string, description: string, quantity: number): CargoItem {
    return new CargoItem(
      uuidV4(id, 'item.id'),
      requiredText(description, 'item.description', MAX_ITEM_DESCRIPTION_LENGTH),
      positiveInteger(quantity, 'item.quantity', MAX_ITEM_QUANTITY),
    );
  }

  public static fromSnapshot(snapshot: CargoItemSnapshot): CargoItem {
    return CargoItem.create(snapshot.id, snapshot.description, snapshot.quantity);
  }

  public toSnapshot(): CargoItemSnapshot {
    return {
      id: this.id,
      description: this.description,
      quantity: this.quantity,
    };
  }
}
