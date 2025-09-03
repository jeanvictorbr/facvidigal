/*
  Warnings:

  - You are about to drop the column `recrutadorRoleId` on the `GuildConfig` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."GuildConfig" DROP COLUMN "recrutadorRoleId",
ADD COLUMN     "recrutadorRoleIds" TEXT;
