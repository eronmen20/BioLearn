export interface QuizQuestion {
  q: { id: string; en: string };
  opts: { id: string[]; en: string[] };
  ans: number;
  explanation?: { id: string; en: string };
}

export const QUIZ: Record<string, QuizQuestion[]> = {
  sel: [
    {
      q: {
        id: "Organel sel yang berfungsi sebagai tempat respirasi seluler dan menghasilkan ATP adalah...",
        en: "Which organelle functions as the site of cellular respiration and produces ATP?",
      },
      opts: {
        id: ["Nukleus", "Mitokondria", "Ribosom", "Aparatus Golgi"],
        en: ["Nucleus", "Mitochondria", "Ribosome", "Golgi Apparatus"],
      },
      ans: 1,
      explanation: {
        id: "Mitokondria adalah organel yang memiliki membran ganda dan berfungsi sebagai 'pembangkit tenaga' sel melalui proses respirasi seluler yang menghasilkan ATP (adenosin trifosfat).",
        en: "Mitochondria are double-membrane organelles that act as the 'powerhouse' of the cell through cellular respiration, producing ATP (adenosine triphosphate).",
      },
    },
    {
      q: {
        id: "Proses pergerakan molekul dari konsentrasi tinggi ke rendah tanpa memerlukan energi disebut...",
        en: "Movement of molecules from high to low concentration without energy is called...",
      },
      opts: {
        id: ["Transpor Aktif", "Osmosis", "Difusi", "Endositosis"],
        en: ["Active Transport", "Osmosis", "Diffusion", "Endocytosis"],
      },
      ans: 2,
      explanation: {
        id: "Difusi adalah pergerakan molekul dari area berkonsentrasi tinggi ke rendah tanpa memerlukan energi (ATP). Ini adalah transpor pasif yang terjadi secara alami mengikuti gradien konsentrasi.",
        en: "Diffusion is the movement of molecules from high to low concentration without requiring energy (ATP). It is passive transport occurring naturally along the concentration gradient.",
      },
    },
    {
      q: {
        id: "Pembelahan sel yang menghasilkan 4 sel anak dengan jumlah kromosom haploid (n) adalah...",
        en: "Cell division producing 4 haploid (n) daughter cells is called...",
      },
      opts: {
        id: ["Mitosis", "Amitosis", "Meiosis", "Fragmentasi"],
        en: ["Mitosis", "Amitosis", "Meiosis", "Fragmentation"],
      },
      ans: 2,
      explanation: {
        id: "Meiosis menghasilkan 4 sel anak haploid (n) melalui dua tahap pembelahan: Meiosis I (reduksi) dan Meiosis II. Berbeda dengan mitosis yang menghasilkan 2 sel diploid (2n).",
        en: "Meiosis produces 4 haploid (n) daughter cells through two stages: Meiosis I (reduction) and Meiosis II. This differs from mitosis which produces 2 diploid (2n) cells.",
      },
    },
    {
      q: {
        id: "Struktur DNA berupa double helix pertama kali ditemukan oleh...",
        en: "The DNA double helix structure was first discovered by...",
      },
      opts: {
        id: ["Robert Hooke", "Watson & Crick", "Gregor Mendel", "Charles Darwin"],
        en: ["Robert Hooke", "Watson & Crick", "Gregor Mendel", "Charles Darwin"],
      },
      ans: 1,
      explanation: {
        id: "Watson & Crick (1953) menemukan struktur double helix DNA menggunakan data difraksi sinar-X dari Rosalind Franklin. Penemuan ini menjadi fondasi biologi molekuler modern.",
        en: "Watson & Crick (1953) discovered the DNA double helix structure using X-ray diffraction data from Rosalind Franklin. This discovery became the foundation of modern molecular biology.",
      },
    },
    {
      q: {
        id: "Organel yang berfungsi dalam sintesis protein adalah...",
        en: "The organelle responsible for protein synthesis is...",
      },
      opts: {
        id: ["Lisosom", "Ribosom", "RE Halus", "Vakuola"],
        en: ["Lysosome", "Ribosome", "Smooth ER", "Vacuole"],
      },
      ans: 1,
      explanation: {
        id: "Ribosom adalah organel kecil yang tersusun dari rRNA dan protein. Fungsinya menerjemahkan mRNA menjadi rantai polipeptida (protein) melalui proses translasi.",
        en: "Ribosomes are small organelles composed of rRNA and protein. They translate mRNA into polypeptide chains (proteins) through the process of translation.",
      },
    },
  ],
  pencernaan: [
    {
      q: {
        id: "Enzim yang berfungsi mengubah amilum (pati) menjadi maltosa adalah...",
        en: "The enzyme that converts starch into maltose is...",
      },
      opts: {
        id: ["Pepsin", "Tripsin", "Amilase", "Lipase"],
        en: ["Pepsin", "Trypsin", "Amylase", "Lipase"],
      },
      ans: 2,
      explanation: {
        id: "Amilase adalah enzim yang memecah amilum (pati/karbohidrat kompleks) menjadi maltosa (disakarida). Dihasilkan oleh kelenjar ludah (ptialin) dan pankreas (amilase pankreas).",
        en: "Amylase breaks down starch (complex carbohydrates) into maltose (a disaccharide). Produced by salivary glands (ptyalin) and pancreas (pancreatic amylase).",
      },
    },
    {
      q: {
        id: "Organ pencernaan yang berfungsi menyerap air dan membentuk feses adalah...",
        en: "The digestive organ that absorbs water and forms feces is...",
      },
      opts: {
        id: ["Usus Halus", "Lambung", "Usus Besar", "Kerongkongan"],
        en: ["Small Intestine", "Stomach", "Large Intestine", "Esophagus"],
      },
      ans: 2,
      explanation: {
        id: "Usus besar (kolon) menyerap air dan elektrolit dari sisa makanan yang tidak tercerna, membentuk feses. Usus halus yang bertugas menyerap nutrisi.",
        en: "The large intestine (colon) absorbs water and electrolytes from undigested food residue, forming feces. The small intestine is responsible for nutrient absorption.",
      },
    },
    {
      q: {
        id: "Hormon yang merangsang produksi asam lambung adalah...",
        en: "The hormone that stimulates gastric acid production is...",
      },
      opts: {
        id: ["Insulin", "Gastrin", "Glukagon", "Adrenalin"],
        en: ["Insulin", "Gastrin", "Glucagon", "Adrenaline"],
      },
      ans: 1,
      explanation: {
        id: "Gastrin adalah hormon yang diproduksi sel G di lambung. Merangsang sel parietal untuk mensekresi HCl (asam lambung) yang penting untuk mengaktifkan pepsinogen menjadi pepsin.",
        en: "Gastrin is produced by G cells in the stomach. It stimulates parietal cells to secrete HCl (gastric acid), essential for activating pepsinogen into pepsin.",
      },
    },
    {
      q: {
        id: "Penyerapan nutrisi terutama terjadi di bagian usus halus yang disebut...",
        en: "Nutrient absorption mainly occurs in which part of the small intestine?",
      },
      opts: {
        id: ["Duodenum", "Jejunum dan Ileum", "Sekum", "Kolon"],
        en: ["Duodenum", "Jejunum and Ileum", "Cecum", "Colon"],
      },
      ans: 1,
      explanation: {
        id: "Jejunum dan ileum memiliki vili dan mikrovili yang memperluas permukaan penyerapan hingga ~200 m². Di sinilah sebagian besar nutrisi diserap ke dalam darah.",
        en: "The jejunum and ileum have villi and microvilli expanding the absorption surface to ~200 m². Most nutrients are absorbed into the bloodstream here.",
      },
    },
    {
      q: {
        id: "Empedu diproduksi oleh organ... dan berfungsi mengemulsikan lemak.",
        en: "Bile is produced by the... and emulsifies fats.",
      },
      opts: {
        id: ["Pankreas", "Kantung Empedu", "Hati", "Lambung"],
        en: ["Pancreas", "Gallbladder", "Liver", "Stomach"],
      },
      ans: 2,
      explanation: {
        id: "Hati (liver) memproduksi empedu yang disimpan di kantung empedu. Empedu mengandung garam empedu yang mengemulsikan lemak — memecah menjadi droplet kecil agar lipase dapat bekerja.",
        en: "The liver produces bile stored in the gallbladder. Bile contains bile salts that emulsify fats — breaking them into small droplets so lipase can work.",
      },
    },
  ],
  ekosistem: [
    {
      q: {
        id: "Dalam rantai makanan, organisme yang berperan sebagai produsen adalah...",
        en: "In a food chain, organisms that act as producers are...",
      },
      opts: {
        id: ["Hewan Herbivora", "Tumbuhan Hijau", "Jamur", "Bakteri"],
        en: ["Herbivores", "Green Plants", "Fungi", "Bacteria"],
      },
      ans: 1,
      explanation: {
        id: "Tumbuhan hijau adalah produsen (autotrof) yang menghasilkan makanan sendiri melalui fotosintesis. Mereka mengubah energi matahari menjadi energi kimia dalam bentuk glukosa.",
        en: "Green plants are producers (autotrophs) that make their own food through photosynthesis. They convert solar energy into chemical energy in the form of glucose.",
      },
    },
    {
      q: {
        id: "Hukum 10% dalam aliran energi menyatakan bahwa...",
        en: "The 10% law in energy flow states that...",
      },
      opts: {
        id: [
          "Energi bertambah 10% tiap tingkat",
          "Hanya 10% energi berpindah ke tingkat berikutnya",
          "10% energi hilang sebagai panas",
          "Semua benar",
        ],
        en: [
          "Energy increases 10% per level",
          "Only 10% energy transfers to the next level",
          "10% energy is lost as heat",
          "All of the above",
        ],
      },
      ans: 1,
      explanation: {
        id: "Hukum 10% Lindeman: hanya sekitar 10% energi yang berpindah ke tingkat trofik berikutnya. 90% hilang sebagai panas melalui respirasi dan aktivitas metabolisme.",
        en: "Lindeman's 10% Law: only about 10% of energy transfers to the next trophic level. 90% is lost as heat through respiration and metabolic activities.",
      },
    },
    {
      q: {
        id: "Siklus biogeokimia yang melibatkan bakteri Rhizobium dalam fiksasi nitrogen adalah...",
        en: "The biogeochemical cycle involving Rhizobium bacteria in nitrogen fixation is...",
      },
      opts: {
        id: ["Siklus Karbon", "Siklus Nitrogen", "Siklus Fosfor", "Siklus Air"],
        en: ["Carbon Cycle", "Nitrogen Cycle", "Phosphorus Cycle", "Water Cycle"],
      },
      ans: 1,
      explanation: {
        id: "Bakteri Rhizobium hidup bersimbiosis dengan akar kacang-kacangan, mengikat N₂ dari udara dan mengubahnya menjadi amonia (NH₃) yang dapat digunakan tumbuhan.",
        en: "Rhizobium bacteria live symbiotically with legume roots, fixing N₂ from the air and converting it to ammonia (NH₃) usable by plants.",
      },
    },
    {
      q: {
        id: "Komponen abiotik dalam ekosistem meliputi...",
        en: "Abiotic components in an ecosystem include...",
      },
      opts: {
        id: ["Tumbuhan dan hewan", "Bakteri dan jamur", "Cahaya dan suhu", "Semua makhluk hidup"],
        en: ["Plants and animals", "Bacteria and fungi", "Light and temperature", "All living things"],
      },
      ans: 2,
      explanation: {
        id: "Komponen abiotik adalah faktor tak hidup: cahaya matahari, suhu, air, tanah, udara, pH, kelembaban. Komponen biotik adalah makhluk hidup: produsen, konsumen, dekomposer.",
        en: "Abiotic components are non-living factors: sunlight, temperature, water, soil, air, pH, humidity. Biotic components are living things: producers, consumers, decomposers.",
      },
    },
    {
      q: {
        id: "Piramida ekologi yang menggambarkan jumlah total biomassa pada setiap tingkat trofik disebut...",
        en: "The ecological pyramid showing total biomass at each trophic level is called...",
      },
      opts: {
        id: ["Piramida Energi", "Piramida Biomassa", "Piramida Jumlah", "Piramida Makanan"],
        en: ["Energy Pyramid", "Biomass Pyramid", "Pyramid of Numbers", "Food Pyramid"],
      },
      ans: 1,
      explanation: {
        id: "Piramida biomassa menunjukkan total massa kering organisme di setiap tingkat trofik. Biasanya menyempit ke atas karena energi yang hilang antar tingkat.",
        en: "The biomass pyramid shows the total dry mass of organisms at each trophic level. It typically narrows upward due to energy lost between levels.",
      },
    },
  ],
  genetika: [
    {
      q: {
        id: "Basa nitrogen yang hanya terdapat pada RNA dan menggantikan Timin adalah...",
        en: "The nitrogenous base found only in RNA replacing Thymine is...",
      },
      opts: {
        id: ["Adenin", "Guanin", "Sitosin", "Urasil"],
        en: ["Adenine", "Guanine", "Cytosine", "Uracil"],
      },
      ans: 3,
      explanation: {
        id: "RNA menggunakan Urasil (U) menggantikan Timin (T). Pasangan basa: A-U dan G-C. DNA menggunakan Timin: A-T dan G-C. Perbedaan ini penting dalam transkripsi.",
        en: "RNA uses Uracil (U) replacing Thymine (T). Base pairs: A-U and G-C. DNA uses Thymine: A-T and G-C. This difference is important in transcription.",
      },
    },
    {
      q: {
        id: "Proses pembentukan mRNA dari DNA disebut...",
        en: "The process of forming mRNA from DNA is called...",
      },
      opts: {
        id: ["Translasi", "Replikasi", "Transkripsi", "Duplikasi"],
        en: ["Translation", "Replication", "Transcription", "Duplication"],
      },
      ans: 2,
      explanation: {
        id: "Transkripsi adalah proses penyalinan DNA menjadi mRNA oleh enzim RNA polimerase. Terjadi di nukleus. Translasi adalah penerjemahan mRNA menjadi protein di ribosom.",
        en: "Transcription copies DNA into mRNA by RNA polymerase. Occurs in the nucleus. Translation decodes mRNA into proteins at ribosomes.",
      },
    },
    {
      q: {
        id: "Hukum Mendel I dikenal sebagai...",
        en: "Mendel's Law I is known as...",
      },
      opts: {
        id: ["Hukum Assortasi Bebas", "Hukum Segregasi", "Hukum Dominansi", "Hukum Resesif"],
        en: ["Law of Independent Assortment", "Law of Segregation", "Law of Dominance", "Law of Recessiveness"],
      },
      ans: 1,
      explanation: {
        id: "Hukum Segregasi (Mendel I): setiap individu memiliki sepasang alel yang memisah (segregasi) saat pembentukan gamet. Setiap gamet hanya membawa satu alel.",
        en: "Law of Segregation (Mendel I): each individual has a pair of alleles that separate (segregate) during gamete formation. Each gamete carries only one allele.",
      },
    },
    {
      q: {
        id: "Jika individu bergenotip AaBb, jumlah macam gamet yang dihasilkan adalah...",
        en: "If an individual has genotype AaBb, how many types of gametes are produced?",
      },
      opts: {
        id: ["2", "3", "4", "8"],
        en: ["2", "3", "4", "8"],
      },
      ans: 2,
      explanation: {
        id: "Genotip AaBb menghasilkan 4 gamet: AB, Ab, aB, ab. Rumus: 2ⁿ, di mana n = jumlah alel heterozigot. AaBb punya 2 alel heterozigot → 2² = 4.",
        en: "Genotype AaBb produces 4 gametes: AB, Ab, aB, ab. Formula: 2ⁿ, where n = number of heterozygous alleles. AaBb has 2 heterozygous alleles → 2² = 4.",
      },
    },
    {
      q: {
        id: "Mutasi yang disebabkan oleh perubahan satu basa nitrogen disebut...",
        en: "A mutation caused by a change in one nitrogen base is called...",
      },
      opts: {
        id: ["Mutasi Kromosom", "Mutasi Gen (Titik)", "Delesi", "Translokasi"],
        en: ["Chromosomal Mutation", "Gene (Point) Mutation", "Deletion", "Translocation"],
      },
      ans: 1,
      explanation: {
        id: "Mutasi titik (point mutation) adalah perubahan satu basa nitrogen. Jenis: substitusi (penggantian), insersi (penyisipan), delesi (penghapusan). Dapat menyebabkan penyakit seperti anemia sel sabit.",
        en: "Point mutation is a change in one nitrogen base. Types: substitution (replacement), insertion (addition), deletion (removal). Can cause diseases like sickle cell anemia.",
      },
    },
  ],
  evolusi: [
    {
      q: {
        id: "Teori evolusi yang menekankan pada seleksi alam dikemukakan oleh...",
        en: "The evolution theory emphasizing natural selection was proposed by...",
      },
      opts: {
        id: ["Lamarck", "Darwin", "Wallace", "Weismann"],
        en: ["Lamarck", "Darwin", "Wallace", "Weismann"],
      },
      ans: 1,
      explanation: {
        id: "Charles Darwin (1859) mempublikasikan 'On the Origin of Species'. Teorinya: seleksi alam — variasi → kompetisi → survival of the fittest → reproduksi diferensial menjadi mekanisme utama evolusi.",
        en: "Charles Darwin (1859) published 'On the Origin of Species'. His theory: natural selection — variation → competition → survival of the fittest → differential reproduction is the main mechanism of evolution.",
      },
    },
    {
      q: {
        id: "Contoh adaptasi ngengat Biston betularia di Inggris akibat Revolusi Industri adalah contoh...",
        en: "The Biston betularia adaptation in England due to the Industrial Revolution is an example of...",
      },
      opts: {
        id: ["Seleksi Alam Buatan", "Seleksi Alam Alami", "Mutasi Buatan", "Evolusi Buatan"],
        en: ["Artificial Selection", "Natural Selection", "Artificial Mutation", "Artificial Evolution"],
      },
      ans: 1,
      explanation: {
        id: "Ngengat Biston betularia: sebelum revolusi industri, ngengat putih dominan (kamuflase di pohon terang). Setelah polusi menggelapkan pohon, ngengat gelap lebih bertahan — contoh klasik seleksi alam.",
        en: "Peppered moth (Biston betularia): before the industrial revolution, white moths dominated (camouflage on light trees). After pollution darkened trees, dark moths survived better — a classic example of natural selection.",
      },
    },
    {
      q: {
        id: "Struktur homolog adalah...",
        en: "Homologous structures are...",
      },
      opts: {
        id: ["Struktur sama, fungsi sama", "Struktur sama, fungsi berbeda", "Struktur berbeda, fungsi sama", "Struktur berbeda, fungsi berbeda"],
        en: ["Same structure, same function", "Same structure, different function", "Different structure, same function", "Different structure, different function"],
      },
      ans: 1,
      explanation: {
        id: "Homologi: struktur dengan asal evolusi sama (nenek moyang sama) tapi fungsi berbeda. Contoh: tangan manusia, sayap kelelawar, sirip paus — semua punya struktur tulang dasar yang sama.",
        en: "Homology: structures with the same evolutionary origin (common ancestor) but different functions. Example: human hand, bat wing, whale flipper — all have the same basic bone structure.",
      },
    },
    {
      q: {
        id: "Spesiasi yang terjadi karena isolasi geografis disebut...",
        en: "Speciation occurring due to geographic isolation is called...",
      },
      opts: {
        id: ["Spesiasi Simpatrik", "Spesiasi Allopatrik", "Spesiasi Parapatrik", "Spesiasi Sintetrik"],
        en: ["Sympatric Speciation", "Allopatric Speciation", "Parapatric Speciation", "Synthetic Speciation"],
      },
      ans: 1,
      explanation: {
        id: "Spesiasi allopatrik terjadi ketika populasi terpisah oleh penghalang geografis (gunung, sungai, laut). Isolasi mencegah aliran gen, sehingga populasi berevolusi secara terpisah.",
        en: "Allopatric speciation occurs when populations are separated by geographic barriers (mountains, rivers, seas). Isolation prevents gene flow, so populations evolve separately.",
      },
    },
    {
      q: {
        id: "Organ vestigial pada manusia contohnya adalah...",
        en: "An example of a vestigial organ in humans is...",
      },
      opts: {
        id: ["Jantung", "Apendiks (Usus Buntu)", "Paru-paru", "Ginjal"],
        en: ["Heart", "Appendix", "Lungs", "Kidneys"],
      },
      ans: 1,
      explanation: {
        id: "Apendiks (usus buntu) adalah organ vestigial — sisa evolusi yang kehilangan fungsi aslinya. Pada manusia, apendiks tidak lagi mencerna selulosa seperti pada herbivora.",
        en: "The appendix is a vestigial organ — an evolutionary remnant that lost its original function. In humans, the appendix no longer digests cellulose as in herbivores.",
      },
    },
  ],
  sirkulasi: [
    {
      q: {
        id: "Jantung manusia memiliki berapa ruang?",
        en: "How many chambers does the human heart have?",
      },
      opts: {
        id: ["2", "3", "4", "5"],
        en: ["2", "3", "4", "5"],
      },
      ans: 2,
      explanation: {
        id: "Jantung manusia memiliki 4 ruang: 2 atrium (kanan & kiri) dan 2 ventrikel (kanan & kiri). Ini disebut jantung beruang empat (tetrachamber) — efisien memisahkan darah kaya O₂ dan CO₂.",
        en: "The human heart has 4 chambers: 2 atria (right & left) and 2 ventricles (right & left). This four-chambered heart efficiently separates O₂-rich and CO₂-rich blood.",
      },
    },
    {
      q: {
        id: "Pembuluh darah yang membawa darah kaya oksigen dari jantung ke seluruh tubuh adalah...",
        en: "Blood vessels carrying oxygen-rich blood from the heart to the body are...",
      },
      opts: {
        id: ["Vena", "Arteri", "Kapiler", "Venula"],
        en: ["Veins", "Arteries", "Capillaries", "Venules"],
      },
      ans: 1,
      explanation: {
        id: "Arteri membawa darah dari jantung ke seluruh tubuh. Dindingnya tebal dan elastis karena tekanan darah tinggi. Arteri pulmonalis adalah pengecualian — membawa darah rendah O₂ ke paru-paru.",
        en: "Arteries carry blood from the heart to the body. Their walls are thick and elastic due to high blood pressure. Pulmonary artery is an exception — carries low-O₂ blood to lungs.",
      },
    },
    {
      q: {
        id: "Komponen darah yang berperan dalam pembekuan darah adalah...",
        en: "Blood components responsible for blood clotting are...",
      },
      opts: {
        id: ["Eritrosit", "Leukosit", "Trombosit", "Plasma"],
        en: ["Erythrocytes", "Leukocytes", "Thrombocytes", "Plasma"],
      },
      ans: 2,
      explanation: {
        id: "Trombosit (keping darah) adalah fragmen sel tanpa inti. Saat pembuluh darah terluka, trombosit pecah dan melepaskan trombokinase yang memicu kaskade pembekuan darah.",
        en: "Thrombocytes (platelets) are cell fragments without a nucleus. When blood vessels are damaged, platelets rupture and release thrombokinase triggering the blood clotting cascade.",
      },
    },
    {
      q: {
        id: "Peredaran darah yang membawa darah dari jantung ke paru-paru disebut...",
        en: "Blood circulation from the heart to the lungs is called...",
      },
      opts: {
        id: ["Sistemik", "Pulmonal", "Koroner", "Portal"],
        en: ["Systemic", "Pulmonary", "Coronary", "Portal"],
      },
      ans: 1,
      explanation: {
        id: "Peredaran pulmonal (kecil): jantung → paru-paru → jantung. Darah melepaskan CO₂ dan mengambil O₂ di alveolus paru-paru. Peredaran sistemik (besar): jantung → seluruh tubuh → jantung.",
        en: "Pulmonary circulation: heart → lungs → heart. Blood releases CO₂ and takes O₂ in lung alveoli. Systemic circulation: heart → body → heart.",
      },
    },
    {
      q: {
        id: "Tekanan darah normal orang dewasa adalah sekitar...",
        en: "Normal adult blood pressure is around...",
      },
      opts: {
        id: ["100/60 mmHg", "120/80 mmHg", "140/90 mmHg", "160/100 mmHg"],
        en: ["100/60 mmHg", "120/80 mmHg", "140/90 mmHg", "160/100 mmHg"],
      },
      ans: 1,
      explanation: {
        id: "Tekanan darah normal dewasa: 120/80 mmHg. Sistol (120) = tekanan saat ventrikel berkontraksi. Diastol (80) = tekanan saat ventrikel relaksasi. Hipertensi > 140/90 mmHg.",
        en: "Normal adult blood pressure: 120/80 mmHg. Systole (120) = pressure when ventricles contract. Diastole (80) = pressure when ventricles relax. Hypertension > 140/90 mmHg.",
      },
    },
  ],
  syaraf: [
    {
      q: {
        id: "Bagian neuron yang berfungsi menerima impuls dari neuron lain adalah...",
        en: "The part of a neuron that receives impulses from other neurons is...",
      },
      opts: {
        id: ["Akson", "Badan Sel", "Dendrit", "Sinaps"],
        en: ["Axon", "Cell Body", "Dendrite", "Synapse"],
      },
      ans: 2,
      explanation: {
        id: "Dendrit adalah cabang pendek dari badan sel neuron yang menerima impuls dari neuron lain atau reseptor sensorik. Impuls bergerak dari dendrit → badan sel → akson.",
        en: "Dendrites are short branches from the neuron cell body that receive impulses from other neurons or sensory receptors. Impulses travel from dendrites → cell body → axon.",
      },
    },
    {
      q: {
        id: "Sistem saraf yang mengontrol gerakan sadar adalah...",
        en: "The nervous system controlling voluntary movements is...",
      },
      opts: {
        id: ["Otonom Simpatis", "Otonom Parasimpatis", "Somatik", "Enterik"],
        en: ["Sympathetic Autonomic", "Parasympathetic Autonomic", "Somatic", "Enteric"],
      },
      ans: 2,
      explanation: {
        id: "Sistem saraf somatik mengontrol gerakan sadar (volunter) seperti berjalan dan menulis. Menggunakan 12 saraf kranial dan 31 saraf spinal. Saraf motorik mengirim perintah ke otot rangka.",
        en: "The somatic nervous system controls voluntary movements like walking and writing. Uses 12 cranial nerves and 31 spinal nerves. Motor nerves send commands to skeletal muscles.",
      },
    },
    {
      q: {
        id: "Bagian otak yang berfungsi untuk keseimbangan dan koordinasi gerak adalah...",
        en: "The brain part responsible for balance and coordination is...",
      },
      opts: {
        id: ["Serebrum", "Serebelum", "Batang Otak", "Hipotalamus"],
        en: ["Cerebrum", "Cerebellum", "Brainstem", "Hypothalamus"],
      },
      ans: 1,
      explanation: {
        id: "Serebelum (otak kecil) terletak di bawah lobus oksipital. Fungsi: koordinasi gerakan halus, keseimbangan, dan postur tubuh. Kerusakan serebelum menyebabkan ataksia (gerakan tidak terkoordinasi).",
        en: "The cerebellum is located below the occipital lobe. Functions: fine motor coordination, balance, and posture. Damage causes ataxia (uncoordinated movements).",
      },
    },
    {
      q: {
        id: "Reseptor yang mendeteksi rasa manis pada lidah terdapat di bagian...",
        en: "Sweet taste receptors on the tongue are located...",
      },
      opts: {
        id: ["Ujung Lidah", "Tepi Lidah", "Belakang Lidah", "Seluruh Lidah"],
        en: ["Tip of Tongue", "Sides of Tongue", "Back of Tongue", "Whole Tongue"],
      },
      ans: 0,
      explanation: {
        id: "Reseptor manis terkonsentrasi di ujung lidah. Asin di tepi depan, asam di tepi samping, pahit di belakang. Umami (gurih) tersebar merata. Ini adalah peta rasa klasik lidah.",
        en: "Sweet receptors are concentrated at the tongue tip. Salty at front sides, sour at side edges, bitter at the back. Umami (savory) is spread evenly. This is the classic tongue taste map.",
      },
    },
    {
      q: {
        id: "Neurotransmitter yang berperan dalam perasaan senang dan penghargaan adalah...",
        en: "The neurotransmitter associated with pleasure and reward is...",
      },
      opts: {
        id: ["Asetilkolin", "Dopamin", "Serotonin", "GABA"],
        en: ["Acetylcholine", "Dopamine", "Serotonin", "GABA"],
      },
      ans: 1,
      explanation: {
        id: "Dopamin adalah neurotransmitter yang berperan dalam sistem reward otak — sensasi senang, motivasi, dan penghargaan. Juga penting untuk kontrol gerakan. Kekurangan dopamin terkait Parkinson.",
        en: "Dopamine is a neurotransmitter in the brain's reward system — pleasure, motivation, and reward sensations. Also important for movement control. Dopamine deficiency is linked to Parkinson's disease.",
      },
    },
  ],
  bakteri: [
    {
      q: {
        id: "Bakteri termasuk kingdom...",
        en: "Bacteria belong to the kingdom...",
      },
      opts: {
        id: ["Protista", "Monera", "Fungi", "Plantae"],
        en: ["Protista", "Monera", "Fungi", "Plantae"],
      },
      ans: 1,
      explanation: {
        id: "Bakteri termasuk kingdom Monera — organisme prokariotik uniseluler. Kingdom lain: Protista (eukariotik sederhana), Fungi (jamur), Plantae (tumbuhan), Animalia (hewan).",
        en: "Bacteria belong to kingdom Monera — unicellular prokaryotic organisms. Other kingdoms: Protista (simple eukaryotes), Fungi, Plantae (plants), Animalia (animals).",
      },
    },
    {
      q: {
        id: "Bentuk bakteri bulat disebut...",
        en: "Spherical bacteria are called...",
      },
      opts: {
        id: ["Basil", "Spirilum", "Kokus", "Vibrio"],
        en: ["Bacilli", "Spirilla", "Cocci", "Vibrio"],
      },
      ans: 2,
      explanation: {
        id: "Bakteri kokus berbentuk bulat. Dapat tersusun: monokokus (tunggal), diplokokus (berpasangan), streptokokus (rantai), stafilokokus (bergerombol seperti anggur).",
        en: "Cocci are spherical bacteria. Arrangements: monococcus (single), diplococcus (pairs), streptococcus (chains), staphylococcus (grape-like clusters).",
      },
    },
    {
      q: {
        id: "Dinding sel bakteri tersusun dari...",
        en: "Bacterial cell walls are composed of...",
      },
      opts: {
        id: ["Selulosa", "Kitin", "Peptidoglikan", "Lignin"],
        en: ["Cellulose", "Chitin", "Peptidoglycan", "Lignin"],
      },
      ans: 2,
      explanation: {
        id: "Peptidoglikan adalah polimer unik dinding sel bakteri — terdiri dari rantai gula (NAG & NAM) yang dihubungkan silang oleh peptida pendek. Target antibiotik seperti penisilin.",
        en: "Peptidoglycan is a unique polymer of bacterial cell walls — sugar chains (NAG & NAM) cross-linked by short peptides. Target of antibiotics like penicillin.",
      },
    },
    {
      q: {
        id: "Reproduksi aseksual bakteri disebut...",
        en: "Asexual reproduction in bacteria is called...",
      },
      opts: {
        id: ["Fragmentasi", "Pembelahan Biner", "Tunas", "Spora"],
        en: ["Fragmentation", "Binary Fission", "Budding", "Spores"],
      },
      ans: 1,
      explanation: {
        id: "Pembelahan biner: DNA bakteri bereplikasi → sel memanjang → terbentuk septum (dinding pembatas) → sel membelah jadi 2. Waktu generasi cepat: 20-30 menit pada kondisi optimal.",
        en: "Binary fission: bacterial DNA replicates → cell elongates → septum forms → cell divides into 2. Fast generation time: 20-30 minutes under optimal conditions.",
      },
    },
    {
      q: {
        id: "Transfer DNA bakteri melalui virus disebut...",
        en: "Bacterial DNA transfer via viruses is called...",
      },
      opts: {
        id: ["Konjugasi", "Transformasi", "Transduksi", "Replikasi"],
        en: ["Conjugation", "Transformation", "Transduction", "Replication"],
      },
      ans: 2,
      explanation: {
        id: "Transduksi: transfer DNA bakteri melalui virus (bakteriofag). Fag membawa DNA bakteri dari sel donor ke sel resipien. Dua jenis: transduksi umum dan khusus.",
        en: "Transduction: bacterial DNA transfer via viruses (bacteriophages). Phage carries bacterial DNA from donor to recipient cell. Two types: generalized and specialized transduction.",
      },
    },
  ],
};