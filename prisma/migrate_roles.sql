-- Step 1: 新しい enum 値を追加
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'STAFF';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MANAGER';
ALTER TYPE "Role" ADD VALUE IF NOT EXISTS 'MEMBER';

-- Step 2: 既存データを変換
UPDATE "User" SET role = 'STAFF' WHERE role = 'COACH';
UPDATE "User" SET role = 'MEMBER' WHERE role = 'STUDENT';
UPDATE "InvitedUser" SET role = 'STAFF' WHERE role = 'COACH';
UPDATE "InvitedUser" SET role = 'MEMBER' WHERE role = 'STUDENT';

-- Step 3: 新しい enum 型を作成して差し替え
CREATE TYPE "Role_new" AS ENUM ('STAFF', 'MANAGER', 'MEMBER');
ALTER TABLE "User" ALTER COLUMN role TYPE "Role_new" USING role::text::"Role_new";
ALTER TABLE "InvitedUser" ALTER COLUMN role TYPE "Role_new" USING role::text::"Role_new";
DROP TYPE "Role";
ALTER TYPE "Role_new" RENAME TO "Role";
