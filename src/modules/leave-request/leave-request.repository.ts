import { Injectable } from '@nestjs/common';
import { Prisma, LeaveRequest as PrismaLeaveRequest } from '@prisma/client';
import { PrismaService } from '../../database/prisma.service';
import { LeaveRequest } from './leave-request.entity';

@Injectable()
export class LeaveRequestRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.LeaveRequestCreateInput): Promise<LeaveRequest> {
    const request = await this.prisma.leaveRequest.create({ data });
    return this.toEntity(request);
  }

  async findAll(): Promise<LeaveRequest[]> {
    const requests = await this.prisma.leaveRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((req) => this.toEntity(req));
  }

  async findById(id: string): Promise<LeaveRequest | null> {
    const request = await this.prisma.leaveRequest.findUnique({ where: { id } });
    return request ? this.toEntity(request) : null;
  }

  async findByEmployee(employeeId: string): Promise<LeaveRequest[]> {
    const requests = await this.prisma.leaveRequest.findMany({
      where: { employeeId },
      orderBy: { createdAt: 'desc' },
    });
    return requests.map((req) => this.toEntity(req));
  }

  async updateStatus(id: string, status: string): Promise<LeaveRequest> {
    const updated = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status },
    });
    return this.toEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.leaveRequest.delete({ where: { id } });
  }

  async findOverlapping(
    employeeId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<LeaveRequest[]> {
    const requests = await this.prisma.leaveRequest.findMany({
      where: {
        employeeId,
        status: {
          not: 'rejected',
        },
        AND: [
          { startDate: { lte: endDate } },
          { endDate: { gte: startDate } },
        ],
      },
    });

    return requests.map((req) => this.toEntity(req));
  }

  async findMany(where?: Prisma.LeaveRequestWhereInput): Promise<LeaveRequest[]> {
    const requests = await this.prisma.leaveRequest.findMany({ where });
    return requests.map((req) => this.toEntity(req));
  }

  private toEntity(data: PrismaLeaveRequest): LeaveRequest {
    return new LeaveRequest({
      id: data.id,
      employeeId: data.employeeId,
      leaveType: data.leaveType as any,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      status: data.status as any,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    });
  }
}
