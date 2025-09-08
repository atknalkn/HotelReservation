-- Mevcut oteller için property oluştur
INSERT INTO "Properties" ("HotelId", "Title", "Description", "City", "Address", "Stars", "Location", "CreatedAt", "UpdatedAt")
SELECT 
    h."Id" as "HotelId",
    h."Name" as "Title",
    h."Description",
    h."City",
    h."Address",
    h."StarRating" as "Stars",
    CONCAT(h."City", ', ', h."Address") as "Location",
    NOW() as "CreatedAt",
    NOW() as "UpdatedAt"
FROM "Hotels" h
WHERE NOT EXISTS (
    SELECT 1 FROM "Properties" p WHERE p."HotelId" = h."Id"
);
