import { LeaveRequestRepository } from '../../../../src/modules/leave-request/leave-request.repository';
import { PrismaService } from '../../../../src/database/prisma.service';
import { LeaveRequest } from '../../../../src/modules/leave-request/leave-request.entity';

const buildPrismaRecord = (overrides: Record<string, any> = {}) => ({
  id: 'lr_1',
  employeeId: 'EMP001',
  leaveType: 'vacation',
  startDate: new Date('2026-03-15T00:00:00.000Z'),
  endDate: new Date('2026-03-20T00:00:00.000Z'),
  reason: 'Family vacation',
  status: 'pending',
  createdAt: new Date('2026-03-01T00:00:00.000Z'),
  updatedAt: new Date('2026-03-01T00:00:00.000Z'),
  ...overrides,
});

describe('LeaveRequestRepository', () => {
  let repository: LeaveRequestRepository;
  let prismaMock: {
    leaveRequest: {
      create: jest.Mock;
      findMany: jest.Mock;
      findUnique: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeEach(() => {
    prismaMock = {
      leaveRequest: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    repository = new LeaveRequestRepository(prismaMock as unknown as PrismaService);
  });

  it('creates and maps a leave request entity', async () => {
    const persisted = buildPrismaRecord();
    prismaMock.leaveRequest.create.mockResolvedValue(persisted);

    const result = await repository.create({
      employeeId: 'EMP001',
      leaveType: 'vacation',
      startDate: persisted.startDate,
      endDate: persisted.endDate,
      reason: 'Family vacation',
      status: 'pending',
    });

    expect(prismaMock.leaveRequest.create).toHaveBeenCalledWith({
      data: {
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: persisted.startDate,
        endDate: persisted.endDate,
        reason: 'Family vacation',
        status: 'pending',
      },
    });
    expect(result).toBeInstanceOf(LeaveRequest);
    expect(result.employeeId).toBe('EMP001');
  });

  it('returns ordered leave requests', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([buildPrismaRecord()]);

    const results = await repository.findAll();

    expect(prismaMock.leaveRequest.findMany).toHaveBeenCalledWith({
      orderBy: { createdAt: 'desc' },
    });
    expect(results[0]).toBeInstanceOf(LeaveRequest);
  });

  it('finds by id and returns null when missing', async () => {
    prismaMock.leaveRequest.findUnique.mockResolvedValue(buildPrismaRecord());
    const found = await repository.findById('lr_1');
    expect(found?.id).toBe('lr_1');

    prismaMock.leaveRequest.findUnique.mockResolvedValue(null);
    const missing = await repository.findById('lr_missing');
    expect(missing).toBeNull();
  });

  it('filters by employee', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([buildPrismaRecord({ employeeId: 'EMP999' })]);

    const results = await repository.findByEmployee('EMP999');

    expect(prismaMock.leaveRequest.findMany).toHaveBeenCalledWith({
      where: { employeeId: 'EMP999' },
      orderBy: { createdAt: 'desc' },
    });
    expect(results[0].employeeId).toBe('EMP999');
  });

  it('updates status and maps entity', async () => {
    prismaMock.leaveRequest.update.mockResolvedValue(buildPrismaRecord({ status: 'approved' }));

    const result = await repository.updateStatus('lr_1', 'approved');

    expect(prismaMock.leaveRequest.update).toHaveBeenCalledWith({
      where: { id: 'lr_1' },
      data: { status: 'approved' },
    });
    expect(result.status).toBe('approved');
  });

  it('deletes by id', async () => {
    prismaMock.leaveRequest.delete.mockResolvedValue(undefined);

    await repository.delete('lr_1');
    expect(prismaMock.leaveRequest.delete).toHaveBeenCalledWith({ where: { id: 'lr_1' } });
  });

  it('finds overlapping requests', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([buildPrismaRecord()]);

    const start = new Date('2026-03-15T00:00:00.000Z');
    const end = new Date('2026-03-20T00:00:00.000Z');

    const results = await repository.findOverlapping('EMP001', start, end);

    expect(prismaMock.leaveRequest.findMany).toHaveBeenCalledWith({
      where: {
        employeeId: 'EMP001',
        status: { not: 'rejected' },
        AND: [
          { startDate: { lte: end } },
          { endDate: { gte: start } },
        ],
      },
    });
    expect(results).toHaveLength(1);
  });

  it('passes through filters in findMany()', async () => {
    prismaMock.leaveRequest.findMany.mockResolvedValue([buildPrismaRecord({ employeeId: 'EMP777' })]);

    const results = await repository.findMany({ employeeId: 'EMP777' });

    expect(prismaMock.leaveRequest.findMany).toHaveBeenCalledWith({ where: { employeeId: 'EMP777' } });
    expect(results[0].employeeId).toBe('EMP777');
  });
});
