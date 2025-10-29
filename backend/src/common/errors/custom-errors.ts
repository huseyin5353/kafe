import { HttpException, HttpStatus } from '@nestjs/common';

/**
 * Business Logic Error
 * İş mantığı kuralı ihlali (örn: stok yetersiz, sipariş iptal edilemez)
 */
export class BusinessLogicException extends HttpException {
  constructor(message: string, details?: any) {
    super(
      {
        message,
        statusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        error: 'Business Logic Error',
        details,
      },
      HttpStatus.UNPROCESSABLE_ENTITY,
    );
  }
}

/**
 * Resource Not Found Error
 * Kaynak bulunamadı
 */
export class ResourceNotFoundException extends HttpException {
  constructor(resource: string, identifier?: string | number) {
    const message = identifier
      ? `${resource} (${identifier}) bulunamadı`
      : `${resource} bulunamadı`;

    super(
      {
        message,
        statusCode: HttpStatus.NOT_FOUND,
        error: 'Not Found',
        resource,
        identifier,
      },
      HttpStatus.NOT_FOUND,
    );
  }
}

/**
 * Duplicate Resource Error
 * Kaynak zaten mevcut (unique constraint)
 */
export class DuplicateResourceException extends HttpException {
  constructor(resource: string, field: string, value?: any) {
    const message = value
      ? `Bu ${field} (${value}) zaten kullanılıyor`
      : `Bu ${field} zaten kullanılıyor`;

    super(
      {
        message,
        statusCode: HttpStatus.CONFLICT,
        error: 'Duplicate Resource',
        resource,
        field,
        value,
      },
      HttpStatus.CONFLICT,
    );
  }
}

/**
 * Invalid Operation Error
 * Geçersiz işlem (örn: pasif kullanıcı giriş yapamaz)
 */
export class InvalidOperationException extends HttpException {
  constructor(message: string, reason?: string) {
    super(
      {
        message,
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Invalid Operation',
        reason,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}

/**
 * Insufficient Permission Error
 * Yetersiz izin
 */
export class InsufficientPermissionException extends HttpException {
  constructor(action: string, resource?: string) {
    const message = resource
      ? `${resource} için ${action} yetkisi bulunmuyor`
      : `${action} yetkisi bulunmuyor`;

    super(
      {
        message,
        statusCode: HttpStatus.FORBIDDEN,
        error: 'Forbidden',
        action,
        resource,
      },
      HttpStatus.FORBIDDEN,
    );
  }
}

/**
 * External Service Error
 * Harici servis hatası (örn: payment gateway, email service)
 */
export class ExternalServiceException extends HttpException {
  constructor(service: string, message: string, originalError?: any) {
    super(
      {
        message: `${service} servisi hatası: ${message}`,
        statusCode: HttpStatus.SERVICE_UNAVAILABLE,
        error: 'External Service Error',
        service,
        originalError: originalError?.message,
      },
      HttpStatus.SERVICE_UNAVAILABLE,
    );
  }
}

/**
 * Rate Limit Exceeded Error
 * Rate limit aşıldı (custom throttler için)
 */
export class RateLimitExceededException extends HttpException {
  constructor(limit: number, windowMs: number) {
    const windowMinutes = Math.ceil(windowMs / 60000);
    const message = `Çok fazla istek. ${limit} istek / ${windowMinutes} dakika limiti aşıldı`;

    super(
      {
        message,
        statusCode: HttpStatus.TOO_MANY_REQUESTS,
        error: 'Rate Limit Exceeded',
        limit,
        windowMs,
      },
      HttpStatus.TOO_MANY_REQUESTS,
    );
  }
}

/**
 * Validation Error
 * Data validation hatası
 */
export class ValidationException extends HttpException {
  constructor(errors: Record<string, string>) {
    super(
      {
        message: 'Validation failed',
        statusCode: HttpStatus.BAD_REQUEST,
        error: 'Validation Error',
        errors,
      },
      HttpStatus.BAD_REQUEST,
    );
  }
}



