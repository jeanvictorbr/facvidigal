/*
  Warnings:

  - The `recrutadorRoleIds` column on the `GuildConfig` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "public"."GuildConfig" DROP COLUMN "recrutadorRoleIds",
ADD COLUMN     "recrutadorRoleIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
