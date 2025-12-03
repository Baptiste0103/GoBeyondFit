import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path: string;
}

/**
 * Global HTTP Exception Filter
 * Catches all HTTP exceptions and formats responses consistently
 * Provides detailed error logging for debugging
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    // Extract message and error details
    let message: string | string[] = exception.message;
    let error: string = HttpStatus[status];

    if (typeof exceptionResponse === 'object') {
      const objResponse = exceptionResponse as any;
      message = objResponse.message || message;
      error = objResponse.error || error;
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    // Log error details for debugging
    this.logger.error(
      `${request.method} ${request.url} - ${status}`,
      {
        message,
        error,
        stack: exception.stack,
      },
      'HttpException',
    );

    response.status(status).json(errorResponse);
  }
}
