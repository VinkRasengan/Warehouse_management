import { Repository } from 'typeorm';
import { Customer } from '../entities/Customer';
import { AppDataSource } from '../config/database';
import { createLogger } from '@warehouse/utils';
import { QueryParams } from '@warehouse/types';

const logger = createLogger('customer-service');

export class CustomerService {
  private customerRepository: Repository<Customer>;

  constructor() {
    this.customerRepository = AppDataSource.getRepository(Customer);
  }

  async getCustomers(queryParams: QueryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      isActive
    } = queryParams;

    const queryBuilder = this.customerRepository.createQueryBuilder('customer');

    if (search) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :search OR customer.lastName ILIKE :search OR customer.email ILIKE :search)',
        { search: `%${search}%` }
      );
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('customer.isActive = :isActive', { isActive });
    }

    queryBuilder.orderBy(`customer.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [customers, total] = await queryBuilder.getManyAndCount();

    return {
      data: customers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getCustomerById(id: string): Promise<Customer | null> {
    return await this.customerRepository.findOne({ where: { id } });
  }

  async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const customer = this.customerRepository.create(data);
    const savedCustomer = await this.customerRepository.save(customer);

    logger.info('Customer created', { customerId: savedCustomer.id, email: savedCustomer.email });
    return savedCustomer;
  }

  async updateCustomer(id: string, data: Partial<Customer>): Promise<Customer | null> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) return null;

    Object.assign(customer, data);
    const updatedCustomer = await this.customerRepository.save(customer);

    logger.info('Customer updated', { customerId: id });
    return updatedCustomer;
  }

  async deleteCustomer(id: string): Promise<boolean> {
    const result = await this.customerRepository.delete(id);
    const deleted = result.affected! > 0;

    if (deleted) {
      logger.info('Customer deleted', { customerId: id });
    }

    return deleted;
  }
}
