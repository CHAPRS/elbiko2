-- DropForeignKey
ALTER TABLE `Payment` DROP FOREIGN KEY `Payment_rentId_fkey`;

-- DropForeignKey
ALTER TABLE `Rent` DROP FOREIGN KEY `Rent_bikeId_fkey`;

-- DropForeignKey
ALTER TABLE `Rent` DROP FOREIGN KEY `Rent_userId_fkey`;

-- DropIndex
DROP INDEX `Payment_rentId_fkey` ON `Payment`;

-- AlterTable
ALTER TABLE `Bike` ADD COLUMN `imageUrl` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'FREE',
    ALTER COLUMN `isWaterproof` DROP DEFAULT,
    MODIFY `pricePerDay` DECIMAL(10, 2) NOT NULL DEFAULT 0.00;

-- AlterTable
ALTER TABLE `Payment` DROP PRIMARY KEY,
    DROP COLUMN `providerId`,
    ADD COLUMN `paymentId` VARCHAR(191) NULL,
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `rentId` INTEGER NOT NULL,
    MODIFY `amount` DECIMAL(10, 2) NOT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING',
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `Rent` DROP PRIMARY KEY,
    ADD COLUMN `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `userId` INTEGER NOT NULL,
    MODIFY `totalPrice` DECIMAL(10, 2) NOT NULL,
    ADD PRIMARY KEY (`id`);

-- AlterTable
ALTER TABLE `User` DROP PRIMARY KEY,
    ADD COLUMN `balance` DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    ADD COLUMN `password` VARCHAR(191) NOT NULL DEFAULT '',
    MODIFY `id` INTEGER NOT NULL AUTO_INCREMENT,
    MODIFY `name` VARCHAR(191) NOT NULL DEFAULT 'Курьер',
    ADD PRIMARY KEY (`id`);

-- CreateTable
CREATE TABLE `RentalSession` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tariff` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `startDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `endDate` DATETIME(3) NULL,
    `userId` INTEGER NOT NULL,
    `bikeId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `RentalSession_userId_idx`(`userId`),
    INDEX `RentalSession_bikeId_idx`(`bikeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lead` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `bikeName` VARCHAR(191) NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'NEW',
    `message` TEXT NULL,
    `comment` TEXT NULL,
    `rejectReason` TEXT NULL,
    `processedAt` DATETIME(3) NULL,
    `rentId` INTEGER NULL,
    `bikeId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Lead_status_idx`(`status`),
    INDEX `Lead_phone_idx`(`phone`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Payment_rentId_key` ON `Payment`(`rentId`);

-- CreateIndex
CREATE INDEX `Payment_status_idx` ON `Payment`(`status`);

-- CreateIndex
CREATE INDEX `Rent_status_idx` ON `Rent`(`status`);

-- AddForeignKey
ALTER TABLE `RentalSession` ADD CONSTRAINT `RentalSession_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RentalSession` ADD CONSTRAINT `RentalSession_bikeId_fkey` FOREIGN KEY (`bikeId`) REFERENCES `Bike`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lead` ADD CONSTRAINT `Lead_bikeId_fkey` FOREIGN KEY (`bikeId`) REFERENCES `Bike`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rent` ADD CONSTRAINT `Rent_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rent` ADD CONSTRAINT `Rent_bikeId_fkey` FOREIGN KEY (`bikeId`) REFERENCES `Bike`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_rentId_fkey` FOREIGN KEY (`rentId`) REFERENCES `Rent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- RenameIndex
ALTER TABLE `Rent` RENAME INDEX `Rent_bikeId_fkey` TO `Rent_bikeId_idx`;

-- RenameIndex
ALTER TABLE `Rent` RENAME INDEX `Rent_userId_fkey` TO `Rent_userId_idx`;

