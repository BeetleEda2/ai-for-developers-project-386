export interface ApiError {
  code?: string;
  message?: string;
}

export function getErrorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (err && typeof err === 'object' && 'message' in err) {
    return String((err as ApiError).message);
  }
  return 'Something went wrong';
}

export function isConflictError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as ApiError).code === 'TIME_SLOT_TAKEN'
  );
}

export function isValidationError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as ApiError).code === 'VALIDATION_FAILED'
  );
}
