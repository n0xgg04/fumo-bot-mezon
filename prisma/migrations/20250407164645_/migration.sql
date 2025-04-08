-- CreateTable
CREATE TABLE "user_balance" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "balance" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_logs" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "transaction_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transaction_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "user_balance_user_id_idx" ON "user_balance"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_balance_user_id_key" ON "user_balance"("user_id");

-- CreateIndex
CREATE INDEX "transaction_logs_user_id_transaction_id_idx" ON "transaction_logs"("user_id", "transaction_id");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_logs_transaction_id_key" ON "transaction_logs"("transaction_id");
