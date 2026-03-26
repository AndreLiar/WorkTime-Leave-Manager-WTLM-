import { LeaveRequestResponseDto } from './leave-request-response.dto';

export class PaginatedResponseDto {
  data: LeaveRequestResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
