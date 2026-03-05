import { LeaveRequest } from '../leave-request.entity';

export class LeaveRequestResponseDto {
  id: string;
  employeeId: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: string;
  createdAt: string;
  updatedAt: string;

  static fromEntity(entity: LeaveRequest): LeaveRequestResponseDto {
    return {
      id: entity.id,
      employeeId: entity.employeeId,
      leaveType: entity.leaveType,
      startDate: entity.startDate.toISOString(),
      endDate: entity.endDate.toISOString(),
      reason: entity.reason,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      updatedAt: entity.updatedAt.toISOString(),
    };
  }
}
