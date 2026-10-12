import { Module } from '@nestjs/common';

import { SHIPMENT_STORE } from './application/ports';
import {
  AddCargoItemUseCase,
  CreateShipmentUseCase,
  GetShipmentUseCase,
  ListShipmentsUseCase,
} from './application';
import { ShipmentsController } from './adapters/inbound/http';
import { InMemoryShipmentStore } from './adapters/outbound/in-memory/in-memory-shipment.store';

@Module({
  controllers: [ShipmentsController],
  providers: [
    InMemoryShipmentStore,
    {
      provide: SHIPMENT_STORE,
      useExisting: InMemoryShipmentStore,
    },
    {
      provide: CreateShipmentUseCase,
      useFactory: (store: import('./application/ports').ShipmentStore): CreateShipmentUseCase =>
        new CreateShipmentUseCase(store),
      inject: [SHIPMENT_STORE],
    },
    {
      provide: GetShipmentUseCase,
      useFactory: (store: import('./application/ports').ShipmentStore): GetShipmentUseCase =>
        new GetShipmentUseCase(store),
      inject: [SHIPMENT_STORE],
    },
    {
      provide: AddCargoItemUseCase,
      useFactory: (store: import('./application/ports').ShipmentStore): AddCargoItemUseCase =>
        new AddCargoItemUseCase(store),
      inject: [SHIPMENT_STORE],
    },
    {
      provide: ListShipmentsUseCase,
      useFactory: (store: import('./application/ports').ShipmentStore): ListShipmentsUseCase =>
        new ListShipmentsUseCase(store),
      inject: [SHIPMENT_STORE],
    },
  ],
  exports: [SHIPMENT_STORE],
})
export class ShipmentsModule {}
