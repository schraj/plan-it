-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Person" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "canDrive" BOOLEAN NOT NULL DEFAULT false,
    "householdId" TEXT NOT NULL,
    "userId" TEXT,
    CONSTRAINT "Person_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Person_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Person" ("color", "householdId", "id", "name", "userId") SELECT "color", "householdId", "id", "name", "userId" FROM "Person";
DROP TABLE "Person";
ALTER TABLE "new_Person" RENAME TO "Person";
CREATE UNIQUE INDEX "Person_userId_key" ON "Person"("userId");
CREATE INDEX "Person_householdId_idx" ON "Person"("householdId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
