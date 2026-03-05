import { BadRequestException, NotFoundException } from '@nestjs/common';
import { LeaveRequestService } from '../../../../src/modules/leave-request/leave-request.service';
import { LeaveRequestRepository } from '../../../../src/modules/leave-request/leave-request.repository';
import { CreateLeaveRequestDto } from '../../../../src/modules/leave-request/dto/create-leave-request.dto';
import { LeaveRequest } from '../../../../src/modules/leave-request/leave-request.entity';

const buildLeaveRequest = (data?: Partial<LeaveRequest>): LeaveRequest =>
  new LeaveRequest({
    id: data?.id ?? 'lr_1',
    employeeId: data?.employeeId ?? 'EMP001',
    leaveType: data?.leaveType ?? 'vacation',
    startDate:
      data?.startDate ?? new Date('2026-03-15T00:00:00.000Z'),
    endDate: data?.endDate ?? new Date('2026-03-20T00:00:00.000Z'),
    reason: data?.reason ?? 'Family vacation',
    status: data?.status ?? 'pending',
    createdAt: data?.createdAt ?? new Date('2026-03-01T00:00:00.000Z'),
    updatedAt: data?.updatedAt ?? new Date('2026-03-01T00:00:00.000Z'),
  });

describe('LeaveRequestService', () => {
  let service: LeaveRequestService;
  let repository: jest.Mocked<LeaveRequestRepository>;

  const validDto = (): CreateLeaveRequestDto => ({
    employeeId: 'EMP001',
    leaveType: 'vacation',
    startDate: '2026-03-15T00:00:00.000Z',
    endDate: '2026-03-20T00:00:00.000Z',
    reason: 'Family vacation',
  });

  beforeEach(() => {
    repository = {
      create: jest.fn(),
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmployee: jest.fn(),
      updateStatus: jest.fn(),
      delete: jest.fn(),
      findOverlapping: jest.fn(),
      findMany: jest.fn(),
    } as unknown as jest.Mocked<LeaveRequestRepository>;

    service = new LeaveRequestService(repository);
  });

  describe('create', () => {
    it('persists a leave request when data is valid', async () => {
      const request = buildLeaveRequest();
      repository.findOverlapping.mockResolvedValue([]);
      repository.create.mockResolvedValue(request);

      await expect(service.create(validDto())).resolves.toEqual(request);

      expect(repository.create).toHaveBeenCalledWith({
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: new Date('2026-03-15T00:00:00.000Z'),
        endDate: new Date('2026-03-20T00:00:00.000Z'),
        reason: 'Family vacation',
        status: 'pending',
      });
    });

    it('rejects invalid dates', async () => {
      const dto = {
        ...validDto(),
        startDate: 'invalid',
        endDate: 'invalid',
      };

      await expect(service.create(dto)).rejects.toThrow(BadRequestException);
      await expect(service.create(dto)).rejects.toThrow('Invalid date format');
    });

    it('rejects start dates after end dates', async () => {
      const dto = {
        ...validDto(),
        startDate: '2026-03-22T00:00:00.000Z',
        endDate: '2026-03-20T00:00:00.000Z',
      };

      await expect(service.create(dto)).rejects.toThrow(
        'Start date must be before end date',
      );
    });

    it('rejects past start dates', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dto = {
        ...validDto(),
        startDate: yesterday.toISOString(),
        endDate: tomorrow.toISOString(),
      };

      await expect(service.create(dto)).rejects.toThrow(
        'Cannot request leave in the past',
      );
    });

    it('rejects overlapping requests', async () => {
      repository.findOverlapping.mockResolvedValue([buildLeaveRequest()]);

      await expect(service.create(validDto())).rejects.toThrow(
        'Leave request overlaps with existing request',
      );
    });
  });

  describe('findAll', () => {
    it('returns all requests', async () => {
      const list = [buildLeaveRequest()];
      repository.findAll.mockResolvedValue(list);

      await expect(service.findAll()).resolves.toEqual(list);
      expect(repository.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('returns an existing request', async () => {
      const request = buildLeaveRequest();
      repository.findById.mockResolvedValue(request);

      await expect(service.findOne('lr_1')).resolves.toEqual(request);
    });

    it('throws when request is missing', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('lr_missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByEmployee', () => {
    it('returns requests for the employee', async () => {
      const list = [buildLeaveRequest({ employeeId: 'EMP999' })];
      repository.findByEmployee.mockResolvedValue(list);

      await expect(service.findByEmployee('EMP999')).resolves.toEqual(list);
    });
  });

  describe('approve', () => {
    it('updates the status when pending', async () => {
      const pending = buildLeaveRequest();
      const approved = buildLeaveRequest({ status: 'approved' });
      repository.findById.mockResolvedValue(pending);
      repository.updateStatus.mockResolvedValue(approved);

      await expect(service.approve('lr_1')).resolves.toEqual(approved);
      expect(repository.updateStatus).toHaveBeenCalledWith('lr_1', 'approved');
    });

    it('throws when status is not pending', async () => {
      repository.findById.mockResolvedValue(buildLeaveRequest({ status: 'approved' }));

      await expect(service.approve('lr_1')).rejects.toThrow(
        'Cannot approve leave request with status: approved',
      );
    });
  });

  describe('reject', () => {
    it('updates the status when pending', async () => {
      const pending = buildLeaveRequest();
      const rejected = buildLeaveRequest({ status: 'rejected' });
      repository.findById.mockResolvedValue(pending);
      repository.updateStatus.mockResolvedValue(rejected);

      await expect(service.reject('lr_1')).resolves.toEqual(rejected);
      expect(repository.updateStatus).toHaveBeenCalledWith('lr_1', 'rejected');
    });

    it('throws when status is not pending', async () => {
      repository.findById.mockResolvedValue(buildLeaveRequest({ status: 'approved' }));

      await expect(service.reject('lr_1')).rejects.toThrow(
        'Cannot reject leave request with status: approved',
      );
    });
  });

  describe('delete', () => {
    it('deletes non-approved requests', async () => {
      repository.findById.mockResolvedValue(buildLeaveRequest({ status: 'pending' }));
      repository.delete.mockResolvedValue(undefined);

      await expect(service.delete('lr_1')).resolves.toBeUndefined();
      expect(repository.delete).toHaveBeenCalledWith('lr_1');
    });

    it('throws when request is approved', async () => {
      repository.findById.mockResolvedValue(buildLeaveRequest({ status: 'approved' }));

      await expect(service.delete('lr_1')).rejects.toThrow(
        'Cannot delete approved leave requests',
      );
      expect(repository.delete).not.toHaveBeenCalled();
    });
  });

  describe('getStatistics', () => {
    it('aggregates totals', async () => {
      const list = [
        buildLeaveRequest({ status: 'approved', startDate: new Date('2026-01-01'), endDate: new Date('2026-01-03') }),
        buildLeaveRequest({ status: 'rejected', id: 'lr_2' }),
        buildLeaveRequest({ status: 'pending', id: 'lr_3' }),
      ];
      repository.findMany.mockResolvedValue(list);

      const stats = await service.getStatistics();

      expect(stats.total).toBe(3);
      expect(stats.approved).toBe(1);
      expect(stats.rejected).toBe(1);
      expect(stats.pending).toBe(1);
      const expectedDays = list.reduce(
        (sum, request) => sum + request.getDaysRequested(),
        0,
      );
      expect(stats.totalDaysRequested).toBe(expectedDays);
    });

    it('applies employee filtering', async () => {
      repository.findMany.mockResolvedValue([buildLeaveRequest({ employeeId: 'EMP123' })]);

      const stats = await service.getStatistics('EMP123');
      expect(repository.findMany).toHaveBeenCalledWith({ employeeId: 'EMP123' });
      expect(stats.total).toBe(1);
    });
  });
});
