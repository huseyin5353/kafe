import {
  IsString,
  IsEmail,
  IsOptional,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Kullanıcı adı en az 3 karakter olmalıdır' })
  @MaxLength(100, { message: 'Kullanıcı adı en fazla 100 karakter olabilir' })
  username?: string;

  @IsEmail({}, { message: 'Geçerli bir email adresi giriniz' })
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  @MinLength(3, { message: 'Ad Soyad en az 3 karakter olmalıdır' })
  @MaxLength(255, { message: 'Ad Soyad en fazla 255 karakter olabilir' })
  full_name?: string;

  @IsString()
  @IsOptional()
  @Matches(/^\+?[1-9]\d{1,14}$/, {
    message: 'Geçerli bir telefon numarası giriniz (E.164 formatı)',
  })
  phone?: string;
}


