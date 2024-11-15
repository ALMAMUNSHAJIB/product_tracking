import { IsOptional, IsInt, IsString, IsNotEmpty } from 'class-validator';

export class RecordViewDto {
  @IsOptional()
  @IsInt()
  userId?: number 
}
