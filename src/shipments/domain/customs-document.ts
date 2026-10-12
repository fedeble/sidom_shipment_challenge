import { CustomsDocumentType, MAX_DOCUMENT_REFERENCE_LENGTH } from './constants';
import { DomainValidationError } from './errors';
import { CustomsDocumentSnapshot } from './snapshots';
import { requiredText, uuidV4 } from './validation';

export class CustomsDocument {
  private constructor(
    public readonly id: string,
    public readonly type: CustomsDocumentType,
    public readonly reference: string,
  ) {}

  public static create(id: string, type: CustomsDocumentType, reference: string): CustomsDocument {
    if (!Object.values(CustomsDocumentType).includes(type)) {
      throw new DomainValidationError(`document.type is not supported: ${String(type)}`);
    }

    return new CustomsDocument(
      uuidV4(id, 'document.id'),
      type,
      requiredText(reference, 'document.reference', MAX_DOCUMENT_REFERENCE_LENGTH),
    );
  }

  public static fromSnapshot(snapshot: CustomsDocumentSnapshot): CustomsDocument {
    return CustomsDocument.create(snapshot.id, snapshot.type, snapshot.reference);
  }

  public toSnapshot(): CustomsDocumentSnapshot {
    return {
      id: this.id,
      type: this.type,
      reference: this.reference,
    };
  }
}
