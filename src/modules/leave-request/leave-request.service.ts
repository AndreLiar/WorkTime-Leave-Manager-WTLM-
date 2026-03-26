import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequest } from './leave-request.entity';
import { LeaveRequestRepository } from './leave-request.repository';
import { RedisService } from '../../redis/redis.service';

const TTL = 60; // seconds

const KEYS = {
  all: 'leave-requests:all',
  byEmployee: (id: string) => `leave-requests:emp:${id}`,
  byId: (id: string) => `leave-requests:id:${id}`,
  stats: 'leave-requests:stats:all',
  statsByEmployee: (id: string) => `leave-requests:stats:emp:${id}`,
};

@Injectable()
export class LeaveRequestService {
  constructor(
    private readonly repository: LeaveRequestRepository,
    private readonly redis: RedisService,
  ) {}

  async create(
    createLeaveRequestDto: CreateLeaveRequestDto,
  ): Promise<LeaveRequest> {
    const { startDate, endDate, employeeId, leaveType, reason } =
      createLeaveRequestDto;

    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new BadRequestException('Invalid date format');
    }

    if (start > end) {
      throw new BadRequestException('Start date must be before end date');
    }

    if (start < new Date(new Date().setHours(0, 0, 0, 0))) {
      throw new BadRequestException('Cannot request leave in the past');
    }

    const overlapping = await this.repository.findOverlapping(
      employeeId,
      start,
      end,
    );

    if (overlapping.length > 0) {
      throw new BadRequestException(
        'Leave request overlaps with existing request',
      );
    }

    const created = await this.repository.create({
      employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: 'pending',
    });

    await this.invalidate(employeeId);
    return created;
  }

  async findAll(): Promise<LeaveRequest[]> {
    const cached = await this.redis.get<LeaveRequest[]>(KEYS.all);
    if (cached) return cached;

    const result = await this.repository.findAll();
    await this.redis.set(KEYS.all, result, TTL);
    return result;
  }

  async findOne(id: string): Promise<LeaveRequest> {
    const cached = await this.redis.get<LeaveRequest>(KEYS.byId(id));
    if (cached) return cached;

    const request = await this.repository.findById(id);
    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    await this.redis.set(KEYS.byId(id), request, TTL);
    return request;
  }

  async findByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    const key = KEYS.byEmployee(employeeId);
    const cached = await this.redis.get<LeaveRequest[]>(key);
    if (cached) return cached;

    const result = await this.repository.findByEmployee(employeeId);
    await this.redis.set(key, result, TTL);
    return result;
  }

  async approve(id: string): Promise<LeaveRequest> {
    const request = await this.findOne(id);
    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Cannot approve leave request with status: ${request.status}`,
      );
    }

    const updated = await this.repository.updateStatus(id, 'approved');
    await this.invalidate(updated.employeeId, id);
    return updated;
  }

  async reject(id: string): Promise<LeaveRequest> {
    const request = await this.findOne(id);
    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Cannot reject leave request with status: ${request.status}`,
      );
    }

    const updated = await this.repository.updateStatus(id, 'rejected');
    await this.invalidate(updated.employeeId, id);
    return updated;
  }

  async delete(id: string): Promise<void> {
    const request = await this.findOne(id);
    if (request.status === 'approved') {
      throw new BadRequestException('Cannot delete approved leave requests');
    }

    await this.repository.delete(id);
    await this.invalidate(request.employeeId, id);
  }

  async getStatistics(employeeId?: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalDaysRequested: number;
  }> {
    const key = employeeId ? KEYS.statsByEmployee(employeeId) : KEYS.stats;
    const cached =
      await this.redis.get<ReturnType<typeof this.getStatistics>>(key);
    if (cached) return cached as Awaited<ReturnType<typeof this.getStatistics>>;

    const where = employeeId ? { employeeId } : undefined;
    const leaveRequests = await this.repository.findMany(where);

    const result = {
      total: leaveRequests.length,
      pending: leaveRequests.filter((r) => r.status === 'pending').length,
      approved: leaveRequests.filter((r) => r.status === 'approved').length,
      rejected: leaveRequests.filter((r) => r.status === 'rejected').length,
      totalDaysRequested: leaveRequests.reduce(
        (sum, r) => sum + r.getDaysRequested(),
        0,
      ),
    };

    await this.redis.set(key, result, TTL);
    return result;
  }

  private async invalidate(employeeId: string, id?: string): Promise<void> {
    const keys = [
      KEYS.all,
      KEYS.byEmployee(employeeId),
      KEYS.stats,
      KEYS.statsByEmployee(employeeId),
    ];
    if (id) keys.push(KEYS.byId(id));
    await this.redis.del(...keys);
  }
}
