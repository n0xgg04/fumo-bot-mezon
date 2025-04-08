/*
  Warnings:

  - A unique constraint covering the columns `[user_id_create,only_for_user_id,clan_id,channel_id,message_id]` on the table `keobuabao_game` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `clan_id` to the `keobuabao_game` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "keobuabao_game_user_id_create_only_for_user_id_key";

-- AlterTable
ALTER TABLE "keobuabao_game" ADD COLUMN     "clan_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "keobuabao_game_user_id_create_only_for_user_id_clan_id_chan_key" ON "keobuabao_game"("user_id_create", "only_for_user_id", "clan_id", "channel_id", "message_id");
