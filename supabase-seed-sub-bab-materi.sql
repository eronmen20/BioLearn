-- BioLearn: Seed data untuk tabel sub_bab
-- Jalankan di Supabase SQL Editor setelah supabase-migration-v2.sql

-- =============================================
-- 1. FIX BAB TABLE
-- =============================================
INSERT INTO bab (id, icon, color, video_id, video_title_id, video_title_en, hotspotted, kelas_id, sort_order) VALUES
  ('sirkulasi', '🫀', '#e17055', 'OKAO0H5e3LI', 'Sistem Peredaran Darah Manusia', 'Human Circulatory System', 'sirkulasi', 'xi', 6),
  ('syaraf', '🧠', '#a29bfe', 'qPix_X-9t7E', 'Sistem Saraf Manusia', 'Human Nervous System', 'syaraf', 'xi', 7),
  ('bakteri', '🦠', '#00b894', 'ORB9Qimv5bQ', 'Bakteri — Struktur & Klasifikasi', 'Bacteria — Structure & Classification', 'bakteri', 'x', 8)
ON CONFLICT (id) DO NOTHING;

UPDATE bab SET kelas_id = 'x', sort_order = 1 WHERE id = 'bakteri' AND (kelas_id IS NULL OR kelas_id = 'x');
UPDATE bab SET kelas_id = 'xi', sort_order = 2 WHERE id = 'sel' AND (kelas_id IS NULL OR kelas_id = 'x');
UPDATE bab SET kelas_id = 'xi', sort_order = 3 WHERE id = 'pencernaan' AND (kelas_id IS NULL OR kelas_id = 'x');
UPDATE bab SET kelas_id = 'xi', sort_order = 4 WHERE id = 'sirkulasi';
UPDATE bab SET kelas_id = 'xi', sort_order = 5 WHERE id = 'syaraf';
UPDATE bab SET kelas_id = 'xii', sort_order = 6 WHERE id = 'genetika' AND (kelas_id IS NULL OR kelas_id = 'x');
UPDATE bab SET kelas_id = 'xii', sort_order = 7 WHERE id = 'evolusi' AND (kelas_id IS NULL OR kelas_id = 'x');
UPDATE bab SET kelas_id = 'xii', sort_order = 8 WHERE id = 'ekosistem' AND (kelas_id IS NULL OR kelas_id = 'x');

-- =============================================
-- 2. SEED TABLE SUB_BAB - BAB: SEL
-- =============================================
INSERT INTO sub_bab (bab_id, key, title_id, title_en, summary_id, summary_en, content_id, content_en, sort_order) VALUES
('sel', 'sub.sel1', 'Teori Sel', 'Cell Theory',
 'Sel adalah unit terkecil kehidupan. Teori sel menyatakan bahwa semua makhluk hidup tersusun atas sel.',
 'The cell is the smallest unit of life. Cell theory states that all living things are composed of cells.',
 '<h3>Teori Sel</h3><p>Sel pertama kali ditemukan oleh Robert Hooke (1665). Teori sel modern: (1) Semua makhluk hidup terdiri dari sel, (2) Sel adalah unit struktural dan fungsional kehidupan, (3) Semua sel berasal dari sel sebelumnya (omnis cellula e cellula).</p>',
 '<h3>Cell Theory</h3><p>The cell was first discovered by Robert Hooke (1665). Modern cell theory: (1) All living things consist of cells, (2) Cells are the structural and functional unit of life, (3) All cells come from pre-existing cells (omnis cellula e cellula).</p>',
 1),
('sel', 'sub.sel2', 'Organel Sel', 'Cell Organelles',
 'Organel utama: nukleus (inti sel), mitokondria (energi), retikulum endoplasma (sintesis protein), aparatus Golgi (modifikasi protein).',
 'Major organelles: nucleus, mitochondria (energy), endoplasmic reticulum (protein synthesis), Golgi apparatus (protein modification).',
 '<h3>Organel Sel</h3><p><strong>Nukleus:</strong> Mengandung DNA, mengontrol aktivitas sel. <strong>Mitokondria:</strong> Tempat respirasi seluler, menghasilkan ATP. <strong>RE Kasar:</strong> Sintesis protein (dengan ribosom). <strong>RE Halus:</strong> Sintesis lipid. <strong>Aparatus Golgi:</strong> Modifikasi, sortir, dan pengemasan protein. <strong>Lisosom:</strong> Pencernaan intraseluler. <strong>Ribosom:</strong> Sintesis protein.</p>',
 '<h3>Cell Organelles</h3><p><strong>Nucleus:</strong> Contains DNA, controls cell activities. <strong>Mitochondria:</strong> Site of cellular respiration, produces ATP. <strong>Rough ER:</strong> Protein synthesis (with ribosomes). <strong>Smooth ER:</strong> Lipid synthesis. <strong>Golgi Apparatus:</strong> Modifies, sorts, and packages proteins. <strong>Lysosome:</strong> Intracellular digestion. <strong>Ribosome:</strong> Protein synthesis.</p>',
 2),
