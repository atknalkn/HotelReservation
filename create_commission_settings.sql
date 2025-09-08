-- CommissionSettings tablosunu oluştur
CREATE TABLE IF NOT EXISTS "CommissionSettings" (
    "Id" SERIAL PRIMARY KEY,
    "CommissionRate" DECIMAL(5,2) NOT NULL DEFAULT 15.0,
    "MinimumCommission" DECIMAL(10,2) NOT NULL DEFAULT 5.0,
    "MaximumCommission" DECIMAL(10,2) NOT NULL DEFAULT 0.0,
    "CalculationMethod" INTEGER NOT NULL DEFAULT 0,
    "IsActive" BOOLEAN NOT NULL DEFAULT true,
    "LastUpdated" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    "UpdatedByUserId" INTEGER NOT NULL
);

-- Varsayılan komisyon ayarlarını ekle
INSERT INTO "CommissionSettings" ("CommissionRate", "MinimumCommission", "MaximumCommission", "CalculationMethod", "IsActive", "LastUpdated", "UpdatedByUserId")
VALUES (15.0, 5.0, 0.0, 0, true, NOW(), 1)
ON CONFLICT DO NOTHING;
