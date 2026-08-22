-- Fix: Insert bab yang missing + fix kelas_id

-- Insert bab baru
INSERT INTO bab (id, icon, color, video_id, video_title_id, video_title_en, hotspotted, kelas_id, sort_order) VALUES
  ('sirkulasi', '🫀', '#e17055', 'OKAO0H5e3LI', 'Sistem Peredaran Darah Manusia', 'Human Circulatory System', 'sirkulasi', 'xi', 5),
  ('syaraf', '🧠', '#a29bfe', 'qPix_X-9t7E', 'Sistem Saraf Manusia', 'Human Nervous System', 'syaraf', 'xi', 6)
ON CONFLICT (id) DO NOTHING;

-- Fix kelas_id yang salah
UPDATE bab SET kelas_id = 'xi', sort_order = 2 WHERE id = 'sel';
UPDATE bab SET kelas_id = 'xi', sort_order = 3 WHERE id = 'pencernaan';
UPDATE bab SET kelas_id = 'xi', sort_order = 4 WHERE id = 'sirkulasi';
UPDATE bab SET kelas_id = 'xi', sort_order = 5 WHERE id = 'syaraf';
UPDATE bab SET kelas_id = 'xii', sort_order = 6 WHERE id = 'genetika';
UPDATE bab SET kelas_id = 'xii', sort_order = 7 WHERE id = 'evolusi';
UPDATE bab SET kelas_id = 'xii', sort_order = 8 WHERE id = 'ekosistem';
UPDATE bab SET kelas_id = 'x', sort_order = 1 WHERE id = 'bakteri';