('sel', 'sub.sel3', 'Transpor Membran', 'Membrane Transport',
 'Transpor membran: difusi, osmosis, transpor aktif, endositosis & eksositosis.',
 'Membrane transport: diffusion, osmosis, active transport, endocytosis & exocytosis.',
 '<h3>Transpor Membran</h3><p><strong>Difusi:</strong> Pergerakan molekul dari konsentrasi tinggi ke rendah (pasif). <strong>Osmosis:</strong> Difusi air melalui membran semipermeabel. <strong>Transpor Aktif:</strong> Melawan gradien konsentrasi, memerlukan ATP. <strong>Endositosis:</strong> Memasukkan molekul besar. <strong>Eksositosis:</strong> Mengeluarkan molekul besar.</p>',
 '<h3>Membrane Transport</h3><p><strong>Diffusion:</strong> Movement from high to low concentration (passive). <strong>Osmosis:</strong> Water diffusion through semipermeable membrane. <strong>Active Transport:</strong> Against concentration gradient, requires ATP. <strong>Endocytosis:</strong> Brings in large molecules. <strong>Exocytosis:</strong> Releases large molecules.</p>',
 3),
('sel', 'sub.sel4', 'Pembelahan Sel', 'Cell Division',
 'Pembelahan sel: mitosis (2 sel anak identik) dan meiosis (4 sel gamet).',
 'Cell division: mitosis (2 identical daughter cells) and meiosis (4 gamete cells).',
 '<h3>Pembelahan Sel</h3><p><strong>Mitosis:</strong> Profase - Metafase - Anafase - Telofase. 2 sel anak identik, 2n. <strong>Meiosis:</strong> Meiosis I (reduksi) - Meiosis II. 4 sel anak, n. Pematangan gamet pada gonad.</p>',
 '<h3>Cell Division</h3><p><strong>Mitosis:</strong> Prophase - Metaphase - Anaphase - Telophase. 2 identical daughter cells, 2n. <strong>Meiosis:</strong> Meiosis I (reduction) - Meiosis II. 4 daughter cells, n. Gamete maturation in gonads.</p>',
 4);

-- =============================================
-- BAB: PENCERNAAN
-- =============================================
INSERT INTO sub_bab (bab_id, key, title_id, title_en, summary_id, summary_en, content_id, content_en, sort_order) VALUES
('pencernaan', 'sub.pencernaan1', 'Organ Pencernaan', 'Digestive Organs',
 'Sistem pencernaan terdiri dari saluran pencernaan dan organ aksesori.',
 'The digestive system consists of the alimentary canal and accessory organs.',
 '<h3>Organ Pencernaan</h3><p><strong>Mulut:</strong> Gigi (mekanis), lidah, kelenjar ludah (amilase). <strong>Kerongkongan (Esofagus):</strong> Gerak peristaltik mendorong makanan ke lambung. <strong>Lambung:</strong> Getah lambung (HCl, pepsin, renin). <strong>Usus Halus:</strong> Duodenum, jejunum, ileum - tempat penyerapan nutrisi. <strong>Usus Besar:</strong> Absorpsi air, pembentukan feses. <strong>Anus:</strong> Ekskresi feses.</p>',
 '<h3>Digestive Organs</h3><p><strong>Mouth:</strong> Teeth (mechanical), tongue, salivary glands (amylase). <strong>Esophagus:</strong> Peristalsis pushes food to stomach. <strong>Stomach:</strong> Gastric juices (HCl, pepsin, rennin). <strong>Small Intestine:</strong> Duodenum, jejunum, ileum - site of nutrient absorption. <strong>Large Intestine:</strong> Water absorption, feces formation. <strong>Anus:</strong> Feces excretion.</p>',
 1),
('pencernaan', 'sub.pencernaan2', 'Enzim Pencernaan', 'Digestive Enzymes',
 'Pencernaan mekanis (fisik) dan kimiawi (enzim). Enzim utama: amilase, pepsin, tripsin, lipase.',
 'Mechanical (physical) and chemical (enzymatic) digestion. Key enzymes: amylase, pepsin, trypsin, lipase.',
 '<h3>Enzim Pencernaan</h3><p><strong>Amilase (ludah/pankreas):</strong> Amilum - Maltosa. <strong>Pepsin (lambung):</strong> Protein - Pepton. <strong>Tripsin (pankreas):</strong> Protein - Asam amino. <strong>Lipase (pankreas):</strong> Lemak - Asam lemak + Gliserol. <strong>Laktase/Sukrase/Maltase (usus):</strong> Disakarida - Monosakarida.</p>',
 '<h3>Digestive Enzymes</h3><p><strong>Amylase (saliva/pancreatic):</strong> Starch - Maltose. <strong>Pepsin (stomach):</strong> Protein - Peptones. <strong>Trypsin (pancreas):</strong> Protein - Amino acids. <strong>Lipase (pancreas):</strong> Fat - Fatty acids + Glycerol. <strong>Lactase/Sucrase/Maltase (intestine):</strong> Disaccharides - Monosaccharides.</p>',
 2),
('pencernaan', 'sub.pencernaan3', 'Mekanisme Pencernaan', 'Mechanism of Digestion',
 'Organ utama: mulut - kerongkongan - lambung - usus halus - usus besar - anus. Organ aksesori: hati, pankreas, kantung empedu.',
 'Main organs: mouth - esophagus - stomach - small intestine - large intestine - anus. Accessory organs: liver, pancreas, gallbladder.',
 '<h3>Mekanisme Pencernaan</h3><p>Pencernaan dimulai di mulut (mekanis dan kimiawi), dilanjutkan di lambung (asam dan enzim), lalu usus halus (penyerapan). Gerak peristaltik dan gerakan segmentasi mengaduk dan mendorong makanan. Selain enzim, empedu dari hati membantu emulsifikasi lemak.</p>',
 '<h3>Mechanism of Digestion</h3><p>Digestion begins in the mouth (mechanical and chemical), continues in the stomach (acid and enzymes), then small intestine (absorption). Peristalsis and segmentation movements mix and push food. Bile from the liver helps emulsify fats.</p>',
 3),
