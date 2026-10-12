export type DomainErrorCode =
  'INVALID_DOMAIN_DATA' | 'BUSINESS_RULE_VIOLATION' | 'CONTAINER_NOT_FOUND';

export class DomainError extends Error {
  public readonly code: DomainErrorCode;

  public constructor(code: DomainErrorCode, message: string) {
    super(message);
    this.name = 'DomainError';
    this.code = code;
  }
}

export class DomainValidationError extends DomainError {
  public constructor(message: string) {
    super('INVALID_DOMAIN_DATA', message);
    this.name = 'DomainValidationError';
  }
}

export class BusinessRuleError extends DomainError {
  public constructor(message: string) {
    super('BUSINESS_RULE_VIOLATION', message);
    this.name = 'BusinessRuleError';
  }
}

export class ContainerNotFoundError extends DomainError {
  public constructor(containerId: string) {
    super('CONTAINER_NOT_FOUND', `Container ${containerId} does not belong to the shipment`);
    this.name = 'ContainerNotFoundError';
  }
}
