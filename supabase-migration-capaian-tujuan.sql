-- Migrasi: Capaian Pembelajaran (CP) & Tujuan Pembelajaran (TP) per bab
-- Siswa melihat untuk apa mereka belajar sebelum masuk materi.
-- Konten disimpan sebagai teks biasa (baris = item list untuk TP).
-- Jalankan di Supabase SQL Editor. Aman dijalankan berulang.

ALTER TABLE public.bab ADD COLUMN IF NOT EXISTS capaian_id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.bab ADD COLUMN IF NOT EXISTS capaian_en TEXT NOT NULL DEFAULT '';
ALTER TABLE public.bab ADD COLUMN IF NOT EXISTS tujuan_id TEXT NOT NULL DEFAULT '';
ALTER TABLE public.bab ADD COLUMN IF NOT EXISTS tujuan_en TEXT NOT NULL DEFAULT '';

-- Seed CP & TP untuk semua bab.
-- Format: satu paragraf untuk capaian; baris terpisah (E'...\n...') untuk tiap tujuan.

-- SEL
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menjelaskan struktur sel prokariotik dan eukariotik serta berbagai proses kehidupan yang terjadi di dalam sel sebagai dasar keberlangsungan hidup organisme.',
capaian_en = 'Students can explain the structure of prokaryotic and eukaryotic cells and various life processes within the cell as the basis for an organism''s survival.',
tujuan_id = E'Menjelaskan perkembangan teori sel dan prinsip "omnis cellula e cellula".\nMengidentifikasi organel sel beserta fungsi utamanya.\nMenganalisis jalur transpor membran: difusi, osmosis, dan transpor aktif.\nMembedakan tahapan pembelahan mitosis dan meiosis serta hasilnya.',
tujuan_en = E'Explain the development of cell theory and the principle of "omnis cellula e cellula".\nIdentify cell organelles and their main functions.\nAnalyze membrane transport pathways: diffusion, osmosis, and active transport.\nDifferentiate the stages of mitosis and meiosis and their outcomes.'
WHERE id = 'sel';

-- PENCERNAAN
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menganalisis sistem pencernaan manusia — organ, enzim, dan mekanisme kerjanya — beserta upaya menjaga kesehatannya.',
capaian_en = 'Students can analyze the human digestive system — organs, enzymes, and how they work — along with efforts to keep it healthy.',
tujuan_id = E'Mengidentifikasi organ saluran pencernaan dan organ aksesori beserta fungsinya.\nMenjelaskan peran tiap enzim pencernaan pada substrat dan produknya.\nMenguraikan alur makanan dari mulut hingga diserap di usus halus.\nMemahami gangguan pencernaan umum dan cara pencegahannya.',
tujuan_en = E'Identify digestive tract organs and accessory organs with their functions.\nExplain each digestive enzyme''s role on its substrate and products.\nTrace the journey of food from the mouth to absorption in the small intestine.\nUnderstand common digestive disorders and how to prevent them.'
WHERE id = 'pencernaan';

-- SIRKULASI
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menjelaskan struktur dan fungsi jantung, darah, dan pembuluh darah, serta menghubungkan gangguan sirkulasi dengan pola hidup sehat.',
capaian_en = 'Students can explain the structure and function of the heart, blood, and blood vessels, and connect circulatory disorders with healthy lifestyle choices.',
tujuan_id = E'Menjelaskan alur peredaran darah kecil dan besar di dalam jantung.\nMembedakan komponen darah dan tugas masing-masing.\nMembandingkan ciri pembuluh arteri, vena, dan kapiler.\nMengaitkan gangguan peredaran darah dengan gaya hidup.',
tujuan_en = E'Examine the pulmonary and systemic circulation routes through the heart.\nDifferentiate blood components and each one''s role.\nCompare the traits of arteries, veins, and capillaries.\nRelate circulatory disorders to lifestyle habits.'
WHERE id = 'sirkulasi';

