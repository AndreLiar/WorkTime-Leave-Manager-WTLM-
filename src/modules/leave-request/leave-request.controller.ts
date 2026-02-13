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

@Controller('leave-requests')
export class LeaveRequestController {
  constructor(private readonly leaveRequestService: LeaveRequestService) {}

  @Post()
  create(@Body() createLeaveRequestDto: CreateLeaveRequestDto) {
    return this.leaveRequestService.create(createLeaveRequestDto);
  }

  @Get()
  findAll(@Query('employeeId') employeeId?: string) {
    if (employeeId) {
      return this.leaveRequestService.findByEmployee(employeeId);
    }
    return this.leaveRequestService.findAll();
  }

  @Get('statistics')
  getStatistics(@Query('employeeId') employeeId?: string) {
    return this.leaveRequestService.getStatistics(employeeId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.leaveRequestService.findOne(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.leaveRequestService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string) {
    return this.leaveRequestService.reject(id);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.leaveRequestService.delete(id);
    return { message: 'Leave request deleted successfully' };
  }
}
