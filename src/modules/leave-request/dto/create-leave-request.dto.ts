import { IsDateString, IsIn, IsNotEmpty, IsString } from 'class-validator';
import { LeaveType } from '../leave-request.entity';

const LEAVE_TYPES: LeaveType[] = ['vacation', 'sick', 'personal', 'unpaid'];

export class CreateLeaveRequestDto {
  @IsString()
  @IsNotEmpty()
  employeeId: string;

  @IsString()
  @IsIn(LEAVE_TYPES)
  leaveType: LeaveType;

  @IsDateString()
  startDate: string;

  @IsDateString()
  endDate: string;

  @IsString()
  @IsNotEmpty()
  reason: string;
}
