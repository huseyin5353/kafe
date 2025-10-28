import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
  Matches,
  MaxLength,
} from 'class-validator';

export class SuperAdminRegisterDto {
  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır' })
  @MaxLength(50, { message: 'Kullanıcı adı en fazla 50 karakter olabilir' })
  username: string;

  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8, { message: 'Şifre en az 8 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir',
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(3, { message: 'Ad Soyad en az 3 karakter olmalıdır' })
  full_name: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Geçerli bir telefon numarası giriniz',
  })
  phone?: string;
}

