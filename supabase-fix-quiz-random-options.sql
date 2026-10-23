-- Migration: Pastikan jawaban kuis sub-bab acak dan merata (A, B, C, D)
-- Memperbaiki pola jawaban di sub.virus1, sub.virus2, sub.virus4, sub.virus5, sub.virus6, dan refleksi bakteri

-- 1. sub.virus1 (ID 33: pindah Wendell Stanley ke posisi D / index 3)
UPDATE sub_bab_quiz
SET
  options_id = '["Adolf Mayer", "Dmitri Ivanovsky", "Martinus Beijerinck", "Wendell Stanley"]'::jsonb,
  options_en = '["Adolf Mayer", "Dmitri Ivanovsky", "Martinus Beijerinck", "Wendell Stanley"]'::jsonb,
  correct_answer = 3
WHERE id = 33;

-- 2. sub.virus2 (ID 38: pindah Antibiotik ke posisi D / index 3)
UPDATE sub_bab_quiz
SET
  options_id = '["Vaksin profilaksis", "Obat antivirus spesifik", "Peningkatan sistem imun tubuh", "Antibiotik"]'::jsonb,
  options_en = '["Prophylactic vaccines", "Specific antiviral drugs", "Boosting immune defenses", "Antibiotics"]'::jsonb,
  correct_answer = 3
WHERE id = 38;

-- 3. sub.virus4
-- ID 45: tahapan litik pindah ke posisi C / index 2
UPDATE sub_bab_quiz
SET
  options_id = '["Penetrasi → Adsorbsi → Sintesis → Lisis → Pematangan", "Adsorbsi → Sintesis → Penetrasi → Lisis → Pematangan", "Adsorbsi → Penetrasi → Sintesis → Pematangan/Perakitan → Lisis", "Sintesis → Penetrasi → Adsorbsi → Pematangan → Lisis"]'::jsonb,
  options_en = '["Penetration → Adsorption → Biosynthesis → Lysis → Assembly", "Adsorption → Biosynthesis → Penetration → Lysis → Assembly", "Adsorption → Penetration → Biosynthesis → Assembly → Lysis", "Biosynthesis → Penetration → Adsorption → Assembly → Lysis"]'::jsonb,
  correct_answer = 2
WHERE id = 45;

-- ID 46: Profag pindah ke posisi B / index 1
UPDATE sub_bab_quiz
SET
  options_id = '["Mesosom", "Profag", "Virion", "Kapsid"]'::jsonb,
  options_en = '["Mesosome", "Prophage", "Virion", "Capsid"]'::jsonb,
  correct_answer = 1
WHERE id = 46;

-- 4. sub.virus5 (Sebelumnya SEMUA jawaban index 0 / A)
-- ID 48: -viridae ke posisi C / index 2
UPDATE sub_bab_quiz
SET
  options_id = '["-virus", "-virales", "-viridae", "-virinae"]'::jsonb,
  options_en = '["-virus", "-virales", "-viridae", "-virinae"]'::jsonb,
  correct_answer = 2
WHERE id = 48;

-- ID 49: Famili Poxviridae ke posisi B / index 1
UPDATE sub_bab_quiz
SET
  options_id = '["Famili Variolaviridae, Genus Pox, Spesies Orthopoxvirus", "Famili Poxviridae, Genus Orthopoxvirus, Spesies Variola virus", "Famili Herpesviridae, Genus Variola, Spesies Poxvirus", "Famili Retroviridae, Genus Lentivirus, Spesies Variola"]'::jsonb,
  options_en = '["Family Variolaviridae, Genus Pox, Species Orthopoxvirus", "Family Poxviridae, Genus Orthopoxvirus, Species Variola virus", "Family Herpesviridae, Genus Variola, Species Poxvirus", "Family Retroviridae, Genus Lentivirus, Species Variola"]'::jsonb,
  correct_answer = 1
WHERE id = 49;

-- ID 50: Herpesvirus, Papovavirus... ke posisi D / index 3
UPDATE sub_bab_quiz
SET
  options_id = '["Coronavirus, Picornavirus, Paramyxovirus, Retrovirus", "Flavivirus, Rhabdovirus, Togavirus, Orthomyxovirus", "Poliovirus, HIV, Ebola virus, Influenza virus", "Herpesvirus, Papovavirus, Adenovirus, Parvovirus"]'::jsonb,
  options_en = '["Coronavirus, Picornavirus, Paramyxovirus, Retrovirus", "Flavivirus, Rhabdovirus, Togavirus, Orthomyxovirus", "Poliovirus, HIV, Ebola virus, Influenza virus", "Herpesvirus, Papovavirus, Adenovirus, Parvovirus"]'::jsonb,
  correct_answer = 3
