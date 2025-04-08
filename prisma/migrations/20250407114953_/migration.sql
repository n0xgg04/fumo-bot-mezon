-- CreateTable
CREATE TABLE "message_logs" (
    "id" SERIAL NOT NULL,
    "message_id" TEXT NOT NULL,
    "sender_avatar" TEXT NOT NULL,
    "sender_name" TEXT NOT NULL,
    "sender_id" TEXT NOT NULL,
    "sender_username" TEXT NOT NULL,
    "content" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel_id" TEXT NOT NULL,
    "clan_id" TEXT NOT NULL,
    "clan_avatar" TEXT NOT NULL,
    "clan_name" TEXT NOT NULL,
    "clan_username" TEXT NOT NULL,

    CONSTRAINT "message_logs_pkey" PRIMARY KEY ("id")
);
