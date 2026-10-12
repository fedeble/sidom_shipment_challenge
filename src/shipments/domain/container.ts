import { CargoItem } from './cargo-item';
import { MAX_CONTAINER_REFERENCE_LENGTH } from './constants';
import { ContainerSnapshot } from './snapshots';
import { requiredText, uuidV4 } from './validation';

export class Container {
  private constructor(
    public readonly id: string,
    public readonly reference: string,
    private readonly itemEntities: readonly CargoItem[],
  ) {}

  public static create(id: string, reference: string, items: readonly CargoItem[] = []): Container {
    return new Container(
      uuidV4(id, 'container.id'),
      requiredText(reference, 'container.reference', MAX_CONTAINER_REFERENCE_LENGTH),
      [...items],
    );
  }

  public static fromSnapshot(snapshot: ContainerSnapshot): Container {
    return Container.create(
      snapshot.id,
      snapshot.reference,
      snapshot.items.map((item) => CargoItem.fromSnapshot(item)),
    );
  }

  public get items(): readonly CargoItem[] {
    return this.itemEntities;
  }

  public addItem(item: CargoItem): Container {
    return new Container(this.id, this.reference, [...this.itemEntities, item]);
  }

  public toSnapshot(): ContainerSnapshot {
    return {
      id: this.id,
      reference: this.reference,
      items: this.itemEntities.map((item) => item.toSnapshot()),
    };
  }
}
