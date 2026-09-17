const fs = require('fs');
let auth = fs.readFileSync('src/lib/auth.ts', 'utf8');

const eventsBlock = `
  events: {
    async signIn({ user }) {
      if (user?.id) {
        try {
          await prisma.connectionLog.create({
            data: { userId: user.id }
          })
        } catch(e) {
          console.error("Failed to log connection", e)
        }
      }
    }
  },
  callbacks:`;

if (!auth.includes('events: {')) {
  auth = auth.replace('  callbacks:', eventsBlock);
  fs.writeFileSync('src/lib/auth.ts', auth);
  console.log('auth.ts patched');
}
