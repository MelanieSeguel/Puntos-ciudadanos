import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Iniciando seed de la base de datos...');

  try {
    // Limpiar datos existentes (opcional - comentar en producción)
    await prisma.pointTransaction.deleteMany();
    await prisma.wallet.deleteMany();
    await prisma.news.deleteMany();
    await prisma.benefit.deleteMany();
    await prisma.user.deleteMany();
    
    console.log('Datos anteriores eliminados');

    // ============================================
    // CREAR USUARIOS
    // ============================================
    
    const passwordHash = await bcrypt.hash('admin123', 12);
    
    const admin = await prisma.user.create({
      data: {
        nombre: 'Administrador Energía CO2',
        email: 'admin@energiaco2.com',
        passwordHash,
        rol: 'ADMIN',
        estado: 'ACTIVE',
      },
    });
    
    console.log('Usuario administrador creado');

    const userPasswordHash = await bcrypt.hash('user123', 12);
    
    const user1 = await prisma.user.create({
      data: {
        nombre: 'María González',
        email: 'maria@example.com',
        passwordHash: userPasswordHash,
        rol: 'USER',
        estado: 'ACTIVE',
        wallet: {
          create: {
            saldoActual: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    const user2 = await prisma.user.create({
      data: {
        nombre: 'Juan Pérez',
        email: 'juan@example.com',
        passwordHash: userPasswordHash,
        rol: 'USER',
        estado: 'ACTIVE',
        wallet: {
          create: {
            saldoActual: 0,
          },
        },
      },
      include: {
        wallet: true,
      },
    });

    console.log('Usuarios ciudadanos creados con sus wallets');

    // ============================================
    // CREAR BENEFICIOS
    // ============================================

    const benefits = await prisma.benefit.createMany({
      data: [
        {
          titulo: 'Descuento 10% en Supermercado Local',
          descripcion: 'Obtén un 10% de descuento en tu próxima compra en supermercados participantes',
          costoPuntos: 500,
          stock: 100,
          activo: true,
          categoria: 'Descuentos',
        },
        {
          titulo: 'Entrada Gratis a Museo Municipal',
          descripcion: 'Entrada gratuita para 2 personas al Museo de la Ciudad',
          costoPuntos: 300,
          stock: 50,
          activo: true,
          categoria: 'Cultura',
        },
        {
          titulo: 'Kit de Reciclaje Doméstico',
          descripcion: 'Kit completo con contenedores para reciclar en casa',
          costoPuntos: 800,
          stock: 25,
          activo: true,
          categoria: 'Productos',
        },
        {
          titulo: 'Plantación de Árbol a tu Nombre',
          descripcion: 'Plantamos un árbol en el parque central a tu nombre',
          costoPuntos: 1000,
          stock: 30,
          activo: true,
          categoria: 'Ecología',
        },
        {
          titulo: 'Clase de Yoga en el Parque',
          descripcion: 'Sesión grupal de yoga al aire libre (1 hora)',
          costoPuntos: 200,
          stock: 20,
          activo: true,
          categoria: 'Salud',
        },
      ],
    });

    console.log('Catálogo de beneficios creado');

    // ============================================
    // CREAR NOTICIAS
    // ============================================

    await prisma.news.createMany({
      data: [
        {
          titulo: '¡Bienvenidos a Puntos Ciudadanos!',
          cuerpo: 'Estamos emocionados de lanzar esta plataforma que premia tus buenas acciones. Cada acción positiva que realices suma puntos que puedes canjear por beneficios increíbles.',
          autorId: admin.id,
          publicada: true,
        },
        {
          titulo: 'Nueva Campaña de Reciclaje',
          cuerpo: 'Este mes lanzamos una campaña especial de reciclaje. Por cada kg de material reciclado, ganas puntos extra. ¡Participa y ayuda al planeta!',
          autorId: admin.id,
          publicada: true,
        },
        {
          titulo: 'Mantenimiento Programado',
          cuerpo: 'El próximo sábado realizaremos mantenimiento al sistema entre las 2:00 AM y 4:00 AM. Disculpa las molestias.',
          autorId: admin.id,
          publicada: false,
        },
      ],
    });

    console.log('Noticias creadas');

    // ============================================
    // CREAR TRANSACCIONES DE EJEMPLO
    // ============================================

    // Transacción para user1
    await prisma.pointTransaction.create({
      data: {
        walletId: user1.wallet.id,
        tipo: 'EARNED',
        monto: 150,
        descripcion: 'Puntos por registrarse en la plataforma',
        metadata: {
          action: 'registration_bonus',
          timestamp: new Date().toISOString(),
        },
      },
    });

    await prisma.wallet.update({
      where: { id: user1.wallet.id },
      data: { saldoActual: 150 },
    });

    // Transacción para user2
    await prisma.pointTransaction.create({
      data: {
        walletId: user2.wallet.id,
        tipo: 'EARNED',
        monto: 250,
        descripcion: 'Puntos por reciclar 5kg de plástico',
        metadata: {
          action: 'recycling',
          amount: '5kg',
          material: 'plastic',
        },
      },
    });

    await prisma.wallet.update({
      where: { id: user2.wallet.id },
      data: { saldoActual: 250 },
    });

    console.log('Transacciones de ejemplo creadas');

    console.log('\nSeed completado exitosamente!\n');
    console.log('Datos de prueba:');
    console.log('   - Admin: admin@energiaco2.com / admin123');
    console.log('   - Usuario: maria@example.com / user123');
    console.log('   - Usuario: juan@example.com / user123');
    console.log('   - 5 Beneficios creados');
    console.log('   - 3 Noticias creadas\n');
    
  } catch (error) {
    console.error('Error durante el seed:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
