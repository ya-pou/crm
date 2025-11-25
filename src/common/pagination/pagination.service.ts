import { Injectable } from '@nestjs/common';
import { SelectQueryBuilder } from 'typeorm';
import { PaginationQueryDto } from './pagination.dto';

@Injectable()
export class PaginationService {
  async paginate<T>(
    qb: SelectQueryBuilder<T>,
    query: PaginationQueryDto,
    searchableFields: string[] = [],
  ) {
    const limit = query.limit ?? 50; // default 50
    const page = Number(query.page);
    const offset = query.page ? (page - 1) * limit : Number(query.offset) || 0;
    const search = query.search;
    const sort = query.sort;
    const dir = query.dir ?? 'asc';

    // SEARCH
    if (search && searchableFields.length > 0) {
      searchableFields.forEach((field, index) => {
        const key = `search${index}`;
        if (index === 0) {
          qb.where(`${field} LIKE :${key}`, { [key]: `%${search}%` });
        } else {
          qb.orWhere(`${field} LIKE :${key}`, { [key]: `%${search}%` });
        }
      });
    }

    // SORT
    if (sort) {
      let sortField = query.sort;
      if (!sortField.includes('.')) {
        sortField = `${qb.alias}.${sortField}`;
      }
      qb.orderBy(sortField, dir.toUpperCase() as 'ASC' | 'DESC');
    }

    qb.take(limit).skip(offset);

    const [data, total] = await qb.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        offset,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