WHERE id = 50;

-- ID 52: Kokus dan Streptobasil ke posisi C / index 2
UPDATE sub_bab_quiz
SET
  options_id = '["Heliks / Batang", "Polihedral", "Kokus dan Streptobasil", "Kompleks T"]'::jsonb,
  options_en = '["Helical / Rod", "Polyhedral", "Coccus and Streptobacillus", "Complex T"]'::jsonb,
  correct_answer = 2
WHERE id = 52;

-- 5. sub.virus6 (Sebelumnya SEMUA jawaban index 0 / A)
-- ID 53: ADA ke limfosit T ke posisi B / index 1
UPDATE sub_bab_quiz
SET
  options_id = '["Amilase ke sel pankreas", "Adenosin Deaminase (ADA) ke limfosit T", "Pepsinogen ke lambung", "Lipase ke usus halus"]'::jsonb,
  options_en = '["Amylase into pancreatic cells", "Adenosine Deaminase (ADA) into T lymphocytes", "Pepsinogen into gastric mucosa", "Lipase into small intestine"]'::jsonb,
  correct_answer = 1
WHERE id = 53;

-- ID 54: Baculovirus ke posisi D / index 3
UPDATE sub_bab_quiz
SET
  options_id = '["Aphthovirus", "Morbillivirus", "Picornavirus", "Baculovirus"]'::jsonb,
  options_en = '["Aphthovirus", "Morbillivirus", "Picornavirus", "Baculovirus"]'::jsonb,
  correct_answer = 3
WHERE id = 54;

-- ID 56: Wereng hijau dan cokelat ke posisi C / index 2
UPDATE sub_bab_quiz
SET
  options_id = '["Nyamuk Anopheles", "Kutu daun tembakau", "Wereng hijau dan wereng cokelat", "Lalat buah"]'::jsonb,
  options_en = '["Anopheles mosquitoes", "Tobacco aphids", "Green and brown leafhoppers / planthoppers", "Fruit flies"]'::jsonb,
  correct_answer = 2
WHERE id = 56;

-- ID 57: Gejala tetelo ke posisi B / index 1
UPDATE sub_bab_quiz
SET
  options_id = '["Muncul bercak kuning pada bulu sayap", "Diare, batuk, kehilangan keseimbangan, dan kepala terputar (tortikolis)", "Kuku ayam terlepas dan berlendir", "Pembengkakan parotis kelenjar ludah"]'::jsonb,
  options_en = '["Yellow spots appearing on feathers", "Diarrhea, coughing, loss of balance, and twisted neck tremors (torticollis)", "Detached claws and foot slime", "Swelling of parotid salivary glands"]'::jsonb,
  correct_answer = 1
WHERE id = 57;

-- 6. Refleksi Bakteri (Sebelumnya ID 27, 28, 29, 30 berturut-turut index 0 / A)
-- ID 27: Bakteri resisten ke posisi C / index 2
UPDATE sub_bab_quiz
SET
  options_id = '["Antibiotik menumpuk di tubuh dan meracuni pasien", "Bakteri berubah menjadi virus yang lebih ganas", "Bakteri yang selamat membawa sifat resistensi lalu berkembang biak", "Tidak ada risiko karena gejalanya sudah hilang"]'::jsonb,
  options_en = '["Antibiotics accumulate in the body and poison the patient", "Bacteria turn into more dangerous viruses", "Surviving bacteria carry resistance traits and multiply", "There is no risk because the symptoms are gone"]'::jsonb,
  correct_answer = 2
WHERE id = 27;

-- ID 29: Dinding sel berbeda ke posisi B / index 1
UPDATE sub_bab_quiz
SET
  options_id = '["Karena warna tabletnya harus dibedakan", "Karena jenis dan struktur dinding sel bakterinya berbeda", "Karena setiap pasien alergi terhadap semua antibiotik", "Karena bakteri selalu kebal terhadap antibiotik pertama"]'::jsonb,
  options_en = '["Because the tablet colors must be different", "Because the type and cell wall structure of the bacteria differ", "Because every patient is allergic to all antibiotics", "Because bacteria are always immune to the first antibiotic"]'::jsonb,
  correct_answer = 1
WHERE id = 29;

-- ID 30: Konjugasi ke posisi D / index 3
UPDATE sub_bab_quiz
SET
  options_id = '["Fotosintesis", "Pembelahan biner", "Pembentukan endospora", "Konjugasi"]'::jsonb,
  options_en = '["Photosynthesis", "Binary fission", "Endospore formation", "Conjugation"]'::jsonb,
  correct_answer = 3
WHERE id = 30;
