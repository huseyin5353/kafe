import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  MaxLength,
  Matches,
  IsOptional,
  IsEnum,
  IsObject,
} from 'class-validator';

export class CreateTenantDto {
  @IsString()
  @IsNotEmpty({ message: 'Kafe adı zorunludur' })
  @MinLength(2, { message: 'Kafe adı en az 2 karakter olmalıdır' })
  @MaxLength(255, { message: 'Kafe adı en fazla 255 karakter olabilir' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'İşletme adı zorunludur' })
  @MinLength(2, { message: 'İşletme adı en az 2 karakter olmalıdır' })
  @MaxLength(255, { message: 'İşletme adı en fazla 255 karakter olabilir' })
  business_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Subdomain zorunludur' })
  @MinLength(3, { message: 'Subdomain en az 3 karakter olmalıdır' })
  @MaxLength(100, { message: 'Subdomain en fazla 100 karakter olabilir' })
  @Matches(/^[a-z0-9-]+$/, {
    message: 'Subdomain sadece küçük harf, rakam ve tire içerebilir',
  })
  slug: string;

  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Email zorunludur' })
  email: string;

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

  // Kafe sahibi bilgileri (otomatik user oluşturulacak)
  @IsString()
  @IsNotEmpty({ message: 'Kafe sahibi adı zorunludur' })
  @MinLength(3, { message: 'Kafe sahibi adı en az 3 karakter olmalıdır' })
  owner_full_name: string;

  @IsString()
  @IsNotEmpty({ message: 'Kullanıcı adı zorunludur' })
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır' })
  @MaxLength(100, { message: 'Kullanıcı adı en fazla 100 karakter olabilir' })
  owner_username: string;

  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty({ message: 'Kafe sahibi email zorunludur' })
  owner_email: string;

  @IsString()
  @IsNotEmpty({ message: 'Şifre zorunludur' })
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir',
  })
  owner_password: string;
}
