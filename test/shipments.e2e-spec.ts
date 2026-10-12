import { INestApplication } from '@nestjs/common';
import type { Server } from 'node:http';
import { Test } from '@nestjs/testing';
// eslint-disable-next-line @typescript-eslint/no-require-imports
import request = require('supertest');

import { AppModule } from '../src/app.module';
import { configureApplication, setupOpenApi } from '../src/bootstrap';
import { SHIPMENT_STORE, type ShipmentStore } from '../src/shipments/application/ports';

interface ShipmentBody {
  readonly id: string;
  readonly status: string;
  readonly containers: readonly { readonly id: string; readonly items: readonly unknown[] }[];
}

interface ItemBody {
  readonly description: string;
  readonly quantity: number;
}

interface ErrorBody {
  readonly code: string;
}

interface OpenApiBody {
  readonly paths: Record<string, unknown>;
}

interface ShipmentListBody {
  readonly data: readonly ShipmentBody[];
  readonly total: number;
  readonly limit: number;
  readonly size: number;
}

describe('Shipments HTTP API', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const module = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = module.createNestApplication();
    configureApplication(app);
    setupOpenApi(app);
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('creates, adds an item, and reads the complete shipment', async () => {
    const server = app.getHttpServer() as Server;
    const createResponse = await request(server)
      .post('/shipments')
      .send({
        origin: 'Buenos Aires, Argentina',
        destination: 'Montevideo, Uruguay',
        containers: [{ reference: 'CONT-001' }, { reference: 'CONT-002' }],
        documents: [
          { type: 'COMMERCIAL_INVOICE', reference: 'INV-001' },
          { type: 'PACKING_LIST', reference: 'PL-001' },
        ],
      });
    const createdShipment = createResponse.body as ShipmentBody;

    expect(createResponse.status).toBe(201);
    expect(createdShipment.status).toBe('CREATED');
    expect(createdShipment.containers).toHaveLength(2);
    expect(createdShipment.containers[1]?.items).toEqual([]);

    const shipmentId = createdShipment.id;
    const containerId = createdShipment.containers[1]?.id;
    expect(containerId).toBeDefined();
    const itemResponse = await request(server)
      .post(`/shipments/${shipmentId}/containers/${containerId}/items`)
      .send({ description: 'Repuestos industriales', quantity: 24 });
    const createdItem = itemResponse.body as ItemBody;

    expect(itemResponse.status).toBe(201);
    expect(createdItem).toEqual(
      expect.objectContaining({ description: 'Repuestos industriales', quantity: 24 }),
    );

    const getResponse = await request(server).get(`/shipments/${shipmentId}`);
    const retrievedShipment = getResponse.body as ShipmentBody;
    expect(getResponse.status).toBe(200);
    expect(retrievedShipment.containers[0]?.items).toEqual([]);
    expect(retrievedShipment.containers[1]?.items).toHaveLength(1);
  });

  it('rejects unknown properties and unknown shipments with stable errors', async () => {
    const server = app.getHttpServer() as Server;
    const invalidResponse = await request(server)
      .post('/shipments')
      .send({
        origin: 'Origin',
        destination: 'Destination',
        unexpected: true,
        containers: [{ reference: 'CONT-001' }],
        documents: [
          { type: 'COMMERCIAL_INVOICE', reference: 'INV-001' },
          { type: 'PACKING_LIST', reference: 'PL-001' },
        ],
      });
    const invalidBody = invalidResponse.body as ErrorBody;
    expect(invalidResponse.status).toBe(400);
    expect(invalidBody.code).toBe('VALIDATION_ERROR');

    const missingResponse = await request(server).get(
      '/shipments/aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    );
    const missingBody = missingResponse.body as ErrorBody;
    expect(missingResponse.status).toBe(404);
    expect(missingBody.code).toBe('SHIPMENT_NOT_FOUND');
  });

  it('rejects invalid creation rules without leaving partial shipments', async () => {
    const server = app.getHttpServer() as Server;
    const store = app.get<ShipmentStore>(SHIPMENT_STORE);
    const before = store.count();
    const invalidPayloads: readonly Record<string, unknown>[] = [
      { ...validShipmentPayload(), containers: [] },
      {
        ...validShipmentPayload(),
        documents: [{ type: 'PACKING_LIST', reference: 'PL-001' }],
      },
      {
        ...validShipmentPayload(),
        documents: [
          { type: 'COMMERCIAL_INVOICE', reference: 'INV-001' },
          { type: 'COMMERCIAL_INVOICE', reference: 'INV-002' },
        ],
      },
      {
        ...validShipmentPayload(),
        documents: [
          { type: 'UNKNOWN', reference: 'DOC-001' },
          { type: 'PACKING_LIST', reference: 'PL-001' },
        ],
      },
    ];

    for (const payload of invalidPayloads) {
      const response = await request(server).post('/shipments').send(payload);
      expect(response.status).toBe(400);
      expect((response.body as ErrorBody).code).toMatch(/VALIDATION|BUSINESS/);
    }

    expect(store.count()).toBe(before);
  });

  it('rejects invalid item values and malformed UUIDs', async () => {
    const server = app.getHttpServer() as Server;
    const shipment = await createShipment(server);
    const containerId = shipment.containers[0]?.id;

    expect(containerId).toBeDefined();
    for (const body of [
      { description: 'Item', quantity: 0 },
      { description: 'Item', quantity: -1 },
      { description: 'Item', quantity: 1.5 },
      { description: '   ', quantity: 1 },
    ]) {
      const response = await request(server)
        .post(`/shipments/${shipment.id}/containers/${containerId}/items`)
        .send(body);
      expect(response.status).toBe(400);
      expect((response.body as ErrorBody).code).toBe('VALIDATION_ERROR');
    }

    const invalidUuidResponse = await request(server).get('/shipments/not-a-uuid');
    expect(invalidUuidResponse.status).toBe(400);
    expect((invalidUuidResponse.body as ErrorBody).code).toBe('VALIDATION_ERROR');
  });

  it('rejects a container that belongs to another shipment without changing either one', async () => {
    const server = app.getHttpServer() as Server;
    const first = await createShipment(server);
    const second = await createShipment(server);
    const foreignContainerId = first.containers[0]?.id;

    expect(foreignContainerId).toBeDefined();
    const response = await request(server)
      .post(`/shipments/${second.id}/containers/${foreignContainerId}/items`)
      .send({ description: 'No debe agregarse', quantity: 1 });

    expect(response.status).toBe(404);
    expect((response.body as ErrorBody).code).toBe('CONTAINER_NOT_FOUND');
    const firstAfter = await request(server).get(`/shipments/${first.id}`);
    const secondAfter = await request(server).get(`/shipments/${second.id}`);
    expect((firstAfter.body as ShipmentBody).containers[0]?.items).toHaveLength(0);
    expect((secondAfter.body as ShipmentBody).containers[0]?.items).toHaveLength(0);
  });

  it('preserves both item additions when requests arrive concurrently', async () => {
    const server = app.getHttpServer() as Server;
    const shipment = await createShipment(server);
    const containerId = shipment.containers[0]?.id;

    expect(containerId).toBeDefined();
    const responses = await Promise.all([
      request(server)
        .post(`/shipments/${shipment.id}/containers/${containerId}/items`)
        .send({ description: 'Item concurrent 1', quantity: 1 }),
      request(server)
        .post(`/shipments/${shipment.id}/containers/${containerId}/items`)
        .send({ description: 'Item concurrent 2', quantity: 2 }),
    ]);

    expect(responses.map((response) => response.status)).toEqual([201, 201]);
    const finalResponse = await request(server).get(`/shipments/${shipment.id}`);
    expect((finalResponse.body as ShipmentBody).containers[0]?.items).toHaveLength(2);
  });

  it('lists shipments with numeric pagination query parameters', async () => {
    const server = app.getHttpServer() as Server;
    await createShipment(server);

    const response = await request(server)
      .get('/shipments')
      .query({ status: 'CREATED', limit: 1, size: 1 });

    expect(response.status).toBe(200);
    const body = response.body as ShipmentListBody;
    expect(body.total).toBeGreaterThanOrEqual(1);
    expect(body.limit).toBe(1);
    expect(body.size).toBe(1);
    expect(body.data).toHaveLength(1);
  });

  it('exposes liveness and readiness endpoints', async () => {
    const server = app.getHttpServer() as Server;
    await request(server).get('/liveness').expect(200).expect({ status: 'ok' });
    await request(server).get('/readiness').expect(200).expect({ status: 'ok' });
  });

  it('publishes Swagger UI and the generated OpenAPI document', async () => {
    const server = app.getHttpServer() as Server;
    const docsResponse = await request(server).get('/docs');
    const openApiResponse = await request(server).get('/openapi.json');
    const openApiBody = openApiResponse.body as OpenApiBody;

    expect(docsResponse.status).toBe(200);
    expect(openApiResponse.status).toBe(200);
    expect(openApiBody.paths['/shipments']).toBeDefined();
    expect(openApiBody.paths['/shipments/{shipmentId}']).toBeDefined();
  });
});

function validShipmentPayload(): Record<string, unknown> {
  return {
    origin: 'Buenos Aires, Argentina',
    destination: 'Montevideo, Uruguay',
    containers: [{ reference: 'CONT-001' }],
    documents: [
      { type: 'COMMERCIAL_INVOICE', reference: 'INV-001' },
      { type: 'PACKING_LIST', reference: 'PL-001' },
    ],
  };
}

async function createShipment(server: Server): Promise<ShipmentBody> {
  const response = await request(server).post('/shipments').send(validShipmentPayload());
  expect(response.status).toBe(201);
  return response.body as ShipmentBody;
}
