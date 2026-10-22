// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface BabSubDef {
  id: string;
  icon: string;
  color: string;
  subs: string[];
  summary: { id: string[]; en: string[] };
  full: { id: string[]; en: string[] };
  videoId: string;
  video: { id: string; en: string };
  hotspotted: string;
}

export type BabData = BabSubDef;

export interface BabSub {
  id: string;
  icon: string;
  color: string;
  subs: string[];
  summary: { id: string[]; en: string[] };
  full: { id: string[]; en: string[] };
  videoId: string;
  video: { id: string; en: string };
  hotspotted: string;
}

export const BAB: BabSub[] = [
  {
    id: "sel",
    icon: "🔬",
    color: "#6c5ce7",
    subs: ["sub.sel1", "sub.sel2", "sub.sel3", "sub.sel4"],
    summary: {
      id: [
        "Sel adalah unit terkecil kehidupan. Teori sel menyatakan bahwa semua makhluk hidup tersusun atas sel.",
        "Organel utama: nukleus (inti sel), mitokondria (energi), retikulum endoplasma (sintesis protein), aparatus Golgi (modifikasi protein).",
        "Transpor membran: difusi, osmosis, transpor aktif, endositosis & eksositosis.",
        "Pembelahan sel: mitosis (2 sel anak identik) dan meiosis (4 sel gamet).",
      ],
      en: [
        "The cell is the smallest unit of life. Cell theory states that all living things are composed of cells.",
        "Major organelles: nucleus, mitochondria (energy), endoplasmic reticulum (protein synthesis), Golgi apparatus (protein modification).",
        "Membrane transport: diffusion, osmosis, active transport, endocytosis & exocytosis.",
        "Cell division: mitosis (2 identical daughter cells) and meiosis (4 gamete cells).",
      ],
    },
    full: {
      id: [
        '<h3>Teori Sel</h3><p>Sel pertama kali ditemukan oleh Robert Hooke (1665). Teori sel modern: (1) Semua makhluk hidup terdiri dari sel, (2) Sel adalah unit struktural dan fungsional kehidupan, (3) Semua sel berasal dari sel sebelumnya (omnis cellula e cellula).</p>',
        '<h3>Organel Sel</h3><p><strong>Nukleus:</strong> Mengandung DNA, mengontrol aktivitas sel. <strong>Mitokondria:</strong> Tempat respirasi seluler, menghasilkan ATP. <strong>RE Kasar:</strong> Sintesis protein (dengan ribosom). <strong>RE Halus:</strong> Sintesis lipid. <strong>Aparatus Golgi:</strong> Modifikasi, sortir, dan pengemasan protein. <strong>Lisosom:</strong> Pencernaan intraseluler. <strong>Ribosom:</strong> Sintesis protein.</p>',
        '<h3>Transpor Membran</h3><p><strong>Difusi:</strong> Pergerakan molekul dari konsentrasi tinggi ke rendah (pasif). <strong>Osmosis:</strong> Difusi air melalui membran semipermeabel. <strong>Transpor Aktif:</strong> Melawan gradien konsentrasi, memerlukan ATP. <strong>Endositosis:</strong> Memasukkan molekul besar. <strong>Eksositosis:</strong> Mengeluarkan molekul besar.</p>',
        '<h3>Pembelahan Sel</h3><p><strong>Mitosis:</strong> Profase → Metafase → Anafase → Telofase. 2 sel anak identik, 2n. <strong>Meiosis:</strong> Meiosis I (reduksi) → Meiosis II. 4 sel anak, n. Pematangan gamet pada gonad.</p>',
      ],
      en: [
        '<h3>Cell Theory</h3><p>The cell was first discovered by Robert Hooke (1665). Modern cell theory: (1) All living things consist of cells, (2) Cells are the structural and functional unit of life, (3) All cells come from pre-existing cells (omnis cellula e cellula).</p>',
        '<h3>Cell Organelles</h3><p><strong>Nucleus:</strong> Contains DNA, controls cell activities. <strong>Mitochondria:</strong> Site of cellular respiration, produces ATP. <strong>Rough ER:</strong> Protein synthesis (with ribosomes). <strong>Smooth ER:</strong> Lipid synthesis. <strong>Golgi Apparatus:</strong> Modifies, sorts, and packages proteins. <strong>Lysosome:</strong> Intracellular digestion. <strong>Ribosome:</strong> Protein synthesis.</p>',
        '<h3>Membrane Transport</h3><p><strong>Diffusion:</strong> Movement from high to low concentration (passive). <strong>Osmosis:</strong> Water diffusion through semipermeable membrane. <strong>Active Transport:</strong> Against concentration gradient, requires ATP. <strong>Endocytosis:</strong> Brings in large molecules. <strong>Exocytosis:</strong> Releases large molecules.</p>',
        '<h3>Cell Division</h3><p><strong>Mitosis:</strong> Prophase → Metaphase → Anaphase → Telophase. 2 identical daughter cells, 2n. <strong>Meiosis:</strong> Meiosis I (reduction) → Meiosis II. 4 daughter cells, n. Gamete maturation in gonads.</p>',
      ],
    },
    hotspotted: "sel",
    video: { id: "Struktur dan Fungsi Sel — IPA Biologi", en: "Cell Structure and Function — Biology" },
    videoId: "t8zUakMdYlc",
  },
  {
    id: "pencernaan",
    icon: "🍽️",
    color: "#00b894",
    subs: ["sub.pencernaan1", "sub.pencernaan2", "sub.pencernaan3", "sub.pencernaan4", "sub.pencernaan5"],
    summary: {
      id: [
        "Organ pencernaan atas terdiri dari mulut (gigi, lidah, kelenjar ludah) dan kerongkongan (esofagus). Saluran pencernaan memiliki 4 lapisan dinding: mukosa, submukosa, muskularis propria, dan serosa. Bolus didorong melalui gerak peristaltik terkoordinasi melintasi sfingter esofagus bawah.",
        "Lambung memproses makanan menjadi kimus melalui gerak rugae dan sekresi getah lambung (HCl, pepsin, renin, dan faktor intrinsik). Kelenjar aksesori hati mensekresikan empedu untuk emulsifikasi lipid, dan pankreas mensekresikan ion bikarbonat serta enzim tripsinogen, amilase, dan lipase.",
        "Usus halus (duodenum, jejunum, ileum) memiliki vili dan mikrovili seluas ~200 m². Sistem Saraf Enterik (ENS) dan hormon gastrin, sekretin, CCK meregulasi motilitas dan sekresi terhadap stimulus bolus. Kolon mereabsorpsi air dan mineral serta memelihara mikrobiota penghasil vitamin K.",
        "Tubuh memerlukan makronutrien (karbohidrat, protein, lipid) dan mikronutrien lengkap (vitamin A, D, E, K, B kompleks, C, serta makro dan mikromineral). Dua rute penyerapan: nutrien larut air menuju kapiler vena porta hepatika ke hati, sedangkan lipid dirakit menjadi kilomikron menuju pembuluh limfe lakteal.",
        "Analisis patofisiologi gangguan pencernaan: diare (refleks iritan kapsaisin TRPV1 dan terapi rehidrasi oralit SGLT1), apendisitis (obstruksi lumen oleh fekalit dan hiperplasia limfoid vs mitos mie instan), gastritis dan ulkus peptikum (infeksi Helicobacter pylori penghasil urease & efek NSAID), serta analisis kritis bedah bariatrik.",
      ],
      en: [
        "Upper digestive organs comprise the mouth (teeth, tongue, salivary glands) and esophagus. The alimentary canal features 4 concentric layers: mucosa, submucosa, muscularis, and serosa. The food bolus is propelled by coordinated peristalsis through the lower esophageal sphincter.",
        "The stomach churns food into chyme using rugae contractions and gastric secretions (HCl, pepsin, rennin, intrinsic factor). The liver secretes bile for lipid emulsification, and the pancreas produces bicarbonate and essential enzymes (trypsinogen, amylase, lipase).",
        "The small intestine spans ~200 m² via villi and microvilli. The Enteric Nervous System (ENS) alongside gastrin, secretin, and CCK coordinates motility and secretions. The colon reabsorbs water and electrolytes, harboring symbiotic microflora synthesizing vitamin K.",
        "The body requires macronutrients (carbohydrates, proteins, lipids) and complete micronutrients (vitamins A, D, E, K, B complex, C, alongside macro and trace minerals). Two absorption routes: water-soluble nutrients enter portal capillaries to the liver, and lipids enter lymphatic lacteals as chylomicrons.",
        "Pathophysiological analysis of digestive disorders: diarrhea (capsaicin TRPV1 irritation and ORS SGLT1 rehydration), appendicitis (fecalith obstruction vs noodle myth), gastritis & peptic ulcers (urease-producing Helicobacter pylori & NSAIDs), and bariatric surgery critical evaluation.",
      ],
    },
    full: {
      id: [
        '<h3>Organ Pencernaan Atas & Struktur Dinding Saluran Cerna</h3><p><strong>Rongga Mulut:</strong> Terjadi pencernaan mekanis oleh gigi (insisivus, kaninus, premolar, molar) dan pencernaan kimiawi oleh enzim amilase ptialin dari tiga pasang kelenjar ludah (parotis, submaksilaris, sublingualis).<br/><strong>Esofagus & Epiglotis:</strong> Katup kartilago epiglotis secara refleks menutup saluran trakea saat menelan makanan (deglutisi). Makanan berbentuk bolus didorong aktif oleh gelombang kontraksi ritmis otot sirkuler dan longitudinal (gerak peristaltik) melewati Lower Esophageal Sphincter (LES) ke lambung.<br/><strong>4 Lapisan Dinding:</strong> (1) <em>Mukosa</em> (epitel, lamina propria, muskularis mukosa), (2) <em>Submukosa</em> (kaya pembuluh darah, limfe, dan pleksus saraf Meissner), (3) <em>Muskularis Propria</em> (otot sirkuler dalam dan longitudinal luar dengan pleksus saraf Auerbach), dan (4) <em>Serosa / Adventisia</em> (jaringan ikat pelapis luar berpelumas serosa).</p>',
        '<h3>Fisiologi Lambung & Kelenjar Aksesori Pencernaan</h3><p><strong>Lambung (Ventrikulus):</strong> Terdiri atas kardiak, fundus, korpus, dan pilorus. Sel parietal mensekresi Asam Lambung (HCl pH 1-2) untuk membunuh mikroba patogen dan mendenaturasi protein, serta <em>Intrinsic Factor</em> untuk absorpsi vitamin B12. Sel chief mensekresi pepsinogen yang diaktifkan oleh HCl menjadi pepsin aktif. Sel goblet menghasilkan lapisan lendir mukus alkali pelindung dinding dari autodigesti.<br/><strong>Hati & Kantung Empedu:</strong> Hati memproduksi cairan empedu yang mengandung garam empedu (kolat dan kenodeoksikolat) yang disimpan dan dipekatkan di kantung empedu. Garam empedu mengemulsikan droplet lipid besar menjadi misel mikroskopis.<br/><strong>Pankreas Eksokrin:</strong> Mensekresi ion bikarbonat (NaHCO₃) penetral asam kimus serta enzim hidrolitik kuat: amilase pankreas, lipase pankreas, dan zimogen protease (tripsinogen diaktifkan enterokinase usus menjadi tripsin, kimotripsinogen, karboksipeptidase).</p>',
        '<h3>Usus Halus, Usus Besar, & Koordinasi Neuro-Endokrin</h3><p><strong>Usus Halus:</strong> Duodenum (25 cm) sebagai arena pencernaan kimiawi bermuaranya empedu dan pankreas via papilla Vateri; Jejunum (2,5 m) tempat hidrolisis lanjutan; Ileum (3,6 m) penyerapan nutrisi akhir. Luas penyerapan berlipat ganda hingga ~200 m² berkat plicae circulares, jutaan vili, dan ~3.000 mikrovili ber-<em>brush border enzymes</em> (maltase, sukrase, laktase, peptidase).<br/><strong>Sistem Saraf Enterik (ENS) & Koordinasi Saraf-Hormon:</strong> Dinding usus memiliki lebih dari 500 juta neuron yang mengontrol motilitas dan sekresi secara otomatis terhadap stimulus mekanik (peregang dinding) dan kimiawi (asam/lemak). Hormon gastrin, sekretin, dan kolesistokinin (CCK) meregulasi pengosongan lambung dan sekresi empedu/enzim.<br/><strong>Kolon & Mikrobiota:</strong> Usus besar (sekum, kolon asenden, transversum, desenden, sigmoid, rektum) mereabsorpsi 90% sisa air dan elektrolit. Triliunan mikrobiota simbiotik memfermentasi serat menjadi SCFA dan memproduksi vitamin K serta biotin sebelum defekasi.</p>',
        '<h3>Nutrisi Makanan & Rute Penyerapan Lengkap</h3><p><strong>Makronutrien:</strong> Karbohidrat (glukosa, fruktosa, amilum, glikogen, serat selulosa), Protein (9 asam amino esensial dan 11 non-esensial untuk struktur jaringan, enzim, dan imunoglobulin), serta Lipid/Lemak (trigliserida, asam lemak jenuh dan tak jenuh Omega-3/6, kolesterol).<br/><strong>Mikronutrien Lengkap:</strong><br/>• <em>Vitamin Larut Lemak (A, D, E, K):</em> Vit A (rodopsin penglihatan redup; defisiensi: hemeralopi/rabun senja), Vit D (stimulasi calbindin absorpsi Ca; defisiensi: rakitis/osteomalasia), Vit E (antioksidan pemutus rantai peroksidasi lipid eritrosit), Vit K (karboksilasi faktor pembekuan II, VII, IX, X oleh mikrobiota usus).<br/>• <em>Vitamin Larut Air (B Kompleks & C):</em> Vit B1 (tiamin, defisiensi: beri-beri), B2 (riboflavin, FAD), B3 (niasin, pelagra), B6 (piridoksin, transaminasi), B9 (asam folat, spina bifida), B12 (faktor intrinsik ileum, anemia pernisiosa), dan Vit C (hidroksilasi kolagen & antioksidan; defisiensi: skorbut gusi berdarah).<br/>• <em>Mineral Makro & Mikro:</em> Kalsium & Fosfor (matriks hidroksiapatit tulang, aktin-miosin), Magnesium (kofaktor transfer ATP), Natrium & Kalium (pompa Na⁺/K⁺ potensial aksi), Klorida (HCl lambung), Besi/Fe (inti heme hemoglobin), Iodium/I (hormon tiroid T3/T4), Seng/Zn (polimerase DNA & imunitas), serta Fluor/F (fluoroapatit email gigi).<br/><strong>Dua Jalur Logistik Absorpsi:</strong> Nutrien larut air masuk kapiler vena porta hepatika langsung menuju hati. Nutrien larut lemak dibungkus menjadi lipoprotein Kilomikron menuju kapiler limfe Lakteal lalu dialirkan via duktus torasikus langsung ke vena subklavia tanpa melewati hati terlebih dahulu.</p>',
        '<h3>Analisis Gangguan Patofisiologis Sistem Pencernaan</h3><p><strong>Diare & Mekanisme Kapsaisin:</strong> Senyawa kapsaisin cabai mengaktivasi reseptor TRPV1 nosiseptif usus, memicu sekresi histamin/serotonin dan hiper-peristaltik ekspulsi untuk membilas iritan. Terapi cairan Oralit memanfaatkan kotransporter Na⁺-glukosa (SGLT1) enterosit yang tetap utuh untuk menarik molekul air kembali ke darah secara osmotik.<br/><strong>Apendisitis (Fakta vs Mitos):</strong> Mitos mie instan dan biji jambu telah dibantah secara medis; apendisitis dipicu obstruksi mekanis lumen apendiks oleh fekalit (tinja membatu), hiperplasia folikel limfoid submukosa, atau sumbatan parasit cacing, yang memicu iskemia dan risiko perforasi peritonitis.<br/><strong>Gastritis & Tukak Lambung:</strong> Infeksi bakteri <em>Helicobacter pylori</em> mensekresikan enzim urease yang memecah urea menjadi amonia alkali perusak mukosa. Penggunaan obat NSAID (aspirin/ibuprofen) berlebih menghambat enzim COX-1 dan sintesis prostaglandin pelindung dinding lambung.<br/><strong>Analisis Kritis Bedah Bariatrik:</strong> Sleeve gastrectomy memotong ~75% kapasitas lambung dan mengangkat fundus untuk melenyapkan sel penghasil hormon lapar Ghrelin. Pasien wajib mendapatkan suplementasi vitamin B12 seumur hidup karena hilangnya sel parietal penghasil faktor intrinsik serta suplemen zat besi dan kalsium.</p>',
      ],
      en: [
        '<h3>Upper Digestive Organs & Gut Wall Microanatomy</h3><p><strong>Oral Cavity:</strong> Mechanical mastication by teeth and enzymatic digestion by salivary ptyalin (amylase).<br/><strong>Esophagus & Epiglottis:</strong> The epiglottis cartilaginous valve reflexively seals the trachea during swallowing. Coordinated peristaltic waves propel the bolus across the lower esophageal sphincter (LES) into the stomach.<br/><strong>4 Concentric Wall Layers:</strong> Mucosa, Submucosa (Meissner plexus), Muscularis Propria (Auerbach plexus), and Serosa.</p>',
        '<h3>Gastric Physiology & Accessory Organs</h3><p><strong>Stomach:</strong> Parietal cells release HCl (pH 1-2) and Intrinsic Factor (B12 uptake). Chief cells release pepsinogen. Goblet cells secrete a mucus-bicarbonate cytoprotective barrier.<br/><strong>Liver & Gallbladder:</strong> Bile salts emulsify dietary fats into micro-micelles.<br/><strong>Exocrine Pancreas:</strong> Bicarbonate neutralizes gastric chyme, alongside amylase, lipase, and trypsinogen.</p>',
        '<h3>Intestinal Absorption, Colon, & Neuro-Endocrine Control</h3><p><strong>Small Intestine:</strong> Duodenum, jejunum, and ileum feature plicae, villi, and microvilli amplifying area to ~200 m² with brush border enzymes.<br/><strong>Enteric Nervous System (ENS) & Hormones:</strong> Coordinates motility and secretions in response to chyme distension via gastrin, secretin, and CCK.<br/><strong>Colon & Microbiome:</strong> Reabsorbs fluids and minerals, housing microflora that synthesize vitamin K and biotin.</p>',
        '<h3>Food Nutrition & Complete Absorption Routes</h3><p><strong>Macronutrients:</strong> Carbohydrates, Proteins (9 essential & 11 non-essential amino acids), and Lipids (triglycerides, essential unsaturated fatty acids).<br/><strong>Complete Micronutrients:</strong><br/>• <em>Fat-Soluble (A, D, E, K):</em> Vit A (rhodopsin; deficiency: nyctalopia), Vit D (calbindin Ca absorption; rickets), Vit E (antioxidant protecting RBC membranes), Vit K (hepatic carboxylation of factors II, VII, IX, X by colonic microflora).<br/>• <em>Water-Soluble (B Complex & C):</em> B1 (thiamine, beriberi), B2 (riboflavin, FAD), B3 (niacin, pellagra), B6 (pyridoxine), B9 (folate, neural tube defects), B12 (intrinsic factor ileal absorption, pernicious anemia), and Vit C (collagen synthesis & iron uptake; scurvy).<br/>• <em>Minerals:</em> Calcium, Phosphorus, Magnesium, Sodium, Potassium, Chloride, Iron (heme hemoglobin), Iodine (thyroid T3/T4), Zinc (polymerase cofactor), and Fluoride (fluoroapatite enamel).<br/><strong>Dual Absorption Routes:</strong> Water-soluble nutrients enter the hepatic portal vein to the liver. Fat-soluble nutrients packaged as chylomicrons enter central lacteals via the thoracic duct directly into systemic circulation.</p>',
        '<h3>Pathophysiological Disorders of the Digestive System</h3><p><strong>Diarrhea & Capsaicin Mechanisms:</strong> Capsaicin activates TRPV1 gut sensors triggering hyper-motility and fluid secretion. Oral Rehydration Salts (ORS) utilize the intact SGLT1 Na⁺-glucose symporter to osmotically pull water back into blood vessels.<br/><strong>Appendicitis (Facts vs Myths):</strong> Instant noodles and fruit seeds are debunked urban legends; appendicitis is triggered by fecalith luminal impaction, lymphoid hyperplasia, or parasites, risking perforation.<br/><strong>Gastritis & Peptic Ulcers:</strong> <em>Helicobacter pylori</em> secretes urease generating cytopathic ammonia; chronic NSAIDs inhibit COX-1 and cytoprotective prostaglandins.<br/><strong>Bariatric Surgery Repercussions:</strong> Fundus resection eliminates the hunger hormone ghrelin. Patients require lifelong vitamin B12 supplementation due to parietal cell intrinsic factor loss alongside iron and calcium monitoring.</p>',
      ],
    },
    hotspotted: "pencernaan",
    video: { id: "Sistem Pencernaan Manusia: Anatomi, Enzim, dan Homeostasis", en: "Human Digestive System: Anatomy, Enzymes, and Homeostasis" },
    videoId: "iDf0BpBVh5c",
  },
  {
    id: "ekosistem",
    icon: "🌿",
    color: "#00cec9",
    subs: ["sub.ekosistem1", "sub.ekosistem2", "sub.ekosistem3", "sub.ekosistem4"],
    summary: {
      id: [
        "Ekosistem adalah interaksi antara komponen biotik (makhluk hidup) dan abiotik (lingkungan fisik).",
        "Aliran energi dalam ekosistem: produsen → konsumen primer → konsumen sekunder → konsumen tersier → dekomposer.",
        "Siklus biogeokimia: siklus karbon, nitrogen, fosfor, dan air. Setiap elemen bersirkulasi melalui komponen biotik dan abiotik.",
        "Keanekaragaman hayati (biodiversitas) mencakup keanekaragaman gen, spesies, dan ekosistem.",
      ],
      en: [
        "An ecosystem is the interaction between biotic (living) and abiotic (physical environment) components.",
        "Energy flow: producers → primary consumers → secondary consumers → tertiary consumers → decomposers.",
        "Biogeochemical cycles: carbon, nitrogen, phosphorus, and water cycles. Each element circulates through biotic and abiotic components.",
        "Biodiversity includes genetic, species, and ecosystem diversity.",
      ],
    },
    full: {
      id: [
        '<h3>Komponen Ekosistem</h3><p><strong>Biotik:</strong> Produsen (tumbuhan), konsumen (herbivora, karnivora, omnivora), dekomposer (bakteri, jamur). <strong>Abiotik:</strong> Cahaya, suhu, air, tanah, udara, pH. Interaksi antar komponen membentuk jaring-jaring makanan yang kompleks.</p>',
        '<h3>Aliran Energi</h3><p>Energi masuk melalui fotosintesis (produsen). Hanya 10% energi yang berpindah ke tingkat trofik berikutnya (Hukum 10% Lindeman). Rantai makanan: linear. Jaring makanan: kompleks (banyak rantai saling terhubung). Piramida ekologi: piramida energi, biomassa, dan jumlah.</p>',
        '<h3>Siklus Biogeokimia</h3><p><strong>Siklus Karbon:</strong> Fotosintesis → respirasi → dekomposisi → pembakaran. <strong>Siklus Nitrogen:</strong> Fiksasi N₂ → nitrifikasi → asimilasi → amonifikasi → denitrifikasi. <strong>Siklus Air:</strong> Evaporasi → kondensasi → presipitasi → run off.</p>',
        '<h3>Keanekaragaman Hayati</h3><p>Biodiversitas penting untuk keseimbangan ekosistem. Ancaman: deforestasi, polusi, perubahan iklim, spesies invasif. Upaya konservasi: in situ (taman nasional) dan ex situ (kebun binatang, bank benih).</p>',
      ],
      en: [
        '<h3>Ecosystem Components</h3><p><strong>Biotic:</strong> Producers (plants), consumers (herbivores, carnivores, omnivores), decomposers (bacteria, fungi). <strong>Abiotic:</strong> Light, temperature, water, soil, air, pH. Interactions form complex food webs.</p>',
        '<h3>Energy Flow</h3><p>Energy enters through photosynthesis (producers). Only 10% transfers to the next trophic level (Lindeman\'s 10% Law). Food chain: linear. Food web: complex (many interconnected chains). Ecological pyramids: energy, biomass, and number pyramids.</p>',
        '<h3>Biogeochemical Cycles</h3><p><strong>Carbon Cycle:</strong> Photosynthesis → respiration → decomposition → combustion. <strong>Nitrogen Cycle:</strong> N₂ fixation → nitrification → assimilation → ammonification → denitrification. <strong>Water Cycle:</strong> Evaporation → condensation → precipitation → runoff.</p>',
        '<h3>Biodiversity</h3><p>Biodiversity is essential for ecosystem balance. Threats: deforestation, pollution, climate change, invasive species. Conservation: in situ (national parks) and ex situ (zoos, seed banks).</p>',
      ],
    },
    hotspotted: "ekosistem",
    video: { id: "Ekologi & Ekosistem", en: "Ecology & Ecosystems" },
    videoId: "O4fYikSF3do",
  },
  {
    id: "genetika",
    icon: "🧬",
    color: "#e17055",
    subs: ["sub.genetika1", "sub.genetika2", "sub.genetika3", "sub.genetika4"],
    summary: {
      id: [
        "DNA adalah molekul yang membawa informasi genetik. Struktur DNA: double helix (Watson & Crick, 1953).",
        "Sintesis protein: transkripsi (DNA → mRNA) di nukleus, kemudian translasi (mRNA → protein) di ribosom.",
        "Hukum Mendel I (segregasi) dan II (assortasi bebas). Persilangan monohibrid dan dihibrid.",
        "Mutasi adalah perubahan pada urutan DNA. Dapat disebabkan oleh faktor fisik, kimia, atau biologis.",
      ],
      en: [
        "DNA carries genetic information. DNA structure: double helix (Watson & Crick, 1953).",
        "Protein synthesis: transcription (DNA → mRNA) in the nucleus, then translation (mRNA → protein) at ribosomes.",
        "Mendel's Law I (segregation) and II (independent assortment). Monohybrid and dihybrid crosses.",
        "Mutations are changes in DNA sequence. Caused by physical, chemical, or biological factors.",
      ],
    },
    full: {
      id: [
        '<h3>Struktur DNA & RNA</h3><p><strong>DNA:</strong> Double helix, gula deoksiribosa, basa: A-T, G-C. <strong>RNA:</strong> Single strand, gula ribosa, basa: A-U, G-C. Tiga jenis RNA: mRNA (pembawa kode), tRNA (pengangkut asam amino), rRNA (komponen ribosom).</p>',
        '<h3>Sintesis Protein</h3><p>Dua tahap: <strong>Transkripsi:</strong> DNA dibuka, RNA polimerase membentuk mRNA. <strong>Translasi:</strong> mRNA dibaca oleh ribosom dalam kodon (3 basa). tRNA membawa asam amino sesuai kodon. Hasil: rantai polipeptida (protein).</p>',
        '<h3>Genetika Mendel</h3><p><strong>Hukum Segregasi:</strong> Alel berpisah saat pembentukan gamet. <strong>Hukum Assortasi Bebas:</strong> Gen-gen berbeda bersegregasi secara independen. Rasio fenotip F2 monohibrid: 3:1. Dihibrid: 9:3:3:1. Penyimpangan semu: epistasis, kriptomeri, polimeri.</p>',
        '<h3>Mutasi</h3><p><strong>Mutasi Gen:</strong> Substitusi, insersi, delesi (dapat menyebabkan penyakit genetik). <strong>Mutasi Kromosom:</strong> Delesi, duplikasi, inversi, translokasi. Mutagen: radiasi (fisik), senyawa kimia (kimia), virus (biologis).</p>',
      ],
      en: [
        '<h3>DNA & RNA Structure</h3><p><strong>DNA:</strong> Double helix, deoxyribose sugar, bases: A-T, G-C. <strong>RNA:</strong> Single strand, ribose sugar, bases: A-U, G-C. Three RNA types: mRNA (carries code), tRNA (transports amino acids), rRNA (ribosome component).</p>',
        '<h3>Protein Synthesis</h3><p>Two stages: <strong>Transcription:</strong> DNA unwinds, RNA polymerase forms mRNA. <strong>Translation:</strong> mRNA read by ribosomes in codons (3 bases). tRNA brings matching amino acids. Result: polypeptide chain (protein).</p>',
        '<h3>Mendelian Genetics</h3><p><strong>Law of Segregation:</strong> Alleles separate during gamete formation. <strong>Law of Independent Assortment:</strong> Different genes segregate independently. F2 monohybrid ratio: 3:1. Dihybrid: 9:3:3:1. Modifications: epistasis, cryptomery, polymerism.</p>',
        '<h3>Mutations</h3><p><strong>Gene Mutations:</strong> Substitution, insertion, deletion (can cause genetic diseases). <strong>Chromosomal Mutations:</strong> Deletion, duplication, inversion, translocation. Mutagens: radiation (physical), chemicals (chemical), viruses (biological).</p>',
      ],
    },
    hotspotted: "genetika",
    video: { id: "Genetika Dasar — DNA & RNA", en: "Basic Genetics — DNA & RNA" },
    videoId: "8m6hHRwK01I",
  },
  {
    id: "evolusi",
    icon: "🦕",
    color: "#6ab04c",
    subs: ["sub.evolusi1", "sub.evolusi2", "sub.evolusi3", "sub.evolusi4"],
    summary: {
      id: [
        "Teori evolusi menjelaskan perubahan makhluk hidup dari waktu ke waktu melalui seleksi alam (Darwin).",
        "Seleksi alam: individu dengan sifat yang menguntungkan lebih mampu bertahan dan bereproduksi.",
        "Spesiasi adalah pembentukan spesies baru karena isolasi geografis atau reproduktif.",
        "Bukti evolusi: fosil, anatomi perbandingan, embriologi perbandingan, bukti molekuler (DNA).",
      ],
      en: [
        "Evolution theory explains how living things change over time through natural selection (Darwin).",
        "Natural selection: individuals with advantageous traits survive and reproduce better.",
        "Speciation is the formation of new species due to geographic or reproductive isolation.",
        "Evidence of evolution: fossils, comparative anatomy, comparative embryology, molecular evidence (DNA).",
      ],
    },
    full: {
      id: [
        '<h3>Teori Evolusi</h3><p><strong>Lamarck:</strong> Organ yang sering digunakan berkembang (use & disuse). Sifat yang diperoleh diwariskan. <strong>Darwin:</strong> Seleksi alam — variasi genetik → kompetisi → survival of the fittest → reproduksi diferensial. <strong>Sintesis Modern:</strong> Evolusi = perubahan frekuensi alel dalam populasi.</p>',
        '<h3>Seleksi Alam</h3><p>Mekanisme evolusi utama. Tiga syarat: (1) Variasi dalam populasi, (2) Variasi diwariskan, (3) Reproduksi berlebih sehingga terjadi kompetisi. Contoh: Biston betularia (ngengat lada) di Inggris — perubahan warna akibat Revolusi Industri.</p>',
        '<h3>Spesiasi</h3><p><strong>Spesiasi Allopatrik:</strong> Isolasi geografis (gunung, sungai, laut). <strong>Spesiasi Simpatrik:</strong> Isolasi reproduktif dalam satu daerah. <strong>Isolasi Reproduktif:</strong> Mekanis (ukuran), temporal (musim kawin), perilaku (tarian kawin).</p>',
        '<h3>Bukti Evolusi</h3><p><strong>Fosil:</strong> Urutan kronologis di lapisan batuan. <strong>Anatomi:</strong> Homologi (struktur sama, fungsi beda) vs Analogi (struktur beda, fungsi sama). <strong>Embriologi:</strong> Embrio vertebrata mirip di awal perkembangan. <strong>Molekuler:</strong> Perbandingan urutan DNA/Protein.</p>',
      ],
      en: [
        '<h3>Evolution Theory</h3><p><strong>Lamarck:</strong> Use & disuse — organs used more develop further. Acquired traits inherited. <strong>Darwin:</strong> Natural selection — genetic variation → competition → survival of the fittest → differential reproduction. <strong>Modern Synthesis:</strong> Evolution = change in allele frequency in populations.</p>',
        '<h3>Natural Selection</h3><p>Primary mechanism of evolution. Three conditions: (1) Variation in population, (2) Variation is heritable, (3) Over-reproduction leads to competition. Example: Biston betularia (peppered moth) in England — color change due to Industrial Revolution.</p>',
        '<h3>Speciation</h3><p><strong>Allopatric Speciation:</strong> Geographic isolation (mountains, rivers, seas). <strong>Sympatric Speciation:</strong> Reproductive isolation within same area. <strong>Reproductive Isolation:</strong> Mechanical (size), temporal (mating season), behavioral (courtship dance).</p>',
        '<h3>Evidence of Evolution</h3><p><strong>Fossils:</strong> Chronological order in rock layers. <strong>Anatomy:</strong> Homology (same structure, different function) vs Analogy (different structure, same function). <strong>Embryology:</strong> Vertebrate embryos similar in early development. <strong>Molecular:</strong> DNA/Protein sequence comparison.</p>',
      ],
    },
    hotspotted: "evolusi",
    video: { id: "Evolusi & Seleksi Alam", en: "Evolution & Natural Selection" },
    videoId: "DU9o1b3jKYQ",
  },
  {
    id: "sirkulasi",
    icon: "🫀",
    color: "#e17055",
    subs: ["sub.sirkulasi1", "sub.sirkulasi2", "sub.sirkulasi3", "sub.sirkulasi4"],
    summary: {
      id: [
        "Sistem sirkulasi mengangkut oksigen, nutrisi, hormon, dan sisa metabolisme ke seluruh tubuh.",
        "Jantung terdiri dari 4 ruang: atrium kanan/kiri, ventrikel kanan/kiri. Pembuluh darah: arteri, vena, kapiler.",
        "Peredaran darah: peredaran pulmonal (jantung → paru-paru) dan sistemik (jantung → seluruh tubuh).",
        "Komponen darah: eritrosit, leukosit, trombosit, plasma. Gangguan: anemia, hipertensi, serangan jantung.",
      ],
      en: [
        "The circulatory system transports oxygen, nutrients, hormones, and waste products throughout the body.",
        "The heart has 4 chambers: right/left atrium, right/left ventricle. Blood vessels: arteries, veins, capillaries.",
        "Blood circulation: pulmonary (heart → lungs) and systemic (heart → body).",
        "Blood components: erythrocytes, leukocytes, thrombocytes, plasma. Disorders: anemia, hypertension, heart attack.",
      ],
    },
    full: {
      id: [
        '<h3>Jantung & Pembuluh Darah</h3><p><strong>Jantung:</strong> 4 ruang. Atrium kanan terima darah CO₂ dari tubuh, ventrikel kanan pompa ke paru-paru. Atrium kiri terima darah O₂ dari paru-paru, ventrikel kiri pompa ke tubuh. Katup mencegah aliran balik. <strong>Arteri:</strong> Bawa darah dari jantung (O₂). <strong>Vena:</strong> Bawa darah ke jantung (CO₂). <strong>Kapiler:</strong> Tempat pertukaran zat.</p>',
        '<h3>Komponen Darah</h3><p><strong>Eritrosit (sel darah merah):</strong> Mengandung hemoglobin, mengangkut O₂/CO₂. <strong>Leukosit (sel darah putih):</strong> Sistem imun — fagositosis, antibodi. <strong>Trombosit (keping darah):</strong> Pembekuan darah. <strong>Plasma darah:</strong> 90% air, mengandung nutrisi, hormon, protein, antibodi.</p>',
        '<h3>Peredaran Darah</h3><p><strong>Peredaran Pulmonal (kecil):</strong> Ventrikel kanan → arteri pulmonalis → paru-paru → vena pulmonalis → atrium kiri. <strong>Peredaran Sistemik (besar):</strong> Ventrikel kiri → aorta → seluruh tubuh → vena cava → atrium kanan. Nadi: denyut arteri, tekanan darah: sistol/diastol.</p>',
        '<h3>Gangguan Sirkulasi</h3><p><strong>Anemia:</strong> Kurang Hb/eritrosit. <strong>Hipertensi:</strong> Tekanan darah tinggi (>140/90). <strong>Aterosklerosis:</strong> Pengerasan pembuluh darah oleh plak. <strong>Serangan jantung:</strong> Penyumbatan arteri koroner. <strong>Stroke:</strong> Gangguan aliran darah ke otak.</p>',
      ],
      en: [
        '<h3>Heart & Blood Vessels</h3><p><strong>Heart:</strong> 4 chambers. Right atrium receives CO₂ blood from body, right ventricle pumps to lungs. Left atrium receives O₂ blood from lungs, left ventricle pumps to body. Valves prevent backflow. <strong>Arteries:</strong> Carry blood away from heart (O₂). <strong>Veins:</strong> Carry blood to heart (CO₂). <strong>Capillaries:</strong> Site of exchange.</p>',
        '<h3>Blood Components</h3><p><strong>Erythrocytes (red blood cells):</strong> Contain hemoglobin, transport O₂/CO₂. <strong>Leukocytes (white blood cells):</strong> Immune system — phagocytosis, antibodies. <strong>Thrombocytes (platelets):</strong> Blood clotting. <strong>Blood Plasma:</strong> 90% water, nutrients, hormones, proteins, antibodies.</p>',
        '<h3>Blood Circulation</h3><p><strong>Pulmonary Circulation:</strong> Right ventricle → pulmonary artery → lungs → pulmonary vein → left atrium. <strong>Systemic Circulation:</strong> Left ventricle → aorta → body → vena cava → right atrium. Pulse: artery beat, blood pressure: systole/diastole.</p>',
        '<h3>Circulatory Disorders</h3><p><strong>Anemia:</strong> Low Hb/erythrocytes. <strong>Hypertension:</strong> High blood pressure (>140/90). <strong>Atherosclerosis:</strong> Hardening of arteries by plaque. <strong>Heart attack:</strong> Coronary artery blockage. <strong>Stroke:</strong> Disrupted blood flow to brain.</p>',
      ],
    },
    hotspotted: "sirkulasi",
    video: { id: "Sistem Peredaran Darah Manusia", en: "Human Circulatory System" },
    videoId: "OKAO0H5e3LI",
  },
  {
    id: "syaraf",
    icon: "🧠",
    color: "#a29bfe",
    subs: ["sub.syaraf1", "sub.syaraf2", "sub.syaraf3", "sub.syaraf4"],
    summary: {
      id: [
        "Sistem saraf mengatur dan mengkoordinasikan aktivitas tubuh melalui impuls listrik.",
        "Neuron terdiri dari badan sel, dendrit (menerima impuls), dan akson (mengirim impuls). Sinaps adalah celah antar neuron.",
        "Sistem saraf pusat: otak (serebrum, serebelum, batang otak) dan sumsum tulang belakang.",
        "Sistem saraf tepi: saraf somatik (sadar) dan otonom (tak sadar — simpatis & parasimpatis). Organ indra: mata, telinga, hidung, lidah, kulit.",
      ],
      en: [
        "The nervous system regulates and coordinates body activities through electrical impulses.",
        "Neurons consist of cell body, dendrites (receive impulses), and axon (send impulses). Synapse is the gap between neurons.",
        "Central nervous system: brain (cerebrum, cerebellum, brainstem) and spinal cord.",
        "Peripheral nervous system: somatic (voluntary) and autonomic (involuntary — sympathetic & parasympathetic). Sensory organs: eyes, ears, nose, tongue, skin.",
      ],
    },
    full: {
      id: [
        '<h3>Struktur Neuron</h3><p><strong>Dendrit:</strong> Menerima impuls dari neuron lain. <strong>Badan Sel:</strong> Mengandung nukleus, pusat metabolisme. <strong>Akson:</strong> Mengirim impuls ke neuron/efektor lain. <strong>Selubung Mielin:</strong> Isolator, mempercepat hantaran impuls. <strong>Sinaps:</strong> Celah antar neuron, transmisi melalui neurotransmitter (asetilkolin, dopamin, serotonin).</p>',
        '<h3>Sistem Saraf Pusat</h3><p><strong>Otak:</strong> <em>Serebrum</em> (fungsi luhur: berpikir, bicara, memori). <em>Serebelum</em> (keseimbangan, koordinasi gerak). <em>Batang otak</em> (medula oblongata — pernapasan, denyut jantung). <strong>Sumsum Tulang Belakang:</strong> Menghantarkan impuls antara otak dan tubuh, pusat refleks.</p>',
        '<h3>Sistem Saraf Tepi</h3><p><strong>Somatik:</strong> 12 pasang saraf kranial, 31 pasang saraf spinal. Mengontrol gerakan sadar. <strong>Otonom:</strong> <em>Simpatis:</em> Fight or flight (denyut ↑, pupil ↑). <em>Parasimpatis:</em> Rest & digest (denyut ↓, pencernaan ↑).</p>',
        '<h3>Organ Indra</h3><p><strong>Mata:</strong> Kornea → pupil → lensa → retina → saraf optik. <strong>Telinga:</strong> Telinga luar, tengah (tulang pendengaran), dalam (koklea). <strong>Hidung:</strong> Reseptor olfaktori. <strong>Lidah:</strong> Pengecap — manis, asin, asam, pahit, umami. <strong>Kulit:</strong> Reseptor raba, panas, dingin, tekanan, nyeri.</p>',
      ],
      en: [
        '<h3>Neuron Structure</h3><p><strong>Dendrites:</strong> Receive impulses from other neurons. <strong>Cell Body:</strong> Contains nucleus, metabolic center. <strong>Axon:</strong> Sends impulses to other neurons/effectors. <strong>Myelin Sheath:</strong> Insulator, speeds up impulse. <strong>Synapse:</strong> Gap between neurons, transmission via neurotransmitters (acetylcholine, dopamine, serotonin).</p>',
        '<h3>Central Nervous System</h3><p><strong>Brain:</strong> <em>Cerebrum</em> (higher functions: thinking, speech, memory). <em>Cerebellum</em> (balance, coordination). <em>Brainstem</em> (medulla oblongata — breathing, heart rate). <strong>Spinal Cord:</strong> Conducts impulses between brain and body, reflex center.</p>',
        '<h3>Peripheral Nervous System</h3><p><strong>Somatic:</strong> 12 cranial nerves, 31 spinal nerves. Controls voluntary movements. <strong>Autonomic:</strong> <em>Sympathetic:</em> Fight or flight (heart rate ↑, pupils ↑). <em>Parasympathetic:</em> Rest & digest (heart rate ↓, digestion ↑).</p>',
        '<h3>Sensory Organs</h3><p><strong>Eye:</strong> Cornea → pupil → lens → retina → optic nerve. <strong>Ear:</strong> Outer, middle (ossicles), inner (cochlea). <strong>Nose:</strong> Olfactory receptors. <strong>Tongue:</strong> Taste — sweet, salty, sour, bitter, umami. <strong>Skin:</strong> Touch, heat, cold, pressure, pain receptors.</p>',
      ],
    },
    hotspotted: "syaraf",
    video: { id: "Sistem Saraf Manusia", en: "Human Nervous System" },
    videoId: "qPix_X-9t7E",
  },
  {
    id: "virus",
    icon: "🧫",
    color: "#a29bfe",
    subs: ["sub.virus1", "sub.virus2", "sub.virus3", "sub.virus4", "sub.virus5", "sub.virus6"],
    summary: {
      id: [
        "Sejarah penemuan virus diawali dari penelitian penyakit bercak mosaik tembakau (1883) oleh Adolf Mayer, Ivanovsky, Beijerinck, hingga Stanley yang mengkristalkan TMV.",
        "Virus berukuran sangat renik (20–300 nm), aseluler (bukan sel), parasit intraseluler obligat, memiliki satu jenis asam nukleat (DNA atau RNA), dan kebal antibiotik.",
        "Struktur virion bakteriofag T terdiri atas kapsid polihedral (kapsomer), genom asam nukleat, selubung ekor, lempeng dasar dengan jarum penusuk, dan serabut ekor.",
        "Parasit intraseluler obligat yang menginfeksi inang spesifik (lock and key). Replikasi melalui siklus litik (sel lisis) atau siklus lisogenik (membentuk profag).",
        "Klasifikasi didasarkan pada asam nukleat (DNA/RNA), ukuran, morfologi simetri (heliks, ikosahedral, kompleks), dan sistem taksonomi ICTV (-viridae, -virus).",
        "Peranan menguntungkan: terapi gen (vektor Retrovirus), vaksin, dan bioinsektisida (Baculovirus). Merugikan: patogen pada manusia, hewan (rabies, PMK, tetelo), dan tumbuhan.",
      ],
      en: [
        "Virus discovery began with tobacco mosaic disease research (1883) by Mayer, Ivanovsky, Beijerinck, and Stanley crystallizing TMV.",
        "Viruses are submicroscopic (20–300 nm), acellular, obligate intracellular parasites, carrying one nucleic acid type (DNA or RNA), and resistant to antibiotics.",
        "A complete T-phage virion comprises an icosahedral capsid (capsomeres), nucleic acid genome, tail sheath, base plate with pins, and tail fibers.",
        "Obligate intracellular parasites engaging specific hosts (lock and key). Reproduction proceeds via lytic (host lysis) or lysogenic (prophage) cycles.",
        "Classified by nucleic acid (DNA/RNA), dimensions, symmetry morphology (helical, icosahedral, complex), and ICTV taxonomy (-viridae, -virus).",
        "Beneficial roles: gene therapy (Retroviruses), vaccines, and bioinsecticides (Baculovirus). Harmful roles: diseases in humans, animals (rabies, FMD, NCD), and crops.",
      ],
    },
    full: {
      id: [
        '<h3>Sejarah Virus</h3><p>Penelitian virus dimulai 1883 saat Adolf Mayer meneliti penyakit mosaik tembakau. Dmitri Ivanovsky (1892) membuktikan penyebabnya lolos saringan bakteri — lebih kecil dari bakteri. Martinus Beijerinck (1897) menemukan agen itu mampu berkembang biak di sel hidup dan menyebutnya <em>virus lolos saring</em>. Wendell Stanley (1935) berhasil mengkristalkan <em>tobacco mosaic virus</em> (TMV).</p>',
        '<h3>Ciri-Ciri Virus</h3><p>Berukuran 0,02–0,3 μm, terlihat dengan mikroskop elektron. Tubuh terdiri atas kapsid dan materi genetik tunggal (DNA atau RNA). Tidak bermembran dan organel sel. Hanya berreproduksi di sel/jaringan hidup — <em>parasit intraseluler obligat</em>. Dapat mengkristal seperti benda mati. Bentuk: batang, bola, mulut, peluru, huruf T. Antibiotik tidak berpengaruh; dinonaktifkan oleh sinar UV dan sinar X.</p>',
        '<h3>Struktur dan Fungsi Virus</h3><p>Partikel lengkap disebut <strong>virion</strong>. <strong>Kapsid:</strong> selubung protein dari subunit <em>kapsomer</em>; melindungi materi genetik dan membantu perlekatan ke sel inang. <strong>Asam nukleat:</strong> satu jenis saja — DNA atau RNA — sebagai genom/informasi genetik. <strong>Sampul membran:</strong> lipid, karbohidrat, atau glikoprotein (virus Sindbis); virus tanpa sampul = virus telanjang. <strong>Ekor:</strong> serabut ekor & lempeng dasar dengan jarum penusuk untuk menginjeksi DNA, seperti bakteriofag bentuk T.</p>',
        '<h3>Cara Hidup dan Reproduksi</h3><p>Virus mengenali sel inang dengan prinsip <em>lock and key</em> (kesesuaian reseptor). Penularan langsung (udara, air, darah, lendir) dan tidak langsung melalui vektor (nyamuk <em>Aedes aegypti</em> untuk Flavivirus).</p><p><strong>Siklus litik</strong> (virus virulen): adsorbsi → penetrasi → sintesis → pematangan → lisis; sel inang pecah dan mati.</p><p><strong>Siklus lisogenik:</strong> DNA virus menyatu dengan kromosom inang membentuk <em>profag</em>; diwariskan saat sel membelah tanpa membunuh sel. Virus yang dapat keduanya disebut <em>virus temperat</em> (fag λ).</p>',
        '<h3>Bentuk dan Klasifikasi</h3><p>Klasifikasi berdasar: jenis asam nukleat (DNA/RNA), ukuran, morfologi, jenis simetri, jumlah kapsomer, sampul, kerentanan kimia-fisika, enzim, sifat imunologis, sel inang, cara penularan, dan simtomatologi. Menurut ICTV: <strong>famili</strong> berakhiran -viridae (Poxviridae), <strong>genus</strong> berakhiran -virus (Orthopoxvirus), <strong>spesies</strong> dalam bahasa Inggris berakhiran -virus (Variola virus).</p>',
        '<h3>Peranan Virus</h3><p><strong>Menguntungkan:</strong> vektor terapi gen (Retrovirus), pembuatan vaksin, pengobatan biologis, bioinsektisida (Baculovirus sejak 1950).</p><p><strong>Merugikan:</strong> Penyakit manusia — gondongan (Paramyxovirus), herpes (HSV), cacar (Variola), cacar air (varisela), hepatitis, influenza, campak (Morbillivirus), AIDS (HIV), demam berdarah (Flavivirus/dengue), Ebola, flu burung (H5N1), SARS.</p><p><strong>Hewan:</strong> rabies (Rhabdovirus), PMK (Aphthovirus), tetelo (virus NCD).</p><p><strong>Tumbuhan:</strong> TYLC pada tomat, tungro pada padi (vektor wereng cokelat & hijau), mosaik pada tembakau-kacang tanah-papaya-cabai-tomat-kentang.</p>',
      ],
      en: [
        '<h3>History of Viruses</h3><p>Virus research began in 1883 when Adolf Mayer studied tobacco mosaic disease. Dmitri Ivanovsky (1892) proved the agent passed bacteria-retaining filters — smaller than bacteria. Martinus Beijerinck (1897) showed it could reproduce inside living cells, naming it a <em>filterable virus</em>. Wendell Stanley (1935) crystallized <em>tobacco mosaic virus</em> (TMV).</p>',
        '<h3>Virus Traits</h3><p>Virus particles are tiny, 0.02–0.3 μm, visible only by electron microscope. Body consists of a capsid plus a single genetic material (DNA or RNA). No membrane or organelles. They reproduce only inside living cells — obligate intracellular parasites — and can crystallize. Antibiotics fail against them; UV and X-rays inactivate them.</p>',
        '<h3>Virus Structure</h3><p>A complete particle is a <strong>virion</strong>. <strong>Capsid:</strong> protein shell made of <em>capsomeres</em>, protecting genetic material and aiding attachment. <strong>Nucleic acid:</strong> one kind only — DNA or RNA. <strong>Membrane envelope:</strong> lipids, carbohydrates, or glycoproteins; envelope-less viruses are naked. <strong>Tail:</strong> tail fibers and base plate with a needle that injects DNA (T-shaped bacteriophage).</p>',
        '<h3>Life Cycle & Reproduction</h3><p>Viruses recognize host cells via <em>lock and key</em> receptor matching. Direct transmission (air, water, blood, mucus) and indirect vectors (Aedes aegypti for Flavivirus).</p><p><strong>Lytic cycle</strong> (virulent): adsorption → penetration → synthesis → maturation → lysis; host cell bursts.</p><p><strong>Lysogenic cycle:</strong> viral DNA integrates as a <em>prophage</em>, inherited during cell division. Temperate phages (phage λ) switch between both.</p>',
        '<h3>Shape & Classification</h3><p>Basis: nucleic acid type (DNA/RNA), size, morphology, symmetry, capsomere count, envelope, chemical/physical susceptibility, enzymes, immunological traits, host type, transmission, symptomatology. ICTV: <strong>family</strong> ends in -viridae (Poxviridae), <strong>genus</strong> ends in -virus (Orthopoxvirus), <strong>species</strong> ends in -virus (Variola virus).</p>',
        '<h3>Roles</h3><p><strong>Beneficial:</strong> gene therapy vectors (Retrovirus), vaccine production, biological therapy, bioinsecticide (Baculovirus since 1950).</p><p><strong>Harmful:</strong> Human diseases — mumps (Paramyxovirus), herpes (HSV), smallpox (Variola), chickenpox, hepatitis, influenza, measles (Morbillivirus), AIDS (HIV), dengue (Flavivirus), Ebola, bird flu (H5N1), SARS.</p><p><strong>Animal:</strong> rabies (Rhabdovirus), foot-and-mouth (Aphthovirus), Newcastle (NCD virus).</p><p><strong>Plant:</strong> tomato yellow leaf curl (TYLC), rice tungro, and mosaic on tobacco, peanut, papaya, chili, tomato, potato.</p>',
      ],
    },
    hotspotted: "virus",
    video: { id: "Virus & Mikroorganisme", en: "Viruses & Microorganisms" },
    videoId: "",
  },
  {
    id: "bakteri",
    icon: "🦠",
    color: "#00b894",
    subs: ["sub.bakteri1", "sub.bakteri2", "sub.bakteri3", "sub.bakteri4"],
    summary: {
      id: [
        "Bakteri adalah prokariotik — tidak memiliki membran inti. Termasuk kingdom Monera. Uniseluler, ukuran 0,5-5 μm.",
        "Struktur: dinding sel (peptidoglikan), membran plasma, sitoplasma, ribosom, DNA sirkuler (nukleoid). Ada juga kapsul, flagel, pili, dan endospora.",
        "Reproduksi: aseksual (pembelahan biner — amitosis) dan seksual (konjugasi, transformasi, transduksi) untuk pertukaran materi genetik.",
        "Klasifikasi: Gram positif (dinding tebal, ungu) dan Gram negatif (dinding tipis, merah). Peran: dekomposer, fiksasi nitrogen, probiotik, patogen.",
      ],
      en: [
        "Bacteria are prokaryotic — lacking a membrane-bound nucleus. Kingdom Monera. Unicellular, 0.5-5 μm in size.",
        "Structure: cell wall (peptidoglycan), plasma membrane, cytoplasm, ribosomes, circular DNA (nucleoid). Also capsule, flagella, pili, and endospores.",
        "Reproduction: asexual (binary fission — amitosis) and sexual (conjugation, transformation, transduction) for genetic exchange.",
        "Classification: Gram-positive (thick wall, purple) and Gram-negative (thin wall, red). Roles: decomposer, nitrogen fixation, probiotics, pathogen.",
      ],
    },
    full: {
      id: [
        '<h3>Sel Prokariotik</h3><p>Bakteri termasuk prokariot — tidak memiliki membran inti (nukleus). DNA berada di daerah nukleoid berbentuk sirkuler. Tidak memiliki organel bermembran seperti mitokondria atau RE. Ribosom berukuran 70S (lebih kecil dari eukariot). Ukuran umum: 0,5-5 μm. Bakteri pertama kali diamati oleh Antonie van Leeuwenhoek (1676).</p>',
        '<h3>Kapsul atau Lapisan Lendir</h3><img src="/images/bakteri/kapsul.svg" alt="Diagram Kapsul & Lapisan Lendir" /><p><strong>Kapsul</strong> merupakan lapisan lendir pelindung di bagian terluar bakteri yang tersusun atas polisakarida atau protein. Mencegah dehidrasi, membantu perlekatan pada sel inang, dan melindungi bakteri patogen dari sistem kekebalan.</p><h3>Dinding Sel</h3><img src="/images/bakteri/dinding-sel.svg" alt="Diagram Dinding Sel Peptidoglikan" /><p><strong>Dinding Sel:</strong> Tersusun dari <strong>peptidoglikan</strong> (polisakarida + rantai peptida). Berfungsi mempertahankan bentuk sel yang kaku dan mencegah lisis sel ketika berada di lingkungan hipotonik.</p><h3>Membran Plasma</h3><img src="/images/bakteri/membran-plasma.svg" alt="Diagram Membran Plasma Fosfolipid Bilayer" /><p><strong>Membran Plasma:</strong> Lapisan fosfolipid bilayer semipermeabel yang mengatur pertukaran zat keluar masuk sel. Berperan penting dalam respirasi seluler dan pembentukan ATP.</p><h3>Sitoplasma</h3><p><strong>Sitoplasma:</strong> Cairan koloid homogen kental tempat berlangsungnya sebagian besar reaksi metabolisme dan aktivitas kehidupan sel bakteri. Mengandung enzim, butiran glikogen, serta ion anorganik.</p><h3>Nukleoid</h3><img src="/images/bakteri/nukleoid.svg" alt="Diagram Nukleoid DNA Sirkuler" /><p><strong>Nukleoid:</strong> Wilayah tempat materi genetik berupa DNA sirkuler ganda berkumpul tanpa diselubungi membran inti (prokariotik).</p><h3>Plasmid</h3><img src="/images/bakteri/plasmid.svg" alt="Diagram Molekul Plasmid" /><p><strong>Plasmid:</strong> Cincin DNA kecil di luar kromosom utama yang dapat bereplikasi secara mandiri dan membawa gen khusus seperti gen resistensi antibiotik.</p><h3>Ribosom</h3><img src="/images/bakteri/ribosom.svg" alt="Diagram Ribosom 70S" /><p><strong>Ribosom (70S):</strong> Kompleks RNA dan protein tempat berlangsungnya sintesis protein bakteri, tersusun dari subunit 50S dan 30S.</p><h3>Flagela</h3><img src="/images/bakteri/flagela.svg" alt="Diagram Flagela & Motor Basal" /><p><strong>Flagela:</strong> Struktur filamen protein flagelin yang berputar sebagai baling-baling penggerak bakteri menuju sumber nutrisi.</p><h3>Pilus dan Fimbriae</h3><img src="/images/bakteri/pilus.svg" alt="Diagram Pilus Konjugasi & Fimbriae" /><p><strong>Pili dan Fimbriae:</strong> Fimbriae membantu pelekatan pada jaringan, sedangkan pilus seks berfungsi membentuk jembatan konjugasi transfer DNA plasmid.</p>',
        '<h3>Reproduksi Bakteri</h3><p><strong>Aseksual (Pembelahan Biner):</strong> DNA direplikasi → sel membelah menjadi 2 sel anak identik. Waktu generasi: 20-30 menit. <strong>Konjugasi:</strong> Transfer plasmid melalui pili. <strong>Transformasi:</strong> Bakteri mengambil DNA bebas dari lingkungan. <strong>Transduksi:</strong> Transfer DNA melalui bakteriofag (virus bakteri). Reproduksi cepat menyebabkan pertumbuhan koloni eksponensial — kurva pertumbuhan: lag, log (eksponensial), stasioner, kematian.</p>',
        '<h3>Klasifikasi & Peran</h3><p><strong>Gram Positif:</strong> Dinding peptidoglikan tebal, menyerap kristal violet → ungu. Contoh: <em>Staphylococcus</em>, <em>Streptococcus</em>, <em>Bacillus</em>. <strong>Gram Negatif:</strong> Dinding peptidoglikan tipis + membran luar, merah. Contoh: <em>E. coli</em>, <em>Salmonella</em>, <em>Pseudomonas</em>. <strong>Berdasarkan bentuk:</strong> Kokus (bulat), Basil (batang), Spirilum (spiral), Vibrio (koma). <strong>Peran menguntungkan:</strong> Dekomposer, fiksasi N₂ (<em>Rhizobium</em>), probiotik (<em>Lactobacillus</em>), pembuatan antibiotik (<em>Streptomyces</em>), bioremediasi. <strong>Peran merugikan:</strong> Patogen penyebab penyakit — TBC (<em>Mycobacterium tuberculosis</em>), kolera (<em>Vibrio cholerae</em>), tipes (<em>Salmonella typhi</em>), tetanus (<em>Clostridium tetani</em>).</p>',
      ],
      en: [
        '<h3>Prokaryotic Cells</h3><p>Bacteria are prokaryotes — lacking a membrane-bound nucleus. DNA is in the nucleoid region, circular. No membrane-bound organelles like mitochondria or ER. Ribosomes are 70S (smaller than eukaryotes). Typical size: 0.5-5 μm. First observed by Antonie van Leeuwenhoek (1676).</p>',
        '<h3>Capsule or Slime Layer</h3><img src="/images/bakteri/kapsul.svg" alt="Bacterial Capsule & Slime Layer" /><p><strong>Capsule:</strong> Outer protective polysaccharide layer that prevents dehydration and aids adherence.</p><h3>Cell Wall</h3><img src="/images/bakteri/dinding-sel.svg" alt="Peptidoglycan Cell Wall" /><p><strong>Cell Wall:</strong> Composed of peptidoglycan to maintain rigid cell shape and prevent osmotic lysis.</p><h3>Plasma Membrane</h3><img src="/images/bakteri/membran-plasma.svg" alt="Plasma Membrane Bilayer" /><p><strong>Plasma Membrane:</strong> Selectively permeable barrier responsible for transport and cellular respiration.</p><h3>Cytoplasm</h3><p><strong>Cytoplasm:</strong> Fluid matrix containing metabolic enzymes, ions, and organelles without complex cytoskeleton.</p><h3>Nucleoid</h3><img src="/images/bakteri/nukleoid.svg" alt="Bacterial Nucleoid" /><p><strong>Nucleoid:</strong> Unbound region harboring the circular double-stranded chromosome.</p><h3>Plasmid</h3><img src="/images/bakteri/plasmid.svg" alt="Plasmid DNA" /><p><strong>Plasmid:</strong> Autonomous extrachromosomal DNA rings carrying adaptive genes such as antibiotic resistance.</p><h3>Ribosomes</h3><img src="/images/bakteri/ribosom.svg" alt="70S Ribosome" /><p><strong>Ribosomes (70S):</strong> Sites of protein synthesis composed of 50S and 30S subunits.</p><h3>Flagella</h3><img src="/images/bakteri/flagela.svg" alt="Flagella Structure" /><p><strong>Flagella:</strong> Rotary appendages enabling bacterial locomotion toward attractants.</p><h3>Pilus and Fimbriae</h3><img src="/images/bakteri/pilus.svg" alt="Pili & Fimbriae" /><p><strong>Pili and Fimbriae:</strong> Fimbriae facilitate attachment to surfaces, while sex pili mediate genetic transfer during conjugation.</p>',
        '<h3>Bacterial Reproduction</h3><p><strong>Asexual (Binary Fission):</strong> DNA replicates → cell divides into 2 identical daughter cells. Generation time: 20-30 minutes. <strong>Conjugation:</strong> Plasmid transfer via pili. <strong>Transformation:</strong> Bacteria take up free DNA from environment. <strong>Transduction:</strong> DNA transfer via bacteriophages (bacterial viruses). Rapid reproduction causes exponential colony growth — growth curve: lag, log (exponential), stationary, death phases.</p>',
        '<h3>Classification & Roles</h3><p><strong>Gram Positive:</strong> Thick peptidoglycan wall, absorbs crystal violet → purple. Examples: <em>Staphylococcus</em>, <em>Streptococcus</em>, <em>Bacillus</em>. <strong>Gram Negative:</strong> Thin peptidoglycan + outer membrane, red. Examples: <em>E. coli</em>, <em>Salmonella</em>, <em>Pseudomonas</em>. <strong>By shape:</strong> Cocci (spherical), Bacilli (rod), Spirilla (spiral), Vibrio (comma). <strong>Beneficial roles:</strong> Decomposers, N₂ fixation (<em>Rhizobium</em>), probiotics (<em>Lactobacillus</em>), antibiotic production (<em>Streptomyces</em>), bioremediation. <strong>Harmful roles:</strong> Pathogens causing disease — TB (<em>Mycobacterium tuberculosis</em>), cholera (<em>Vibrio cholerae</em>), typhoid (<em>Salmonella typhi</em>), tetanus (<em>Clostridium tetani</em>).</p>',
      ],
    },
    hotspotted: "bakteri",
    video: { id: "Bakteri — Struktur & Klasifikasi", en: "Bacteria — Structure & Classification" },
    videoId: "ORB9Qimv5bQ",
  },
];
export const KELAS = [
  {
    id: "x",
    nama: "Kelas X",
    materi: ["bakteri", "virus"],
  },
  {
    id: "xi",
    nama: "Kelas XI",
    materi: [
      "sel",
      "pencernaan",
      "sirkulasi",
      "syaraf",
    ],
  },
  {
    id: "xii",
    nama: "Kelas XII",
    materi: [
      "genetika",
      "evolusi",
      "ekosistem",
    ],
  },
];