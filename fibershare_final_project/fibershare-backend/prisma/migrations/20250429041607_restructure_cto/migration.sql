/*
  Warnings:

  - You are about to drop the `cto_ports` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ctos` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "cto_ports" DROP CONSTRAINT "cto_ports_cto_id_fkey";

-- DropForeignKey
ALTER TABLE "ctos" DROP CONSTRAINT "ctos_operator_id_fkey";

-- DropForeignKey
ALTER TABLE "port_service_orders" DROP CONSTRAINT "port_service_orders_port_id_fkey";

-- DropTable
DROP TABLE "cto_ports";

-- DropTable
DROP TABLE "ctos";

-- CreateTable
CREATE TABLE "CTO" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "totalPorts" INTEGER NOT NULL,
    "occupiedPorts" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION NOT NULL,
    "longitude" DOUBLE PRECISION NOT NULL,
    "operatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CTO_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CTOPort" (
    "id" TEXT NOT NULL,
    "ctoId" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "clientId" TEXT,
    "price" DOUBLE PRECISION,
    "lastModified" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CTOPort_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CTO_operatorId_idx" ON "CTO"("operatorId");

-- CreateIndex
CREATE INDEX "CTOPort_ctoId_idx" ON "CTOPort"("ctoId");

-- CreateIndex
CREATE UNIQUE INDEX "CTOPort_ctoId_number_key" ON "CTOPort"("ctoId", "number");

-- AddForeignKey
ALTER TABLE "CTO" ADD CONSTRAINT "CTO_operatorId_fkey" FOREIGN KEY ("operatorId") REFERENCES "operators"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CTOPort" ADD CONSTRAINT "CTOPort_ctoId_fkey" FOREIGN KEY ("ctoId") REFERENCES "CTO"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "port_service_orders" ADD CONSTRAINT "port_service_orders_port_id_fkey" FOREIGN KEY ("port_id") REFERENCES "CTOPort"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
