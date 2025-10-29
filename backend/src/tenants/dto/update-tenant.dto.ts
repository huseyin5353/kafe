import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
  IsEnum,
  IsObject,
  IsBoolean,
} from 'class-validator';

export class UpdateTenantDto {
  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'Kafe adı en az 2 karakter olmalıdır' })
  @MaxLength(255, { message: 'Kafe adı en fazla 255 karakter olabilir' })
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(2, { message: 'İşletme adı en az 2 karakter olmalıdır' })
  @MaxLength(255, { message: 'İşletme adı en fazla 255 karakter olabilir' })
  business_name?: string;

  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Subdomain en az 3 karakter olmalıdır' })
  @MaxLength(100, { message: 'Subdomain en fazla 100 karakter olabilir' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Subdomain sadece küçük harf, rakam ve tire içerebilir',
  })
  slug?: string;

  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Geçerli bir telefon numarası giriniz (E.164 formatı)',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  @IsEnum(['TRY', 'USD', 'EUR'], {
    message: 'Para birimi TRY, USD veya EUR olmalıdır',
  })
  currency?: string;

  @IsString()
  @IsOptional()
  timezone?: string;

  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;
}
