import { Test, TestingModule } from '@nestjs/testing';
import { LeaveRequestController } from './leave-request.controller';
import { LeaveRequestService } from './leave-request.service';

describe('LeaveRequestController', () => {
  let controller: LeaveRequestController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LeaveRequestController],
      providers: [LeaveRequestService],
    }).compile();

    controller = module.get<LeaveRequestController>(LeaveRequestController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a leave request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const dto = {
        employeeId: 'EMP001',
        leaveType: 'vacation' as const,
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Family vacation',
      };

      const result = controller.create(dto);

      expect(result).toBeDefined();
      expect(result.employeeId).toBe('EMP001');
      expect(result.status).toBe('pending');
    });
  });

  describe('findAll', () => {
    it('should return all leave requests when no employeeId provided', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      controller.create({
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      });

      const result = controller.findAll();
      expect(result).toHaveLength(1);
    });

    it('should filter by employeeId when provided', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      controller.create({
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      });

      controller.create({
        employeeId: 'EMP002',
        leaveType: 'sick',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Sick',
      });

      const result = controller.findAll('EMP001');
      expect(result).toHaveLength(1);
      expect(result[0].employeeId).toBe('EMP001');
    });
  });

  describe('findOne', () => {
    it('should return a single leave request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const created = controller.create({
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Test',
      });

      const result = controller.findOne(created.id);
      expect(result.id).toBe(created.id);
    });
  });

  describe('approve', () => {
    it('should approve a leave request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const created = controller.create({
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      });

      const result = controller.approve(created.id);
      expect(result.status).toBe('approved');
    });
  });

  describe('reject', () => {
    it('should reject a leave request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const created = controller.create({
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      });

      const result = controller.reject(created.id);
      expect(result.status).toBe('rejected');
    });
  });

  describe('remove', () => {
    it('should delete a leave request', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      const created = controller.create({
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Test',
      });

      const result = controller.remove(created.id);
      expect(result.message).toBe('Leave request deleted successfully');
    });
  });

  describe('getStatistics', () => {
    it('should return statistics', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);

      controller.create({
        employeeId: 'EMP001',
        leaveType: 'vacation',
        startDate: tomorrow.toISOString(),
        endDate: nextWeek.toISOString(),
        reason: 'Vacation',
      });

      const stats = controller.getStatistics();
      expect(stats).toHaveProperty('total');
      expect(stats).toHaveProperty('pending');
      expect(stats).toHaveProperty('approved');
      expect(stats).toHaveProperty('rejected');
      expect(stats.total).toBe(1);
    });
  });
});
