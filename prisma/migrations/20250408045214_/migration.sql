-- DropForeignKey
ALTER TABLE "keobuabao_game_logs" DROP CONSTRAINT "keobuabao_game_logs_game_id_fkey";

-- AddForeignKey
ALTER TABLE "keobuabao_game_logs" ADD CONSTRAINT "keobuabao_game_logs_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "keobuabao_game"("id") ON DELETE CASCADE ON UPDATE CASCADE;