-- SYARAF
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menganalisis struktur sistem saraf, mekanisme impuls dan refleks, serta kaitannya dengan perilaku makhluk hidup.',
capaian_en = 'Students can analyze the structure of the nervous system, the mechanism of impulses and reflexes, and how they relate to organism behavior.',
tujuan_id = E'Mengidentifikasi bagian sistem saraf pusat dan tepi beserta fungsinya.\nMenjelaskan jalur impuls melalui neuron (akson, dendrit, selaput mielin).\nMenganalisis mekanisme refleks dan lengkung refleks.\nMenghubungkan kesehatan saraf dengan kebiasaan sehari-hari.',
tujuan_en = E'Identify the central and peripheral nervous system parts with their functions.\nExplain impulse transmission through neurons (axon, dendrite, myelin).\nAnalyze reflex mechanisms and the reflex arc.\nConnect nerve health to everyday habits.'
WHERE id = 'syaraf';

-- GENETIKA
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menerapkan prinsip pewarisan sifat, struktur dan fungsi materi genetik, serta penerapannya dalam persilangan.',
capaian_en = 'Students can apply the principles of trait inheritance, explain the structure and function of genetic material, and use these in crosses.',
tujuan_id = E'Menjelaskan struktur DNA, kromosom, dan gen sebagai materi pembawa sifat.\nMenerapkan hukum Mendel I dan II dalam papan persilangan (Punnett square).\nMenganalisis pewarisan sifat dominan, resesif, dan kelompok darah.\nMembedakan genetik normal dengan gangguan kromosom umum.',
tujuan_en = E'Explain DNA, chromosome, and gene structure as units carrying traits.\nApply Mendel''s first and second laws using a Punnett square.\nAnalyze inheritance of dominant, recessive, and blood-group traits.\nDistinguish normal genetics from common chromosomal disorders.'
WHERE id = 'genetika';

-- EVOLUSI
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menjelaskan teori evolusi dan bukti-bukti evolusi, serta menerapkan prinsip seleksi alam pada fenomena kehidupan nyata.',
capaian_en = 'Students can explain theories and evidence of evolution, and apply the principle of natural selection to real-world phenomena.',
tujuan_id = E'Membandingkan teori evolusi Lamarck dan Darwin.\nMenjelaskan bukti evolusi: fosil, anatomi, embriologi, dan molekuler.\nMenerapkan prinsip seleksi alam dan spesiasi pada contoh nyata.\nMenghubungkan evolusi dengan isu nyata seperti resistensi antibiotik.',
tujuan_en = E'Compare the evolution theories of Lamarck and Darwin.\nExplain evidence of evolution: fossils, anatomy, embryology, and molecular data.\nApply natural selection and speciation to real examples.\nConnect evolution to real issues such as antibiotic resistance.'
WHERE id = 'evolusi';

-- EKOSISTEM
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menganalisis interaksi makhluk hidup dengan lingkungan, aliran energi dalam ekosistem, dan perannya menjaga keseimbangan lingkungan.',
capaian_en = 'Students can analyze how organisms interact with their environment, the flow of energy in ecosystems, and their role in keeping the environment balanced.',
tujuan_id = E'Mengidentifikasi komponen biotik dan abiotik dalam ekosistem.\nMenganalisis rantai makanan, jaring makanan, dan piramida energi.\nMenjelaskan siklus biogeokimia pendukung kehidupan.\nMengaitkan polusi dan eksploitasi lingkungan dengan keseimbangan ekosistem.',
tujuan_en = E'Identify biotic and abiotic components within ecosystems.\nAnalyze food chains, food webs, and energy pyramids.\nExplain the biogeochemical cycles that support life.\nRelate pollution and environmental exploitation to ecosystem balance.'
WHERE id = 'ekosistem';

-- BAKTERI
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menjelaskan struktur, reproduksi, dan peran bakteri bagi kehidupan, serta mengambil keputusan cerdas dalam menjaga kesehatan dari penyakit bakteri.',
capaian_en = 'Students can explain the structure, reproduction, and roles of bacteria in life, and make informed decisions to protect health from bacterial diseases.',
tujuan_id = E'Menjelaskan struktur bakteri (dinding sel, membran, plasmid, pilus) dan fungsinya.\nMenganalisis cara bakteri berkembang biak, termasuk konjugasi dan gen R.\nMengklasifikasikan bakteri berdasarkan bentuk, dinding sel, dan perannya.\nMenghubungkan resistensi antibiotik dengan evolusi dan cara pencegahannya.',
tujuan_en = E'Explain bacterial structure (cell wall, membrane, plasmid, pili) and their functions.\nAnalyze how bacteria reproduce, including conjugation and the R gene.\nClassify bacteria by shape, cell wall, and role.\nRelate antibiotic resistance to evolutionary theory and prevention.'
WHERE id = 'bakteri';

