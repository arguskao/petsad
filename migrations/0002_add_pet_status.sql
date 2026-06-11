ALTER TABLE pets ADD COLUMN status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'hidden', 'adopted'));

UPDATE pets
SET status = 'available'
WHERE status IS NULL;
