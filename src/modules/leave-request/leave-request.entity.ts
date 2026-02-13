export type LeaveStatus = 'pending' | 'approved' | 'rejected';
export type LeaveType = 'vacation' | 'sick' | 'personal' | 'unpaid';

export class LeaveRequest {
  id: string;
  employeeId: string;
  leaveType: LeaveType;
  startDate: Date;
  endDate: Date;
  reason: string;
  status: LeaveStatus;
  createdAt: Date;
  updatedAt: Date;

  constructor(partial: Partial<LeaveRequest>) {
    Object.assign(this, partial);
  }

  getDaysRequested(): number {
    const diffTime = Math.abs(
      this.endDate.getTime() - this.startDate.getTime(),
    );
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
  }

  isOverlapping(other: LeaveRequest): boolean {
    return (
      this.employeeId === other.employeeId &&
      this.startDate <= other.endDate &&
      this.endDate >= other.startDate
    );
  }
}
