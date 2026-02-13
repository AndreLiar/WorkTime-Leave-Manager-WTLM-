import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequest } from './leave-request.entity';

@Injectable()
export class LeaveRequestService {
  private leaveRequests: Map<string, LeaveRequest> = new Map();
  private idCounter = 1;

  create(createLeaveRequestDto: CreateLeaveRequestDto): LeaveRequest {
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

    const newRequest = new LeaveRequest({
      id: `LR${String(this.idCounter++).padStart(6, '0')}`,
      employeeId,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const hasOverlap = Array.from(this.leaveRequests.values()).some(
      (existing) =>
        existing.status !== 'rejected' && existing.isOverlapping(newRequest),
    );

    if (hasOverlap) {
      throw new BadRequestException(
        'Leave request overlaps with existing request',
      );
    }

    this.leaveRequests.set(newRequest.id, newRequest);
    return newRequest;
  }

  findAll(): LeaveRequest[] {
    return Array.from(this.leaveRequests.values());
  }

  findOne(id: string): LeaveRequest {
    const request = this.leaveRequests.get(id);
    if (!request) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }
    return request;
  }

  findByEmployee(employeeId: string): LeaveRequest[] {
    return Array.from(this.leaveRequests.values()).filter(
      (request) => request.employeeId === employeeId,
    );
  }

  approve(id: string): LeaveRequest {
    const request = this.findOne(id);
    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Cannot approve leave request with status: ${request.status}`,
      );
    }
    request.status = 'approved';
    request.updatedAt = new Date();
    return request;
  }

  reject(id: string): LeaveRequest {
    const request = this.findOne(id);
    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Cannot reject leave request with status: ${request.status}`,
      );
    }
    request.status = 'rejected';
    request.updatedAt = new Date();
    return request;
  }

  delete(id: string): void {
    const request = this.findOne(id);
    if (request.status === 'approved') {
      throw new BadRequestException('Cannot delete approved leave requests');
    }
    this.leaveRequests.delete(id);
  }

  getStatistics(employeeId?: string): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalDaysRequested: number;
  } {
    const requests = employeeId
      ? this.findByEmployee(employeeId)
      : this.findAll();

    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === 'pending').length,
      approved: requests.filter((r) => r.status === 'approved').length,
      rejected: requests.filter((r) => r.status === 'rejected').length,
      totalDaysRequested: requests
        .filter((r) => r.status === 'approved')
        .reduce((sum, r) => sum + r.getDaysRequested(), 0),
    };
  }
}
