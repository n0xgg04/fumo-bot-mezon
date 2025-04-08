-- AlterTable
CREATE SEQUENCE keobuabao_game_id_seq;
ALTER TABLE "keobuabao_game" ALTER COLUMN "id" SET DEFAULT nextval('keobuabao_game_id_seq');
ALTER SEQUENCE keobuabao_game_id_seq OWNED BY "keobuabao_game"."id";
