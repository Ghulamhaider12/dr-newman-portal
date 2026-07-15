-- CreateTable
CREATE TABLE "helping_materials" (
    "id" SERIAL NOT NULL,
    "file_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL DEFAULT '',
    "filename" TEXT NOT NULL DEFAULT '',
    "storage_key" TEXT NOT NULL,
    "file_type" "FileType" NOT NULL,
    "file_size" INTEGER NOT NULL DEFAULT 0,
    "position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "helping_materials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "helping_materials_file_id_idx" ON "helping_materials"("file_id");

-- AddForeignKey
ALTER TABLE "helping_materials" ADD CONSTRAINT "helping_materials_file_id_fkey" FOREIGN KEY ("file_id") REFERENCES "files"("id") ON DELETE CASCADE ON UPDATE CASCADE;
