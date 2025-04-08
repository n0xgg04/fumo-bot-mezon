/*
  Warnings:

  - Added the required column `username` to the `user_balance` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_balance" ADD COLUMN     "username" TEXT NOT NULL;
