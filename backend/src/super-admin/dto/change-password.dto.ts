import { IsString, IsNotEmpty, MinLength, Matches } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty({ message: 'Mevcut şifre zorunludur' })
  current_password: string;

  @IsString()
  @IsNotEmpty({ message: 'Yeni şifre zorunludur' })
  @MinLength(8, { message: 'Yeni şifre en az 8 karakter olmalıdır' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message:
      'Yeni şifre en az 1 büyük harf, 1 küçük harf, 1 rakam ve 1 özel karakter içermelidir',
  })
  new_password: string;

  @IsString()
  @IsNotEmpty({ message: 'Şifre onayı zorunludur' })
  new_password_confirm: string;
}


