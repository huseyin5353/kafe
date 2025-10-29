import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class BulkDeleteDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'En az bir kayıt seçilmelidir' })
  @IsString({ each: true })
  ids: string[];
}



