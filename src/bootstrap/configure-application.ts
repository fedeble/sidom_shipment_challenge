import { BadRequestException, ValidationPipe } from '@nestjs/common';
import type { INestApplication } from '@nestjs/common';
import { json } from 'express';

import { HttpExceptionFilter } from '../shipments/adapters/inbound/http';

const HTTP_BODY_LIMIT = '100kb';

export function configureApplication(app: INestApplication): void {
  app.use(json({ limit: HTTP_BODY_LIMIT }));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
      exceptionFactory: (errors): BadRequestException => {
        const details = errors.flatMap((error) => Object.values(error.constraints ?? {}));
        return new BadRequestException({
          statusCode: 400,
          message: 'Request validation failed',
          details,
        });
      },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
}
