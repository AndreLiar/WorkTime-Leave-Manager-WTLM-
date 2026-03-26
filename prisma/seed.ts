import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const d = (daysOffset: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date;
};

const LEAVE_REQUESTS = [
  // EMP001 — approved vacation (past)
  {
    employeeId: 'EMP001',
    leaveType: 'vacation',
    startDate: d(-30),
    endDate: d(-25),
    reason: 'Annual family vacation',
    status: 'approved',
  },
  // EMP001 — pending vacation (future)
  {
    employeeId: 'EMP001',
    leaveType: 'vacation',
    startDate: d(20),
    endDate: d(25),
    reason: 'Summer holiday',
    status: 'pending',
  },
  // EMP002 — approved sick leave (past)
  {
    employeeId: 'EMP002',
    leaveType: 'sick',
    startDate: d(-10),
    endDate: d(-8),
    reason: 'Flu recovery',
    status: 'approved',
  },
  // EMP002 — rejected personal (past)
  {
    employeeId: 'EMP002',
    leaveType: 'personal',
    startDate: d(-5),
    endDate: d(-4),
    reason: 'Personal appointment',
    status: 'rejected',
  },
  // EMP002 — pending future
  {
    employeeId: 'EMP002',
    leaveType: 'vacation',
    startDate: d(30),
    endDate: d(35),
    reason: 'Beach trip',
    status: 'pending',
  },
  // EMP003 — approved unpaid (past)
  {
    employeeId: 'EMP003',
    leaveType: 'unpaid',
    startDate: d(-60),
    endDate: d(-50),
    reason: 'Extended personal leave',
    status: 'approved',
  },
  // EMP003 — pending sick (future)
  {
    employeeId: 'EMP003',
    leaveType: 'sick',
    startDate: d(5),
    endDate: d(6),
    reason: 'Medical procedure follow-up',
    status: 'pending',
  },
  // EMP004 — rejected vacation (past)
  {
    employeeId: 'EMP004',
    leaveType: 'vacation',
    startDate: d(-15),
    endDate: d(-10),
    reason: 'Travel abroad',
    status: 'rejected',
  },
  // EMP004 — pending future
  {
    employeeId: 'EMP004',
    leaveType: 'personal',
    startDate: d(10),
    endDate: d(11),
    reason: 'Home renovation',
    status: 'pending',
  },
  // EMP005 — approved (past)
  {
    employeeId: 'EMP005',
    leaveType: 'vacation',
    startDate: d(-45),
    endDate: d(-40),
    reason: 'Wedding celebration',
    status: 'approved',
  },
  // EMP005 — approved sick (past)
  {
    employeeId: 'EMP005',
    leaveType: 'sick',
    startDate: d(-20),
    endDate: d(-19),
    reason: 'Doctor appointment',
    status: 'approved',
  },
  // EMP005 — pending future
  {
    employeeId: 'EMP005',
    leaveType: 'vacation',
    startDate: d(40),
    endDate: d(47),
    reason: 'Year-end holiday',
    status: 'pending',
  },
];

async function main() {
  console.log('🌱 Seeding database...');

  // Clear existing seed data (employees EMP001–EMP005 only)
  const deleted = await prisma.leaveRequest.deleteMany({
    where: {
      employeeId: { in: ['EMP001', 'EMP002', 'EMP003', 'EMP004', 'EMP005'] },
    },
  });
  console.log(`🗑️  Cleared ${deleted.count} existing seed records`);

  for (const data of LEAVE_REQUESTS) {
    await prisma.leaveRequest.create({ data });
  }

  console.log(`✅ Seeded ${LEAVE_REQUESTS.length} leave requests`);

  const stats = await prisma.leaveRequest.groupBy({
    by: ['status'],
    _count: { status: true },
  });
  stats.forEach(({ status, _count }) =>
    console.log(`   ${status}: ${_count.status}`),
  );
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
