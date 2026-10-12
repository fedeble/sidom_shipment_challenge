import {
  BusinessRuleError,
  CargoItem,
  Container,
  ContainerNotFoundError,
  CustomsDocument,
  CustomsDocumentType,
  DomainValidationError,
  Shipment,
  ShipmentStatus,
} from './index';

const IDS = {
  shipment: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  firstContainer: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
  secondContainer: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
  item: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
  invoice: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
  packingList: 'ffffffff-ffff-4fff-8fff-ffffffffffff',
};

function createShipment(): Shipment {
  return Shipment.create({
    id: IDS.shipment,
    origin: ' Buenos Aires ',
    destination: 'Montevideo',
    containers: [
      Container.create(IDS.firstContainer, 'CONT-001'),
      Container.create(IDS.secondContainer, 'CONT-002'),
    ],
    documents: [
      CustomsDocument.create(IDS.invoice, CustomsDocumentType.COMMERCIAL_INVOICE, 'INV-001'),
      CustomsDocument.create(IDS.packingList, CustomsDocumentType.PACKING_LIST, 'PL-001'),
    ],
  });
}

describe('Shipment aggregate', () => {
  it('creates a valid aggregate with server-controlled CREATED status', () => {
    const shipment = createShipment();

    expect(shipment.status).toBe(ShipmentStatus.CREATED);
    expect(shipment.origin).toBe('Buenos Aires');
    expect(shipment.containers).toHaveLength(2);
    expect(shipment.containers[0]?.items).toHaveLength(0);
  });

  it.each([
    ['no containers', []],
    [
      'too many containers',
      Array.from({ length: 51 }, (_, index) => Container.create(uuid(index), `C-${index}`)),
    ],
  ])('rejects creation when there are %s', (_reason, containers) => {
    expect(() =>
      Shipment.create({
        id: IDS.shipment,
        origin: 'Origin',
        destination: 'Destination',
        containers,
        documents: validDocuments(),
      }),
    ).toThrow(BusinessRuleError);
  });

  it('requires exactly one invoice and one packing list', () => {
    const invoice = CustomsDocument.create(
      IDS.invoice,
      CustomsDocumentType.COMMERCIAL_INVOICE,
      'INV-001',
    );

    expect(() =>
      Shipment.create({
        id: IDS.shipment,
        origin: 'Origin',
        destination: 'Destination',
        containers: [Container.create(IDS.firstContainer, 'C-001')],
        documents: [invoice, invoice],
      }),
    ).toThrow(BusinessRuleError);
  });

  it('rejects invalid item values in the domain', () => {
    expect(() => CargoItem.create(IDS.item, ' ', 1)).toThrow(DomainValidationError);
    expect(() => CargoItem.create(IDS.item, 'Item', 0)).toThrow(DomainValidationError);
    expect(() => CargoItem.create(IDS.item, 'Item', 1.5)).toThrow(DomainValidationError);
  });

  it('adds an item immutably to the selected container', () => {
    const shipment = createShipment();
    const item = CargoItem.create(IDS.item, 'Repuestos', 24);
    const updated = shipment.addCargoItem(IDS.secondContainer, item);

    expect(shipment.containers[1]?.items).toHaveLength(0);
    expect(updated.containers[0]?.items).toHaveLength(0);
    expect(updated.containers[1]?.items[0]?.description).toBe('Repuestos');
  });

  it('rejects an item for a container outside the aggregate', () => {
    expect(() =>
      createShipment().addCargoItem(IDS.item, CargoItem.create(IDS.item, 'Item', 1)),
    ).toThrow(ContainerNotFoundError);
  });
});

function validDocuments(): [CustomsDocument, CustomsDocument] {
  return [
    CustomsDocument.create(IDS.invoice, CustomsDocumentType.COMMERCIAL_INVOICE, 'INV-001'),
    CustomsDocument.create(IDS.packingList, CustomsDocumentType.PACKING_LIST, 'PL-001'),
  ];
}

function uuid(index: number): string {
  return `${index.toString(16).padStart(8, '0')}-0000-4000-8000-000000000000`;
}
