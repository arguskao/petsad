ALTER TABLE shelters ADD COLUMN contact_name TEXT;
ALTER TABLE shelters ADD COLUMN contact_phone TEXT;
ALTER TABLE shelters ADD COLUMN contact_email TEXT;

UPDATE shelters SET
  contact_name = '台北動保中心',
  contact_phone = '02-1234-5678',
  contact_email = 'adopt@taipei-animal-home.tw'
WHERE id = 'taipei-animal-home';

UPDATE shelters SET
  contact_name = '愛心中途志工組',
  contact_phone = '02-2345-6789',
  contact_email = 'foster@loving-foster-home.tw'
WHERE id = 'loving-foster-home';

UPDATE shelters SET
  contact_name = '送養服務窗口',
  contact_phone = '03-3456-7890',
  contact_email = 'adopt@stray-association.tw'
WHERE id = 'stray-association';

UPDATE shelters SET
  contact_name = '幸福毛孩客服',
  contact_phone = '04-4567-8901',
  contact_email = 'hello@happy-fur-home.tw'
WHERE id = 'happy-fur-home';
