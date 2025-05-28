import { Repository } from 'typeorm';
import { Product } from '../entities/Product';
import { AppDataSource } from '../config/database';
import { createLogger } from '@warehouse/utils';
import { QueryParams } from '@warehouse/types';

const logger = createLogger('product-service');

export class ProductService {
  private productRepository: Repository<Product>;

  constructor() {
    this.productRepository = AppDataSource.getRepository(Product);
  }

  async getProducts(queryParams: QueryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      categoryId,
      isActive,
      search
    } = queryParams;

    const queryBuilder = this.productRepository.createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category');

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    if (search) {
      queryBuilder.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR product.sku ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    queryBuilder.orderBy(`product.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [products, total] = await queryBuilder.getManyAndCount();

    return {
      data: products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getProductById(id: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { id },
      relations: ['category']
    });
  }

  async getProductBySku(sku: string): Promise<Product | null> {
    return await this.productRepository.findOne({
      where: { sku },
      relations: ['category']
    });
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const product = this.productRepository.create(data);
    const savedProduct = await this.productRepository.save(product);

    logger.info('Product created', { productId: savedProduct.id, sku: savedProduct.sku });
    return savedProduct;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product | null> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) return null;

    Object.assign(product, data);
    const updatedProduct = await this.productRepository.save(product);

    logger.info('Product updated', { productId: id });
    return updatedProduct;
  }

  async deleteProduct(id: string): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    const deleted = result.affected! > 0;

    if (deleted) {
      logger.info('Product deleted', { productId: id });
    }

    return deleted;
  }
}
