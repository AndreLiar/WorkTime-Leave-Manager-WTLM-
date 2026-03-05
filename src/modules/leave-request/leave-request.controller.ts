import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { LeaveRequestService } from './leave-request.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { LeaveRequestResponseDto } from './dto/leave-request-response.dto';

@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  async create(
    @Body() createLeaveRequestDto: CreateLeaveRequestDto,
  ): Promise<LeaveRequestResponseDto> {
    const request = await this.leaveRequestService.create(createLeaveRequestDto);
    return LeaveRequestResponseDto.fromEntity(request);
  }

  @Get()
  async findAll(
    @Query('employeeId') employeeId?: string,
  ): Promise<LeaveRequestResponseDto[]> {
    const requests = employeeId
      ? await this.leaveRequestService.findByEmployee(employeeId)
      : await this.leaveRequestService.findAll();
    return requests.map((request) =>
      LeaveRequestResponseDto.fromEntity(request),
    );
  }

  @Get('statistics')
  getStatistics(@Query('employeeId') employeeId?: string) {
    return this.leaveRequestService.getStatistics(employeeId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<LeaveRequestResponseDto> {
    const request = await this.leaveRequestService.findOne(id);
    return LeaveRequestResponseDto.fromEntity(request);
  }

  @Patch(':id/approve')
  async approve(@Param('id') id: string): Promise<LeaveRequestResponseDto> {
    const request = await this.leaveRequestService.approve(id);
    return LeaveRequestResponseDto.fromEntity(request);
  }

  @Patch(':id/reject')
  async reject(@Param('id') id: string): Promise<LeaveRequestResponseDto> {
    const request = await this.leaveRequestService.reject(id);
    return LeaveRequestResponseDto.fromEntity(request);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.leaveRequestService.delete(id);
    return { message: 'Leave request deleted successfully' };
  }
}
