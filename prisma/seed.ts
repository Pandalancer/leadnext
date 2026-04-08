import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({})

async function main() {
  // Create Super Admin - CHANGE THESE DEFAULTS IN PRODUCTION
  const superAdminPassword = await bcrypt.hash('ChangeMe@SuperAdmin1!', 12)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@leadcrm.com' },
    update: { password: superAdminPassword },
    create: {
      email: 'superadmin@leadcrm.com',
      name: 'Super Admin',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('Super Admin created:', superAdmin.email)

  // Create Admin - CHANGE THESE DEFAULTS IN PRODUCTION
  const adminPassword = await bcrypt.hash('ChangeMe@Admin1!', 12)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@leadcrm.com' },
    update: { password: adminPassword },
    create: {
      email: 'admin@leadcrm.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('Admin created:', admin.email)

  // Create sample leads for admin
  const sampleLeads = [
    {
      name: 'Rahul Sharma',
      phone: '9876543210',
      email: 'rahul@example.com',
      city: 'Delhi',
      source: 'MANUAL' as const,
      status: 'NEW' as const,
      remarks: 'Interested in our services',
    },
    {
      name: 'Priya Patel',
      phone: '9876543211',
      email: 'priya@example.com',
      city: 'Mumbai',
      source: 'FACEBOOK' as const,
      status: 'INTERESTED' as const,
      remarks: 'Follow up next week',
    },
    {
      name: 'Amit Singh',
      phone: '9876543212',
      email: 'amit@example.com',
      city: 'Bangalore',
      source: 'WHATSAPP' as const,
      status: 'CONVERTED' as const,
      remarks: 'Successfully converted',
    },
  ]

  for (const leadData of sampleLeads) {
    await prisma.lead.upsert({
      where: {
        adminId_phone: {
          adminId: admin.id,
          phone: leadData.phone,
        },
      },
      update: {},
      create: {
        ...leadData,
        adminId: admin.id,
      },
    })
  }
  console.log('Sample leads created')

  console.log('⚠️  IMPORTANT: Change default passwords before sharing access with anyone.')
  console.log('   Super Admin: superadmin@leadcrm.com')
  console.log('   Admin:       admin@leadcrm.com')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
