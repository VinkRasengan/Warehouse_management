import { Repository } from 'typeorm';
import { Alert } from '../entities/Alert';
import { AppDataSource } from '../config/database';
import { createLogger } from '@warehouse/utils';
import { QueryParams, AlertType, AlertSeverity } from '@warehouse/types';
import { EmailService } from './EmailService';

const logger = createLogger('alert-service');

export class AlertService {
  private alertRepository: Repository<Alert>;
  private emailService: EmailService;

  constructor() {
    this.alertRepository = AppDataSource.getRepository(Alert);
    this.emailService = new EmailService();
  }

  async getAlerts(queryParams: QueryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      type,
      severity,
      isRead,
      isResolved
    } = queryParams;

    const queryBuilder = this.alertRepository.createQueryBuilder('alert');

    if (type) {
      queryBuilder.andWhere('alert.type = :type', { type });
    }

    if (severity) {
      queryBuilder.andWhere('alert.severity = :severity', { severity });
    }

    if (isRead !== undefined) {
      queryBuilder.andWhere('alert.isRead = :isRead', { isRead });
    }

    if (isResolved !== undefined) {
      queryBuilder.andWhere('alert.isResolved = :isResolved', { isResolved });
    }

    queryBuilder.orderBy(`alert.${sortBy}`, sortOrder.toUpperCase() as 'ASC' | 'DESC');

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [alerts, total] = await queryBuilder.getManyAndCount();

    return {
      data: alerts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async createAlert(data: Partial<Alert>): Promise<Alert> {
    const alert = this.alertRepository.create(data);
    const savedAlert = await this.alertRepository.save(alert);

    // Send email notification for high/critical alerts
    if (savedAlert.severity === AlertSeverity.HIGH || savedAlert.severity === AlertSeverity.CRITICAL) {
      await this.emailService.sendAlertNotification(savedAlert);
    }

    logger.info('Alert created', {
      alertId: savedAlert.id,
      type: savedAlert.type,
      severity: savedAlert.severity
    });

    return savedAlert;
  }

  async markAsRead(id: string): Promise<Alert | null> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) return null;

    alert.isRead = true;
    const updatedAlert = await this.alertRepository.save(alert);

    logger.info('Alert marked as read', { alertId: id });
    return updatedAlert;
  }

  async resolveAlert(id: string, resolvedBy: string): Promise<Alert | null> {
    const alert = await this.alertRepository.findOne({ where: { id } });
    if (!alert) return null;

    alert.isResolved = true;
    alert.resolvedAt = new Date();
    alert.resolvedBy = resolvedBy;
    const updatedAlert = await this.alertRepository.save(alert);

    logger.info('Alert resolved', { alertId: id, resolvedBy });
    return updatedAlert;
  }

  async createStockLowAlert(productId: string, currentQuantity: number, minThreshold: number): Promise<Alert> {
    const alertData = {
      type: AlertType.LOW_STOCK,
      title: 'Low Stock Alert',
      message: `Product ${productId} is running low. Current stock: ${currentQuantity}, Minimum threshold: ${minThreshold}`,
      severity: currentQuantity === 0 ? AlertSeverity.CRITICAL : AlertSeverity.HIGH,
      productId
    };

    return await this.createAlert(alertData);
  }
}
