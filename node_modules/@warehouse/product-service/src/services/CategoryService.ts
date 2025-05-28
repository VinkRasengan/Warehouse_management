import { Repository } from 'typeorm';
import { Category } from '../entities/Category';
import { AppDataSource } from '../config/database';
import { createLogger } from '@warehouse/utils';

const logger = createLogger('category-service');

export class CategoryService {
  private categoryRepository: Repository<Category>;

  constructor() {
    this.categoryRepository = AppDataSource.getRepository(Category);
  }

  async getCategories(): Promise<Category[]> {
    return await this.categoryRepository.find({
      relations: ['parent', 'children']
    });
  }

  async getCategoryById(id: string): Promise<Category | null> {
    return await this.categoryRepository.findOne({
      where: { id },
      relations: ['parent', 'children']
    });
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    const category = this.categoryRepository.create(data);
    const savedCategory = await this.categoryRepository.save(category);

    logger.info('Category created', { categoryId: savedCategory.id, name: savedCategory.name });
    return savedCategory;
  }
}
