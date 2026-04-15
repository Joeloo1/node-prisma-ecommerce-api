import "dotenv/config";
import { PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

type Args = {
  email?: string;
  role?: "ADMIN" | "USER";
};

function parseArgs(argv: string[]): Args {
  const args: Args = {};
  for (const arg of argv) {
    if (arg.startsWith("--email=")) {
      args.email = arg.slice("--email=".length).trim().toLowerCase();
    } else if (arg.startsWith("--role=")) {
      const role = arg.slice("--role=".length).trim().toUpperCase();
      if (role === "ADMIN" || role === "USER") args.role = role;
    }
  }
  return args;
}

async function main() {
  const { email, role = "ADMIN" } = parseArgs(process.argv.slice(2));

  if (!email) {
    throw new Error("Missing --email. Usage: npm run db:make-admin -- --email=user@example.com");
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (!existing) {
    throw new Error(`No user found with email: ${email}`);
  }

  const nextRole = role === "ADMIN" ? UserRole.ADMIN : UserRole.USER;
  if (existing.roles === nextRole) {
    console.log(`No change needed. ${email} is already ${nextRole}.`);
    return;
  }

  const updated = await prisma.user.update({
    where: { email },
    data: { roles: nextRole },
    select: { id: true, email: true, roles: true, updatedAt: true },
  });

  console.log(
    `Updated role: ${updated.email} -> ${updated.roles} (at ${updated.updatedAt.toISOString()})`,
  );
}

main()
  .catch((e) => {
    console.error(e instanceof Error ? e.message : String(e));
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

