-- AlterTable: estado de pago de la guía
ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "paid" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "shipments" ADD COLUMN IF NOT EXISTS "paid_at" TIMESTAMP(3);
