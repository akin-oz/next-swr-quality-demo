import { z } from 'zod';

//
// Error model
//

export const AppErrorType = {
  Network: 'network',
  Http: 'http',
  Parse: 'parse',
  Validation: 'validation',
  Aborted: 'aborted',
  Unknown: 'unknown',
} as const;

export type AppErrorType = typeof AppErrorType[keyof typeof AppErrorType];

export type AppError = {
  type: AppErrorType;
  message: string;
  status?: number;
  cause?: unknown;
};

export function createAppError(
  type: AppErrorType,
  message: string,
  extras?: { status?: number; cause?: unknown },
): AppError {
  return {
    type,
    message,
    ...(extras ?? {}),
  };
}

export function isAppError(e: unknown): e is AppError {
  return (
    typeof e === 'object' &&
    e !== null &&
    'type' in e &&
    'message' in e &&
    typeof e.message === 'string'
  );
}

//
// API envelopes
//

export const ApiEnvelope = <T extends z.ZodTypeAny>(schema: T) =>
  z.object({ data: schema });

//
// Domain models
//

export const ItemSchema = z.object({
  id: z.number().int().nonnegative(),
  title: z.string().min(1),
  completed: z.boolean().optional(),
});

export type Item = z.infer<typeof ItemSchema>;