('pencernaan', 'sub.pencernaan4', 'Penyerapan dan Gangguan', 'Absorption and Disorders',
 'Penyerapan nutrisi terjadi di usus halus melalui vili. Gangguan: maag, diare, sembelit, tukak lambung.',
 'Nutrient absorption occurs in the small intestine through villi. Disorders: gastritis, diarrhea, constipation, peptic ulcers.',
 '<h3>Penyerapan dan Gangguan</h3><p>Nutrisi diserap di usus halus melalui vili dan mikrovili. Gangguan umum: <strong>Gastritis:</strong> Peradangan lambung. <strong>Diare:</strong> Feses cair (infeksi/intoleransi). <strong>Konstipasi:</strong> Sulit BAB. <strong>Tukak lambung:</strong> Luka di dinding lambung. <strong>Apendisitis:</strong> Radang usus buntu.</p>',
 '<h3>Absorption and Disorders</h3><p>Nutrients are absorbed in the small intestine through villi and microvilli. Common disorders: <strong>Gastritis:</strong> Stomach inflammation. <strong>Diarrhea:</strong> Watery feces (infection/intolerance). <strong>Constipation:</strong> Difficulty defecating. <strong>Peptic ulcer:</strong> Sores in stomach lining. <strong>Appendicitis:</strong> Appendix inflammation.</p>',
 4);

-- =============================================
-- BAB: ECOSISTEM
-- =============================================
INSERT INTO sub_bab (bab_id, key, title_id, title_en, summary_id, summary_en, content_id, content_en, sort_order) VALUES
('ekosistem', 'sub.ekosistem1', 'Komponen Ekosistem', 'Ecosystem Components',
 'Ekosistem adalah interaksi antara komponen biotik (makhluk hidup) dan abiotik (lingkungan fisik).',
 'An ecosystem is the interaction between biotic (living) and abiotic (physical environment) components.',
 '<h3>Komponen Ekosistem</h3><p><strong>Biotik:</strong> Produsen (tumbuhan), konsumen (herbivora, karnivora, omnivora), dekomposer (bakteri, jamur). <strong>Abiotik:</strong> Cahaya, suhu, air, tanah, udara, pH. Interaksi antar komponen membentuk jaring-jaring makanan yang kompleks.</p>',
 '<h3>Ecosystem Components</h3><p><strong>Biotic:</strong> Producers (plants), consumers (herbivores, carnivores, omnivores), decomposers (bacteria, fungi). <strong>Abiotic:</strong> Light, temperature, water, soil, air, pH. Interactions form complex food webs.</p>',
 1),
('ekosistem', 'sub.ekosistem2', 'Aliran Energi', 'Energy Flow',
 'Aliran energi dalam ekosistem: produsen - konsumen primer - konsumen sekunder - konsumen tersier - dekomposer.',
 'Energy flow: producers - primary consumers - secondary consumers - tertiary consumers - decomposers.',
 '<h3>Aliran Energi</h3><p>Energi masuk melalui fotosintesis (produsen). Hanya 10% energi yang berpindah ke tingkat trofik berikutnya (Hukum 10% Lindeman). Rantai makanan: linear. Jaring makanan: kompleks (banyak rantai saling terhubung). Piramida ekologi: piramida energi, biomassa, dan jumlah.</p>',
 '<h3>Energy Flow</h3><p>Energy enters through photosynthesis (producers). Only 10% transfers to the next trophic level (Lindeman 10% Law). Food chain: linear. Food web: complex (many interconnected chains). Ecological pyramids: energy, biomass, and number pyramids.</p>',
 2),
('ekosistem', 'sub.ekosistem3', 'Siklus Biogeokimia', 'Biogeochemical Cycles',
 'Siklus biogeokimia: siklus karbon, nitrogen, fosfor, dan air. Setiap elemen bersirkulasi melalui komponen biotik dan abiotik.',
 'Biogeochemical cycles: carbon, nitrogen, phosphorus, and water cycles. Each element circulates through biotic and abiotic components.',
 '<h3>Siklus Biogeokimia</h3><p><strong>Siklus Karbon:</strong> Fotosintesis - respirasi - dekomposisi - pembakaran. <strong>Siklus Nitrogen:</strong> Fiksasi N2 - nitrifikasi - asimilasi - amonifikasi - denitrifikasi. <strong>Siklus Air:</strong> Evaporasi - kondensasi - presipitasi - run off.</p>',
 '<h3>Biogeochemical Cycles</h3><p><strong>Carbon Cycle:</strong> Photosynthesis - respiration - decomposition - combustion. <strong>Nitrogen Cycle:</strong> N2 fixation - nitrification - assimilation - ammonification - denitrification. <strong>Water Cycle:</strong> Evaporation - condensation - precipitation - runoff.</p>',
 3),
('ekosistem', 'sub.ekosistem4', 'Keanekaragaman Hayati', 'Biodiversity',
 'Keanekaragaman hayati (biodiversitas) mencakup keanekaragaman gen, spesies, dan ekosistem.',
 'Biodiversity includes genetic, species, and ecosystem diversity.',
 '<h3>Keanekaragaman Hayati</h3><p>Biodiversitas penting untuk keseimbangan ekosistem. Ancaman: deforestasi, polusi, perubahan iklim, spesies invasif. Upaya konservasi: in situ (taman nasional) dan ex situ (kebun binatang, bank benih).</p>',
 '<h3>Biodiversity</h3><p>Biodiversity is essential for ecosystem balance. Threats: deforestation, pollution, climate change, invasive species. Conservation: in situ (national parks) and ex situ (zoos, seed banks).</p>',
 4);

