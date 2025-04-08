/*
  Warnings:

  - A unique constraint covering the columns `[user_id_create,only_for_user_id]` on the table `keobuabao_game` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "keobuabao_game_user_id_create_key";

-- CreateIndex
CREATE UNIQUE INDEX "keobuabao_game_user_id_create_only_for_user_id_key" ON "keobuabao_game"("user_id_create", "only_for_user_id");
