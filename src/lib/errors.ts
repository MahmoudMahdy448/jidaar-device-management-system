export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: Record<string, string>
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class ValidationError extends AppError {
  constructor(
    message: string,
    details: Record<string, string>
  ) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, id?: string) {
    super(
      404,
      "NOT_FOUND",
      id ? `${resource} with id ${id} not found` : `${resource} not found`
    );
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: Record<string, string>) {
    super(409, "CONFLICT", message, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "You do not have permission to perform this action") {
    super(403, "FORBIDDEN", message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Authentication required") {
    super(401, "UNAUTHORIZED", message);
  }
}

export interface ApiResponse<T = unknown> {
  data: T | null;
  meta?: {
    page?: number;
    pageSize?: number;
    total?: number;
  };
  error?: {
    code: string;
    message: string;
    details?: Record<string, string>;
  };
}

export function apiSuccess<T>(data: T, meta?: ApiResponse["meta"]): Response {
  const body: ApiResponse<T> = { data, meta };
  return Response.json(body);
}

export function apiError(error: AppError): Response {
  const body: ApiResponse = {
    data: null,
    error: {
      code: error.code,
      message: error.message,
      details: error.details,
    },
  };
  return Response.json(body, { status: error.statusCode });
}

export function handleApiError(error: unknown): Response {
  if (error instanceof AppError) {
    return apiError(error);
  }
  console.error("Unhandled API error:", error);
  return apiError(new AppError(500, "INTERNAL_ERROR", "An unexpected error occurred"));
}