-- =============================================
-- BAB: GENETIKA
-- =============================================
INSERT INTO sub_bab (bab_id, key, title_id, title_en, summary_id, summary_en, content_id, content_en, sort_order) VALUES
('genetika', 'sub.genetika1', 'Struktur DNA dan RNA', 'DNA and RNA Structure',
 'DNA adalah molekul yang membawa informasi genetik. Struktur DNA: double helix (Watson dan Crick, 1953).',
 'DNA carries genetic information. DNA structure: double helix (Watson and Crick, 1953).',
 '<h3>Struktur DNA dan RNA</h3><p><strong>DNA:</strong> Double helix, gula deoksiribosa, basa: A-T, G-C. <strong>RNA:</strong> Single strand, gula ribosa, basa: A-U, G-C. Tiga jenis RNA: mRNA (pembawa kode), tRNA (pengangkut asam amino), rRNA (komponen ribosom).</p>',
 '<h3>DNA and RNA Structure</h3><p><strong>DNA:</strong> Double helix, deoxyribose sugar, bases: A-T, G-C. <strong>RNA:</strong> Single strand, ribose sugar, bases: A-U, G-C. Three RNA types: mRNA (carries code), tRNA (transports amino acids), rRNA (ribosome component).</p>',
 1),
('genetika', 'sub.genetika2', 'Sintesis Protein', 'Protein Synthesis',
 'Sintesis protein: transkripsi (DNA - mRNA) di nukleus, kemudian translasi (mRNA - protein) di ribosom.',
 'Protein synthesis: transcription (DNA - mRNA) in the nucleus, then translation (mRNA - protein) at ribosomes.',
 '<h3>Sintesis Protein</h3><p>Dua tahap: <strong>Transkripsi:</strong> DNA dibuka, RNA polimerase membentuk mRNA. <strong>Translasi:</strong> mRNA dibaca oleh ribosom dalam kodon (3 basa). tRNA membawa asam amino sesuai kodon. Hasil: rantai polipeptida (protein).</p>',
 '<h3>Protein Synthesis</h3><p>Two stages: <strong>Transcription:</strong> DNA unwinds, RNA polymerase forms mRNA. <strong>Translation:</strong> mRNA read by ribosomes in codons (3 bases). tRNA brings matching amino acids. Result: polypeptide chain (protein).</p>',
 2),
('genetika', 'sub.genetika3', 'Genetika Mendel', 'Mendelian Genetics',
 'Hukum Mendel I (segregasi) dan II (assortasi bebas). Persilangan monohibrid dan dihibrid.',
 'Mendel Law I (segregation) and II (independent assortment). Monohybrid and dihybrid crosses.',
 '<h3>Genetika Mendel</h3><p><strong>Hukum Segregasi:</strong> Alel berpisah saat pembentukan gamet. <strong>Hukum Assortasi Bebas:</strong> Gen-gen berbeda bersegregasi secara independen. Rasio fenotip F2 monohibrid: 3:1. Dihibrid: 9:3:3:1. Penyimpangan semu: epistasis, kriptomeri, polimeri.</p>',
 '<h3>Mendelian Genetics</h3><p><strong>Law of Segregation:</strong> Alleles separate during gamete formation. <strong>Law of Independent Assortment:</strong> Different genes segregate independently. F2 monohybrid ratio: 3:1. Dihybrid: 9:3:3:1. Modifications: epistasis, cryptomery, polymerism.</p>',
 3),
('genetika', 'sub.genetika4', 'Mutasi', 'Mutations',
 'Mutasi adalah perubahan pada urutan DNA. Dapat disebabkan oleh faktor fisik, kimia, atau biologis.',
 'Mutations are changes in DNA sequence. Caused by physical, chemical, or biological factors.',
 '<h3>Mutasi</h3><p><strong>Mutasi Gen:</strong> Substitusi, insersi, delesi (dapat menyebabkan penyakit genetik). <strong>Mutasi Kromosom:</strong> Delesi, duplikasi, inversi, translokasi. Mutagen: radiasi (fisik), senyawa kimia (kimia), virus (biologis).</p>',
 '<h3>Mutations</h3><p><strong>Gene Mutations:</strong> Substitution, insertion, deletion (can cause genetic diseases). <strong>Chromosomal Mutations:</strong> Deletion, duplication, inversion, translocation. Mutagens: radiation (physical), chemicals (chemical), viruses (biological).</p>',
 4);

-- =============================================
-- BAB: EVOLUSI
-- =============================================
INSERT INTO sub_bab (bab_id, key, title_id, title_en, summary_id, summary_en, content_id, content_en, sort_order) VALUES
('evolusi', 'sub.evolusi1', 'Teori Evolusi', 'Evolution Theory',
 'Teori evolusi menjelaskan perubahan makhluk hidup dari waktu ke waktu melalui seleksi alam (Darwin).',
 'Evolution theory explains how living things change over time through natural selection (Darwin).',
 '<h3>Teori Evolusi</h3><p><strong>Lamarck:</strong> Organ yang sering digunakan berkembang (use and disuse). Sifat yang diperoleh diwariskan. <strong>Darwin:</strong> Seleksi alam - variasi genetik - kompetisi - survival of the fittest - reproduksi diferensial. <strong>Sintesis Modern:</strong> Evolusi = perubahan frekuensi alel dalam populasi.</p>',
 '<h3>Evolution Theory</h3><p><strong>Lamarck:</strong> Use and disuse - organs used more develop further. Acquired traits inherited. <strong>Darwin:</strong> Natural selection - genetic variation - competition - survival of the fittest - differential reproduction. <strong>Modern Synthesis:</strong> Evolution = change in allele frequency in populations.</p>',
 1),
