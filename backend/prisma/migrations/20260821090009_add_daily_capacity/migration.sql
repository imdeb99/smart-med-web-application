-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "dailyCapacityId" TEXT,
ADD COLUMN     "estimatedTime" TIMESTAMP(3),
ADD COLUMN     "tokenNumber" INTEGER;

-- CreateTable
CREATE TABLE "DailyCapacity" (
    "id" TEXT NOT NULL,
    "doctorId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "totalCapacity" INTEGER NOT NULL,
    "startTime" TEXT NOT NULL,
    "avgDurationMin" INTEGER NOT NULL DEFAULT 10,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "DailyCapacity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyCapacity_doctorId_date_key" ON "DailyCapacity"("doctorId", "date");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_dailyCapacityId_fkey" FOREIGN KEY ("dailyCapacityId") REFERENCES "DailyCapacity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyCapacity" ADD CONSTRAINT "DailyCapacity_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES "DoctorProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
