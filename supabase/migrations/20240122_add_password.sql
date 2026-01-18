-- Add password column to employees table for authentication
-- Passwords are stored as plain text for demo purposes only
-- In production, use proper password hashing (bcrypt, argon2, etc.)

ALTER TABLE employees
ADD COLUMN IF NOT EXISTS password TEXT;

-- Add index for email lookup during login
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees(email);

COMMENT ON COLUMN employees.password IS 'User password for authentication (demo only - use hashing in production)';

-- Sync passwords from DEMO_USERS to database
-- Run this once to enable database authentication

UPDATE employees SET password = 'CSpace2024!' WHERE email = 'admin@cspace.uz';
UPDATE employees SET password = 'Nodir@2024' WHERE email = 'nodir.mahmudov@cspace.uz';
UPDATE employees SET password = 'Said@2024Y' WHERE email = 'said.yunusabad@cspace.uz';
UPDATE employees SET password = 'Nigina@2024' WHERE email = 'nigina.umaraliyeva@cspace.uz';
UPDATE employees SET password = 'Yusufjon@2024' WHERE email = 'yusufjon.sayfullayev@cspace.uz';
UPDATE employees SET password = 'Ruxshona@2024' WHERE email = 'ruxshona.nabijonova@cspace.uz';
UPDATE employees SET password = 'Shahzod@2024' WHERE email = 'shahzod.xabibjonov@cspace.uz';
UPDATE employees SET password = 'Rahmatulloh@2024' WHERE email = 'rahmatulloh.yusupov@cspace.uz';
UPDATE employees SET password = 'Jamshid@2024F' WHERE email = 'jamshid.farhodov@cspace.uz';
UPDATE employees SET password = 'Xushbaxt@2024' WHERE email = 'xushbaxt.abdusalomov@cspace.uz';
UPDATE employees SET password = 'Paxlavon@2024' WHERE email = 'paxlavon.begijonov@cspace.uz';
UPDATE employees SET password = 'Axror@2024U' WHERE email = 'axror.umarov@cspace.uz';
UPDATE employees SET password = 'Sayyora@2024' WHERE email = 'sayyora.sharipova@cspace.uz';
UPDATE employees SET password = 'Maxmudjon@2024' WHERE email = 'maxmudjon.bustonov@cspace.uz';
UPDATE employees SET password = 'Mirvohid@2024' WHERE email = 'mirvohid.raimbekov@cspace.uz';
UPDATE employees SET password = 'Sulhiya@2024' WHERE email = 'sulhiya.aminova@cspace.uz';
UPDATE employees SET password = 'Abror@2024' WHERE email = 'abror.umarov@cspace.uz';
UPDATE employees SET password = 'Said@2024L' WHERE email = 'said.labzak@cspace.uz';
UPDATE employees SET password = 'Zuxriddin@2024' WHERE email = 'zuxriddin.abduraxmonov@cspace.uz';
UPDATE employees SET password = 'Xusravbek@2024' WHERE email = 'xusravbek.olimjonov@cspace.uz';
UPDATE employees SET password = 'Solih@2024' WHERE email = 'solih@cspace.uz';
UPDATE employees SET password = 'Bekzod@2024' WHERE email = 'bekzod.tursunaliyev@cspace.uz';
UPDATE employees SET password = 'Fozilbek@2024' WHERE email = 'fozilbek.akmalov@cspace.uz';
UPDATE employees SET password = 'Lobarxon@2024' WHERE email = 'lobarxon.abdurasulova@cspace.uz';
UPDATE employees SET password = 'Guljamal@2024' WHERE email = 'guljamal.kenjabayeva@cspace.uz';
UPDATE employees SET password = 'Nodirbek@2024' WHERE email = 'nodirbek.yusupov@cspace.uz';
UPDATE employees SET password = 'Ibrohim@2024A' WHERE email = 'ibrohim.abduqodirov@cspace.uz';
UPDATE employees SET password = 'Munira@2024' WHERE email = 'munira.bababekova@cspace.uz';
UPDATE employees SET password = 'Gulbahor@2024' WHERE email = 'gulbahor.primova@cspace.uz';
UPDATE employees SET password = 'Saodat@2024I' WHERE email = 'saodat.ikromova@cspace.uz';
UPDATE employees SET password = 'Said@2024E' WHERE email = 'said.elbek@cspace.uz';
UPDATE employees SET password = 'Ibrohim@2024O' WHERE email = 'ibrohim.oripov@cspace.uz';
UPDATE employees SET password = 'Fozilxon@2024' WHERE email = 'fozilxon.raxmatov@cspace.uz';
UPDATE employees SET password = 'Salim@2024' WHERE email = 'salim.avazov@cspace.uz';
UPDATE employees SET password = 'Axror@2024N' WHERE email = 'axror.nazirqulov@cspace.uz';
UPDATE employees SET password = 'Bexruz@2024' WHERE email = 'bexruz.xaydarov@cspace.uz';
UPDATE employees SET password = 'Mirjalol@2024' WHERE email = 'mirjalol.omonqulov@cspace.uz';
UPDATE employees SET password = 'Durbek@2024' WHERE email = 'durbek.shaymardanov@cspace.uz';
UPDATE employees SET password = 'Samad@2024' WHERE email = 'samad.gaipov@cspace.uz';
UPDATE employees SET password = 'Said@2024C' WHERE email = 'said.chust@cspace.uz';
UPDATE employees SET password = 'Gavhar@2024' WHERE email = 'gavhar.abdigayeva@cspace.uz';
UPDATE employees SET password = 'Saodat@2024R' WHERE email = 'saodat.rahimova@cspace.uz';
UPDATE employees SET password = 'Xurshida@2024' WHERE email = 'xurshida.muxamedjanova@cspace.uz';
UPDATE employees SET password = 'Nabijon@2024' WHERE email = 'nabijon.turgunov@cspace.uz';
UPDATE employees SET password = 'Javlon@2024' WHERE email = 'javlon.toshpulatov@cspace.uz';
UPDATE employees SET password = 'Mohigul@2024' WHERE email = 'mohigul.yuldoshova@cspace.uz';
UPDATE employees SET password = 'Jamshid@2024I' WHERE email = 'jamshid.ibragimov@cspace.uz';
UPDATE employees SET password = 'Suxrob@2024' WHERE email = 'suxrob.usmonov@cspace.uz';
UPDATE employees SET password = 'Ulbosin@2024' WHERE email = 'ulbosin.usarova@cspace.uz';
UPDATE employees SET password = 'Ubaydullo@2024' WHERE email = 'ubaydullo.pulat@cspace.uz';
UPDATE employees SET password = 'Said@2024A' WHERE email = 'said.aero@cspace.uz';
UPDATE employees SET password = 'Abubakr@2024' WHERE email = 'abubakr.sodiqov@cspace.uz';
UPDATE employees SET password = 'Oyxol@2024' WHERE email = 'oyxol.egamberdiyeva@cspace.uz';
UPDATE employees SET password = 'Humoyun@2024' WHERE email = 'humoyun.odilov@cspace.uz';
UPDATE employees SET password = 'Nargiza@2024' WHERE email = 'nargiza.rahimova@cspace.uz';
UPDATE employees SET password = 'Said@2024B' WHERE email = 'said.beruniy@cspace.uz';
UPDATE employees SET password = 'Humora@2024' WHERE email = 'humora.urokboyeva@cspace.uz';
UPDATE employees SET password = 'Said@2024M' WHERE email = 'said.muqimiy@cspace.uz';
UPDATE employees SET password = 'Azizbek@2024' WHERE email = 'azizbek.samiyev@cspace.uz';
