import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { User } from '../users/entities/user.entity';

@Injectable()
export class ProductsService {
  constructor(@InjectRepository(Product) private repo: Repository<Product>) { }

  async create(dto: CreateProductDto, owner: any) {
    const product = this.repo.create({
      ...dto,
      ownerId: owner.userId
    });
    return await this.repo.save(product);
  }

  async findAll(filter?: { category?: string; sort?: 'asc' | 'desc' }) {
    const qb = this.repo.createQueryBuilder('p');

    if (filter?.category) {
      qb.andWhere('p.category = :category', { category: filter.category });
    }

    if (filter?.sort) {
      qb.orderBy('p.price', filter.sort.toUpperCase() as 'ASC' | 'DESC');
    }

    return await qb.getMany();
  }

  async findOne(id: number) {
    const product = await this.repo.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.findOne(id);
    Object.assign(product, dto);
    return await this.repo.save(product);
  }

  async remove(id: number) {
    const product = await this.findOne(id);
    await this.repo.remove(product);
    return { message: 'Product deleted' };
  }
}
