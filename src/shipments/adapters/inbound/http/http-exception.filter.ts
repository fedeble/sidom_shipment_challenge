import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';

import { ShipmentNotFoundError } from '../../../application';
import { BusinessRuleError, ContainerNotFoundError, DomainValidationError } from '../../../domain';

interface ErrorResponse {
  readonly statusCode: number;
  readonly code: string;
  readonly message: string;
  readonly details?: readonly string[];
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  public catch(exception: unknown, host: ArgumentsHost): void {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const error = this.toErrorResponse(exception);

    response.status(error.statusCode).json(error);
  }

  private toErrorResponse(exception: unknown): ErrorResponse {
    if (exception instanceof ShipmentNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        code: 'SHIPMENT_NOT_FOUND',
        message: exception.message,
      };
    }

    if (exception instanceof ContainerNotFoundError) {
      return {
        statusCode: HttpStatus.NOT_FOUND,
        code: 'CONTAINER_NOT_FOUND',
        message: exception.message,
      };
    }

    if (exception instanceof DomainValidationError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'VALIDATION_ERROR',
        message: exception.message,
      };
    }

    if (exception instanceof BusinessRuleError) {
      return {
        statusCode: HttpStatus.BAD_REQUEST,
        code: 'BUSINESS_RULE_VIOLATION',
        message: exception.message,
      };
    }

    if (exception instanceof HttpException) {
      return this.fromHttpException(exception);
    }

    return {
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    };
  }

  private fromHttpException(exception: HttpException): ErrorResponse {
    const statusCode = exception.getStatus();
    const exceptionResponse = exception.getResponse();
    if (isValidationResponse(exceptionResponse)) {
      return {
        statusCode,
        code: 'VALIDATION_ERROR',
        message: exceptionResponse.message,
        details: exceptionResponse.details,
      };
    }

    return {
      statusCode,
      code: statusCode >= 500 ? 'INTERNAL_ERROR' : 'VALIDATION_ERROR',
      message: statusCode >= 500 ? 'An unexpected error occurred' : 'Request is invalid',
    };
  }
}

function isValidationResponse(value: string | object): value is {
  message: string;
  details: readonly string[];
} {
  return (
    typeof value === 'object' &&
    value !== null &&
    'message' in value &&
    typeof value.message === 'string' &&
    'details' in value &&
    Array.isArray(value.details)
  );
}
