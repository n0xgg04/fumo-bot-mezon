-- CreateEnum
CREATE TYPE "KeoBuaBaoEnum" AS ENUM ('KEO', 'BUA', 'BAO');

-- CreateEnum
CREATE TYPE "EKeobuabaoGameStatus" AS ENUM ('PLAYING', 'ENDED');

-- CreateTable
CREATE TABLE "keobuabao_game" (
    "id" INTEGER NOT NULL,
    "user_id_create" TEXT NOT NULL,
    "cost" INTEGER NOT NULL DEFAULT 0,
    "only_for_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "status" "EKeobuabaoGameStatus" NOT NULL DEFAULT 'PLAYING',

    CONSTRAINT "keobuabao_game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "keobuabao_game_logs" (
    "id" SERIAL NOT NULL,
    "game_id" INTEGER NOT NULL,
    "user_id" TEXT NOT NULL,
    "keo_bua_bao" "KeoBuaBaoEnum" NOT NULL,

    CONSTRAINT "keobuabao_game_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "keobuabao_game_user_id_create_idx" ON "keobuabao_game"("user_id_create");

-- CreateIndex
CREATE UNIQUE INDEX "keobuabao_game_user_id_create_key" ON "keobuabao_game"("user_id_create");

-- CreateIndex
CREATE INDEX "keobuabao_game_logs_game_id_user_id_idx" ON "keobuabao_game_logs"("game_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "keobuabao_game_logs_game_id_user_id_key" ON "keobuabao_game_logs"("game_id", "user_id");

-- AddForeignKey
ALTER TABLE "keobuabao_game_logs" ADD CONSTRAINT "keobuabao_game_logs_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "keobuabao_game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