('evolusi', 'sub.evolusi2', 'Seleksi Alam', 'Natural Selection',
 'Seleksi alam: individu dengan sifat yang menguntungkan lebih mampu bertahan dan bereproduksi.',
 'Natural selection: individuals with advantageous traits survive and reproduce better.',
 '<h3>Seleksi Alam</h3><p>Mekanisme evolusi utama. Tiga syarat: (1) Variasi dalam populasi, (2) Variasi diwariskan, (3) Reproduksi berlebih sehingga terjadi kompetisi. Contoh: Biston betularia (ngengat lada) di Inggris - perubahan warna akibat Revolusi Industri.</p>',
 '<h3>Natural Selection</h3><p>Primary mechanism of evolution. Three conditions: (1) Variation in population, (2) Variation is heritable, (3) Over-reproduction leads to competition. Example: Biston betularia (peppered moth) in England - color change due to Industrial Revolution.</p>',
 2),
('evolusi', 'sub.evolusi3', 'Spesiasi', 'Speciation',
 'Spesiasi adalah pembentukan spesies baru karena isolasi geografis atau reproduktif.',
 'Speciation is the formation of new species due to geographic or reproductive isolation.',
 '<h3>Spesiasi</h3><p><strong>Spesiasi Allopatrik:</strong> Isolasi geografis (gunung, sungai, laut). <strong>Spesiasi Simpatrik:</strong> Isolasi reproduktif dalam satu daerah. <strong>Isolasi Reproduktif:</strong> Mekanis (ukuran), temporal (musim kawin), perilaku (tarian kawin).</p>',
 '<h3>Speciation</h3><p><strong>Allopatric Speciation:</strong> Geographic isolation (mountains, rivers, seas). <strong>Sympatric Speciation:</strong> Reproductive isolation within same area. <strong>Reproductive Isolation:</strong> Mechanical (size), temporal (mating season), behavioral (courtship dance).</p>',
 3),
('evolusi', 'sub.evolusi4', 'Bukti Evolusi', 'Evidence of Evolution',
 'Bukti evolusi: fosil, anatomi perbandingan, embriologi perbandingan, bukti molekuler (DNA).',
 'Evidence of evolution: fossils, comparative anatomy, comparative embryology, molecular evidence (DNA).',
 '<h3>Bukti Evolusi</h3><p><strong>Fosil:</strong> Urutan kronologis di lapisan batuan. <strong>Anatomi:</strong> Homologi (struktur sama, fungsi beda) vs Analogi (struktur beda, fungsi sama). <strong>Embriologi:</strong> Embrio vertebrata mirip di awal perkembangan. <strong>Molekuler:</strong> Perbandingan urutan DNA/Protein.</p>',
 '<h3>Evidence of Evolution</h3><p><strong>Fossils:</strong> Chronological order in rock layers. <strong>Anatomy:</strong> Homology (same structure, different function) vs Analogy (different structure, same function). <strong>Embryology:</strong> Vertebrate embryos similar in early development. <strong>Molecular:</strong> DNA/Protein sequence comparison.</p>',
 4);

-- =============================================
-- BAB: SISTEM SIRKULASI
-- =============================================
INSERT INTO sub_bab (bab_id, key, title_id, title_en, summary_id, summary_en, content_id, content_en, sort_order) VALUES
('sirkulasi', 'sub.sirkulasi1', 'Jantung dan Pembuluh Darah', 'Heart and Blood Vessels',
 'Sistem sirkulasi mengangkut oksigen, nutrisi, hormon, dan sisa metabolisme ke seluruh tubuh.',
 'The circulatory system transports oxygen, nutrients, hormones, and waste products throughout the body.',
 '<h3>Jantung dan Pembuluh Darah</h3><p><strong>Jantung:</strong> 4 ruang. Atrium kanan terima darah CO2 dari tubuh, ventrikel kanan pompa ke paru-paru. Atrium kiri terima darah O2 dari paru-paru, ventrikel kiri pompa ke tubuh. Katup mencegah aliran balik. <strong>Arteri:</strong> Bawa darah dari jantung (O2). <strong>Vena:</strong> Bawa darah ke jantung (CO2). <strong>Kapiler:</strong> Tempat pertukaran zat.</p>',
 '<h3>Heart and Blood Vessels</h3><p><strong>Heart:</strong> 4 chambers. Right atrium receives CO2 blood from body, right ventricle pumps to lungs. Left atrium receives O2 blood from lungs, left ventricle pumps to body. Valves prevent backflow. <strong>Arteries:</strong> Carry blood away from heart (O2). <strong>Veins:</strong> Carry blood to heart (CO2). <strong>Capillaries:</strong> Site of exchange.</p>',
 1),
