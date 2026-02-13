export class CreateLeaveRequestDto {
  employeeId: string;
  leaveType: 'vacation' | 'sick' | 'personal' | 'unpaid';
  startDate: string;
  endDate: string;
  reason: string;
}
