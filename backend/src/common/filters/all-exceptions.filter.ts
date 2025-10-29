import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { ThrottlerException } from '@nestjs/throttler';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: any = ctx.getResponse();
    const request: any = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errors: any = null;

    // HttpException (NestJS exceptions)
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object') {
        message = (exceptionResponse as any).message || message;
        errors = (exceptionResponse as any).errors || null;
      }
    }
    // Rate Limit Errors
    else if (exception instanceof ThrottlerException) {
      status = HttpStatus.TOO_MANY_REQUESTS;
      message = 'Çok fazla istek. Lütfen daha sonra tekrar deneyin.';
    }
    // Prisma errors
    else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      status = HttpStatus.BAD_REQUEST;

      switch (exception.code) {
        case 'P2002':
          // Unique constraint failed
          const field = Array.isArray(exception.meta?.target)
            ? (exception.meta.target as string[]).join(', ')
            : exception.meta?.target;
          message = `Bu ${field} zaten kullanılıyor`;
          errors = { field: exception.meta?.target };
          break;
        case 'P2025':
          // Record not found
          message = 'Kayıt bulunamadı';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          // Foreign key constraint failed
          message = 'İlişkili kayıt bulunamadı';
          break;
        case 'P2014':
          // Relation violation
          message = 'Bu kaydı silmek için önce ilişkili kayıtları silmelisiniz';
          status = HttpStatus.CONFLICT;
          break;
        case 'P2015':
          // Related record not found
          message = 'İlgili kayıt bulunamadı';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2016':
          // Query interpretation error
          message = 'Sorgu hatası';
          break;
        case 'P2021':
          // Table does not exist
          message = 'Tablo bulunamadı';
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        case 'P2022':
          // Column does not exist
          message = 'Sütun bulunamadı';
          status = HttpStatus.INTERNAL_SERVER_ERROR;
          break;
        default:
          message = 'Veritabanı hatası';
          this.logger.error(`Unhandled Prisma error: ${exception.code}`, exception.message);
      }
    }
    // Prisma validation error
    else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      message = 'Geçersiz veri formatı';
      errors = { validation: 'Gönderilen veri yapısı hatalı' };
    }
    // Prisma initialization error
    else if (exception instanceof Prisma.PrismaClientInitializationError) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      message = 'Veritabanı bağlantı hatası';
      this.logger.error('Prisma initialization error', exception.message);
    }
    // Prisma rust panic
    else if (exception instanceof Prisma.PrismaClientRustPanicError) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Veritabanı kritik hatası';
      this.logger.error('Prisma rust panic', exception.message);
    }
    // Unknown errors
    else if (exception instanceof Error) {
      message = exception.message;
    }

    // Log error
    const errorLog = {
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      status,
      message,
      user: request?.user?.userId || 'anonymous',
      ip: request?.ip || request?.ips?.[0] || request?.socket?.remoteAddress,
      userAgent: request?.headers?.['user-agent'] || (typeof request?.get === 'function' ? request.get('user-agent') : undefined),
    };

    if (status >= 500) {
      this.logger.error('Server Error:', errorLog, exception instanceof Error ? exception.stack : '');
    } else if (status >= 400) {
      this.logger.warn('Client Error:', errorLog);
    } else {
      this.logger.log('Exception:', errorLog);
    }

    // Response
    const body = {
      success: false,
      statusCode: status,
      message,
      errors,
      timestamp: new Date().toISOString(),
      path: request?.url,
    };

    if (typeof response.status === 'function' && typeof response.json === 'function') {
      // Express-like
      response.status(status).json(body);
    } else if (typeof response.status === 'function' && typeof response.send === 'function') {
      // Fastify-compatible
      response.status(status).send(body);
    } else if (typeof response.code === 'function' && typeof response.send === 'function') {
      // Fastify classic
      response.code(status).send(body);
    } else {
      try {
        response.send(body);
      } catch {
        // noop
      }
    }
  }
}

