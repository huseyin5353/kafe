import { IsArray, ArrayNotEmpty, IsString, IsBoolean } from 'class-validator';

export class BulkUpdateStatusDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'En az bir kayıt seçilmelidir' })
  @IsString({ each: true })
  ids: string[];

  @IsBoolean()
  is_active: boolean;
}



