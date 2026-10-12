export class ShipmentNotFoundError extends Error {
  public constructor(shipmentId: string) {
    super(`Shipment ${shipmentId} was not found`);
    this.name = 'ShipmentNotFoundError';
  }
}
