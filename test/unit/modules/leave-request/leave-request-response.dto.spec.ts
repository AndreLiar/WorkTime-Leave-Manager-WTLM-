import { LeaveRequestResponseDto } from '../../../../src/modules/leave-request/dto/leave-request-response.dto';
import { LeaveRequest } from '../../../../src/modules/leave-request/leave-request.entity';

describe('LeaveRequestResponseDto', () => {
  it('maps entity fields to serializable payload', () => {
    const entity = new LeaveRequest({
      id: 'lr_1',
      employeeId: 'EMP001',
      leaveType: 'vacation',
      startDate: new Date('2026-03-15T00:00:00.000Z'),
      endDate: new Date('2026-03-20T00:00:00.000Z'),
      reason: 'Family vacation',
      status: 'pending',
      createdAt: new Date('2026-03-01T00:00:00.000Z'),
      updatedAt: new Date('2026-03-02T00:00:00.000Z'),
    });

    const dto = LeaveRequestResponseDto.fromEntity(entity);

    expect(dto).toEqual({
      id: 'lr_1',
      employeeId: 'EMP001',
      leaveType: 'vacation',
      startDate: '2026-03-15T00:00:00.000Z',
      endDate: '2026-03-20T00:00:00.000Z',
      reason: 'Family vacation',
      status: 'pending',
      createdAt: '2026-03-01T00:00:00.000Z',
      updatedAt: '2026-03-02T00:00:00.000Z',
    });
  });
});
