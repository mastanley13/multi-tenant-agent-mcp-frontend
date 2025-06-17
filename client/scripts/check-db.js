const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkDatabase() {
  try {
    console.log('🔍 Checking database state...\n')
    
    // Check users
    const users = await prisma.user.findMany({
      include: {
        accounts: true,
        conversations: true,
        _count: {
          select: {
            conversations: true,
            accounts: true
          }
        }
      }
    })
    
    console.log(`👥 Found ${users.length} users:`)
    users.forEach(user => {
      console.log(`  - ID: ${user.id}`)
      console.log(`    Name: ${user.name}`)
      console.log(`    Email: ${user.email}`)
      console.log(`    LocationID: ${user.locationId}`)
      console.log(`    Conversations: ${user._count.conversations}`)
      console.log(`    Accounts: ${user._count.accounts}`)
      console.log(`    Created: ${user.createdAt}`)
      console.log('')
    })
    
    // Check accounts
    const accounts = await prisma.account.findMany()
    console.log(`🔐 Found ${accounts.length} accounts:`)
    accounts.forEach(account => {
      console.log(`  - Provider: ${account.provider}`)
      console.log(`    UserID: ${account.userId}`)
      console.log(`    ProviderAccountID: ${account.providerAccountId}`)
      console.log(`    LocationID: ${account.locationId}`)
      console.log(`    CompanyID: ${account.companyId}`)
      console.log(`    UserType: ${account.userType}`)
      console.log(`    Has Access Token: ${account.access_token ? 'YES' : 'NO'}`)
      console.log('')
    })
    
    // Check conversations
    const conversations = await prisma.conversation.findMany({
      include: {
        _count: {
          select: {
            messages: true
          }
        }
      }
    })
    
    console.log(`💬 Found ${conversations.length} conversations:`)
    conversations.forEach(conv => {
      console.log(`  - ID: ${conv.id}`)
      console.log(`    UserID: ${conv.userId}`)
      console.log(`    Title: ${conv.title}`)
      console.log(`    Messages: ${conv._count.messages}`)
      console.log(`    Created: ${conv.createdAt}`)
      console.log('')
    })
    
  } catch (error) {
    console.error('❌ Error checking database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkDatabase() 