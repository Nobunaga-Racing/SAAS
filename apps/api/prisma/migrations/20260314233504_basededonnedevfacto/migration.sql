-- CreateEnum
CREATE TYPE "TenantPlan" AS ENUM ('FREE', 'PRO', 'ENTERPRISE');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'ACCOUNTANT', 'USER');

-- CreateEnum
CREATE TYPE "ClientType" AS ENUM ('INDIVIDUAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('PROSPECT', 'ACTIVE', 'INACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "InvoiceType" AS ENUM ('INVOICE', 'CREDIT_NOTE', 'DEPOSIT_INVOICE');

-- CreateEnum
CREATE TYPE "InvoiceStatus" AS ENUM ('DRAFT', 'SENT', 'PARTIAL', 'PAID', 'CANCELLED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('BANK_TRANSFER', 'CARD', 'CHECK', 'CASH', 'STRIPE');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING', 'INVOICED', 'RECEIVED');

-- CreateEnum
CREATE TYPE "JournalEntryType" AS ENUM ('SALE', 'RECEIPT', 'CREDIT_NOTE', 'DEPOSIT');

-- CreateEnum
CREATE TYPE "QuoteStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED', 'EXPIRED', 'CONVERTED');

-- CreateEnum
CREATE TYPE "ProductType" AS ENUM ('PRODUCT', 'SERVICE', 'DIGITAL');

-- CreateEnum
CREATE TYPE "ProductUnit" AS ENUM ('PIECE', 'HOUR', 'DAY', 'MONTH', 'KG', 'LITER', 'METER', 'FLAT');

-- CreateTable
CREATE TABLE "tenants" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(100) NOT NULL,
    "plan" "TenantPlan" NOT NULL DEFAULT 'FREE',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "company_name" VARCHAR(255),
    "siret" VARCHAR(20),
    "vat_number" VARCHAR(30),
    "address_line1" TEXT,
    "address_line2" TEXT,
    "city" VARCHAR(100),
    "zip_code" VARCHAR(20),
    "country" CHAR(2) NOT NULL DEFAULT 'FR',
    "phone" VARCHAR(30),
    "logo_url" TEXT,
    "default_payment_term_days" INTEGER NOT NULL DEFAULT 30,
    "default_vat_rate" DECIMAL(5,2) NOT NULL DEFAULT 20,
    "invoice_footer" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "first_name" VARCHAR(100),
    "last_name" VARCHAR(100),
    "avatar_url" TEXT,
    "password_hash" VARCHAR(255) NOT NULL,
    "email_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "failed_attempts" INTEGER NOT NULL DEFAULT 0,
    "locked_until" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "last_login_ip" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "device_hint" VARCHAR(255),
    "ip_address" VARCHAR(45),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "email_verifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "email_verifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "password_resets" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token_hash" VARCHAR(255) NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "used_at" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "password_resets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "type" "ClientType" NOT NULL DEFAULT 'COMPANY',
    "status" "ClientStatus" NOT NULL DEFAULT 'PROSPECT',
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "website" VARCHAR(255),
    "siret" VARCHAR(20),
    "vat_number" VARCHAR(30),
    "address_line1" VARCHAR(255),
    "address_line2" VARCHAR(255),
    "city" VARCHAR(100),
    "zip_code" VARCHAR(20),
    "country" CHAR(2) NOT NULL DEFAULT 'FR',
    "shipping_address_line1" VARCHAR(255),
    "shipping_address_line2" VARCHAR(255),
    "shipping_city" VARCHAR(100),
    "shipping_zip_code" VARCHAR(20),
    "shipping_country" CHAR(2),
    "payment_term_days" INTEGER,
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "notes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "client_contacts" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(100),
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotes" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "number" TEXT NOT NULL,
    "status" "QuoteStatus" NOT NULL DEFAULT 'DRAFT',
    "issue_date" DATE NOT NULL,
    "expiry_date" DATE NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "footer" TEXT,
    "discount_type" "DiscountType",
    "discount_value" DECIMAL(10,2),
    "subtotal_ht" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_ht" DECIMAL(10,2) NOT NULL,
    "total_vat" DECIMAL(10,2) NOT NULL,
    "total_ttc" DECIMAL(10,2) NOT NULL,
    "sent_at" TIMESTAMP(3),
    "accepted_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),
    "rejected_reason" VARCHAR(500),
    "converted_at" TIMESTAMP(3),
    "pdf_url" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_lines" (
    "id" TEXT NOT NULL,
    "quote_id" TEXT NOT NULL,
    "product_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "discount_type" "DiscountType",
    "discount_value" DECIMAL(10,2),
    "line_base_ht" DECIMAL(10,2) NOT NULL,
    "line_discount_amt" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "line_total_ht" DECIMAL(10,2) NOT NULL,
    "line_vat_amount" DECIMAL(10,2) NOT NULL,
    "line_total_ttc" DECIMAL(10,2) NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "quote_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "quote_id" TEXT,
    "number" TEXT NOT NULL,
    "type" "InvoiceType" NOT NULL DEFAULT 'INVOICE',
    "status" "InvoiceStatus" NOT NULL DEFAULT 'DRAFT',
    "issue_date" DATE NOT NULL,
    "due_date" DATE NOT NULL,
    "subject" TEXT NOT NULL,
    "notes" TEXT,
    "footer" TEXT,
    "discount_type" "DiscountType",
    "discount_value" DECIMAL(10,2),
    "deposit_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "subtotal_ht" DECIMAL(10,2) NOT NULL,
    "discount_amount" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_ht" DECIMAL(10,2) NOT NULL,
    "total_vat" DECIMAL(10,2) NOT NULL,
    "total_ttc" DECIMAL(10,2) NOT NULL,
    "amount_paid" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "amount_due" DECIMAL(10,2) NOT NULL,
    "pdf_url" TEXT,
    "sent_at" TIMESTAMP(3),
    "paid_at" TIMESTAMP(3),
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoice_lines" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "product_id" TEXT,
    "description" TEXT NOT NULL,
    "quantity" DECIMAL(10,3) NOT NULL,
    "unit_price" DECIMAL(10,2) NOT NULL,
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "discount_type" "DiscountType",
    "discount_value" DECIMAL(10,2),
    "line_base_ht" DECIMAL(10,2) NOT NULL,
    "line_discount_amt" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "line_total_ht" DECIMAL(10,2) NOT NULL,
    "line_vat_amount" DECIMAL(10,2) NOT NULL,
    "line_total_ttc" DECIMAL(10,2) NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "invoice_lines_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vat_summaries" (
    "id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "base_ht" DECIMAL(10,2) NOT NULL,
    "vat_amount" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "vat_summaries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "reference" TEXT,
    "payment_date" DATE NOT NULL,
    "stripe_id" TEXT,
    "stripe_receipt_url" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_id" TEXT NOT NULL,
    "amount_type" "DiscountType" NOT NULL,
    "amount_value" DECIMAL(10,2) NOT NULL,
    "amount_resolved" DECIMAL(10,2) NOT NULL,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING',
    "deposit_invoice_id" TEXT,
    "deposit_invoice_number" TEXT,
    "paid_at" TIMESTAMP(3),
    "payment_ref" TEXT,
    "due_date" DATE NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_categories" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(255),
    "color" CHAR(7),
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "category_id" TEXT,
    "type" "ProductType" NOT NULL DEFAULT 'SERVICE',
    "sku" VARCHAR(100),
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "description_short" VARCHAR(500),
    "unit_price" DECIMAL(10,2) NOT NULL,
    "unit" "ProductUnit" NOT NULL DEFAULT 'PIECE',
    "currency" CHAR(3) NOT NULL DEFAULT 'EUR',
    "vat_rate" DECIMAL(5,2) NOT NULL,
    "vat_exempt" BOOLEAN NOT NULL DEFAULT false,
    "vat_exempt_ref" VARCHAR(255),
    "cost_price" DECIMAL(10,2),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "journal_entries" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "invoice_id" TEXT,
    "payment_id" TEXT,
    "entry_type" "JournalEntryType" NOT NULL,
    "journal_code" VARCHAR(2) NOT NULL,
    "journal_lib" VARCHAR(50) NOT NULL,
    "date" DATE NOT NULL,
    "reference" VARCHAR(50) NOT NULL,
    "label" VARCHAR(255) NOT NULL,
    "account_debit" VARCHAR(10) NOT NULL,
    "account_credit" VARCHAR(10) NOT NULL,
    "amount_ht" DECIMAL(10,2) NOT NULL,
    "amount_vat" DECIMAL(10,2) NOT NULL,
    "amount_ttc" DECIMAL(10,2) NOT NULL,
    "vat_rate" DECIMAL(5,2),
    "is_posted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "journal_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_slug_key" ON "tenants"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_tenant_id_role_idx" ON "users"("tenant_id", "role");

-- CreateIndex
CREATE INDEX "users_email_is_active_idx" ON "users"("email", "is_active");

-- CreateIndex
CREATE INDEX "refresh_tokens_token_hash_idx" ON "refresh_tokens"("token_hash");

-- CreateIndex
CREATE INDEX "refresh_tokens_user_id_revoked_at_idx" ON "refresh_tokens"("user_id", "revoked_at");

-- CreateIndex
CREATE INDEX "email_verifications_token_hash_idx" ON "email_verifications"("token_hash");

-- CreateIndex
CREATE INDEX "password_resets_token_hash_idx" ON "password_resets"("token_hash");

-- CreateIndex
CREATE INDEX "clients_tenant_id_status_idx" ON "clients"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "clients_tenant_id_name_idx" ON "clients"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "clients_tenant_id_email_idx" ON "clients"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "client_contacts_client_id_is_primary_idx" ON "client_contacts"("client_id", "is_primary");

-- CreateIndex
CREATE UNIQUE INDEX "quotes_number_key" ON "quotes"("number");

-- CreateIndex
CREATE INDEX "quotes_tenant_id_status_idx" ON "quotes"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "quotes_tenant_id_client_id_idx" ON "quotes"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "quotes_tenant_id_expiry_date_idx" ON "quotes"("tenant_id", "expiry_date");

-- CreateIndex
CREATE INDEX "quote_lines_quote_id_idx" ON "quote_lines"("quote_id");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_number_key" ON "invoices"("number");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_status_idx" ON "invoices"("tenant_id", "status");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_client_id_idx" ON "invoices"("tenant_id", "client_id");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_due_date_idx" ON "invoices"("tenant_id", "due_date");

-- CreateIndex
CREATE UNIQUE INDEX "vat_summaries_invoice_id_vat_rate_key" ON "vat_summaries"("invoice_id", "vat_rate");

-- CreateIndex
CREATE INDEX "payments_tenant_id_invoice_id_idx" ON "payments"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "payments_tenant_id_payment_date_idx" ON "payments"("tenant_id", "payment_date");

-- CreateIndex
CREATE INDEX "deposits_tenant_id_invoice_id_idx" ON "deposits"("tenant_id", "invoice_id");

-- CreateIndex
CREATE INDEX "product_categories_tenant_id_position_idx" ON "product_categories"("tenant_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_tenant_id_name_key" ON "product_categories"("tenant_id", "name");

-- CreateIndex
CREATE INDEX "products_tenant_id_is_active_idx" ON "products"("tenant_id", "is_active");

-- CreateIndex
CREATE INDEX "products_tenant_id_type_idx" ON "products"("tenant_id", "type");

-- CreateIndex
CREATE INDEX "products_tenant_id_category_id_idx" ON "products"("tenant_id", "category_id");

-- CreateIndex
CREATE INDEX "products_tenant_id_sku_idx" ON "products"("tenant_id", "sku");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_date_idx" ON "journal_entries"("tenant_id", "date");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_entry_type_idx" ON "journal_entries"("tenant_id", "entry_type");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_reference_idx" ON "journal_entries"("tenant_id", "reference");

-- CreateIndex
CREATE INDEX "journal_entries_tenant_id_is_posted_idx" ON "journal_entries"("tenant_id", "is_posted");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "refresh_tokens" ADD CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "email_verifications" ADD CONSTRAINT "email_verifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "password_resets" ADD CONSTRAINT "password_resets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "client_contacts" ADD CONSTRAINT "client_contacts_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotes" ADD CONSTRAINT "quotes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_lines" ADD CONSTRAINT "quote_lines_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quote_lines" ADD CONSTRAINT "quote_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_quote_id_fkey" FOREIGN KEY ("quote_id") REFERENCES "quotes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoice_lines" ADD CONSTRAINT "invoice_lines_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vat_summaries" ADD CONSTRAINT "vat_summaries_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_invoice_id_fkey" FOREIGN KEY ("invoice_id") REFERENCES "invoices"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "journal_entries" ADD CONSTRAINT "journal_entries_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