('sirkulasi', 'sub.sirkulasi2', 'Komponen Darah', 'Blood Components',
 'Jantung terdiri dari 4 ruang: atrium kanan/kiri, ventrikel kanan/kiri. Pembuluh darah: arteri, vena, kapiler.',
 'The heart has 4 chambers: right/left atrium, right/left ventricle. Blood vessels: arteries, veins, capillaries.',
 '<h3>Komponen Darah</h3><p><strong>Eritrosit (sel darah merah):</strong> Mengandung hemoglobin, mengangkut O2/CO2. <strong>Leukosit (sel darah putih):</strong> Sistem imun - fagositosis, antibodi. <strong>Trombosit (keping darah):</strong> Pembekuan darah. <strong>Plasma darah:</strong> 90% air, mengandung nutrisi, hormon, protein, antibodi.</p>',
 '<h3>Blood Components</h3><p><strong>Erythrocytes (red blood cells):</strong> Contain hemoglobin, transport O2/CO2. <strong>Leukocytes (white blood cells):</strong> Immune system - phagocytosis, antibodies. <strong>Thrombocytes (platelets):</strong> Blood clotting. <strong>Blood Plasma:</strong> 90% water, nutrients, hormones, proteins, antibodies.</p>',
 2),
('sirkulasi', 'sub.sirkulasi3', 'Peredaran Darah', 'Blood Circulation',
 'Peredaran darah: peredaran pulmonal (jantung - paru-paru) dan sistemik (jantung - seluruh tubuh).',
 'Blood circulation: pulmonary (heart - lungs) and systemic (heart - body).',
 '<h3>Peredaran Darah</h3><p><strong>Peredaran Pulmonal (kecil):</strong> Ventrikel kanan - arteri pulmonalis - paru-paru - vena pulmonalis - atrium kiri. <strong>Peredaran Sistemik (besar):</strong> Ventrikel kiri - aorta - seluruh tubuh - vena cava - atrium kanan. Nadi: denyut arteri, tekanan darah: sistol/diastol.</p>',
 '<h3>Blood Circulation</h3><p><strong>Pulmonary Circulation:</strong> Right ventricle - pulmonary artery - lungs - pulmonary vein - left atrium. <strong>Systemic Circulation:</strong> Left ventricle - aorta - body - vena cava - right atrium. Pulse: artery beat, blood pressure: systole/diastole.</p>',
 3),
('sirkulasi', 'sub.sirkulasi4', 'Gangguan Sirkulasi', 'Circulatory Disorders',
 'Komponen darah: eritrosit, leukosit, trombosit, plasma. Gangguan: anemia, hipertensi, serangan jantung.',
 'Blood components: erythrocytes, leukocytes, thrombocytes, plasma. Disorders: anemia, hypertension, heart attack.',
 '<h3>Gangguan Sirkulasi</h3><p><strong>Anemia:</strong> Kurang Hb/eritrosit. <strong>Hipertensi:</strong> Tekanan darah tinggi (>140/90). <strong>Aterosklerosis:</strong> Pengerasan pembuluh darah oleh plak. <strong>Serangan jantung:</strong> Penyumbatan arteri koroner. <strong>Stroke:</strong> Gangguan aliran darah ke otak.</p>',
 '<h3>Circulatory Disorders</h3><p><strong>Anemia:</strong> Low Hb/erythrocytes. <strong>Hypertension:</strong> High blood pressure (>140/90). <strong>Atherosclerosis:</strong> Hardening of arteries by plaque. <strong>Heart attack:</strong> Coronary artery blockage. <strong>Stroke:</strong> Disrupted blood flow to brain.</p>',
 4);

-- =============================================
-- BAB: SISTEM SARAF
-- =============================================
INSERT INTO sub_bab (bab_id, key, title_id, title_en, summary_id, summary_en, content_id, content_en, sort_order) VALUES
('syaraf', 'sub.syaraf1', 'Struktur Neuron', 'Neuron Structure',
 'Sistem saraf mengatur dan mengkoordinasikan aktivitas tubuh melalui impuls listrik.',
 'The nervous system regulates and coordinates body activities through electrical impulses.',
 '<h3>Struktur Neuron</h3><p><strong>Dendrit:</strong> Menerima impuls dari neuron lain. <strong>Badan Sel:</strong> Mengandung nukleus, pusat metabolisme. <strong>Akson:</strong> Mengirim impuls ke neuron/efektor lain. <strong>Selubung Mielin:</strong> Isolator, mempercepat hantaran impuls. <strong>Sinaps:</strong> Celah antar neuron, transmisi melalui neurotransmitter (asetilkolin, dopamin, serotonin).</p>',
 '<h3>Neuron Structure</h3><p><strong>Dendrites:</strong> Receive impulses from other neurons. <strong>Cell Body:</strong> Contains nucleus, metabolic center. <strong>Axon:</strong> Sends impulses to other neurons/effectors. <strong>Myelin Sheath:</strong> Insulator, speeds up impulse. <strong>Synapse:</strong> Gap between neurons, transmission via neurotransmitters (acetylcholine, dopamine, serotonin).</p>',
 1),
