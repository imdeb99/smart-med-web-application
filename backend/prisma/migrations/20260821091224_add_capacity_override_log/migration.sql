-- CreateTable
CREATE TABLE "CapacityOverrideLog" (
    "id" TEXT NOT NULL,
    "dailyCapacityId" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "previousCapacity" INTEGER NOT NULL,
    "newCapacity" INTEGER NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CapacityOverrideLog_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CapacityOverrideLog" ADD CONSTRAINT "CapacityOverrideLog_dailyCapacityId_fkey" FOREIGN KEY ("dailyCapacityId") REFERENCES "DailyCapacity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
