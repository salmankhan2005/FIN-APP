const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedAdmin() {
  const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@123456', 12);
  
  // Super Admin Account
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@loanflow.com';
  const adminPhone = process.env.ADMIN_PHONE || '6380372501';
  const existingAdmin = await prisma.user.findFirst({
    where: { OR: [{ email: adminEmail }, { role: 'ADMIN' }] }
  });

  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: adminEmail,
        phone: adminPhone,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      }
    });
  } else {
    await prisma.user.create({
      data: {
        name: process.env.ADMIN_NAME || 'Super Admin',
        email: adminEmail,
        phone: adminPhone,
        passwordHash,
        role: 'ADMIN',
        isActive: true,
      }
    });
  }
  console.log('✅ Admin user verified/seeded:', adminEmail);

  // Agent JEEVAA Account
  const agentEmail = 'jeevaamarimuthu8@gmail.com';
  const existingAgent = await prisma.user.findFirst({
    where: { OR: [{ email: agentEmail }, { agentId: 'AGT-9830' }] }
  });

  if (existingAgent) {
    await prisma.user.update({
      where: { id: existingAgent.id },
      data: {
        name: 'JEEVAA',
        email: agentEmail,
        phone: '9865016056',
        agentId: 'AGT-9830',
        role: 'AGENT',
        passwordHash,
        isActive: true,
      }
    });
  } else {
    await prisma.user.create({
      data: {
        name: 'JEEVAA',
        email: agentEmail,
        phone: '9865016056',
        agentId: 'AGT-9830',
        role: 'AGENT',
        passwordHash,
        isActive: true,
      }
    });
  }
  console.log('✅ Agent JEEVAA verified/seeded:', agentEmail);
}

module.exports = { seedAdmin };