('syaraf', 'sub.syaraf2', 'Sistem Saraf Pusat', 'Central Nervous System',
 'Neuron terdiri dari badan sel, dendrit (menerima impuls), dan akson (mengirim impuls). Sinaps adalah celah antar neuron.',
 'Neurons consist of cell body, dendrites (receive impulses), and axon (send impulses). Synapse is the gap between neurons.',
 '<h3>Sistem Saraf Pusat</h3><p><strong>Otak:</strong> <em>Serebrum</em> (fungsi luhur: berpikir, bicara, memori). <em>Serebelum</em> (keseimbangan, koordinasi gerak). <em>Batang otak</em> (medula oblongata - pernapasan, denyut jantung). <strong>Sumsum Tulang Belakang:</strong> Menghantarkan impuls antara otak dan tubuh, pusat refleks.</p>',
 '<h3>Central Nervous System</h3><p><strong>Brain:</strong> <em>Cerebrum</em> (higher functions: thinking, speech, memory). <em>Cerebellum</em> (balance, coordination). <em>Brainstem</em> (medulla oblongata - breathing, heart rate). <strong>Spinal Cord:</strong> Conducts impulses between brain and body, reflex center.</p>',
 2),
('syaraf', 'sub.syaraf3', 'Sistem Saraf Tepi', 'Peripheral Nervous System',
 'Sistem saraf pusat: otak (serebrum, serebelum, batang otak) dan sumsum tulang belakang.',
 'Central nervous system: brain (cerebrum, cerebellum, brainstem) and spinal cord.',
 '<h3>Sistem Saraf Tepi</h3><p><strong>Somatik:</strong> 12 pasang saraf kranial, 31 pasang saraf spinal. Mengontrol gerakan sadar. <strong>Otonom:</strong> <em>Simpatis:</em> Fight or flight (denyut naik, pupil membesar). <em>Parasimpatis:</em> Rest and digest (denyut turun, pencernaan meningkat).</p>',
 '<h3>Peripheral Nervous System</h3><p><strong>Somatic:</strong> 12 cranial nerves, 31 spinal nerves. Controls voluntary movements. <strong>Autonomic:</strong> <em>Sympathetic:</em> Fight or flight (heart rate up, pupils dilate). <em>Parasympathetic:</em> Rest and digest (heart rate down, digestion increases).</p>',
 3),
('syaraf', 'sub.syaraf4', 'Organ Indra', 'Sensory Organs',
 'Sistem saraf tepi: saraf somatik (sadar) dan otonom (tak sadar - simpatis dan parasimpatis). Organ indra: mata, telinga, hidung, lidah, kulit.',
 'Peripheral nervous system: somatic (voluntary) and autonomic (involuntary - sympathetic and parasympathetic). Sensory organs: eyes, ears, nose, tongue, skin.',
 '<h3>Organ Indra</h3><p><strong>Mata:</strong> Kornea - pupil - lensa - retina - saraf optik. <strong>Telinga:</strong> Telinga luar, tengah (tulang pendengaran), dalam (koklea). <strong>Hidung:</strong> Reseptor olfaktori. <strong>Lidah:</strong> Pengecap - manis, asin, asam, pahit, umami. <strong>Kulit:</strong> Reseptor raba, panas, dingin, tekanan, nyeri.</p>',
 '<h3>Sensory Organs</h3><p><strong>Eye:</strong> Cornea - pupil - lens - retina - optic nerve. <strong>Ear:</strong> Outer, middle (ossicles), inner (cochlea). <strong>Nose:</strong> Olfactory receptors. <strong>Tongue:</strong> Taste - sweet, salty, sour, bitter, umami. <strong>Skin:</strong> Touch, heat, cold, pressure, pain receptors.</p>',
 4);

-- =============================================
-- BAB: BAKTERI
-- =============================================
INSERT INTO sub_bab (bab_id, key, title_id, title_en, summary_id, summary_en, content_id, content_en, sort_order) VALUES
('bakteri', 'sub.bakteri1', 'Sel Prokariotik', 'Prokaryotic Cells',
 'Bakteri adalah prokariotik - tidak memiliki membran inti. Termasuk kingdom Monera. Uniseluler, ukuran 0,5-5 um.',
 'Bacteria are prokaryotic - lacking a membrane-bound nucleus. Kingdom Monera. Unicellular, 0.5-5 um in size.',
 '<h3>Sel Prokariotik</h3><p>Bakteri termasuk prokariot - tidak memiliki membran inti (nukleus). DNA berada di daerah nukleoid berbentuk sirkuler. Tidak memiliki organel bermembran seperti mitokondria atau RE. Ribosom berukuran 70S (lebih kecil dari eukariot). Ukuran umum: 0,5-5 um. Bakteri pertama kali diamati oleh Antonie van Leeuwenhoek (1676).</p>',
 '<h3>Prokaryotic Cells</h3><p>Bacteria are prokaryotes - lacking a membrane-bound nucleus. DNA is in the nucleoid region, circular. No membrane-bound organelles like mitochondria or ER. Ribosomes are 70S (smaller than eukaryotes). Typical size: 0.5-5 um. First observed by Antonie van Leeuwenhoek (1676).</p>',
 1),
