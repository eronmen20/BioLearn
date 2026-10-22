export interface AnalogiItem {
  id: string;
  term: string;
  scientificName?: string;
  analogyTitle: string;
  emoji: string;
  story: string;
  termEn?: string;
  analogyTitleEn?: string;
  storyEn?: string;
}

export interface AnalogiGroup {
  babId: string;
  subKey: string;
  title: string;
  titleEn: string;
  subtitle: string;
  subtitleEn: string;
  items: AnalogiItem[];
}

export const ANALOGI_DATABASE: AnalogiGroup[] = [
  // ──────────────────────────────────────────
  // BAB BAKTERI
  // ──────────────────────────────────────────
  {
    babId: "bakteri",
    subKey: "sub.bakteri1",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Biar nggak pusing sama istilah kaku, bayangin karakteristik bakteri lewat analogi ini:",
    subtitleEn: "To understand bacterial traits easily, imagine them through these everyday analogies:",
    items: [
      {
        id: "prokariotik-studio",
        term: "Sel Prokariotik",
        scientificName: "Tanpa Membran Inti",
        analogyTitle: "Kamar Kos Tipe Studio Minimalis",
        emoji: "🏠",
        story: "Di sel eukariotik (seperti manusia), ada sekat kamar tidur khusus DNA (nukleus). Nah kalau bakteri itu ibarat kamar kos tipe studio: ruangannya plong tanpa sekat. DNA sirkulernya santai mengapung di tengah ruangan (nukleoid) bersama perabotan sel lainnya.",
        termEn: "Prokaryotic Cell",
        analogyTitleEn: "Minimalist Studio Apartment",
        storyEn: "Unlike human cells with separate walled rooms for DNA (nucleus), bacteria are like open studio apartments. Their circular DNA floats freely in the center (nucleoid) alongside other cell gear.",
      },
      {
        id: "ukuran-mikro",
        term: "Ukuran Mikroskopis (0,5–5 μm)",
        scientificName: "Skala Sel Bakteri",
        analogyTitle: "Butiran Pasir di Lapangan Bola",
        emoji: "🔬",
        story: "Saking kecilnya bakteri, di satu ujung runcing jarum pentul saja bisa berkumpul ratusan ribu hingga jutaan bakteri berpesta tanpa berdesakan.",
        termEn: "Microscopic Size (0.5–5 μm)",
        analogyTitleEn: "Grain of Sand on a Soccer Field",
        storyEn: "Bacteria are so tiny that hundreds of thousands can gather and party on the single tip of a sewing needle without feeling cramped.",
      },
      {
        id: "dinding-peptidoglikan",
        term: "Dinding Sel Peptidoglikan",
        scientificName: "Pelindung Bentuk Sel",
        analogyTitle: "Rangka Beton Tahan Gempa",
        emoji: "🧱",
        story: "Bakteri sering menyerap air dari lingkungan sekitarnya. Tanpa rangka dinding peptidoglikan yang kokoh seperti beton bertulang, sel bakteri bakal gampang menggelembung dan meletus.",
        termEn: "Peptidoglycan Cell Wall",
        analogyTitleEn: "Earthquake-Proof Concrete Frame",
        storyEn: "Bacteria constantly absorb water. Without a tough peptidoglycan wall acting like reinforced concrete, the cell would over-inflate and burst.",
      },
    ],
  },
  {
    babId: "bakteri",
    subKey: "sub.bakteri2",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami fungsi tiap organel dan bagian bakteri lewat perumpamaan berikut:",
    subtitleEn: "Understand each bacterial organelle through these real-world comparisons:",
    items: [
      {
        id: "plasmid-flashdisk",
        term: "Plasmid",
        scientificName: "Cincin DNA Ekstrakromosomal",
        analogyTitle: "Flashdisk Berisi Cheat Game",
        emoji: "💾",
        story: "Bakteri punya hardisk utama berisi panduan hidup (DNA nukleoid). Tapi plasmid ini seperti flashdisk kecil terpisah berisi cheat rahasia, misalnya resep kebal antibiotik. Enaknya lagi, flashdisk ini bisa di-copy dan dipinjamkan ke teman bakteri lainnya.",
        termEn: "Plasmid",
        analogyTitleEn: "USB Drive with Secret Cheat Codes",
        storyEn: "Bacteria have a main hard drive (nucleoid DNA), but plasmids are like portable USB drives holding special cheat codes, like antibiotic resistance recipes, which can be easily shared.",
      },
      {
        id: "kapsul-jas-hujan",
        term: "Kapsul Lendir",
        scientificName: "Lapisan Polisakarida Terluar",
        analogyTitle: "Jas Hujan Super Licin",
        emoji: "🧥",
        story: "Kapsul lendir di luar bakteri itu seperti jas hujan berlapis sabun. Saat sel darah putih imun tubuh mau menangkap dan memangsa bakteri patogen, mereka malah terpeleset karena permukaannya yang sangat licin.",
        termEn: "Slime Capsule",
        analogyTitleEn: "Slippery Raincoat",
        storyEn: "The outer capsule is like a soap-coated raincoat. When immune white blood cells try to grab and swallow pathogenic bacteria, they slip right off.",
      },
      {
        id: "pilus-kabel-data",
        term: "Pilus Seks (Jembatan)",
        scientificName: "Pili Konjugasi",
        analogyTitle: "Kabel Data Transfer File",
        emoji: "🔌",
        story: "Saat satu bakteri mau membagikan salinan plasmid ke bakteri lain, dia memanjangkan saluran mirip pipa kecil yang bertindak persis seperti kabel data penghubung dua perangkat.",
        termEn: "Sex Pilus",
        analogyTitleEn: "Data Transfer Cable",
        storyEn: "When one bacterium wants to share its plasmid with another, it extends a tiny conduit that works just like a USB cable connecting two computers.",
      },
      {
        id: "endospora-bunker",
        term: "Endospora",
        scientificName: "Bentuk Pertahanan Diri",
        analogyTitle: "Bunker Kiamat Tahan Nuklir",
        emoji: "🛡️",
        story: "Saat cuaca di luar sangat mengerikan (kekeringan ekstrem, radiasi, atau panas membara), bakteri mengemas DNA intinya di dalam kapsul baja tebal yang disebut endospora. Bakteri bisa 'mati suri' di bunker ini selama puluhan tahun sampai kondisi luar kembali nyaman.",
        termEn: "Endospore",
        analogyTitleEn: "Fallout Survival Bunker",
        storyEn: "When outer conditions turn extreme (drought, boiling heat, chemical threats), bacteria lock their DNA inside an armored bunker called an endospore, hibernating for decades until safety returns.",
      },
      {
        id: "flagela-baling-baling",
        term: "Flagela",
        scientificName: "Alat Gerak Sel",
        analogyTitle: "Baling-baling Mesin Tempel Kapal",
        emoji: "🛥️",
        story: "Flagela bukan sekadar ekor yang melambai, tapi benar-benar punya motor putar biologis di pangkalnya yang berputar ratusan kali per detik untuk mendorong bakteri meluncur menuju sumber nutrisi.",
        termEn: "Flagella",
        analogyTitleEn: "Boat Outboard Motor Propeller",
        storyEn: "Flagella are genuine rotary motors spinning hundreds of times per second at their base, propelling the bacterium directly toward food sources.",
      },
    ],
  },
  {
    babId: "bakteri",
    subKey: "sub.bakteri3",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Cara bakteri berkembang biak dan berbagi gen ternyata seru kalau dibayangkan seperti ini:",
    subtitleEn: "How bacteria multiply and share genes becomes fascinating with these stories:",
    items: [
      {
        id: "pembelahan-biner-fotokopi",
        term: "Pembelahan Biner",
        scientificName: "Reproduksi Aseksual",
        analogyTitle: "Mesin Fotokopi Otomatis Super Cepat",
        emoji: "🖨️",
        story: "Bakteri tidak butuh pasangan untuk punya keturunan. Satu sel cukup menduplikasi DNA-nya, lalu membelah di tengah menjadi dua kloningan identik. Proses ini hanya makan waktu 20 menit, makanya semangkuk sup yang ditinggal semalam bisa dipenuhi jutaan bakteri.",
        termEn: "Binary Fission",
        analogyTitleEn: "High-Speed Photocopy Machine",
        storyEn: "Bacteria need no partner. One cell replicates its DNA and divides in half into two identical clones in just 20 minutes, which is why food left out overnight teems with bacteria by morning.",
      },
      {
        id: "transformasi-looting",
        term: "Transformasi Genetik",
        scientificName: "Penyerapan DNA Bebas",
        analogyTitle: "Looting Senjata Jatuh di Game Battle Royale",
        emoji: "🎮",
        story: "Saat ada bakteri lain yang mati dan hancur di sekitarnya, potongan DNA-nya berserakan di tanah. Bakteri yang masih hidup bisa memungut (looting) serpihan DNA itu dan memasukkannya ke tubuh sendiri untuk mendapatkan kemampuan baru.",
        termEn: "Genetic Transformation",
        analogyTitleEn: "Looting Dropped Weapons in Battle Royale",
        storyEn: "When a nearby bacterium dies and breaks apart, its DNA fragments scatter around. Surviving bacteria can pick up (loot) those scraps and incorporate them to gain brand-new abilities.",
      },
      {
        id: "transduksi-kurir-nyasar",
        term: "Transduksi",
        scientificName: "Transfer via Bakteriofag",
        analogyTitle: "Kurir Paket Salah Masuk Kotak",
        emoji: "📦",
        story: "Virus bakteriofag menginfeksi bakteri A, lalu saat merakit diri, virus tersebut tidak sengaja membungkus potongan DNA bakteri A. Ketika virus itu terbang dan menyuntikkan isinya ke bakteri B, bakteri B malah menerima potongan gen dari bakteri A.",
        termEn: "Transduction",
        analogyTitleEn: "Courier Delivering the Wrong Package",
        storyEn: "A bacteriophage virus mistakenly packs a piece of bacterium A's DNA into its capsule. When it attacks bacterium B, bacterium B accidentally receives genetic gifts from bacterium A.",
      },
    ],
  },
  {
    babId: "bakteri",
    subKey: "sub.bakteri4",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami perbedaan Gram positif/negatif dan peran bakteri lewat analogi ini:",
    subtitleEn: "Understand Gram staining differences and bacterial roles clearly:",
    items: [
      {
        id: "gram-jaket",
        term: "Gram Positif vs Gram Negatif",
        scientificName: "Struktur Dinding & Pewarnaan",
        analogyTitle: "Kaos Wol Tebal vs Jaket Parasut Berlapis",
        emoji: "🧥",
        story: "Gram positif punya dinding peptidoglikan sangat tebal dan empuk seperti kaos rajut wol, sehingga mudah menyerap dan menahan pewarna ungu kristal violet. Sebaliknya, Gram negatif punya dinding tipis tapi dilapisi membran luar tahan air mirip jaket parasut, sehingga pewarna ungu mudah luntur dan bakteri tampak merah saat diwarnai safranin.",
        termEn: "Gram-Positive vs Gram-Negative",
        analogyTitleEn: "Thick Wool Sweater vs Layered Windbreaker",
        storyEn: "Gram-positive bacteria have thick, absorbent peptidoglycan walls like a wool sweater, locking in purple dye. Gram-negative bacteria have thin walls covered by a slippery outer membrane like a raincoat, resisting standard dyes and appearing red.",
      },
      {
        id: "peran-probiotik",
        term: "Bakteri Baik (Probiotik)",
        scientificName: "Misalnya Lactobacillus di Usus",
        analogyTitle: "Tetangga Ramah Penjaga Kompleks",
        emoji: "🤝",
        story: "Tidak semua bakteri itu musuh. Triliunan bakteri di usus kita bertindak seperti tetangga ramah yang memenuhi seluruh kavling perumahan. Karena semua rumah sudah ditempati bakteri baik, bakteri jahat penyebab diare tidak punya tempat untuk mampir dan menempel.",
        termEn: "Beneficial Bacteria (Probiotics)",
        analogyTitleEn: "Friendly Neighborhood Watch",
        storyEn: "Trillions of gut bacteria act like a friendly neighborhood watch occupying every vacant lot, leaving no room for harmful invaders to settle down and cause infections.",
      },
    ],
  },

  // ──────────────────────────────────────────
  // BAB SEL
  // ──────────────────────────────────────────
  {
    babId: "sel",
    subKey: "sub.sel1",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Bayangkan sel hewan dan tumbuhan seperti kota metropolitan modern:",
    subtitleEn: "Picture plant and animal cells like a bustling modern metropolis:",
    items: [
      {
        id: "nukleus-direktur",
        term: "Nukleus (Inti Sel)",
        scientificName: "Pusat Kendali Genetik",
        analogyTitle: "Ruang Direktur Utama & Brankas Master",
        emoji: "👑",
        story: "Nukleus adalah ruang kantor kepala eksekutif. Di dalam brankasnya tersimpan cetak biru master DNA lengkap seluruh operasional pabrik tubuh. Dari ruangan ini, perintah dikirim ke seluruh organel sel.",
        termEn: "Nucleus",
        analogyTitleEn: "CEO Office & Blueprint Vault",
        storyEn: "The nucleus is the master office containing all the master architectural blueprints (DNA) and directing every department across the cellular city.",
      },
      {
        id: "mitokondria-pltu",
        term: "Mitokondria",
        scientificName: "Respirasi Seluler & ATP",
        analogyTitle: "Pembangkit Listrik Kota (PLTU)",
        emoji: "⚡",
        story: "Mitokondria membakar bahan bakar makanan (glukosa) bersama oksigen untuk menghasilkan baterai energi siap pakai bernama ATP. Tanpa pembangkit listrik ini, semua aktivitas sel akan mati lampu.",
        termEn: "Mitochondria",
        analogyTitleEn: "Metropolitan Power Plant",
        storyEn: "Mitochondria burn fuel (glucose) with oxygen to produce ready-to-use biological energy currency (ATP), keeping the entire cellular city powered up.",
      },
      {
        id: "golgi-kantor-pos",
        term: "Aparatus Golgi",
        scientificName: "Sekresi & Modifikasi Protein",
        analogyTitle: "Gudang Ekspedisi & Packing Kurir",
        emoji: "📦",
        story: "Setelah protein dirakit oleh ribosom, paket protein tersebut dikirim ke Aparatus Golgi. Di sini protein disortir, dimodifikasi, ditempeli label alamat, lalu dibungkus rapi sebelum dikirim ke luar sel.",
        termEn: "Golgi Apparatus",
        analogyTitleEn: "Sorting & Shipping Hub",
        storyEn: "After proteins are manufactured, they arrive at the Golgi hub to be inspected, labeled, packaged, and shipped out to their destinations.",
      },
      {
        id: "lisosom-truk-sampah",
        term: "Lisosom",
        scientificName: "Pencernaan Intraseluler",
        analogyTitle: "Dinas Kebersihan & Truk Sampah Daur Ulang",
        emoji: "♻️",
        story: "Lisosom dilengkapi enzim pencerna asam yang kuat. Tugasnya menelan organel yang sudah rusak atau bakteri penyusup, lalu mencacahnya menjadi bahan dasar yang bisa didaur ulang kembali.",
        termEn: "Lysosome",
        analogyTitleEn: "Recycling & Sanitation Department",
        storyEn: "Packed with digestive enzymes, lysosomes patrol the cell to break down worn-out parts and foreign invaders, recycling useful raw materials.",
      },
    ],
  },

  // ──────────────────────────────────────────
  // BAB VIRUS
  // ──────────────────────────────────────────
  {
    babId: "virus",
    subKey: "sub.virus1",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami sifat misterius virus lewat perumpamaan berikut:",
    subtitleEn: "Grasp the mysterious nature of viruses through these relatable pictures:",
    items: [
      {
        id: "virus-file-flashdisk",
        term: "Sifat Aseluler Virus",
        scientificName: "Bukan Sel Hidup Mandiri",
        analogyTitle: "File Malware Tanpa Komputer",
        emoji: "💾",
        story: "Virus itu bukan makhluk hidup mandiri karena tidak punya mesin sel atau metabolisme. Dia ibarat file malware di dalam flashdisk: saat tergeletak di meja, dia benda mati pasif. Tapi begitu dicolokkan ke komputer inang (sel hidup), barulah kode jahatnya bekerja membajak seluruh sistem.",
        termEn: "Acellular Nature of Viruses",
        analogyTitleEn: "Malware File Without a Computer",
        storyEn: "A virus isn't a standalone living creature because it lacks cellular machinery. It's like malware on a flash drive: completely inert when sitting on a desk, but hijack-capable the moment it enters a host computer.",
      },
      {
        id: "litik-lisogenik",
        term: "Daur Litik vs Lisogenik",
        scientificName: "Siklus Replikasi Virus",
        analogyTitle: "Perampok Kasar vs Mata-mata Tidur",
        emoji: "🕵️",
        story: "Daur litik itu seperti perampok terang-terangan yang mendobrak masuk, merampok bahan sel untuk merakit virus baru, lalu meledakkan rumahnya seketika. Daur lisogenik itu seperti agen mata-mata rahasia yang menyusup tenang dan ikut hidup di DNA inang bertahun-tahun tanpa gejala, sampai suatu hari kondisi inang melemah baru dia bangun meledakkan sel.",
        termEn: "Lytic vs Lysogenic Cycle",
        analogyTitleEn: "Smash-and-Grab Robber vs Sleeper Agent Spy",
        storyEn: "The lytic cycle is a smash-and-grab raid that forces the cell to produce viruses and bursts it open. The lysogenic cycle is a sleeper agent quietly inserting its code into the host DNA for years, waiting for immunity to drop before striking.",
      },
    ],
  },

  // ──────────────────────────────────────────
  // BAB SISTEM PENCERNAAN MANUSIA
  // ──────────────────────────────────────────
  {
    babId: "pencernaan",
    subKey: "sub.pencernaan1",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami struktur saluran pencernaan atas dan mekanismenya lewat analogi sehari-hari:",
    subtitleEn: "Understand upper digestive organs and mechanisms through everyday analogies:",
    items: [
      {
        id: "dinding-jaket-4-lapis",
        term: "4 Lapisan Dinding Saluran Cerna",
        scientificName: "Mukosa, Submukosa, Muskularis, Serosa",
        analogyTitle: "Jaket Militer 4 Lapis Taktis",
        emoji: "🧥",
        story: "Saluran cerna dibangun dari 4 lapisan seperti jaket militer canggih: lapisan paling dalam (Mukosa) adalah kain halus basah tahan gesekan bolus makanan; lapisan kedua (Submukosa) adalah lapisan spons berisi kabel saraf dan pipa darah penyuplai logistik; lapisan ketiga (Muskularis) adalah serat otot dinamis penggerak remasan; dan lapisan luar (Serosa) adalah jas hujan licin berpelumas agar usus tidak lecet bergesekan dengan dinding perut saat bergerak.",
        termEn: "4 Digestive Wall Layers",
        analogyTitleEn: "4-Layer Tactical Military Jacket",
        storyEn: "The gut wall is built like a 4-layer tactical coat: Mucosa (inner moist lining resisting friction), Submucosa (sponge layer carrying nerve wires and blood logistics), Muscularis (muscle engines churning food), and Serosa (lubricated outer slicker preventing organ chafing).",
      },
      {
        id: "epiglotis-palang-kereta",
        term: "Katup Epiglotis",
        scientificName: "Refleks Penutup Jalur Laring",
        analogyTitle: "Palang Pintu Perlintasan Kereta Api Otomatis",
        emoji: "🚧",
        story: "Tenggorokan kita punya persimpangan bercabang dua: jalur napas (trakea) di depan dan jalur makanan (esofagus) di belakang. Epiglotis bekerja seperti palang otomatis: begitu ada bolus makanan mau meluncur, epiglotis langsung menutup lubang trakea rapat-rapat. Kalau kamu makan sambil tertawa atau berbicara tergesa-gesa, palang terlambat turun, makanan nyasar ke jalur napas, dan tubuh langsung memicu batuk tersedak berdaya semprot tinggi untuk mementalkannya keluar!",
        termEn: "Epiglottis Valve",
        analogyTitleEn: "Automatic Railway Crossing Gate",
        storyEn: "Our pharynx is a fork with an airway (trachea) in front and a foodway (esophagus) behind. The epiglottis functions as an automatic crossing gate: when food slides down, it shuts tight over the trachea. Laughing or talking while swallowing delays the gate, causing food to slip into the airway and triggering an explosive coughing reflex!",
      },
      {
        id: "peristaltik-odol",
        term: "Gerak Peristaltik Esofagus",
        scientificName: "Kontraksi Koordinasi Otot Sirkuler & Longitudinal",
        analogyTitle: "Memijat Pasta Gigi dari Pangkal Bawah",
        emoji: "🪥",
        story: "Esofagus bukan sekadar pipa paralon seluncuran gravitasi. Dindingnya memijat makanan dengan gelombang ritmis: otot melingkar di belakang makanan menjepit kuat, sementara otot memanjang di depan mengembang. Prinsipnya persis saat kamu memijat pasta gigi dari ujung pangkal ke mulut tube. Karena dorongan aktif terkoordinasi ini, astronot di stasiun luar angkasa tanpa gravitasi atau bahkan kamu yang sedang bersandar terbalik tetap bisa menelan makanan hingga sampai ke lambung.",
        termEn: "Esophageal Peristalsis",
        analogyTitleEn: "Squeezing Toothpaste from the Base",
        storyEn: "The esophagus isn't just a passive gravity slide. Circular muscles contract behind the bolus while longitudinal muscles expand ahead, squeezing food onward like pushing toothpaste from tube base to nozzle. Thanks to this active wave, astronauts in zero gravity or people hanging upside down can still swallow food straight to the stomach.",
      },
    ],
  },
  {
    babId: "pencernaan",
    subKey: "sub.pencernaan2",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami kehebatan kimiawi lambung dan kelenjar aksesori lewat perumpamaan berikut:",
    subtitleEn: "Grasp gastric biochemistry and accessory glands through relatable comparisons:",
    items: [
      {
        id: "mukus-lambung-jas-lab",
        term: "Mukus Pelindung Lambung",
        scientificName: "Gastric Mucosal Barrier & Bikarbonat",
        analogyTitle: "Jas Laboratorium Anti-Asam Korosif",
        emoji: "🥼",
        story: "Asam lambung (HCl) ber-pH 1–2 punya keasaman yang cukup pekat untuk membunuh kuman dan melarutkan logam runcing. Lalu kenapa dinding lambung yang terbuat dari protein daging tidak hancur tercerna sendiri? Karena sel goblet lambung menggelar karpet gel mukus tebal yang kaya ion bikarbonat (alkali). Lapisan ini ibarat jas lab tebal tahan asam dan tameng penetral yang membuat pH tepat di permukaan sel epitel lambung tetap berada di zona aman netral (pH ~7).",
        termEn: "Gastric Mucus Barrier",
        analogyTitleEn: "Corrosive-Resistant Laboratory Suit",
        storyEn: "Stomach acid (pH 1–2) is strong enough to destroy pathogens and dissolve iron. Why doesn't the stomach digest its own protein tissues? Goblet cells spread a dense mucus carpet enriched with neutralizing alkaline bicarbonate, shielding epithelial cells at a safe neutral pH 7.",
      },
      {
        id: "empedu-sabun-cuci",
        term: "Garam Empedu Hati",
        scientificName: "Emulsifikasi Lemak (Misel)",
        analogyTitle: "Sabun Cuci Piring Penghancur Lemak Panci",
        emoji: "🧼",
        story: "Pernahkah kamu mencoba membersihkan wajan penuh mentega tebal hanya dengan air biasa? Minyak tidak akan pernah bercampur dengan air. Enzim lipase pankreas hanya bisa bekerja di medium air. Di sinilah peran empedu hati: garam empedu memiliki bagian hidrofilik (suka air) dan hidrofobik (suka lemak), persis sabun cuci piring! Dia memecah gumpalan lemak raksasa menjadi butiran misel mikroskopis sehingga lipase bisa menyerbu dan mencerna lemak dengan kecepatan maksimal.",
        termEn: "Liver Bile Salts",
        analogyTitleEn: "Dishwashing Soap Cutting Through Grease",
        storyEn: "Trying to clean a greasy frying pan with only water fails because oil repels water. Pancreatic lipase operates only in an aqueous medium. Bile salts act just like dish soap: their amphiphilic molecules disperse giant lipid droplets into tiny micelle droplets, giving lipase maximum surface area to hydrolyze fats.",
      },
      {
        id: "zimogen-granat-terkunci",
        term: "Enzim Zimogen (Proenzim)",
        scientificName: "Pepsinogen & Tripsinogen",
        analogyTitle: "Granat Tangan dengan Pin Pengaman Terkunci",
        emoji: "💣",
        story: "Sel lambung dan pankreas penghasil enzim pencerna protein juga tersusun dari protein. Kalau enzim protease dibuat langsung dalam kondisi aktif, sel pembuatnya bakal hancur lebur bunuh diri! Solusi cerdas tubuh: enzim dibuat dalam bentuk 'zimogen' (inaktif), ibarat granat yang pin pengamannya masih terpasang kuat. Begitu disemprotkan ke rongga luar (lumen lambung atau usus), barulah asam HCl atau enterokinase mencabut pin tersebut dan mengaktifkannya menjadi mesin penghancur makanan.",
        termEn: "Zymogen Enzymes (Proenzymes)",
        analogyTitleEn: "Hand Grenade with Locked Safety Pin",
        storyEn: "Stomach and pancreas cells consist of protein. If protein-digesting proteases were produced fully active, they would destroy the cells that made them! The body smartly manufactures them as inactive zymogens with locked safety pins, only unlocking them via HCl or enterokinase once safe inside the digestive lumen.",
      },
    ],
  },
  {
    babId: "pencernaan",
    subKey: "sub.pencernaan3",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami penyerapan usus halus, sistem saraf enterik, dan mikrobiota usus:",
    subtitleEn: "Grasp intestinal absorption, enteric nervous coordination, and gut microbiome:",
    items: [
      {
        id: "vili-handuk-microfiber",
        term: "Vili & Mikrovili Usus Halus",
        scientificName: "Brush Border & Lipatan Permukaan",
        analogyTitle: "Handuk Microfiber Berbulu Lebat Super Serap",
        emoji: "🧖",
        story: "Jika usus halus sepanjang 6 meter hanya berbentuk pipa paralon polos tanpa lipatan, sari makanan akan meluncur lewat begitu saja tanpa sempat terserap. Namun dinding usus halus dilengkapi lipatan sirkuler, jutaan jonjot vili, dan 3.000 mikrovili per sel. Bayangkan selembar kain plastik tipis vs handuk microfiber berbulu super tebal: handuk berbulu mampu menyerap air puluhan kali lipat karena luas permukaannya luar biasa! Lipatan usus manusia jika dibentangkan utuh mencapai ~200 m², seluas lapangan tenis!",
        termEn: "Intestinal Villi & Microvilli",
        analogyTitleEn: "Plush High-Absorbency Microfiber Towel",
        storyEn: "If the 6-meter small intestine were a smooth pipe, nutrients would rush through unabsorbed. Instead, it is packed with circular folds, millions of villi, and 3,000 microvilli per enterocyte. Like a plush microfiber towel absorbing far more moisture than flat plastic, this architecture expands absorption area to 200 m²—the size of a tennis court!",
      },
      {
        id: "ens-otak-kedua",
        term: "Sistem Saraf Enterik (ENS)",
        scientificName: "Pleksus Auerbach & Pleksus Meissner",
        analogyTitle: "Komputer Autopilot Pintar di Dalam Perut",
        emoji: "🧠",
        story: "Pernah dengar istilah 'otak kedua' (the second brain)? Saluran cerna manusia memiliki lebih dari 500 juta neuron yang tertanam di dindingnya (ENS). ENS ibarat sistem autopilot pada pesawat jet: saat bolus makanan datang meregangkan dinding usus (stimulus internal), ENS langsung mengomandoi gerakan peristaltik dan sekresi enzim secara mandiri tanpa perlu menunggu perintah dari otak di kepala. Hubungan dua arah usus-otak (Gut-Brain Axis) juga menjelaskan mengapa saat kamu cemas atau gugup menghadapi ujian, perutmu bisa tiba-tiba mulas melilit!",
        termEn: "Enteric Nervous System (ENS)",
        analogyTitleEn: "Intelligent Autopilot Computer in the Gut",
        storyEn: "Known as the 'second brain', our gut houses over 500 million neurons in the Auerbach and Meissner plexuses. ENS acts like an autopilot: when food distends the lumen, it autonomously orchestrates peristalsis and enzyme flow without waiting for cranial orders. The gut-brain axis also explains why anxiety and stress instantly cause gut churns!",
      },
      {
        id: "mikrobiota-pabrik-daur-ulang",
        term: "Mikrobiota Usus Besar",
        scientificName: "Flora Normal Kolon (Bifidobacterium & Bacteroides)",
        analogyTitle: "Pabrik Daur Ulang & Petani Simbiosis",
        emoji: "🌱",
        story: "Serat makanan (selulosa sayur & buah) tidak bisa dicerna oleh enzim manusia dan akan lolos ke usus besar. Di sana, triliunan mikroba baik menyambut serat tersebut sebagai bahan baku daur ulang. Mereka memfermentasi serat menjadi Asam Lemak Rantai Pendek (SCFA) yang menutrisi sel usus, memproduksi vitamin K (pembeku darah) dan biotin, serta menduduki dinding usus agar bakteri jahat patogen tidak punya tempat untuk menempel.",
        termEn: "Gut Microbiome",
        analogyTitleEn: "Recycling Plant & Symbiotic Farmers",
        storyEn: "Human enzymes cannot break down vegetable dietary fiber. In the colon, trillions of symbiotic microflora ferment this fiber into beneficial short-chain fatty acids, synthesize vitamin K and biotin, and occupy binding sites to prevent pathogenic bacterial invasion.",
      },
    ],
  },
  {
    babId: "pencernaan",
    subKey: "sub.pencernaan4",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami rute logistik penyerapan nutrisi dan peran mikronutrien tubuh:",
    subtitleEn: "Understand nutrient absorption transport routes and vital micronutrient roles:",
    items: [
      {
        id: "dua-jalur-tol-darah-limfe",
        term: "2 Jalur Distribusi Nutrisi",
        scientificName: "Vena Porta Hepatika vs Pembuluh Lakteal",
        analogyTitle: "Jalur Tol Darat (Expressway) vs Jalur Kargo Kapal Kontainer",
        emoji: "🚢",
        story: "Nutrisi yang diserap vili usus dibagi menjadi dua jalur logistik: Nutrien larut air (glukosa, asam amino, vitamin B/C) ibarat mobil cepat di jalur tol darat, langsung diserap ke kapiler darah dan disaring ketat di hati (pos bea cukai metabolisme). Sebaliknya, lemak dan vitamin larut lemak (A, D, E, K) dirakit menjadi paket kargo besar (kilomikron) yang terlalu gemuk untuk masuk kapiler darah. Mereka harus naik 'kapal kontainer' lewat pembuluh limfe (lakteal) yang berujung ke pembuluh balik dada (duktus torasikus) sebelum akhirnya bersatu dengan aliran darah.",
        termEn: "2 Nutrient Transport Routes",
        analogyTitleEn: "Expressway Highway vs Cargo Container Barge",
        storyEn: "Water-soluble nutrients (glucose, amino acids, vitamins B/C) travel via the blood expressway straight through liver customs for immediate processing. Bulky lipid packages (chylomicrons) are too large for blood capillaries and must board lymphatic container barges (lacteals) through the thoracic duct into circulation.",
      },
      {
        id: "vitamin-mineral-oli-mesin",
        term: "Vitamin & Mineral Esensial",
        scientificName: "Mikronutrien Koenzim & Kofaktor Enzim",
        analogyTitle: "Oli Pelumas Mesin & Busi Pengapian Mobil Balap",
        emoji: "🏎️",
        story: "Karbohidrat, protein, dan lemak adalah bensin dan rangka bodi mobil balap. Namun tanpa oli pelumas mesin (vitamin) dan busi pengapian listrik (mineral), mobil bertenaga super itu tidak akan pernah bisa menyala! Vitamin bertindak sebagai koenzim yang memicu pembakaran energi seluler, sementara mineral seperti kalsium, magnesium, dan kalium menjadi konduktor listrik penentu detak jantung dan kontraksi otot.",
        termEn: "Essential Vitamins & Minerals",
        analogyTitleEn: "Engine Lubricant & Spark Plugs of a Racing Car",
        storyEn: "Carbs, proteins, and fats are the fuel and chassis of a race car. But without engine lubricant (vitamins) and electric spark plugs (minerals), the supercar cannot even start! Vitamins act as metabolic coenzymes, while minerals conduct cellular electrical impulses for heartbeats and muscle contractions.",
      },
    ],
  },
  {
    babId: "pencernaan",
    subKey: "sub.pencernaan5",
    title: "Ibaratnya Begini 💡",
    titleEn: "Picture It Like This 💡",
    subtitle: "Pahami patofisiologi gangguan pencernaan dan intervensi medis klinis:",
    subtitleEn: "Understand clinical digestive pathophysiology and medical interventions:",
    items: [
      {
        id: "diare-sprinkler-kebakaran",
        term: "Diare Akibat Kapsaisin / Toksin",
        scientificName: "Hipermotilitas & Hipersekresi Protektif",
        analogyTitle: "Sistem Alarm & Sprinkler Semprot Air Darurat",
        emoji: "🚨",
        story: "Saat kamu makan cabai ekstra pedas atau makanan terkontaminasi toksin bakteri, zat kimia kapsaisin mengaktifkan sensor nyeri TRPV1 di usus. Usus membacanya sebagai ancaman zat korosif beracun! Seperti gedung mendeteksi asap, sistem saraf enterik membunyikan alarm darurat: usus memompa air dan elektrolit secara masif ke dalam rongga usus (menyalakan sprinkler) dan memicu peristaltik super kilat (evakuasi darurat) untuk membilas dan menyemburkan zat pengiritasi tersebut keluar secepatnya. Diare dalam konteks ini adalah mekanisme pertahanan hidup tubuh!",
        termEn: "Diarrhea via Capsaicin / Toxins",
        analogyTitleEn: "Fire Alarm & Emergency Water Sprinkler System",
        storyEn: "Consuming heavy capsaicin or bacterial toxins activates intestinal TRPV1 pain sensors. The gut perceives this as toxic invasion! Just like a building fire sprinkler, the enteric system floods the lumen with water and triggers hyper-peristalsis to flush out irritants as fast as possible—a lifesaving defense mechanism!",
      },
      {
        id: "apendisitis-saluran-buntu",
        term: "Apendisitis (Radang Usus Buntu)",
        scientificName: "Obstruksi Lumen Apendiks oleh Fekalit",
        analogyTitle: "Pipa Buntu yang Tersumbat Feses Membatu",
        emoji: "⚠️",
        story: "Banyak orang percaya mitos bahwa biji jambu atau cabai menyebabkan radang usus buntu. Padahal secara klinis, apendisitis paling sering disebabkan oleh 'fekalit' (gumpalan feses kecil yang mengeras dan membatu seperti kerikil) yang menyumbat muara sempit apendiks vermiformis. Karena lumennya tersumbat buntu, mukus yang terus diproduksi tidak bisa keluar, tekanan di dalam membengkak, pembuluh darah terjepit mati, dan bakteri anaerob berkembang biak liar hingga dinding apendiks terancam pecah (perforasi).",
        termEn: "Appendicitis",
        analogyTitleEn: "Dead-End Pipe Blocked by Hardened Stone",
        storyEn: "Contrary to the myth of guava seeds, appendicitis is overwhelmingly triggered by fecaliths (calcified hard fecal stones) blocking the narrow appendix opening. Trapped mucus inflates internal pressure, cuts off blood supply, and invites bacterial proliferation, threatening organ perforation.",
      },
      {
        id: "bariatrik-renovasi-dapur",
        term: "Bedah Bariatrik Lambung",
        scientificName: "Sleeve Gastrectomy & Supresi Ghrelin",
        analogyTitle: "Renovasi Pengecilan Dapur Restoran & Memecat Kurir Lapar",
        emoji: "✂️",
        story: "Operasi sleeve gastrectomy memotong 75-80% kantung lambung, ibarat merombak gudang restoran raksasa menjadi dapur mini yang hanya memuat satu mangkuk sup kecil. Yang lebih revolusioner adalah efek hormonalnya: dengan memotong bagian fundus, tubuh memecat 'kurir lapar' (hormon ghrelin) sehingga sinyal lapar ke otak turun drastis, membuat pasien lekas kenyang dan berat badan turun teratur.",
        termEn: "Bariatric Gastric Surgery",
        analogyTitleEn: "Downsizing the Kitchen & Firing the Hunger Courier",
        storyEn: "Sleeve gastrectomy resects 75-80% of the stomach, turning a massive warehouse into a micro-kitchen. Crucially, excising the fundus eliminates ghrelin-producing cells, effectively firing the 'hunger courier' to the hypothalamus and curbing appetite.",
      },
    ],
  },
];

export function getAnalogiForSub(babId: string, subKey?: string, subIdx?: number): AnalogiGroup | null {
  if (!babId) return null;
  // Match by babId and subKey
  if (subKey) {
    const found = ANALOGI_DATABASE.find(
      (g) => g.babId === babId && (g.subKey === subKey || g.subKey === `sub.${babId}${subIdx !== undefined ? subIdx + 1 : ""}`)
    );
    if (found) return found;
  }
  // Fallback by index sub.<babId><idx+1>
  if (subIdx !== undefined) {
    const fallbackKey = `sub.${babId}${subIdx + 1}`;
    const found = ANALOGI_DATABASE.find((g) => g.babId === babId && g.subKey === fallbackKey);
    if (found) return found;
  }
  return null;
}
