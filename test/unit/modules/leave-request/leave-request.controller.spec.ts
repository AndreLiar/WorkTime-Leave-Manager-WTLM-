import { Test, TestingModule } from '@nestjs/testing';
import { LeaveRequestController } from '../../../../src/modules/leave-request/leave-request.controller';
import { LeaveRequestService } from '../../../../src/modules/leave-request/leave-request.service';
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

describe('LeaveRequestController', () => {
  let controller: LeaveRequestController;
  let service: jest.Mocked<LeaveRequestService>;

  const dto = {
    employeeId: 'EMP001',
    leaveType: 'vacation' as const,
    startDate: '2026-03-15T00:00:00.000Z',
    endDate: '2026-03-20T00:00:00.000Z',
    reason: 'Family vacation',
  };

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findByEmployee: jest.fn(),
      findOne: jest.fn(),
      approve: jest.fn(),
      reject: jest.fn(),
      delete: jest.fn(),
      getStatistics: jest.fn(),
    } as unknown as jest.Mocked<LeaveRequestService>;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveRequestController],
      providers: [{ provide: LeaveRequestService, useValue: service }],
    }).compile();

    controller = module.get<LeaveRequestController>(LeaveRequestController);
  });

  it('creates a leave request and maps response DTO', async () => {
    const request = buildLeaveRequest();
    service.create.mockResolvedValue(request);

    const result = await controller.create(dto);

    expect(result.id).toBe(request.id);
    expect(result.employeeId).toBe('EMP001');
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('lists all requests when no employeeId filter', async () => {
    const list = [buildLeaveRequest(), buildLeaveRequest({ id: 'lr_2' })];
    service.findAll.mockResolvedValue(list);

    const result = await controller.findAll();

    expect(result).toHaveLength(2);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('filters requests by employeeId', async () => {
    const list = [buildLeaveRequest({ employeeId: 'EMP999' })];
    service.findByEmployee.mockResolvedValue(list);

    const result = await controller.findAll('EMP999');

    expect(result).toHaveLength(1);
    expect(result[0].employeeId).toBe('EMP999');
    expect(service.findByEmployee).toHaveBeenCalledWith('EMP999');
  });

  it('returns a single request', async () => {
    const request = buildLeaveRequest();
    service.findOne.mockResolvedValue(request);

    const result = await controller.findOne('lr_1');
    expect(result.id).toBe('lr_1');
  });

  it('approves a request', async () => {
    const approved = buildLeaveRequest({ status: 'approved' });
    service.approve.mockResolvedValue(approved);

    const result = await controller.approve('lr_1');
    expect(result.status).toBe('approved');
    expect(service.approve).toHaveBeenCalledWith('lr_1');
  });

  it('rejects a request', async () => {
    const rejected = buildLeaveRequest({ status: 'rejected' });
    service.reject.mockResolvedValue(rejected);

    const result = await controller.reject('lr_1');
    expect(result.status).toBe('rejected');
  });

  it('removes a request and returns confirmation', async () => {
    service.delete.mockResolvedValue(undefined);

    const response = await controller.remove('lr_1');
    expect(response).toEqual({ message: 'Leave request deleted successfully' });
    expect(service.delete).toHaveBeenCalledWith('lr_1');
  });

  it('returns statistics', async () => {
    const stats = { total: 1, pending: 1, approved: 0, rejected: 0, totalDaysRequested: 2 };
    service.getStatistics.mockResolvedValue(stats);

    expect(await controller.getStatistics()).toEqual(stats);
    expect(service.getStatistics).toHaveBeenCalledWith(undefined);
  });
});
