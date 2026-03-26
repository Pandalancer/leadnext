import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import * as dotenv from 'dotenv'

dotenv.config()

const prisma = new PrismaClient({})

async function main() {
  // Create Super Admin
  const superAdminPassword = await bcrypt.hash('superadmin123', 10)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@leadcrm.com' },
    update: {},
    create: {
      email: 'superadmin@leadcrm.com',
      name: 'Super Admin',
      password: superAdminPassword,
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('Super Admin created:', superAdmin.email)

  // Create Admin
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@leadcrm.com' },
    update: {},
    create: {
      email: 'admin@leadcrm.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  })
  console.log('Admin created:', admin.email)

  // Create Sample Client
  const clientPassword = await bcrypt.hash('client123', 10)
  const client = await prisma.user.upsert({
    where: { email: 'client@leadcrm.com' },
    update: {},
    create: {
      email: 'client@leadcrm.com',
      name: 'Sample Client',
      password: clientPassword,
      role: 'CLIENT',
      status: 'ACTIVE',
      adminId: admin.id,
    },
  })
  console.log('Client created:', client.email)

  // Create sample leads for the client
  const sampleLeads = [
    {
      name: 'John Doe',
      phone: '9876543210',
      email: 'john@example.com',
      city: 'Delhi',
      source: 'MANUAL' as const,
      status: 'NEW' as const,
      remarks: 'Interested in our services',
    },
    {
      name: 'Jane Smith',
      phone: '9876543211',
      email: 'jane@example.com',
      city: 'Mumbai',
      source: 'FACEBOOK' as const,
      status: 'INTERESTED' as const,
      remarks: 'Follow up next week',
      followUpDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    {
      name: 'Bob Johnson',
      phone: '9876543212',
      email: 'bob@example.com',
      city: 'Bangalore',
      source: 'WHATSAPP' as const,
      status: 'CONVERTED' as const,
      remarks: 'Successfully converted',
    },
  ]

  for (const leadData of sampleLeads) {
    await prisma.lead.upsert({
      where: {
        clientId_phone: {
          clientId: client.id,
          phone: leadData.phone,
        },
      },
      update: {},
      create: {
        ...leadData,
        clientId: client.id,
      },
    })
  }
  console.log('Sample leads created')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
