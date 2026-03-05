import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequest } from './leave-request.entity';
import { LeaveRequestRepository } from './leave-request.repository';

@Injectable()
export class LeaveRequestService {
  constructor(private readonly repository: LeaveRequestRepository) {}

  async create(createLeaveRequestDto: CreateLeaveRequestDto): Promise<LeaveRequest> {
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

    return this.repository.create({
      employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: 'pending',
    });
  }

  async findAll(): Promise<LeaveRequest[]> {
    return this.repository.findAll();
  }

  async findOne(id: string): Promise<LeaveRequest> {
    const request = await this.repository.findById(id);

    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return request;
  }

  async findByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    return this.repository.findByEmployee(employeeId);
  }

  async approve(id: string): Promise<LeaveRequest> {
    const request = await this.findOne(id);
    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Cannot approve leave request with status: ${request.status}`,
      );
    }

    return this.repository.updateStatus(id, 'approved');
  }

  async reject(id: string): Promise<LeaveRequest> {
    const request = await this.findOne(id);
    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Cannot reject leave request with status: ${request.status}`,
      );
    }

    return this.repository.updateStatus(id, 'rejected');
  }

  async delete(id: string): Promise<void> {
    const request = await this.findOne(id);
    if (request.status === 'approved') {
      throw new BadRequestException('Cannot delete approved leave requests');
    }

    await this.repository.delete(id);
  }

  async getStatistics(employeeId?: string): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalDaysRequested: number;
  }> {
    const where = employeeId ? { employeeId } : undefined;
    const leaveRequests = await this.repository.findMany(where);

    return {
      total: leaveRequests.length,
      pending: leaveRequests.filter((r) => r.status === 'pending').length,
      approved: leaveRequests.filter((r) => r.status === 'approved').length,
      rejected: leaveRequests.filter((r) => r.status === 'rejected').length,
      totalDaysRequested: leaveRequests.reduce(
        (sum, r) => sum + r.getDaysRequested(),
        0,
      ),
    };
  }

}
