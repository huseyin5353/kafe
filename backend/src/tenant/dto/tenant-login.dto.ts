import { IsString, IsNotEmpty } from 'class-validator';

export class TenantLoginDto {
  @IsString()
  @IsNotEmpty({ message: 'Kullanıcı adı gereklidir' })
  username: string;

  @IsString()
  @IsNotEmpty({ message: 'Şifre gereklidir' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Kafe slug gereklidir' })
  tenant_slug: string;
}


