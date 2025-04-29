/*
  Warnings:

  - You are about to drop the column `user_id` on the `operators` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "operators" DROP CONSTRAINT "operators_user_id_fkey";

-- AlterTable
ALTER TABLE "operators" DROP COLUMN "user_id";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "operator_id" TEXT;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_operator_id_fkey" FOREIGN KEY ("operator_id") REFERENCES "operators"("id") ON DELETE SET NULL ON UPDATE CASCADE;
