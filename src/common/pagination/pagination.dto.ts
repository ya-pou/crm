import { IsOptional, IsPositive, Min } from 'class-validator';

export class PaginationQueryDto {
  @IsOptional()
  @IsPositive()
  page?: number;

  @IsOptional()
  @IsPositive()
  limit?: number = 50;

  @IsOptional()
  @Min(0)
  offset?: number = 0;

  @IsOptional()
  search?: string;

  @IsOptional()
  sort?: string;

  @IsOptional()
  dir?: 'asc' | 'desc';
}
