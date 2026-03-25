const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const enquiries = await prisma.enquiry.findMany();
  console.log('Enquiries:', JSON.stringify(enquiries, null, 2));
  
  const bookings = await prisma.booking.findMany({ include: { user: true, package: true } });
  console.log('Bookings:', JSON.stringify(bookings, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
