-- CreateTable
CREATE TABLE "exercise_ratings" (
    "id" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" SMALLINT NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercise_ratings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "exercise_ratings_exerciseId_idx" ON "exercise_ratings"("exerciseId");

-- CreateIndex
CREATE INDEX "exercise_ratings_userId_idx" ON "exercise_ratings"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "exercise_ratings_exerciseId_userId_key" ON "exercise_ratings"("exerciseId", "userId");

-- AddForeignKey
ALTER TABLE "exercise_ratings" ADD CONSTRAINT "exercise_ratings_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exercise_ratings" ADD CONSTRAINT "exercise_ratings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
