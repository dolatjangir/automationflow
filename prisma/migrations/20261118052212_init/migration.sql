-- CreateTable
CREATE TABLE `User` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `role` ENUM('admin', 'manager', 'agent') NOT NULL DEFAULT 'agent',
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    INDEX `User_role_idx`(`role`),
    INDEX `User_isActive_idx`(`isActive`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `AIProviderCredential` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `provider` ENUM('openai', 'gemini', 'groq') NOT NULL,
    `encryptedApiKey` TEXT NOT NULL,
    `keyHint` VARCHAR(30) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `AIProviderCredential_provider_idx`(`provider`),
    UNIQUE INDEX `AIProviderCredential_userId_provider_key`(`userId`, `provider`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Contact` (
    `id` VARCHAR(191) NOT NULL,
    `firstName` VARCHAR(100) NULL,
    `lastName` VARCHAR(100) NULL,
    `email` VARCHAR(191) NULL,
    `phone` VARCHAR(30) NULL,
    `company` VARCHAR(191) NULL,
    `jobTitle` VARCHAR(191) NULL,
    `source` VARCHAR(100) NULL,
    `status` ENUM('new', 'contacted', 'qualified', 'customer', 'lost') NOT NULL DEFAULT 'new',
    `customFields` JSON NULL,
    `ownerId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Contact_email_idx`(`email`),
    INDEX `Contact_phone_idx`(`phone`),
    INDEX `Contact_status_idx`(`status`),
    INDEX `Contact_ownerId_idx`(`ownerId`),
    INDEX `Contact_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Journey` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `status` ENUM('draft', 'active', 'paused', 'archived') NOT NULL DEFAULT 'draft',
    `createdById` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Journey_status_idx`(`status`),
    INDEX `Journey_createdById_idx`(`createdById`),
    INDEX `Journey_updatedAt_idx`(`updatedAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JourneyNode` (
    `id` VARCHAR(191) NOT NULL,
    `journeyId` VARCHAR(191) NOT NULL,
    `type` ENUM('trigger', 'delay', 'whatsapp', 'email', 'sms', 'condition', 'assign', 'ai_agent', 'end') NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `positionX` DOUBLE NOT NULL DEFAULT 0,
    `positionY` DOUBLE NOT NULL DEFAULT 0,
    `config` JSON NULL,
    `actionId` VARCHAR(191) NULL,
    `category` VARCHAR(100) NULL,
    `icon` VARCHAR(100) NULL,
    `color` VARCHAR(50) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JourneyNode_journeyId_idx`(`journeyId`),
    INDEX `JourneyNode_type_idx`(`type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JourneyEdge` (
    `id` VARCHAR(191) NOT NULL,
    `journeyId` VARCHAR(191) NOT NULL,
    `sourceNodeId` VARCHAR(191) NOT NULL,
    `targetNodeId` VARCHAR(191) NOT NULL,
    `sourceHandle` VARCHAR(50) NULL,
    `targetHandle` VARCHAR(50) NULL,
    `label` VARCHAR(100) NULL,
    `edgeType` VARCHAR(50) NULL,
    `animated` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `JourneyEdge_journeyId_idx`(`journeyId`),
    INDEX `JourneyEdge_sourceNodeId_idx`(`sourceNodeId`),
    INDEX `JourneyEdge_targetNodeId_idx`(`targetNodeId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JourneyExecution` (
    `id` VARCHAR(191) NOT NULL,
    `journeyId` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NULL,
    `status` ENUM('queued', 'running', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'queued',
    `isTest` BOOLEAN NOT NULL DEFAULT false,
    `currentNodeId` VARCHAR(191) NULL,
    `triggerData` JSON NULL,
    `context` JSON NULL,
    `errorMessage` TEXT NULL,
    `retryCount` INTEGER NOT NULL DEFAULT 0,
    `startedAt` DATETIME(3) NULL,
    `completedAt` DATETIME(3) NULL,
    `nextRunAt` DATETIME(3) NULL,
    `lockedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `JourneyExecution_status_nextRunAt_idx`(`status`, `nextRunAt`),
    INDEX `JourneyExecution_status_lockedAt_idx`(`status`, `lockedAt`),
    INDEX `JourneyExecution_journeyId_status_idx`(`journeyId`, `status`),
    INDEX `JourneyExecution_contactId_idx`(`contactId`),
    INDEX `JourneyExecution_status_idx`(`status`),
    INDEX `JourneyExecution_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JourneyEnrollment` (
    `id` VARCHAR(191) NOT NULL,
    `journeyId` VARCHAR(191) NOT NULL,
    `contactId` VARCHAR(191) NOT NULL,
    `status` ENUM('active', 'completed', 'failed', 'cancelled') NOT NULL DEFAULT 'active',
    `executionId` VARCHAR(191) NULL,
    `source` VARCHAR(100) NULL,
    `enrolledAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completedAt` DATETIME(3) NULL,
    `exitedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `JourneyEnrollment_executionId_key`(`executionId`),
    INDEX `JourneyEnrollment_journeyId_status_idx`(`journeyId`, `status`),
    INDEX `JourneyEnrollment_contactId_status_idx`(`contactId`, `status`),
    INDEX `JourneyEnrollment_enrolledAt_idx`(`enrolledAt`),
    UNIQUE INDEX `JourneyEnrollment_journeyId_contactId_key`(`journeyId`, `contactId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ExecutionLog` (
    `id` VARCHAR(191) NOT NULL,
    `executionId` VARCHAR(191) NOT NULL,
    `nodeId` VARCHAR(191) NULL,
    `level` ENUM('info', 'warning', 'error') NOT NULL DEFAULT 'info',
    `message` TEXT NOT NULL,
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `ExecutionLog_executionId_idx`(`executionId`),
    INDEX `ExecutionLog_nodeId_idx`(`nodeId`),
    INDEX `ExecutionLog_level_idx`(`level`),
    INDEX `ExecutionLog_createdAt_idx`(`createdAt`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `AIProviderCredential` ADD CONSTRAINT `AIProviderCredential_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Contact` ADD CONSTRAINT `Contact_ownerId_fkey` FOREIGN KEY (`ownerId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Journey` ADD CONSTRAINT `Journey_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JourneyNode` ADD CONSTRAINT `JourneyNode_journeyId_fkey` FOREIGN KEY (`journeyId`) REFERENCES `Journey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JourneyEdge` ADD CONSTRAINT `JourneyEdge_journeyId_fkey` FOREIGN KEY (`journeyId`) REFERENCES `Journey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JourneyEdge` ADD CONSTRAINT `JourneyEdge_sourceNodeId_fkey` FOREIGN KEY (`sourceNodeId`) REFERENCES `JourneyNode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JourneyEdge` ADD CONSTRAINT `JourneyEdge_targetNodeId_fkey` FOREIGN KEY (`targetNodeId`) REFERENCES `JourneyNode`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JourneyExecution` ADD CONSTRAINT `JourneyExecution_journeyId_fkey` FOREIGN KEY (`journeyId`) REFERENCES `Journey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JourneyExecution` ADD CONSTRAINT `JourneyExecution_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JourneyEnrollment` ADD CONSTRAINT `JourneyEnrollment_journeyId_fkey` FOREIGN KEY (`journeyId`) REFERENCES `Journey`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JourneyEnrollment` ADD CONSTRAINT `JourneyEnrollment_contactId_fkey` FOREIGN KEY (`contactId`) REFERENCES `Contact`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExecutionLog` ADD CONSTRAINT `ExecutionLog_executionId_fkey` FOREIGN KEY (`executionId`) REFERENCES `JourneyExecution`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