('bakteri', 'sub.bakteri2', 'Struktur Bakteri', 'Bacterial Structure',
 'Struktur: dinding sel (peptidoglikan), membran plasma, sitoplasma, ribosom, DNA sirkuler (nukleoid). Ada juga kapsul, flagel, pili, dan endospora.',
 'Structure: cell wall (peptidoglycan), plasma membrane, cytoplasm, ribosomes, circular DNA (nucleoid). Also capsule, flagella, pili, and endospores.',
 '<h3>Struktur Bakteri</h3><p><strong>Dinding Sel:</strong> Tersusun dari peptidoglikan (polisakarida + asam amino). <strong>Membran Plasma:</strong> Membran fosfolipid bilayer - mengatur keluar masuk zat. <strong>Sitoplasma:</strong> Mengandung ribosom, enzim, dan materi genetik. <strong>Nukleoid:</strong> DNA sirkuler (kromosom bakteri). <strong>Plasmid:</strong> DNA ekstrakromosomal - gen resistensi antibiotik. <strong>Kapsul:</strong> Lapisan lendir pelindung. <strong>Flagel:</strong> Alat gerak. <strong>Pili:</strong> Serat untuk melekat dan konjugasi. <strong>Endospora:</strong> Bentuk dorman saat kondisi ekstrem.</p>',
 '<h3>Bacterial Structure</h3><p><strong>Cell Wall:</strong> Composed of peptidoglycan (polysaccharides + amino acids). <strong>Plasma Membrane:</strong> Phospholipid bilayer - regulates transport. <strong>Cytoplasm:</strong> Contains ribosomes, enzymes, genetic material. <strong>Nucleoid:</strong> Circular DNA (bacterial chromosome). <strong>Plasmid:</strong> Extrachromosomal DNA - antibiotic resistance genes. <strong>Capsule:</strong> Protective slime layer. <strong>Flagella:</strong> Locomotion. <strong>Pili:</strong> Fibers for attachment and conjugation. <strong>Endospores:</strong> Dormant form during extreme conditions.</p>',
 2),
('bakteri', 'sub.bakteri3', 'Reproduksi Bakteri', 'Bacterial Reproduction',
 'Reproduksi: aseksual (pembelahan biner - amitosis) dan seksual (konjugasi, transformasi, transduksi) untuk pertukaran materi genetik.',
 'Reproduction: asexual (binary fission - amitosis) and sexual (conjugation, transformation, transduction) for genetic exchange.',
 '<h3>Reproduksi Bakteri</h3><p><strong>Aseksual (Pembelahan Biner):</strong> DNA direplikasi - sel membelah menjadi 2 sel anak identik. Waktu generasi: 20-30 menit. <strong>Konjugasi:</strong> Transfer plasmid melalui pili. <strong>Transformasi:</strong> Bakteri mengambil DNA bebas dari lingkungan. <strong>Transduksi:</strong> Transfer DNA melalui bakteriofag (virus bakteri). Reproduksi cepat menyebabkan pertumbuhan koloni eksponensial - kurva pertumbuhan: lag, log (eksponensial), stasioner, kematian.</p>',
 '<h3>Bacterial Reproduction</h3><p><strong>Asexual (Binary Fission):</strong> DNA replicates - cell divides into 2 identical daughter cells. Generation time: 20-30 minutes. <strong>Conjugation:</strong> Plasmid transfer via pili. <strong>Transformation:</strong> Bacteria take up free DNA from environment. <strong>Transduction:</strong> DNA transfer via bacteriophages (bacterial viruses). Rapid reproduction causes exponential colony growth - growth curve: lag, log (exponential), stationary, death phases.</p>',
 3),
('bakteri', 'sub.bakteri4', 'Klasifikasi dan Peran', 'Classification and Roles',
 'Klasifikasi: Gram positif (dinding tebal, ungu) dan Gram negatif (dinding tipis, merah). Peran: dekomposer, fiksasi nitrogen, probiotik, patogen.',
 'Classification: Gram-positive (thick wall, purple) and Gram-negative (thin wall, red). Roles: decomposer, nitrogen fixation, probiotics, pathogen.',
 '<h3>Klasifikasi dan Peran</h3><p><strong>Gram Positif:</strong> Dinding peptidoglikan tebal, menyerap kristal violet - ungu. Contoh: <em>Staphylococcus</em>, <em>Streptococcus</em>, <em>Bacillus</em>. <strong>Gram Negatif:</strong> Dinding peptidoglikan tipis + membran luar, merah. Contoh: <em>E. coli</em>, <em>Salmonella</em>, <em>Pseudomonas</em>. <strong>Berdasarkan bentuk:</strong> Kokus (bulat), Basil (batang), Spirilum (spiral), Vibrio (koma). <strong>Peran menguntungkan:</strong> Dekomposer, fiksasi N2 (<em>Rhizobium</em>), probiotik (<em>Lactobacillus</em>), pembuatan antibiotik (<em>Streptomyces</em>), bioremediasi. <strong>Peran merugikan:</strong> Patogen penyebab penyakit - TBC (<em>Mycobacterium tuberculosis</em>), kolera (<em>Vibrio cholerae</em>), tipes (<em>Salmonella typhi</em>), tetanus (<em>Clostridium tetani</em>).</p>',
 '<h3>Classification and Roles</h3><p><strong>Gram Positive:</strong> Thick peptidoglycan wall, absorbs crystal violet - purple. Examples: <em>Staphylococcus</em>, <em>Streptococcus</em>, <em>Bacillus</em>. <strong>Gram Negative:</strong> Thin peptidoglycan + outer membrane, red. Examples: <em>E. coli</em>, <em>Salmonella</em>, <em>Pseudomonas</em>. <strong>By shape:</strong> Cocci (spherical), Bacilli (rod), Spirilla (spiral), Vibrio (comma). <strong>Beneficial roles:</strong> Decomposers, N2 fixation (<em>Rhizobium</em>), probiotics (<em>Lactobacillus</em>), antibiotic production (<em>Streptomyces</em>), bioremediation. <strong>Harmful roles:</strong> Pathogens causing disease - TB (<em>Mycobacterium tuberculosis</em>), cholera (<em>Vibrio cholerae</em>), typhoid (<em>Salmonella typhi</em>), tetanus (<em>Clostridium tetani</em>).</p>',
 4);
