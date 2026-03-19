-- AlterTable
ALTER TABLE "tenants" ADD COLUMN     "smtp_from" VARCHAR(255),
ADD COLUMN     "smtp_host" VARCHAR(255),
ADD COLUMN     "smtp_pass" VARCHAR(500),
ADD COLUMN     "smtp_port" INTEGER,
ADD COLUMN     "smtp_secure" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "smtp_user" VARCHAR(255);
