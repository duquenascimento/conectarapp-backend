-- CreateTable
CREATE TABLE "restaurant_delivery_policy" (
    "id" UUID NOT NULL,
    "restaurant_id" UUID NOT NULL,
    "can_create_sunday_orders" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "restaurant_delivery_policy_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "restaurant_delivery_policy_restaurant_id_key" ON "restaurant_delivery_policy"("restaurant_id");

-- AddForeignKey
ALTER TABLE "restaurant_delivery_policy" ADD CONSTRAINT "restaurant_delivery_policy_restaurant_id_fkey" FOREIGN KEY ("restaurant_id") REFERENCES "restaurant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Backfill: Create restaurant_delivery_policy for all existing restaurants
INSERT INTO "restaurant_delivery_policy" (id, restaurant_id, can_create_sunday_orders, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  id,
  false,
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "restaurant"
WHERE NOT EXISTS (
  SELECT 1 FROM "restaurant_delivery_policy" WHERE restaurant_id = "restaurant".id
);
