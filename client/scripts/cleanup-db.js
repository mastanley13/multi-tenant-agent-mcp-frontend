const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function cleanupDatabase() {
  try {
    console.log('🧹 Starting database cleanup...\n')
    
    // Find the invalid "unknown" user
    const unknownUser = await prisma.user.findUnique({
      where: { id: 'unknown' },
      include: {
        conversations: true,
        accounts: true
      }
    })
    
    // Find the valid user
    const validUser = await prisma.user.findFirst({
      where: {
        locationId: { not: null },
        id: { not: 'unknown' }
      }
    })
    
    if (!unknownUser) {
      console.log('✅ No invalid "unknown" user found')
      return
    }
    
    if (!validUser) {
      console.log('❌ No valid user found to migrate data to')
      return
    }
    
    console.log(`📋 Found invalid user: ${unknownUser.id}`)
    console.log(`📋 Found valid user: ${validUser.id}`)
    console.log(`📋 Conversations to migrate: ${unknownUser.conversations.length}`)
    console.log(`📋 Accounts to clean: ${unknownUser.accounts.length}`)
    
    // Migrate conversations from unknown user to valid user
    if (unknownUser.conversations.length > 0) {
      console.log('\n🔄 Migrating conversations...')
      
      for (const conversation of unknownUser.conversations) {
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { userId: validUser.id }
        })
        console.log(`  ✅ Migrated conversation: ${conversation.title}`)
      }
    }
    
    // Delete accounts associated with unknown user
    if (unknownUser.accounts.length > 0) {
      console.log('\n🗑️ Cleaning up invalid accounts...')
      
      for (const account of unknownUser.accounts) {
        await prisma.account.delete({
          where: { id: account.id }
        })
        console.log(`  ✅ Deleted account: ${account.id}`)
      }
    }
    
    // Delete the unknown user
    console.log('\n🗑️ Deleting invalid user...')
    await prisma.user.delete({
      where: { id: 'unknown' }
    })
    console.log(`  ✅ Deleted user: unknown`)
    
    console.log('\n🎉 Database cleanup completed successfully!')
    
    // Show final state
    const remainingUsers = await prisma.user.findMany({
      include: {
        _count: {
          select: {
            conversations: true,
            accounts: true
          }
        }
      }
    })
    
    console.log('\n📊 Final database state:')
    remainingUsers.forEach(user => {
      console.log(`  - User: ${user.id}`)
      console.log(`    LocationID: ${user.locationId}`)
      console.log(`    Conversations: ${user._count.conversations}`)
      console.log(`    Accounts: ${user._count.accounts}`)
    })
    
  } catch (error) {
    console.error('❌ Error during cleanup:', error)
  } finally {
    await prisma.$disconnect()
  }
}

cleanupDatabase() 