-- TUMBUHAN
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menjelaskan struktur tumbuhan — akar, batang, daun, dan bunga — serta proses transportasi, fotosintesis, dan peran tumbuhan dalam ekosistem.',
capaian_en = 'Students can explain plant structure — roots, stems, leaves, and flowers — as well as transport, photosynthesis, and the role of plants in ecosystems.',
tujuan_id = E'Mengidentifikasi jaringan dasar, pengangkut, dan meristematik pada tumbuhan.\nMenjelaskan proses fotosintesis, faktor yang memengaruhi, dan hasilnya.\nMenganalisis jalur transport air dan nutrisi melalui xilem dan floem.\nMenghubungkan peran tumbuhan dengan ketersediaan O₂ dan energi di ekosistem.',
tujuan_en = E'Identify ground, vascular, and meristematic tissues in plants.\nExplain photosynthesis, the factors affecting it, and its products.\nAnalyze how water and nutrients move through xylem and phloem.\nConnect plants'' role with O₂ supply and ecosystem energy.'
WHERE id = 'tumbuhan';

-- MANUSIA
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menganalisis sistem organ tubuh manusia (pencernaan, sirkulasi, saraf) secara utuh dan kaitan antar-sistem dalam menjaga tubuh tetap sehat.',
capaian_en = 'Students can analyze the human body''s organ systems (digestion, circulation, nerves) in an integrated way and how they interact to keep the body healthy.',
tujuan_id = E'Memahami peta besar sistem organ manusia dan tugas utamanya.\nMenganalisis kerja sistem pencernaan, peredaran darah, dan saraf.\nMenghubungkan kerja antar-sistem saat tubuh beraktivitas.\nMengambil keputusan cerdas untuk menjaga kesehatan tubuh.',
tujuan_en = E'Understand the big picture of human organ systems and their main tasks.\nAnalyze the digestive, circulatory, and nervous systems at work.\nConnect system interactions as the body functions.\nMake informed decisions to keep the body healthy.'
WHERE id = 'manusia';

-- VIRUS
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menjelaskan struktur virus, cara reproduksinya (litik dan lisogenik), serta menganalisis pencegahan penyakit infeksi virus.',
capaian_en = 'Students can explain virus structure, how viruses reproduce (lytic and lysogenic), and how to analyze and prevent viral infections.',
tujuan_id = E'Menjelaskan struktur virus (kapsid, asam nukleat, dan selubung protein) beserta bentuknya.\nMembandingkan siklus reproduksi litik dan lisogenik.\nMenganalisis cara virus menular dan penyakit yang ditimbulkannya.\nMengaitkan langkah pencegahan dan vaksinasi dengan sifat virus.',
tujuan_en = E'Explain virus structure (capsid, nucleic acid, envelope) and shapes.\nCompare lytic and lysogenic reproductive cycles.\nAnalyze how viruses spread and the diseases they cause.\nRelate vaccination and prevention steps to viral traits.'
WHERE id = 'virus';

-- JAMUR
UPDATE public.bab SET
capaian_id = 'Peserta didik mampu menjelaskan ciri umum jamur (kingdom Fungi), klasifikasinya, peran menguntungkan dan merugikannya, serta pemanfaatannya dalam kehidupan sehari-hari.',
capaian_en = 'Students can explain the general traits of fungi, their classification, beneficial and harmful roles, and their everyday uses.',
tujuan_id = E'Menjelaskan ciri umum jamur: sel eukariotik, hifa, dinding kitin.\nMengklasifikasikan jamur berdasarkan cara reproduksi dan filogeninya.\nMembedakan peran jamur menguntungkan (makanan, obat) dan merugikan (patogen).\nMengaitkan jamur dengan keseharian: tempe, tape, penicillin.',
tujuan_en = E'Explain general fungi traits: eukaryotic cells, hyphae, chitin walls.\nClassify fungi by reproduction mode and phylogeny.\nDistinguish beneficial (food, medicine) and harmful (pathogenic) fungi.\nRelate fungi to daily life: tempe, bread, penicillin, and more.'
WHERE id = 'jamur';
