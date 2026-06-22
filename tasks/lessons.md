# Lessons

Running log of corrections, so the same mistake doesn't recur. Newest first.

## Prisma 7 + Turbopack: restart the dev server after a schema change

**Symptom:** After `prisma migrate dev` + `prisma generate`, the running `next dev` server
threw confusing, *flip-flopping* Prisma validation errors — one request rejected a new field
(`Unknown argument canDrive`), the next rejected something else — even though the on-disk
generated client (`src/generated/prisma`) was correct (`grep canDrive` found it).

**Cause:** Turbopack caches the generated Prisma client module. After regenerating, the dev
server can keep serving a stale client.

**Fix / rule:** After any schema change, do all three: `prisma migrate dev` → `prisma
generate` → **restart `next dev`** (and `rm -rf .next/dev .next/cache` if it persists).
Don't trust hot-reload for the generated client. Verify the field is in the generated
client on disk before assuming a code bug.

## Prisma 7 nested create: use the relation, not the scalar FK

**Symptom:** `household.create({ data: { persons: { create: { userId: user.id, ... } } } })`
failed at runtime: `Unknown argument 'userId'. Did you mean 'user'?`

**Cause:** In a nested (checked) create, Prisma 7 expects the *relation* form for a foreign
key, not the scalar column.

**Fix / rule:** Use `user: { connect: { id: user.id } }` instead of `userId: user.id` inside
nested `create` blocks. (Scalar FKs are only accepted in top-level *unchecked* creates.)
