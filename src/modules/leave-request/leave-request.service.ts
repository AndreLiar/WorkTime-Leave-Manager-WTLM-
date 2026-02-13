import {
  Injectable,
  BadRequestException,
  NotFoundException,
  OnModuleDestroy,
} from '@nestjs/common';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequest } from './leave-request.entity';
import { DatabaseService } from '../../database/database.service';

@Injectable()
export class LeaveRequestService implements OnModuleDestroy {
  private db: DatabaseService;
  private idCounter = 1;

  constructor() {
    const dbPath = process.env.NODE_ENV === 'test' ? ':memory:' : undefined;
    this.db = new DatabaseService(dbPath);
    this.initializeCounter();
  }

  onModuleDestroy() {
    this.db.close();
  }

  private initializeCounter(): void {
    const result = this.db
      .getDatabase()
      .prepare(
        'SELECT MAX(CAST(SUBSTR(id, 3) AS INTEGER)) as max_id FROM leave_requests',
      )
      .get() as { max_id: number | null };

    if (result.max_id) {
      this.idCounter = result.max_id + 1;
    }
  }

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

    const overlapping = this.db
      .getDatabase()
      .prepare(
        `SELECT * FROM leave_requests 
         WHERE employee_id = ? 
         AND status != 'rejected'
         AND start_date <= ? 
         AND end_date >= ?`,
      )
      .all(employeeId, end.toISOString(), start.toISOString());

    if (overlapping.length > 0) {
      throw new BadRequestException(
        'Leave request overlaps with existing request',
      );
    }

    this.db
      .getDatabase()
      .prepare(
        `INSERT INTO leave_requests (id, employee_id, leave_type, start_date, end_date, reason, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        newRequest.id,
        newRequest.employeeId,
        newRequest.leaveType,
        newRequest.startDate.toISOString(),
        newRequest.endDate.toISOString(),
        newRequest.reason,
        newRequest.status,
        newRequest.createdAt.toISOString(),
        newRequest.updatedAt.toISOString(),
      );

    return newRequest;
  }

  findAll(): LeaveRequest[] {
    const rows = this.db
      .getDatabase()
      .prepare('SELECT * FROM leave_requests ORDER BY created_at DESC')
      .all();
    return rows.map((row: any) => this.mapRowToLeaveRequest(row));
  }

  findOne(id: string): LeaveRequest {
    const row = this.db
      .getDatabase()
      .prepare('SELECT * FROM leave_requests WHERE id = ?')
      .get(id);

    if (!row) {
      throw new NotFoundException(`Leave request with ID ${id} not found`);
    }

    return this.mapRowToLeaveRequest(row as any);
  }

  findByEmployee(employeeId: string): LeaveRequest[] {
    const rows = this.db
      .getDatabase()
      .prepare(
        'SELECT * FROM leave_requests WHERE employee_id = ? ORDER BY created_at DESC',
      )
      .all(employeeId);
    return rows.map((row: any) => this.mapRowToLeaveRequest(row));
  }

  approve(id: string): LeaveRequest {
    const request = this.findOne(id);
    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Cannot approve leave request with status: ${request.status}`,
      );
    }

    const updatedAt = new Date().toISOString();
    this.db
      .getDatabase()
      .prepare('UPDATE leave_requests SET status = ?, updated_at = ? WHERE id = ?')
      .run('approved', updatedAt, id);

    request.status = 'approved';
    request.updatedAt = new Date(updatedAt);
    return request;
  }

  reject(id: string): LeaveRequest {
    const request = this.findOne(id);
    if (request.status !== 'pending') {
      throw new BadRequestException(
        `Cannot reject leave request with status: ${request.status}`,
      );
    }

    const updatedAt = new Date().toISOString();
    this.db
      .getDatabase()
      .prepare('UPDATE leave_requests SET status = ?, updated_at = ? WHERE id = ?')
      .run('rejected', updatedAt, id);

    request.status = 'rejected';
    request.updatedAt = new Date(updatedAt);
    return request;
  }

  delete(id: string): void {
    const request = this.findOne(id);
    if (request.status === 'approved') {
      throw new BadRequestException('Cannot delete approved leave requests');
    }

    this.db
      .getDatabase()
      .prepare('DELETE FROM leave_requests WHERE id = ?')
      .run(id);
  }

  getStatistics(employeeId?: string): {
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    totalDaysRequested: number;
  } {
    let query = 'SELECT * FROM leave_requests';
    const params: any[] = [];

    if (employeeId) {
      query += ' WHERE employee_id = ?';
      params.push(employeeId);
    }

    const rows = this.db.getDatabase().prepare(query).all(...params);
    const requests = rows.map((row: any) => this.mapRowToLeaveRequest(row));

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

  private mapRowToLeaveRequest(row: any): LeaveRequest {
    return new LeaveRequest({
      id: row.id,
      employeeId: row.employee_id,
      leaveType: row.leave_type,
      startDate: new Date(row.start_date),
      endDate: new Date(row.end_date),
      reason: row.reason,
      status: row.status,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    });
  }
}
