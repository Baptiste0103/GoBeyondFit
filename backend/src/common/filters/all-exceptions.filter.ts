import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  Logger,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string;
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Global Catch-All Exception Filter
 * Catches all unhandled exceptions and formats them
 * Preserves HTTP status codes from HttpExceptions
 * Prevents server from crashing and exposes minimal error details
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Preserve HTTP status code from HttpExceptions (BadRequest, NotFound, etc.)
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        message = (exceptionResponse as any).message || exception.message;
      }
      // Only log non-client errors (5xx)
      if (status >= 500) {
        this.logger.error(
          `Unhandled exception: ${exception.message}`,
          exception.stack,
          'AllExceptionsFilter',
        );
      }
    } else if (exception instanceof Error) {
      // Log the full error for debugging
      this.logger.error(
        `Unhandled exception: ${exception.message}`,
        exception.stack,
        'AllExceptionsFilter',
      );
      message = exception.message;
    } else {
      this.logger.error(
        'Unhandled exception',
        JSON.stringify(exception),
        'AllExceptionsFilter',
      );
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error: HttpStatus[status] || 'Unknown Error',
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    response.status(status).json(errorResponse);
  }
}
