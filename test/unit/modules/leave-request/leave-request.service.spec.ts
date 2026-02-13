import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LeaveRequestService } from '../../../../src/modules/leave-request/leave-request.service';
import { CreateLeaveRequestDto } from '../../../../src/modules/leave-request/dto/create-leave-request.dto';

describe('LeaveRequestService', () => {
  let service: LeaveRequestService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LeaveRequestService],
    }).compile();

    service = module.get<LeaveRequestService>(LeaveRequestService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a leave request successfully', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Family vacation',
      };

      const result = service.create(dto);

      expect(result).toBeDefined();
      expect(result.id).toMatch(/^LR\d{6}$/);
      expect(result.employeeId).toBe('EMP001');
      expect(result.leaveType).toBe('vacation');
      expect(result.status).toBe('pending');
      expect(result.reason).toBe('Family vacation');
    });

    it('should throw error if start date is after end date', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: yesterday.toISOString(),
        reason: 'Test',
      };

      expect(() => service.create(dto)).toThrow(BadRequestException);
      expect(() => service.create(dto)).toThrow(
        'Start date must be before end date',
      );
    });

    it('should throw error if start date is in the past', () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'sick',
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString(),
        reason: 'Sick leave',
      };

      expect(() => service.create(dto)).toThrow(BadRequestException);
      expect(() => service.create(dto)).toThrow(
        'Cannot request leave in the past',
      );
    });

    it('should throw error for invalid date format', () => {
      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: 'invalid-date',
        endDate: 'also-invalid',
        reason: 'Test',
      };

      expect(() => service.create(dto)).toThrow(BadRequestException);
      expect(() => service.create(dto)).toThrow('Invalid date format');
    });

    it('should throw error if dates overlap with existing request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto1: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'First request',
      };

      const dto2: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'sick',
        startDate: new Date(
          tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        endDate: new Date(
          nextWeek.getTime() + 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        reason: 'Overlapping request',
      };

      service.create(dto1);
      expect(() => service.create(dto2)).toThrow(BadRequestException);
      expect(() => service.create(dto2)).toThrow(
        'Leave request overlaps with existing request',
      );
    });

    it('should allow overlapping dates for different employees', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto1: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Employee 1 vacation',
      };

      const dto2: CreateLeaveRequestDto = {
        employeeId: 'EMP002',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Employee 2 vacation',
      };

      const result1 = service.create(dto1);
      const result2 = service.create(dto2);

      expect(result1).toBeDefined();
      expect(result2).toBeDefined();
      expect(result1.employeeId).toBe('EMP001');
      expect(result2.employeeId).toBe('EMP002');
    });
  });

  describe('findAll', () => {
    it('should return empty array when no requests exist', () => {
      const result = service.findAll();
      expect(result).toEqual([]);
    });

    it('should return all leave requests', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto1: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      };

      const dto2: CreateLeaveRequestDto = {
        employeeId: 'EMP002',
        leaveType: 'sick',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Sick leave',
      };

      service.create(dto1);
      service.create(dto2);

      const result = service.findAll();
      expect(result).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return a leave request by id', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Test',
      };

      const created = service.create(dto);
      const found = service.findOne(created.id);

      expect(found).toBeDefined();
      expect(found.id).toBe(created.id);
    });

    it('should throw NotFoundException for non-existent id', () => {
      expect(() => service.findOne('LR999999')).toThrow(NotFoundException);
      expect(() => service.findOne('LR999999')).toThrow(
        'Leave request with ID LR999999 not found',
      );
    });
  });

  describe('findByEmployee', () => {
    it('should return all requests for a specific employee', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto1: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation 1',
      };

      const dto2: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'sick',
        startDate: new Date(
          nextWeek.getTime() + 10 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        endDate: new Date(
          nextWeek.getTime() + 15 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        reason: 'Sick leave',
      };

      const dto3: CreateLeaveRequestDto = {
        employeeId: 'EMP002',
        leaveType: 'personal',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Personal',
      };

      service.create(dto1);
      service.create(dto2);
      service.create(dto3);

      const result = service.findByEmployee('EMP001');
      expect(result).toHaveLength(2);
      expect(result.every((r) => r.employeeId === 'EMP001')).toBe(true);
    });
  });

  describe('approve', () => {
    it('should approve a pending leave request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      };

      const created = service.create(dto);
      const approved = service.approve(created.id);

      expect(approved.status).toBe('approved');
      expect(approved.updatedAt).toBeDefined();
    });

    it('should throw error when approving non-pending request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      };

      const created = service.create(dto);
      service.approve(created.id);

      expect(() => service.approve(created.id)).toThrow(BadRequestException);
      expect(() => service.approve(created.id)).toThrow(
        'Cannot approve leave request with status: approved',
      );
    });
  });

  describe('reject', () => {
    it('should reject a pending leave request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      };

      const created = service.create(dto);
      const rejected = service.reject(created.id);

      expect(rejected.status).toBe('rejected');
      expect(rejected.updatedAt).toBeDefined();
    });
  });

  describe('delete', () => {
    it('should delete a pending leave request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      };

      const created = service.create(dto);
      service.delete(created.id);

      expect(() => service.findOne(created.id)).toThrow(NotFoundException);
    });

    it('should throw error when deleting approved request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      };

      const created = service.create(dto);
      service.approve(created.id);

      expect(() => service.delete(created.id)).toThrow(BadRequestException);
      expect(() => service.delete(created.id)).toThrow(
        'Cannot delete approved leave requests',
      );
    });
  });

  describe('getStatistics', () => {
    it('should return correct statistics for all requests', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto1: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      };

      const dto2: CreateLeaveRequestDto = {
        employeeId: 'EMP002',
        leaveType: 'sick',
        startDate: tomorrow.toISOString(),
        endDate: new Date(
          tomorrow.getTime() + 2 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        reason: 'Sick',
      };

      const created1 = service.create(dto1);
      const created2 = service.create(dto2);
      service.approve(created1.id);
      service.reject(created2.id);

      const stats = service.getStatistics();

      expect(stats.total).toBe(2);
      expect(stats.approved).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.pending).toBe(0);
      expect(stats.totalDaysRequested).toBeGreaterThan(0);
    });

    it('should return statistics for specific employee', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto1: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      };

      const dto2: CreateLeaveRequestDto = {
        employeeId: 'EMP002',
        leaveType: 'sick',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Sick',
      };

      service.create(dto1);
      service.create(dto2);

      const stats = service.getStatistics('EMP001');
      expect(stats.total).toBe(1);
    });
  });

  describe('LeaveRequest entity', () => {
    it('should calculate days requested correctly', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto: CreateLeaveRequestDto = {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      };

      const request = service.create(dto);
      const days = request.getDaysRequested();

      expect(days).toBeGreaterThan(0);
      expect(days).toBe(7);
    });
  });
});
