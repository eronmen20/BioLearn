const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log("Seeding Bab Virus to Supabase...");

  // 1. Update / Upsert Bab Virus
  const { error: babError } = await supabase.from("bab").upsert({
    id: "virus",
    icon: "🧫",
    color: "#a29bfe",
    is_archived: false,
    archived_at: null,
    kelas_id: "x",
    video_id: null,
    video_title_id: "Struktur dan Replikasi Virus",
    video_title_en: "Virus Structure and Replication",
    hotspotted: "virus",
    capaian_id:
      "Peserta didik mampu menganalisis struktur virus, mekanisme reproduksi (siklus litik dan lisogenik), dasar klasifikasi virus, serta mengevaluasi peranan virus yang menguntungkan dan merugikan bagi kehidupan.",
    capaian_en:
      "Students are able to analyze virus structure, reproduction mechanisms (lytic and lysogenic cycles), virus classification criteria, and evaluate the beneficial and harmful roles of viruses in life.",
    tujuan_id:
      "1. Menjelaskan sejarah penemuan virus dan ciri-ciri pembeda virus dari sel hidup.\n2. Mengidentifikasi struktur tubuh virus bakteriofag dan fungsinya.\n3. Membandingkan tahapan reproduksi virus pada siklus litik dan siklus lisogenik.\n4. Mengklasifikasikan virus berdasarkan asam nukleat, morfologi, ukuran, dan taksonomi ICTV.\n5. Menganalisis peranan virus yang menguntungkan serta penyakit yang ditimbulkan pada manusia, hewan, dan tumbuhan.",
    tujuan_en:
      "1. Explain the discovery history and unique traits distinguishing viruses from cellular life.\n2. Identify bacteriophage anatomical structures and their functions.\n3. Compare sequential stages of lytic and lysogenic replication cycles.\n4. Classify viruses based on nucleic acids, morphology, size, and ICTV taxonomy.\n5. Analyze beneficial viral applications and diseases caused in humans, animals, and plants.",
  });
  if (babError) throw new Error("Bab upsert failed: " + babError.message);
  console.log("✓ Bab 'virus' updated & unarchived.");

  // 2. Clear old data for virus
  await supabase.from("sub_bab_quiz").delete().eq("bab_id", "virus");
  await supabase.from("materi").delete().eq("bab_id", "virus");
  await supabase.from("sub_bab").delete().eq("bab_id", "virus");
  console.log("✓ Old sub_bab, materi, and quiz cleared.");

  // 3. Insert 6 Sub-Bab
  const subBabs = [
    {
      bab_id: "virus",
      key: "sub.virus1",
      sort_order: 1,
      title_id: "Sejarah Virus",
      title_en: "History of Viruses",
      summary_id:
        "Sejarah penemuan virus diawali dari penelitian penyakit mosaik tembakau (1883) oleh Adolf Mayer, dilanjutkan Dmitri Ivanovsky, Martinus Beijerinck, hingga Wendell Stanley yang berhasil mengkristalkan TMV.",
      summary_en:
        "The history of virus discovery began with tobacco mosaic disease research (1883) by Adolf Mayer, followed by Dmitri Ivanovsky, Martinus Beijerinck, and Wendell Stanley who crystallized TMV.",
      hook_id: "Dari getah tembakau hingga kristal TMV",
      hook_en: "From tobacco sap to TMV crystals",
    },
    {
      bab_id: "virus",
      key: "sub.virus2",
      sort_order: 2,
      title_id: "Ciri-Ciri Virus",
      title_en: "Characteristics of Viruses",
      summary_id:
        "Virus memiliki ciri khas unik di antara benda mati dan makhluk hidup: berukuran sangat kecil (20–300 nm), aseluler, parasit intraseluler obligat, materi genetik tunggal (DNA atau RNA), dan dapat dikristalkan.",
      summary_en:
        "Viruses possess unique traits bridging non-living matter and living organisms: extremely small (20–300 nm), acellular, obligate intracellular parasites, single nucleic acid type (DNA or RNA), and can be crystallized.",
      hook_id: "Di antara benda mati dan makhluk hidup",
      hook_en: "Bridging non-living matter and living organisms",
    },
    {
      bab_id: "virus",
      key: "sub.virus3",
      sort_order: 3,
      title_id: "Struktur dan Fungsi Virus",
      title_en: "Structure and Function of Viruses",
      summary_id:
        "Tubuh virus bakteriofag T tersusun atas kepala dengan kapsid (kapsomer) pelindung asam nukleat, selubung ekor, lempeng dasar dengan jarum penusuk, dan serabut ekor.",
      summary_en:
        "A T-bacteriophage body consists of a head with a capsid (capsomeres) enclosing nucleic acid, a tail sheath, a base plate with an injection pin, and tail fibers.",
      hook_id: "Kapsid, genom, sampul, dan ekor",
      hook_en: "Capsid, genome, envelope, and tail",
    },
    {
      bab_id: "virus",
      key: "sub.virus4",
      sort_order: 4,
      title_id: "Cara Hidup dan Reproduksi Virus",
      title_en: "Life Cycle and Reproduction of Viruses",
      summary_id:
        "Sebagai parasit intraseluler obligat, virus bereproduksi di dalam sel inang spesifik melalui siklus litik (sel pecah menghasilkan virion baru) atau siklus lisogenik (membentuk profag yang diwariskan ke sel anakan).",
      summary_en:
        "As obligate intracellular parasites, viruses replicate inside specific host cells via either the lytic cycle (bursting the host to release virions) or the lysogenic cycle (forming an inherited prophage).",
      hook_id: "Lock and key: litik vs lisogenik",
      hook_en: "Lock and key: lytic vs lysogenic",
    },
    {
      bab_id: "virus",
      key: "sub.virus5",
      sort_order: 5,
      title_id: "Bentuk dan Klasifikasi Virus",
      title_en: "Shapes and Classification of Viruses",
      summary_id:
        "Klasifikasi virus didasarkan pada asam nukleat (DNA/RNA), ukuran, morfologi simetri, dan taksonomi ICTV (famili -viridae, genus -virus, spesies kata bahasa Inggris -virus).",
      summary_en:
        "Virus classification is based on nucleic acid (DNA/RNA), size, symmetry morphology, and ICTV taxonomy (family -viridae, genus -virus, English species name -virus).",
      hook_id: "Simetri, morfologi, dan taksonomi ICTV",
      hook_en: "Symmetry, morphology, and ICTV taxonomy",
    },
    {
      bab_id: "virus",
      key: "sub.virus6",
      sort_order: 6,
      title_id: "Peranan Virus dalam Kehidupan",
      title_en: "Roles of Viruses in Life",
      summary_id:
        "Virus berperan menguntungkan dalam rekayasa genetika (terapi gen), vaksin, dan bioinsektisida; namun juga menyebabkan berbagai penyakit infeksi pada manusia, hewan, dan tumbuhan.",
      summary_en:
        "Viruses have beneficial roles in genetic engineering (gene therapy), vaccines, and bioinsecticides; however, they also cause critical infectious diseases in humans, animals, and crops.",
      hook_id: "Vaksin di satu sisi, penyakit di sisi lain",
      hook_en: "Vaccines on one side, diseases on the other",
    },
  ];

  const { error: subError } = await supabase.from("sub_bab").insert(subBabs);
  if (subError) throw new Error("Sub bab insert failed: " + subError.message);
  console.log("✓ 6 sub_bab inserted.");

  // 4. Insert Materi HTML
  const materiList = [
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus1",
      sort_order: 1,
      type: "html",
      metadata: {
        title_id: "Sejarah Virus",
        title_en: "History of Viruses",
        video_url: "",
      },
      summary_id:
        "Virus pertama diselidiki pada penyakit mosaik tembakau (1883). Mayer menduga bakteri sangat kecil; Ivanovsky membuktikan agen lolos saringan bakteri; Beijerinck menyebutnya virus lolos saring; Stanley (1935) mengkristalkan TMV.",
      summary_en:
        "Viruses were first investigated in tobacco mosaic disease (1883). Mayer suspected tiny bacteria; Ivanovsky proved the agent passed bacterial filters; Beijerinck called it a filterable virus; Stanley (1935) crystallized TMV.",
      content_id: `<section class="space-y-4">
  <h3>Awal Penemuan Virus</h3>
  <p>
    Kata <strong>virus</strong> berasal dari bahasa Latin <em>virion</em> yang berarti racun. Penemuan virus bermula pada akhir abad ke-19 dari penelitian penyakit misterius yang menyebabkan bercak-bercak kuning pada daun tembakau (penyakit mosaik tembakau).
  </p>

  <div class="card p-4 rounded-xl border border-border-light bg-card my-3">
    <h4 class="font-bold text-accent mb-1">1. Adolf Mayer (1883)</h4>
    <p>
      Mayer, ilmuwan Jerman, meneliti penyakit mosaik yang menghambat pertumbuhan daun tembakau. Ia mengekstrak getah dari tanaman sakit lalu menyemprotkannya ke tanaman tembakau sehat. Hasilnya, tanaman sehat ikut terjangkit penyakit yang sama. Ketika diamati di bawah mikroskop cahaya, ia tidak menemukan mikroorganisme penyebabnya. Mayer menyimpulkan bahwa penyakit disebabkan oleh bakteri yang berukuran jauh lebih kecil dari biasanya.
    </p>
  </div>

  <div class="card p-4 rounded-xl border border-border-light bg-card my-3">
    <h4 class="font-bold text-accent mb-1">2. Dmitri Ivanovsky (1892)</h4>
    <p>
      Ilmuwan asal Rusia ini menguji getah tanaman tembakau terinfeksi dengan menyaringnya menggunakan filter porselen Chamberland-Pasteur (saringan khusus berpori sangat halus penahan bakteri). Filtrat hasil saringan ternyata masih mampu menginfeksi tanaman tembakau sehat. Ivanovsky berkesimpulan penyakit disebabkan oleh bakteri patogenik berukuran sangat renik atau toksin bakteri yang mampu lolos dari saringan.
    </p>
  </div>

  <div class="card p-4 rounded-xl border border-border-light bg-card my-3">
    <h4 class="font-bold text-accent mb-1">3. Martinus Beijerinck (1897)</h4>
    <p>
      Ahli mikrobiologi Belanda ini membuktikan bahwa agen penginfeksi tersebut mampu <strong>bereplikasi</strong>: getah tanaman sakit disaring, lalu disemprotkan ke tanaman sehat; getah tanaman yang baru sakit diambil lagi dan disaring untuk menginfeksi tanaman berikutnya secara berulang (infeksi berseri). Daya infeksinya terbukti tidak melemah sama sekali. Agen tersebut tidak bisa dibiakkan pada medium agar cawan petri dan tahan terhadap alkohol. Beijerinck menyimpulkan bahwa agen ini adalah partikel hidup cair yang lebih kecil dan sederhana dari bakteri, dan ia menyebutnya <strong>virus lolos saring (filterable virus)</strong>.
    </p>
  </div>

  <div class="card p-4 rounded-xl border border-border-light bg-card my-3">
    <h4 class="font-bold text-accent mb-1">4. Wendell Stanley (1935)</h4>
    <p>
      Ilmuwan asal Amerika Serikat ini berhasil <strong>mengkristalkan partikel penginfeksi tembakau</strong> tersebut, yang kini dikenal sebagai <em>Tobacco Mosaic Virus (TMV)</em>. Temuan Stanley menggemparkan komunitas sains karena kemampuan mengkristal merupakan sifat khas benda mati, namun partikel kristal tersebut tetap dapat menimbulkan infeksi ketika diinokulasikan kembali ke tanaman tembakau.
    </p>
  </div>
</section>`,
      content_en: `<section class="space-y-4">
  <h3>The Discovery of Viruses</h3>
  <p>
    The word <strong>virus</strong> originates from the Latin <em>virion</em> meaning poison. Viral history began in the late 19th century with the study of a mysterious disease producing mottled yellow spots on tobacco foliage (tobacco mosaic disease).
  </p>

  <div class="card p-4 rounded-xl border border-border-light bg-card my-3">
    <h4 class="font-bold text-accent mb-1">1. Adolf Mayer (1883)</h4>
    <p>
      Mayer, a German scientist, examined mosaic disease stunting tobacco leaf growth. He extracted sap from diseased plants and sprayed it onto healthy tobacco, reproducing the disease. Observing under a light microscope revealed no bacterial agents. Mayer hypothesized that an unusually small bacterium was responsible.
    </p>
  </div>

  <div class="card p-4 rounded-xl border border-border-light bg-card my-3">
    <h4 class="font-bold text-accent mb-1">2. Dmitri Ivanovsky (1892)</h4>
    <p>
      Russian scientist Dmitri Ivanovsky passed infected tobacco sap through porcelain Chamberland-Pasteur filters designed to retain bacteria. The clear filtrate still infected healthy plants. He deduced that either microscopic bacteria capable of passing filters or soluble bacterial toxins caused the disease.
    </p>
  </div>

  <div class="card p-4 rounded-xl border border-border-light bg-card my-3">
    <h4 class="font-bold text-accent mb-1">3. Martinus Beijerinck (1897)</h4>
    <p>
      Dutch microbiologist Martinus Beijerinck showed that the infective agent could replicate: serial transfers of filtered sap from diseased plant to plant retained unattenuated pathogenicity. The agent could not grow on agar nutrients in petri dishes and survived alcohol exposure. Beijerinck concluded it was simpler and smaller than bacteria, designating it a <strong>filterable virus</strong> (<em>contagium vivum fluidum</em>).
    </p>
  </div>

  <div class="card p-4 rounded-xl border border-border-light bg-card my-3">
    <h4 class="font-bold text-accent mb-1">4. Wendell Stanley (1935)</h4>
    <p>
      American scientist Wendell Stanley succeeded in <strong>crystallizing the tobacco mosaic infectious particle</strong>, now designated <em>Tobacco Mosaic Virus (TMV)</em>. Crystallization is a signature feature of inanimate matter, yet upon contact with a living host, TMV retained full infectivity.
    </p>
  </div>
</section>`,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus2",
      sort_order: 2,
      type: "html",
      metadata: {
        title_id: "Ciri-Ciri Virus",
        title_en: "Characteristics of Viruses",
        video_url: "",
      },
      summary_id:
        "Virus berada di antara benda mati dan makhluk hidup: berukuran 20–300 nm, aseluler, parasit intraseluler obligat, materi genetik tunggal (DNA atau RNA), dapat dikristalkan, dan resisten terhadap antibiotik.",
      summary_en:
        "Viruses bridge inanimate and living states: 20–300 nm, acellular, obligate intracellular parasites, single nucleic acid type (DNA or RNA), crystallizable, and resistant to antibiotics.",
      content_id: `<section class="space-y-4">
  <h3>Karakteristik Unik Virus</h3>
  <p>
    Virus tidak dimasukkan ke dalam sistem klasifikasi 5 maupun 6 kingdom makhluk hidup karena memiliki sifat unik yang merupakan perpaduan antara benda mati (abiotik) dan makhluk hidup (biotik).
  </p>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-emerald-600 mb-2">🌿 Karakteristik Seperti Makhluk Hidup</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Memiliki materi genetik (asam nukleat berupa DNA atau RNA).</li>
        <li>Mampu bereplikasi dan memperbanyak diri (hanya di dalam sel inang hidup).</li>
        <li>Dapat mengalami mutasi genetik dan berevolusi merespons seleksi inang.</li>
        <li>Mampu merespons reseptor spesifik pada permukaan sel inang.</li>
      </ul>
    </div>
    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-amber-600 mb-2">💎 Karakteristik Seperti Benda Mati</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li><strong>Aseluler:</strong> Tidak berupa sel (tidak memiliki membran sel, sitoplasma, inti, atau organel metabolisme).</li>
        <li>Dapat <strong>dikristalkan</strong> dan disimpan dalam jangka waktu lama tanpa kehilangan sifat patogennya.</li>
        <li>Tidak memiliki sistem metabolisme mandiri (tidak menghasilkan ATP dan tidak melakukan sintesis protein sendiri).</li>
      </ul>
    </div>
  </div>

  <h3>Ciri-Ciri Utama Virus:</h3>
  <ul class="list-disc list-inside space-y-2">
    <li>
      <strong>Ukuran Sangat Renik:</strong> Berdiameter antara <strong>0,02–0,3 μm (20–300 nm)</strong>. Virus terkecil (seperti Poliovirus ≈ 20 nm) lebih kecil dari ribosom, sedangkan virus terbesar (seperti Poxvirus ≈ 200–300 nm) hampir mendekati ukuran bakteri terkecil. Hanya dapat divisualisasikan menggunakan <strong>mikroskop elektron</strong>.
    </li>
    <li>
      <strong>Struktur Sederhana:</strong> Tubuh virus hanya tersusun atas selubung protein (<strong>kapsid</strong>) dan molekul asam nukleat pembawa genom.
    </li>
    <li>
      <strong>Hanya Satu Jenis Asam Nukleat:</strong> Genom virus hanya terdiri atas <strong>DNA atau RNA saja</strong>, tidak pernah keduanya sekaligus dalam satu virion.
    </li>
    <li>
      <strong>Parasit Intraseluler Obligat:</strong> Virus hanya aktif dan mampu bereproduksi jika menginfeksi sel hidup organisme inang yang spesifik. Di luar sel inang, partikel virus berstatus inaktif (virion bebas).
    </li>
    <li>
      <strong>Bentuk Bervariasi:</strong> Bentuk virus bermacam-macam, mulai dari heliks/batang (TMV), polihedral/ikosahedral (Adenovirus), bulat/sferis (Influenza, HIV, SARS-CoV-2), peluru (Rhabdovirus rabies), filamen (Ebola), hingga bentuk kompleks T (Bakteriofag).
    </li>
    <li>
      <strong>Resistensi Antibiotik:</strong> Antibiotik hanya menargetkan dinding sel atau ribosom bakteri dan <strong>sama sekali tidak berpengaruh terhadap virus</strong>. Aktivitas virus dapat diinaktivasi menggunakan radiasi ultraviolet (UV), sinar-X, dan disinfektan kimiawi (alkohol 70%, pemutih klorin).
    </li>
  </ul>
</section>`,
      content_en: `<section class="space-y-4">
  <h3>Unique Characteristics of Viruses</h3>
  <p>
    Viruses are excluded from the 5 and 6 kingdom classifications because they exhibit dual properties bridging inanimate matter (abiotic) and living systems (biotic).
  </p>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-emerald-600 mb-2">🌿 Living Characteristics</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li>Possess genetic material (nucleic acids in the form of DNA or RNA).</li>
        <li>Capable of replication and proliferation (strictly inside living host cells).</li>
        <li>Undergo genetic mutations and evolve under host immune pressure.</li>
        <li>Exhibit binding specificity toward host cell surface receptors.</li>
      </ul>
    </div>
    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-amber-600 mb-2">💎 Non-Living Characteristics</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li><strong>Acellular:</strong> Not organized into cells (lack plasma membrane, cytoplasm, nucleus, and organelles).</li>
        <li>Can be <strong>crystallized</strong> and stored indefinitely without losing viability.</li>
        <li>Lack independent metabolic pathways (generate no ATP and carry no translational machinery).</li>
      </ul>
    </div>
  </div>

  <h3>Key Viral Attributes:</h3>
  <ul class="list-disc list-inside space-y-2">
    <li>
      <strong>Submicroscopic Dimensions:</strong> Diameters range between <strong>0.02–0.3 μm (20–300 nm)</strong>. Tiny viruses (e.g. Poliovirus ≈ 20 nm) are smaller than eukaryotic ribosomes, whereas large poxviruses measure ≈ 200–300 nm. Visible strictly under <strong>transmission/scanning electron microscopes</strong>.
    </li>
    <li>
      <strong>Simplified Anatomy:</strong> An infectious virion comprises solely a protective protein shell (<strong>capsid</strong>) and an internal genome.
    </li>
    <li>
      <strong>Single Nucleic Acid Type:</strong> The genome is strictly composed of <strong>either DNA or RNA</strong>, never both simultaneously.
    </li>
    <li>
      <strong>Obligate Intracellular Parasites:</strong> Inactive outside living hosts (extracellular virions); biological replication occurs exclusively inside susceptible host cells.
    </li>
    <li>
      <strong>Morphological Diversity:</strong> Helical/rod (TMV), polyhedral/icosahedral (Adenovirus), spherical (Influenza, HIV, Coronaviruses), bullet-shaped (Rabies), filamentous (Ebola), and complex binal T-architectures (Bacteriophages).
    </li>
    <li>
      <strong>Antibiotic Insusceptibility:</strong> Antibiotics targeting bacterial walls or 70S ribosomes exert <strong>zero activity against viruses</strong>. Virions are inactivated by ultraviolet (UV) radiation, ionizing X-rays, and chemical antiseptics.
    </li>
  </ul>
</section>`,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus3",
      sort_order: 3,
      type: "html",
      metadata: {
        title_id: "Struktur dan Fungsi Virus",
        title_en: "Structure and Function of Viruses",
        video_url: "",
      },
      summary_id:
        "Virion lengkap bakteriofag T terdiri atas kapsid (kapsomer) pelindung genom DNA, selubung ekor berkontraksi, lempeng dasar dengan jarum penusuk, dan serabut ekor perlekatan. Beberapa virus memiliki sampul membran lipid (envelope).",
      summary_en:
        "A complete T-phage virion comprises a capsid (capsomeres) protecting the DNA genome, a contractile tail sheath, a base plate with an injection needle, and tail fibers. Some viruses feature a host-derived lipid envelope.",
      content_id: `<section class="space-y-4">
  <h3>Anatomi dan Morfologi Partikel Virus</h3>
  <p>
    Partikel virus yang utuh dan mampu menginfeksi sel inang disebut <strong>virion</strong>. Struktur tubuh virus umumnya dipelajari melalui model <strong>Bakteriofag T4</strong> (virus penginfeksi bakteri <em>Escherichia coli</em>) yang memiliki morfologi paling kompleks:
  </p>

  <div class="my-6 text-center">
    <img src="/images/virus/struktur-virus.svg" alt="Diagram Struktur Virus Bakteriofag T" class="mx-auto max-w-md w-full rounded-2xl shadow-sm border border-border-light" />
    <p class="text-xs text-muted mt-2">Gambar: Struktur anatomi bakteriofag T (kepala, leher/selubung ekor, dan serabut ekor)</p>
  </div>

  <div class="space-y-3">
    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">a. Kepala dan Kapsid</h4>
      <p>
        Kepala bakteriofag berbentuk ikosahedral (polihedral 20 sisi). Bagian terluarnya adalah <strong>kapsid</strong>, yaitu selubung pelindung yang tersusun atas subunit-subunit protein identik yang disebut <strong>kapsomer</strong>. Kapsid berfungsi mempertahankan bentuk virus, melindungi molekul asam nukleat dari degradasi enzim nuklease inang, serta memfasilitasi perlekatan pada sel inang.
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">b. Asam Nukleat (Genom)</h4>
      <p>
        Terletak di dalam rongga kepala kapsid. Virus hanya memiliki satu tipe materi genetik: <strong>DNA untai ganda (dsDNA)</strong>, <strong>DNA untai tunggal (ssDNA)</strong>, <strong>RNA untai tunggal (ssRNA)</strong>, atau <strong>RNA untai ganda (dsRNA)</strong>. Bentuk molekul genom dapat linear, sirkuler, bersegmen (seperti influenza dengan 8 segmen RNA), atau kontinu. Genom ini memuat instruksi genetik untuk sintesis protein virus baru.
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">c. Selubung Ekor (Tail Sheath)</h4>
      <p>
        Struktur silindris berongga yang menghubungkan kepala dengan lempeng dasar. Terdiri dari protein kontraktil yang dapat memendek untuk mendorong tabung inti ekor menembus dinding dan membran plasma sel inang pada saat penetrasi.
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">d. Lempeng Dasar dan Jarum Penusuk (Base Plate & Pin)</h4>
      <p>
        Lempeng heksagonal di ujung selubung ekor yang dilengkapi dengan jarum penusuk (<em>tail pins</em>). Jarum penusuk berfungsi melubangi peptidoglikan dinding sel bakteri dan menyalurkan asam nukleat virus langsung ke dalam sitoplasma sel inang.
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">e. Serabut Ekor (Tail Fibers)</h4>
      <p>
        Serabut filamen protein tipis bercabang di pangkal lempeng dasar. Berfungsi sebagai reseptor pengenal dan alat perlekatan spesifik pada membran sel target.
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">f. Sampul Membran (Envelope)</h4>
      <p>
        Beberapa virus (seperti <em>HIV</em>, <em>Influenza</em>, <em>Sindbis</em>, dan <em>Coronavirus</em>) memiliki lapisan membran luar tambahan berupa <strong>envelope</strong> yang tersusun atas lapisan ganda lipid dan glikoprotein inang yang diperoleh ketika virion bertunas (<em>budding</em>) keluar dari membran sel inang. Virus yang tidak memiliki sampul membran disebut <strong>virus telanjang (naked virus)</strong>. Tonjolan glikoprotein pada sampul (seperti protein <em>Spike / S</em> pada SARS-CoV-2) berfungsi mengikat reseptor permukaan sel inang.
      </p>
    </div>
  </div>
</section>`,
      content_en: `<section class="space-y-4">
  <h3>Anatomy and Morphology of Virions</h3>
  <p>
    A fully assembled, infectious viral particle is called a <strong>virion</strong>. The canonical structural model is exemplified by <strong>T-even Bacteriophages</strong> (viruses parasitizing <em>Escherichia coli</em>):
  </p>

  <div class="my-6 text-center">
    <img src="/images/virus/struktur-virus.svg" alt="Bacteriophage T Structural Anatomy Diagram" class="mx-auto max-w-md w-full rounded-2xl shadow-sm border border-border-light" />
    <p class="text-xs text-muted mt-2">Diagram: Structural layout of a T-bacteriophage (polyhedral head, contractile sheath, and base plate)</p>
  </div>

  <div class="space-y-3">
    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">a. Head and Capsid</h4>
      <p>
        The icosahedral head is encapsulated by a <strong>capsid</strong> formed of repeating morphological protein subunits called <strong>capsomeres</strong>. Capsids shelter genomic material from host nucleases and determine viral antigenic specificity.
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">b. Nucleic Acid Core (Genome)</h4>
      <p>
        Housed within the capsid cavity. Encompasses strictly one nucleic acid class: <strong>double-stranded DNA (dsDNA)</strong>, <strong>single-stranded DNA (ssDNA)</strong>, <strong>single-stranded RNA (ssRNA)</strong>, or <strong>double-stranded RNA (dsRNA)</strong>. Configurations can be linear, circular, continuous, or segmented (e.g. influenza's 8 segments).
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">c. Tail Sheath</h4>
      <p>
        A contractile cylindrical collar surrounding the hollow central core. Upon receptor engagement, it contracts like a hypodermic spring, driving the internal core through the host cell wall.
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">d. Base Plate and Tail Pins</h4>
      <p>
        Hexagonal platform anchoring tail fibers and sharp central injection pins. Tail pins breach the peptidoglycan matrix to deliver genetic material into the host cytoplasm.
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">e. Tail Fibers</h4>
      <p>
        Long flexible appendages extending from the base plate responsible for scanning and landing onto complementary host surface epitopes.
      </p>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">f. Lipid Envelope</h4>
      <p>
        Enveloped viruses (such as <em>HIV</em>, <em>Influenza</em>, <em>Sindbis</em>, and <em>Coronaviruses</em>) cloaked in a host-derived lipid bilayer studded with viral glycoproteins (spikes). Viruses lacking this lipid envelope are termed <strong>naked viruses</strong>.
      </p>
    </div>
  </div>
</section>`,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus4",
      sort_order: 4,
      type: "html",
      metadata: {
        title_id: "Cara Hidup dan Reproduksi Virus",
        title_en: "Life Cycle and Reproduction of Viruses",
        video_url: "",
      },
      summary_id:
        "Virus mengenali sel inang melalui prinsip kesesuaian reseptor (lock and key). Reproduksi berlangsung melalui siklus litik (adsorbsi, penetrasi, sintesis, perakitan, lisis) atau siklus lisogenik (pembentukan profag tanpa mematikan sel inang).",
      summary_en:
        "Viruses identify hosts via lock-and-key receptor specificity. Proliferation proceeds through either the lytic pathway (adsorption, penetration, synthesis, assembly, lysis) or lysogenic pathway (prophage integration sparing immediate host lysis).",
      content_id: `<section class="space-y-4">
  <h3>Cara Hidup dan Penularan Virus</h3>
  <p>
    Virus adalah <strong>parasit intraseluler obligat</strong>. Di luar sel inang, partikel virus tidak menunjukkan tanda-tanda metabolisme kehidupan. Keberhasilan infeksi ditentukan oleh kesesuaian molekuler antara ligan/serabut ekor virus dengan reseptor membran sel inang, menyerupai prinsip <strong>gembok dan kunci (lock and key)</strong>.
  </p>
  <ul>
    <li><strong>Kisaran Inang Luas:</strong> Dapat menginfeksi beberapa kelompok takson, misalnya virus rabies yang menginfeksi berbagai mamalia, atau virus flu burung (H5N1) yang menyerang unggas dan manusia.</li>
    <li><strong>Kisaran Inang Sempit:</strong> Hanya mampu menginfeksi satu spesies atau tipe sel tertentu, misalnya bakteriofag T4 hanya menginfeksi <em>E. coli</em>, atau Poliovirus yang hanya menginfeksi sel saraf primata.</li>
  </ul>

  <h4>Mekanisme Penularan:</h4>
  <p>
    Penularan dapat terjadi secara <strong>langsung</strong> (melalui droplet udara, air, kontak lendir/cairan tubuh, seperti influenza, cacar, campak, dan herpes) atau secara <strong>tidak langsung</strong> melalui perantara hewan pembawa (<strong>vektor</strong>), misalnya penularan <em>Flavivirus</em> demam berdarah melalui gigitan nyamuk betina <em>Aedes aegypti</em>.
  </p>

  <hr class="my-6 border-border-light" />

  <h3>1. Siklus Litik (Virulen)</h3>
  <p>
    Terjadi bila ketahanan sel inang lebih lemah dibandingkan virulensi virus. Pada akhir siklus, sel inang akan pecah (lisis), mati, dan ratusan virion baru akan dilepaskan untuk menginfeksi sel sekitarnya.
  </p>

  <div class="my-6 text-center">
    <img src="/images/virus/siklus-litik.svg" alt="Diagram 5 Tahap Siklus Litik" class="mx-auto max-w-lg w-full rounded-2xl shadow-sm border border-border-light" />
    <p class="text-xs text-muted mt-2">Diagram: Tahapan siklus litik (adsorbsi, penetrasi, sintesis, perakitan, dan lisis)</p>
  </div>

  <ol class="list-decimal list-inside space-y-2">
    <li><strong>Tahap Adsorbsi (Penempelan):</strong> Virion menempel pada dinding sel inang menggunakan serabut ekornya pada situs reseptor spesifik.</li>
    <li><strong>Tahap Penetrasi (Injeksi):</strong> Selubung ekor berkontraksi, jarum penusuk menembus dinding sel dan membran plasma, lalu menyuntikkan genom DNA virus ke dalam sitoplasma inang. Kapsid kosong tertinggal di luar sel (disebut <em>ghost</em>).</li>
    <li><strong>Tahap Sintesis (Replikasi & Transkripsi):</strong> Enzim virus menghidrolisis DNA sel inang. DNA virus mengambil alih perangkat seluler untuk mereplikasi genom virus dan mentranskripsi protein kapsomer dan enzim lisozim.</li>
    <li><strong>Tahap Pematangan (Perakitan/Assembly):</strong> Molekul asam nukleat dan subunit protein kapsomer dirakit menjadi partikel virion utuh yang baru.</li>
    <li><strong>Tahap Lisis (Pemecahan Sel):</strong> Enzim lisozim mencerna dinding sel bakteri dari dalam sehingga air masuk secara osmosis hingga sel membengkak dan pecah, membebaskan 100–200 virion anakan.</li>
  </ol>

  <hr class="my-6 border-border-light" />

  <h3>2. Siklus Lisogenik</h3>
  <p>
    Terjadi jika sistem pertahanan sel inang cukup kuat. Sel inang tidak dihancurkan dan tetap hidup serta dapat bereproduksi secara normal. DNA virus menyisip ke dalam kromosom bakteri membentuk <strong>profag</strong>.
  </p>

  <div class="my-6 text-center">
    <img src="/images/virus/siklus-lisogenik.svg" alt="Diagram Siklus Lisogenik" class="mx-auto max-w-lg w-full rounded-2xl shadow-sm border border-border-light" />
    <p class="text-xs text-muted mt-2">Diagram: Tahapan siklus lisogenik (penggabungan profag, pembelahan sel inang, dan induksi ke daur litik)</p>
  </div>

  <ul class="list-disc list-inside space-y-2">
    <li><strong>Adsorbsi dan Penetrasi:</strong> Mekanisme sama dengan siklus litik awal.</li>
    <li><strong>Tahap Penggabungan (Integrasi):</strong> DNA virus menyatu dengan kromosom inang membentuk <strong>profag</strong>. Gen virus ditekan oleh protein represor spesifik sehingga tidak merusak inang.</li>
    <li><strong>Tahap Pembelahan:</strong> Setiap kali sel inang membelah diri, profag ikut tereplikasi dan diwariskan kepada setiap sel anakan secara konstan tanpa merusak sel.</li>
    <li><strong>Tahap Induksi / Sintesis:</strong> Jika sel inang terpapar faktor stres lingkungan (seperti radiasi UV atau zat kimia), profag dapat memisahkan diri dari kromosom inang dan beralih memasuki <strong>siklus litik</strong>.</li>
  </ul>
  <p class="text-sm bg-accent/10 p-3 rounded-xl border border-accent/20 mt-3">
    💡 Virus yang mampu bereproduksi melalui siklus litik sekaligus lisogenik dinamakan <strong>virus temperat</strong>, contohnya <em>Fag λ (Lambda)</em>.
  </p>
</section>`,
      content_en: `<section class="space-y-4">
  <h3>Mode of Life and Transmission</h3>
  <p>
    Viruses are <strong>obligate intracellular parasites</strong>. In the extracellular environment, virions demonstrate zero metabolic activity. Cellular infection is mediated by <strong>lock-and-key complementary binding</strong> between viral attachment proteins and host cell surface receptors.
  </p>
  <ul>
    <li><strong>Broad Host Range:</strong> Capable of crossing taxonomic boundaries, such as Rabies infecting diverse mammals, or Avian Influenza (H5N1) infecting birds and humans.</li>
    <li><strong>Narrow Host Range:</strong> Restricted to distinct species or cell lineages, such as Phage T4 infecting solely <em>E. coli</em>, or Poliovirus targeting primate motor neurons.</li>
  </ul>

  <h4>Transmission Routes:</h4>
  <p>
    Transmission operates via <strong>direct mechanisms</strong> (aerosol droplets, saliva, blood, mucosal secretions in influenza, smallpox, measles, and herpes) or <strong>indirect mechanisms</strong> mediated by arthropod <strong>vectors</strong>, such as <em>Flavivirus</em> (dengue) transmitted by female <em>Aedes aegypti</em> mosquitoes.
  </p>

  <hr class="my-6 border-border-light" />

  <h3>1. Lytic Cycle (Virulent)</h3>
  <p>
    Occurs when host immune defenses are overwhelmed. At cycle termination, the host cell lyses, releasing hundreds of infectious virions.
  </p>

  <div class="my-6 text-center">
    <img src="/images/virus/siklus-litik.svg" alt="Five Stages of Lytic Cycle" class="mx-auto max-w-lg w-full rounded-2xl shadow-sm border border-border-light" />
    <p class="text-xs text-muted mt-2">Diagram: Lytic cycle progression (adsorption, penetration, synthesis, assembly, and cell lysis)</p>
  </div>

  <ol class="list-decimal list-inside space-y-2">
    <li><strong>Adsorption:</strong> Tail fibers dock onto complementary outer-membrane receptor sites.</li>
    <li><strong>Penetration:</strong> Tail sheath contracts, driving hollow core through cell envelope to inject genomic DNA. Empty ghost capsids remain outside.</li>
    <li><strong>Biosynthesis:</strong> Host genome is degraded; viral genes commandeer host polymerases and ribosomes to synthesize viral nucleic acids, structural capsomeres, and lysozymes.</li>
    <li><strong>Maturation (Assembly):</strong> Genomes are packaged into nascent capsids, attaching tails and fibers into complete virions.</li>
    <li><strong>Lysis:</strong> Endolysins dissolve the peptidoglycan wall, causing osmotic bursting and unleashing 100–200 daughter virions.</li>
  </ol>

  <hr class="my-6 border-border-light" />

  <h3>2. Lysogenic Cycle (Temperate)</h3>
  <p>
    Occurs when host integrity resists immediate destruction. The viral DNA integrates silently into the bacterial circular chromosome as an inactive <strong>prophage</strong>.
  </p>

  <div class="my-6 text-center">
    <img src="/images/virus/siklus-lisogenik.svg" alt="Lysogenic Cycle Diagram" class="mx-auto max-w-lg w-full rounded-2xl shadow-sm border border-border-light" />
    <p class="text-xs text-muted mt-2">Diagram: Lysogenic pathway (prophage integration, host cellular division, and induction into lytic phase)</p>
  </div>

  <ul class="list-disc list-inside space-y-2">
    <li><strong>Adsorption & Penetration:</strong> Initial entry matches the lytic phase.</li>
    <li><strong>Integration:</strong> Viral DNA splices into host chromosome, forming a dormant <strong>prophage</strong> under the control of viral repressor proteins.</li>
    <li><strong>Cell Division:</strong> With each bacterial binary fission, the prophage replicates along with host DNA, propagating into all progeny cells.</li>
    <li><strong>Induction:</strong> Environmental triggers (UV radiation, chemical stress) inactivate repressors, excising the prophage to trigger the <strong>lytic cascade</strong>.</li>
  </ul>
  <p class="text-sm bg-accent/10 p-3 rounded-xl border border-accent/20 mt-3">
    💡 Phages exhibiting dual capability for lytic and lysogenic cascades are termed <strong>temperate phages</strong>, such as <em>Bacteriophage λ (Lambda)</em>.
  </p>
</section>`,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus5",
      sort_order: 5,
      type: "html",
      metadata: {
        title_id: "Bentuk dan Klasifikasi Virus",
        title_en: "Shapes and Classification of Viruses",
        video_url: "",
      },
      summary_id:
        "Klasifikasi virus didasarkan pada asam nukleat (DNA vs RNA), ukuran tubuh, simetri morfologi (sferis, batang, polihedral, kompleks), serta aturan taksonomi ICTV (ordo -virales, famili -viridae, genus -virus, spesies -virus).",
      summary_en:
        "Classification is grounded in nucleic acid type (DNA vs RNA), size, symmetry morphology (spherical, helical, polyhedral, complex), and ICTV taxonomy (family -viridae, genus -virus, species -virus).",
      content_id: `<section class="space-y-4">
  <h3>Dasar Klasifikasi Virus</h3>
  <p>
    Pengelompokkan virus didasarkan pada serangkaian karakteristik biokimiawi dan morfologis:
  </p>

  <div class="my-6 text-center">
    <img src="/images/virus/bentuk-virus.svg" alt="Ragam Morfologi Bentuk Virus" class="mx-auto max-w-lg w-full rounded-2xl shadow-sm border border-border-light" />
    <p class="text-xs text-muted mt-2">Diagram: Ragam morfologi virus (batang, sferis/bulat, polihedral, kompleks T, filamen, dan peluru)</p>
  </div>

  <div class="space-y-3">
    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">1. Berdasarkan Jenis Asam Nukleat</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li><strong>Virus DNA:</strong> Genom berupa DNA untai ganda atau tunggal. Contoh: <em>Parvovirus</em>, <em>Papovavirus</em>, <em>Adenovirus</em>, <em>Herpesvirus</em>, dan <em>Poxvirus</em>.</li>
        <li><strong>Virus RNA:</strong> Genom berupa RNA untai ganda atau tunggal. Contoh: <em>Picornavirus</em> (polio), <em>Togavirus</em>, <em>Flavivirus</em> (dengue), <em>Calicivirus</em>, <em>Coronavirus</em> (SARS-CoV-2), <em>Paramyxovirus</em> (campak & gondongan), <em>Rhabdovirus</em> (rabies), <em>Retrovirus</em> (HIV), dan <em>Orthomyxovirus</em> (influenza).</li>
      </ul>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">2. Berdasarkan Ukuran</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li><strong>Virus Kecil:</strong> Berdiameter ≈ 20–30 nm (lebih kecil dari ribosom sel), contohnya <em>Poliovirus</em>.</li>
        <li><strong>Virus Besar:</strong> Berdiameter antara 150–300 nm atau lebih, contohnya <em>Parainfluenza virus</em>, <em>Poxvirus</em> (cacar), dan <em>Mimivirus</em>.</li>
      </ul>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">3. Berdasarkan Bentuk Morfologi</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li><strong>Bulat / Sferis:</strong> Kapsid bulat terbungkus sampul lipid, contoh: virus Influenza, HIV, dan Coronavirus.</li>
        <li><strong>Batang / Heliks:</strong> Kapsid silindris panjang membungkus asam nukleat, contoh: <em>Tobacco Mosaic Virus (TMV)</em>.</li>
        <li><strong>Polihedral / Ikosahedral:</strong> Memiliki 20 bidang segitiga simetris, contoh: <em>Adenovirus</em>.</li>
        <li><strong>Bentuk Peluru:</strong> Kapsid asimetris memanjang seperti peluru, contoh: <em>Rhabdovirus</em> (rabies).</li>
        <li><strong>Filamen / Benang:</strong> Memanjang tipis seperti cacing, contoh: <em>Ebolavirus</em>.</li>
        <li><strong>Kompleks (Bentuk T):</strong> Memiliki kepala ikosahedral dan aparatus ekor khusus, contoh: <em>Bakteriofag T4</em>.</li>
      </ul>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">4. Sistem Taksonomi ICTV</h4>
      <p class="text-sm leading-relaxed">
        <strong>ICTV (International Committee on Taxonomy of Viruses)</strong> mengklasifikasikan virus ke dalam tingkatan takson internasional:
      </p>
      <ul class="list-disc list-inside space-y-1 text-sm mt-2">
        <li><strong>Famili:</strong> Menggunakan akhiran <strong>-viridae</strong> (contoh: <em>Poxviridae</em>, <em>Retroviridae</em>, <em>Flaviviridae</em>).</li>
        <li><strong>Genus:</strong> Menggunakan akhiran <strong>-virus</strong> (contoh: <em>Orthopoxvirus</em>, <em>Lentivirus</em>, <em>Flavivirus</em>).</li>
        <li><strong>Spesies:</strong> Menggunakan bahasa Inggris yang diakhiri kata <strong>-virus</strong> (contoh: <em>Variola virus</em>, penyebab cacar). Nama genus dan spesies dicetak miring.</li>
      </ul>
    </div>
  </div>
</section>`,
      content_en: `<section class="space-y-4">
  <h3>Principles of Viral Classification</h3>
  <p>
    Viral taxonomy is determined through phenotypic, biochemical, and structural parameters:
  </p>

  <div class="my-6 text-center">
    <img src="/images/virus/bentuk-virus.svg" alt="Viral Morphological Diversity" class="mx-auto max-w-lg w-full rounded-2xl shadow-sm border border-border-light" />
    <p class="text-xs text-muted mt-2">Diagram: Morphological spectrum (helical, spherical, icosahedral, complex binal, filamentous, and bullet shapes)</p>
  </div>

  <div class="space-y-3">
    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">1. By Nucleic Acid Composition</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li><strong>DNA Viruses:</strong> Genomes consist of single or double-stranded DNA. Examples: <em>Parvoviridae</em>, <em>Papovaviridae</em>, <em>Adenoviridae</em>, <em>Herpesviridae</em>, and <em>Poxviridae</em>.</li>
        <li><strong>RNA Viruses:</strong> Genomes consist of single or double-stranded RNA. Examples: <em>Picornaviridae</em> (polio), <em>Togaviridae</em>, <em>Flaviviridae</em> (dengue), <em>Coronaviridae</em> (SARS-CoV-2), <em>Paramyxoviridae</em> (mumps/measles), <em>Rhabdoviridae</em> (rabies), <em>Retroviridae</em> (HIV), and <em>Orthomyxoviridae</em> (influenza).</li>
      </ul>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">2. By Virion Dimensions</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li><strong>Small Viruses:</strong> Diameters ≈ 20–30 nm (smaller than cellular ribosomes), e.g. <em>Poliovirus</em>.</li>
        <li><strong>Large Viruses:</strong> Diameters spanning 150–300+ nm, e.g. <em>Parainfluenza</em>, <em>Poxviruses</em>, and giant <em>Mimiviruses</em>.</li>
      </ul>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">3. By Geometric Morphology</h4>
      <ul class="list-disc list-inside space-y-1 text-sm">
        <li><strong>Spherical:</strong> Membranous envelopes encasing capsids, e.g. Influenza, HIV, Coronaviruses.</li>
        <li><strong>Helical / Rod:</strong> Rigid protein cylinders surrounding nucleic cores, e.g. <em>Tobacco Mosaic Virus (TMV)</em>.</li>
        <li><strong>Polyhedral / Icosahedral:</strong> 20 equilateral triangular facets with 12 vertices, e.g. <em>Adenovirus</em>.</li>
        <li><strong>Bullet-shaped:</strong> Asymmetric rhabdoid silhouettes, e.g. <em>Rabies virus</em>.</li>
        <li><strong>Filamentous:</strong> Elongated flexible serpents, e.g. <em>Ebolavirus</em>.</li>
        <li><strong>Complex Binal:</strong> Polyhedral head appended to contractile tail columns, e.g. <em>T-Bacteriophages</em>.</li>
      </ul>
    </div>

    <div class="card p-4 rounded-xl border border-border-light bg-card">
      <h4 class="font-bold text-accent mb-1">4. The ICTV Taxonomic Framework</h4>
      <p class="text-sm leading-relaxed">
        The <strong>International Committee on Taxonomy of Viruses (ICTV)</strong> structures nomenclature hierarchy:
      </p>
      <ul class="list-disc list-inside space-y-1 text-sm mt-2">
        <li><strong>Family:</strong> Terminating in <strong>-viridae</strong> (e.g. <em>Poxviridae</em>, <em>Retroviridae</em>, <em>Flaviviridae</em>).</li>
        <li><strong>Genus:</strong> Terminating in <strong>-virus</strong> (e.g. <em>Orthopoxvirus</em>, <em>Lentivirus</em>, <em>Flavivirus</em>).</li>
        <li><strong>Species:</strong> Denoted in English terminating in <strong>-virus</strong> (e.g. <em>Variola virus</em>, smallpox pathogen). Genera and species are italicized.</li>
      </ul>
    </div>
  </div>
</section>`,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus6",
      sort_order: 6,
      type: "html",
      metadata: {
        title_id: "Peranan Virus dalam Kehidupan",
        title_en: "Roles of Viruses in Life",
        video_url: "",
      },
      summary_id:
        "Peranan menguntungkan: terapi gen (vektor Retrovirus), vaksin, dan bioinsektisida (Baculovirus). Peranan merugikan: patogen penyebab berbagai penyakit pada manusia, hewan (rabies, PMK, tetelo), dan tanaman budidaya (TYLC, tungro, mosaik).",
      summary_en:
        "Beneficial roles: gene therapy (Retroviral vectors), vaccines, and bioinsecticides (Baculovirus). Detrimental roles: severe viral pathologies across humans, livestock (rabies, FMD, Newcastle), and crops (TYLC, tungro, mosaic).",
      content_id: `<section class="space-y-4">
  <h3>Peranan yang Menguntungkan bagi Manusia</h3>
  <p>
    Meskipun mayoritas virus dikenal sebagai patogen, bioteknologi modern memanfaatkan karakteristik biologis virus untuk kemaslahatan manusia:
  </p>
  <ul class="list-disc list-inside space-y-2">
    <li>
      <strong>Teknologi Rekayasa Genetika (Terapi Gen):</strong> Virus yang telah dilemahkan atau dimodifikasi genetiknya dimanfaatkan sebagai <strong>vektor transportasi gen</strong>. Contohnya, <em>Retrovirus</em> digunakan sebagai vektor untuk menyisipkan salinan gen fungsional pengkode enzim Adenosin Deaminase (ADA) ke dalam sel limfosit T abnormal pada pasien defisiensi kekebalan kombinasi parah (SCID).
    </li>
    <li>
      <strong>Pembuatan Vaksin:</strong> Protein kapsid atau sampul virus diekstraksi untuk memicu respons antibodi adaptif sel imun tubuh tanpa menimbulkan penyakit. Vaksin telah berhasil mengeradikasi penyakit cacar (variola) dan membatasi polio secara global.
    </li>
    <li>
      <strong>Pengobatan Biologis (Fagoterapi):</strong> Menggunakan bakteriofag spesifik untuk membunuh dan menghancurkan bakteri patogen multiresisten antibiotik (AMR), jamur, atau protozoa parasit tanpa mengganggu flora normal tubuh.
    </li>
    <li>
      <strong>Bioinsektisida Hama Tanaman:</strong> Virus parasit serangga, terutama <em>Baculovirus</em>, dibiakkan dan disemprotkan pada tanaman pertanian sejak 1950 untuk membasmi hama ulat tanpa meninggalkan residu kimia berbahaya bagi lingkungan.
    </li>
  </ul>

  <hr class="my-6 border-border-light" />

  <h3>Peranan yang Merugikan (Penyakit Akibat Virus)</h3>

  <h4 class="font-bold text-red-600 mt-4">1. Penyakit pada Manusia:</h4>
  <div class="overflow-x-auto my-3">
    <table class="w-full text-xs sm:text-sm border-collapse border border-border-light">
      <thead class="bg-card">
        <tr class="border-b border-border-light text-left">
          <th class="p-2 border-r border-border-light">Penyakit</th>
          <th class="p-2 border-r border-border-light">Virus Penyebab</th>
          <th class="p-2">Karakteristik & Gejala Utama</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border-light">
        <tr>
          <td class="p-2 font-semibold">Gondongan (Mumps)</td>
          <td class="p-2 italic">Paramyxovirus</td>
          <td class="p-2">Pembengkakan kelenjar ludah (parotis); rasa nyeri meningkat saat menelan makanan berasa asam.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Herpes Simpleks</td>
          <td class="p-2 italic">Herpes Simplex Virus (HSV-1 & HSV-2)</td>
          <td class="p-2">Infeksi epitel yang menimbulkan lepuhan kulit berisi cairan; virus bersifat laten seumur hidup pada sel saraf ganglia sensorik.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Cacar Variola</td>
          <td class="p-2 italic">Variola virus (Famili Poxviridae)</td>
          <td class="p-2">Inkubasi ±12 hari; demam tinggi diikuti erupsi vesikula, pustula bernanah, dan jaringan parut permanen. Dicegah melalui vaksinasi Orthopoxvirus.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Cacar Air</td>
          <td class="p-2 italic">Varicella-zoster virus</td>
          <td class="p-2">Penyakit menular pada anak-anak yang ditandai bintik vesikula gatal pada kulit dan selaput lendir.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Hepatitis</td>
          <td class="p-2 italic">Hepatitis virus (HAV, HBV, HCV)</td>
          <td class="p-2">Kerusakan jaringan dan gangguan fungsi hati serta saluran empedu; penularan via cairan tubuh, jarum suntik, dan makanan tercemar.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Influenza</td>
          <td class="p-2 italic">Influenza virus (Famili Orthomyxoviridae)</td>
          <td class="p-2">Infeksi pernapasan akut dengan menggigil, batuk kering, sakit kepala, nyeri otot, dan demam mendadak.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Campak (Measles)</td>
          <td class="p-2 italic">Morbillivirus</td>
          <td class="p-2">Demam, batuk, konjungtivitis mata merah, dan ruam makulopapular cokelat kemerahan; infeksi primer memberikan imunitas adaptif seumur hidup.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">AIDS</td>
          <td class="p-2 italic">Human Immunodeficiency Virus (HIV - genus Lentivirus)</td>
          <td class="p-2">Menyerang limfosit T pembantu (CD4+) hingga menghancurkan sistem kekebalan tubuh penderita; infeksi sekunder oportunistik dan kematian.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Demam Berdarah (DHF)</td>
          <td class="p-2 italic">Flavivirus (Dengue virus)</td>
          <td class="p-2">Ditransmisikan nyamuk <em>Aedes aegypti</em>; nyeri sendi hebat, penurunan trombosit mendadak, pendarahan kapiler dan syok.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Ebola</td>
          <td class="p-2 italic">Ebolavirus (Famili Filoviridae)</td>
          <td class="p-2">Demam berdarah mematikan di Afrika; menyerang makrofag dan endotel pembuluh darah yang memicu koagulopati dan pendarahan masif internal.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Flu Burung</td>
          <td class="p-2 italic">HPAIV (Highly Pathogenic Avian Influenza H5N1)</td>
          <td class="p-2">Strain virulen tipe A orthomyxovirus yang memicu badai sitokin, sesak napas parah, dan pneumonia akut.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">SARS & COVID-19</td>
          <td class="p-2 italic">SARS-CoV & SARS-CoV-2 (Famili Coronaviridae)</td>
          <td class="p-2">Sindrom pernapasan akut berat; infeksi epitel paru via reseptor ACE2 yang memicu pneumonia dan hipoksia.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h4 class="font-bold text-amber-600 mt-6">2. Penyakit pada Hewan:</h4>
  <ul class="list-disc list-inside space-y-2 text-sm">
    <li><strong>Rabies:</strong> Disebabkan oleh <em>Rhabdovirus</em>; menyerang sistem saraf pusat semua mamalia berdarah panas (anjing, kucing, kera, kelelawar, manusia) melalui gigitan atau air liur, memicu hidrofobia, halusinasi, dan kematian.</li>
    <li><strong>Penyakit Mulut dan Kuku (PMK):</strong> Disebabkan oleh <em>Aphthovirus</em>; menyerang hewan ternak berkuku genap/belah (sapi, kerbau, kambing, domba, babi), menimbulkan demam tinggi 41°C, hipersalivasi, dan lepuh lesi pada kuku serta mukosa mulut.</li>
    <li><strong>Tetelo (Newcastle Disease - NCD):</strong> Disebabkan oleh virus <em>NCD</em>; menyerang unggas dengan gejala gangguan pernapasan, diare kehijauan, dan gangguan neuromuskular (kepala terpelintir berputar-putar/tortikolis).</li>
  </ul>

  <h4 class="font-bold text-green-600 mt-6">3. Penyakit pada Tumbuhan:</h4>
  <ul class="list-disc list-inside space-y-2 text-sm">
    <li><strong>TYLC (Tomato Yellow Leaf Curl Virus):</strong> Menyerang tanaman tomat; daun menguning, mengerut dan menggulung kerdil sehingga menurunkan hasil panen drastis.</li>
    <li><strong>Tungro:</strong> Disebabkan oleh kombinasi <em>Rice Tungro Spherical Virus (RTSV)</em> dan <em>Rice Tungro Bacilliform Virus (RTBV)</em> (Famili <em>Caulimoviridae</em>); ditularkan oleh vektor wereng hijau (<em>Nephotettix virescens</em>) dan wereng cokelat pada padi; klorosis daun dan pertumbuhan tanaman terhambat kerdil.</li>
    <li><strong>Mosaik (TMV):</strong> Menyerang daun tembakau, cabai, tomat, kentang, pepaya, dan kacang tanah; timbul bercak-bercak klorosis kuning belang pada helai daun.</li>
  </ul>
</section>`,
      content_en: `<section class="space-y-4">
  <h3>Beneficial Applications of Viruses</h3>
  <p>
    Although classically deemed pathogenic, modern biotechnology harnesses viral kinetics for human welfare:
  </p>
  <ul class="list-disc list-inside space-y-2">
    <li>
      <strong>Gene Therapy:</strong> Attenuated recombinant viral vehicles mediate <strong>therapeutic gene transfer</strong>. For instance, modified <em>Retroviruses</em> deliver Adenosine Deaminase (ADA) functional sequences into abnormal T-lymphocytes of SCID patients.
    </li>
    <li>
      <strong>Vaccinology:</strong> Non-infectious capsid antigens or recombinant spike proteins elicit protective adaptive antibodies without pathogenicity, eradicating smallpox and curbing polio.
    </li>
    <li>
      <strong>Phage Therapy:</strong> Exploiting bacteriophages to eliminate multidrug-resistant bacterial pathogens (AMR) without perturbing beneficial microbiome flora.
    </li>
    <li>
      <strong>Agricultural Bioinsecticides:</strong> Baculoviruses cultivated since 1950 provide ecologically benign, species-targeted biological suppression of agricultural insect pests.
    </li>
  </ul>

  <hr class="my-6 border-border-light" />

  <h3>Pathogenic Manifestations (Viral Diseases)</h3>

  <h4 class="font-bold text-red-600 mt-4">1. Human Viral Pathologies:</h4>
  <div class="overflow-x-auto my-3">
    <table class="w-full text-xs sm:text-sm border-collapse border border-border-light">
      <thead class="bg-card">
        <tr class="border-b border-border-light text-left">
          <th class="p-2 border-r border-border-light">Disease</th>
          <th class="p-2 border-r border-border-light">Etiological Agent</th>
          <th class="p-2">Pathological Characteristics</th>
        </tr>
      </thead>
      <tbody class="divide-y divide-border-light">
        <tr>
          <td class="p-2 font-semibold">Mumps</td>
          <td class="p-2 italic">Paramyxovirus</td>
          <td class="p-2">Parotid salivary gland swelling exacerbated by mastication or acidic ingestions.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Herpes Simplex</td>
          <td class="p-2 italic">HSV-1 & HSV-2</td>
          <td class="p-2">Mucocutaneous vesicles; establishes lifelong latency inside sensory nerve ganglia.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Smallpox</td>
          <td class="p-2 italic">Variola virus (Poxviridae)</td>
          <td class="p-2">12-day incubation; high fever followed by pustular eruptions and deep pitted scarring.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Chickenpox</td>
          <td class="p-2 italic">Varicella-zoster virus</td>
          <td class="p-2">Contagious childhood vesicular rashes along integument and mucosal boundaries.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Hepatitis</td>
          <td class="p-2 italic">Hepatitis viruses (HAV, HBV, HCV)</td>
          <td class="p-2">Hepatic necrosis and jaundice; spread via blood transfusions, body fluids, or contaminated supplies.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Influenza</td>
          <td class="p-2 italic">Orthomyxoviruses (A, B, C)</td>
          <td class="p-2">Acute febrile respiratory syndrome with chills, myalgia, and prostration.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Measles</td>
          <td class="p-2 italic">Morbillivirus</td>
          <td class="p-2">Coryza, conjunctivitis, Koplik spots, and maculopapular rash conferring lifelong immunity.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">AIDS</td>
          <td class="p-2 italic">HIV (Lentivirus)</td>
          <td class="p-2">Selective ablation of CD4+ helper T-cells leading to catastrophic immunodeficiency and opportunistic mortalities.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Dengue Fever</td>
          <td class="p-2 italic">Flavivirus (Dengue virus)</td>
          <td class="p-2">Transmitted by <em>Aedes aegypti</em>; arthralgia, thrombocytopenia, and capillary extravasation shock.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Ebola Hemorrhagic Fever</td>
          <td class="p-2 italic">Ebolavirus (Filoviridae)</td>
          <td class="p-2">Destruction of endothelial integrity and monocytes inciting massive disseminated intravascular coagulopathy.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">Avian Influenza</td>
          <td class="p-2 italic">HPAIV H5N1</td>
          <td class="p-2">Hypervirulent type A strain driving severe cytokine storms and pulmonary consolidations.</td>
        </tr>
        <tr>
          <td class="p-2 font-semibold">SARS & COVID-19</td>
          <td class="p-2 italic">SARS-CoV & SARS-CoV-2 (Coronaviridae)</td>
          <td class="p-2">Lower respiratory alveolar distress mediated by ACE2 receptor spike tropism.</td>
        </tr>
      </tbody>
    </table>
  </div>

  <h4 class="font-bold text-amber-600 mt-6">2. Veterinary Pathologies:</h4>
  <ul class="list-disc list-inside space-y-2 text-sm">
    <li><strong>Rabies:</strong> <em>Rhabdovirus</em> infecting central nervous systems of warm-blooded animals and humans via bites, provoking hydrophobia and encephalitis.</li>
    <li><strong>Foot-and-Mouth Disease (FMD):</strong> <em>Aphthovirus</em> inflicting cloven-hoofed livestock with 41°C pyrexia, excessive salivation, and oral-coronary vesicles.</li>
    <li><strong>Newcastle Disease (NCD):</strong> Avian paramyxovirus causing respiratory distress, greenish diarrhea, and torticollis (twisted-head tremors).</li>
  </ul>

  <h4 class="font-bold text-green-600 mt-6">3. Phytopathologies (Plant Diseases):</h4>
  <ul class="list-disc list-inside space-y-2 text-sm">
    <li><strong>TYLC (Tomato Yellow Leaf Curl Virus):</strong> Leaf chlorosis and curling, severely depressing tomato agricultural yields.</li>
    <li><strong>Tungro Disease:</strong> Caulimovirus complexes transmitted by green and brown leafhoppers, inducing rice stunting and discoloration.</li>
    <li><strong>Mosaic (TMV):</strong> Distinctive chlorotic mottling across tobacco, solanaceous crops, and legumes.</li>
  </ul>
</section>`,
    },
  ];

  const { error: materiError } = await supabase.from("materi").insert(materiList);
  if (materiError) throw new Error("Materi insert failed: " + materiError.message);
  console.log("✓ 6 materi rows inserted.");

  // 5. Insert 27 Quiz Questions (Sub-bab Quiz + Reflection Quiz)
  const quizzes = [
    // Sub 1: Sejarah (4 soal)
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus1",
      is_reflection: false,
      question_id:
        "Siapa ilmuwan yang pertama kali meneliti penyakit mosaik pada tanaman tembakau pada tahun 1883?",
      question_en:
        "Which scientist first investigated tobacco mosaic disease in 1883?",
      question_image_url: "",
      options_id: ["Adolf Mayer", "Dmitri Ivanovsky", "Martinus Beijerinck", "Wendell Stanley"],
      options_en: ["Adolf Mayer", "Dmitri Ivanovsky", "Martinus Beijerinck", "Wendell Stanley"],
      correct_answer: 0,
      explanation_id:
        "Adolf Mayer (1883) adalah orang pertama yang mengekstrak getah tembakau sakit dan menyemprotkannya ke tanaman tembakau sehat.",
      explanation_en:
        "Adolf Mayer (1883) was the first to extract sap from infected tobacco and spray it onto healthy plants.",
      question_type: "single",
      sort_order: 1,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus1",
      is_reflection: false,
      question_id:
        "Percobaan Dmitri Ivanovsky (1892) dengan filter bakteri Chamberland-Pasteur membuktikan bahwa...",
      question_en:
        "Dmitri Ivanovsky's 1892 experiment using bacterial Chamberland filters proved that...",
      question_image_url: "",
      options_id: [
        "Penyebab penyakit mosaik tertahan oleh saringan bakteri",
        "Filtrat yang lolos saringan bakteri masih mampu menginfeksi tanaman sehat",
        "Penyakit mosaik disebabkan oleh jamur berukuran besar",
        "Agen penyakit dapat dinonaktifkan oleh filter porselen",
      ],
      options_en: [
        "The mosaic pathogen was retained by bacterial filters",
        "The filtrate passing through bacterial filters still infected healthy plants",
        "Mosaic disease was caused by large fungi",
        "The disease agent was neutralized by porcelain filters",
      ],
      correct_answer: 1,
      explanation_id:
        "Filtrat hasil saringan Ivanovsky tetap menimbulkan penyakit mosaik, membuktikan agen tersebut jauh lebih kecil daripada bakteri biasa.",
      explanation_en:
        "Ivanovsky's filtrate continued to cause mosaic disease, demonstrating that the pathogen was far smaller than typical bacteria.",
      question_type: "single",
      sort_order: 2,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus1",
      is_reflection: false,
      question_id:
        "Istilah 'virus lolos saring' (filterable virus) pertama kali dicetuskan oleh...",
      question_en:
        "The terminology 'filterable virus' was originally coined by...",
      question_image_url: "",
      options_id: ["Martinus Beijerinck", "Adolf Mayer", "Dmitri Ivanovsky", "Wendell Stanley"],
      options_en: ["Martinus Beijerinck", "Adolf Mayer", "Dmitri Ivanovsky", "Wendell Stanley"],
      correct_answer: 0,
      explanation_id:
        "Martinus Beijerinck membuktikan agen penginfeksi dapat bereplikasi dan menamainya virus lolos saring (filterable virus).",
      explanation_en:
        "Martinus Beijerinck proved the agent could replicate and named it a filterable virus.",
      question_type: "single",
      sort_order: 3,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus1",
      is_reflection: false,
      question_id:
        "Wendell Stanley (1935) mengejutkan komunitas ilmiah dunia karena berhasil...",
      question_en:
        "Wendell Stanley (1935) astonished the scientific world by successfully...",
      question_image_url: "",
      options_id: [
        "Mengkristalkan partikel Tobacco Mosaic Virus (TMV)",
        "Mengamati virus menggunakan mikroskop cahaya biasa",
        "Menemukan vaksin untuk penyakit cacar",
        "Membudidayakan virus pada medium agar cawan petri",
      ],
      options_en: [
        "Crystallizing Tobacco Mosaic Virus (TMV) particles",
        "Observing viruses with standard light microscopes",
        "Developing the smallpox vaccine",
        "Cultivating viruses on petri dish agar media",
      ],
      correct_answer: 0,
      explanation_id:
        "Stanley berhasil mengkristalkan partikel TMV, menunjukkan adanya sifat benda mati (mengkristal) pada agen penyebab infeksi.",
      explanation_en:
        "Stanley crystallized TMV particles, uncovering an abiotic hallmark (crystallization) in an infectious agent.",
      question_type: "single",
      sort_order: 4,
    },

    // Sub 2: Ciri-Ciri (4 soal)
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus2",
      is_reflection: false,
      question_id:
        "Virus hanya dapat diamati secara jelas menggunakan mikroskop elektron karena ukuran tubuhnya berkisar antara...",
      question_en:
        "Viruses can only be distinctly resolved using electron microscopes because their diameter ranges from...",
      question_image_url: "",
      options_id: ["0,02–0,3 μm (20–300 nm)", "10–50 μm", "0,5–5 mm", "100–500 μm"],
      options_en: ["0.02–0.3 μm (20–300 nm)", "10–50 μm", "0.5–5 mm", "100–500 μm"],
      correct_answer: 0,
      explanation_id:
        "Ukuran virus sangat kecil berkisar antara 20–300 nm (0,02–0,3 μm), jauh di bawah resolusi batas mikroskop cahaya.",
      explanation_en:
        "Viruses are minuscule, measuring 20–300 nm (0.02–0.3 μm), far beneath light microscopy resolution.",
      question_type: "single",
      sort_order: 1,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus2",
      is_reflection: false,
      question_id:
        "Alasan utama mengapa virus disebut sebagai partikel 'aseluler' adalah...",
      question_en:
        "The primary reason viruses are classified as 'acellular' is that they...",
      question_image_url: "",
      options_id: [
        "Tidak memiliki membran sel, sitoplasma, inti, dan organel",
        "Tidak memiliki materi genetik sama sekali",
        "Hanya dapat hidup di air tawar",
        "Memiliki dinding sel dari peptidoglikan",
      ],
      options_en: [
        "Lack plasma membranes, cytoplasm, nuclei, and organelles",
        "Possess no genetic material whatsoever",
        "Only survive in fresh water",
        "Possess peptidoglycan cell walls",
      ],
      correct_answer: 0,
      explanation_id:
        "Aseluler artinya bukan sel. Tubuh virus tidak memiliki sitoplasma, membran plasma seluler, inti sel, maupun organel metabolisme.",
      explanation_en:
        "Acellular means not composed of cells; viruses lack cytoplasm, cellular membranes, nuclei, and organelles.",
      question_type: "single",
      sort_order: 2,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus2",
      is_reflection: false,
      question_id:
        "Virus disebut sebagai 'parasit intraseluler obligat' karena...",
      question_en:
        "Viruses are termed 'obligate intracellular parasites' because they...",
      question_image_url: "",
      options_id: [
        "Hanya dapat bereplikasi di dalam sel hidup inang yang spesifik",
        "Dapat tumbuh bebas pada kaldu nutrisi steril",
        "Mampu menghasilkan ATP sendiri di lingkungan bebas",
        "Selalu memakan bakteri saprofit",
      ],
      options_en: [
        "Can replicate exclusively inside living specific host cells",
        "Grow freely on sterile nutrient broth",
        "Synthesize their own ATP in cell-free environments",
        "Feed exclusively on saprophytic bacteria",
      ],
      correct_answer: 0,
      explanation_id:
        "Parasit intraseluler obligat artinya mutlak membutuhkan sel hidup inang untuk bereproduksi dan melangsungkan fungsi biologisnya.",
      explanation_en:
        "Obligate intracellular parasites strictly require living host cells to reproduce and sustain biological activity.",
      question_type: "single",
      sort_order: 3,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus2",
      is_reflection: false,
      question_id:
        "Tindakan yang TIDAK efektif untuk membasmi virus pada tubuh pasien adalah pemberian...",
      question_en:
        "Which intervention is completely INEFFECTIVE against viral infections in patients?",
      question_image_url: "",
      options_id: [
        "Antibiotik",
        "Vaksin profilaksis",
        "Obat antivirus spesifik",
        "Peningkatan sistem imun tubuh",
      ],
      options_en: [
        "Antibiotics",
        "Prophylactic vaccines",
        "Specific antiviral drugs",
        "Boosting immune defenses",
      ],
      correct_answer: 0,
      explanation_id:
        "Antibiotik menargetkan dinding sel atau ribosom bakteri sehingga sama sekali tidak berkhasiat membasmi virus.",
      explanation_en:
        "Antibiotics selectively inhibit bacterial cell walls or ribosomes, possessing zero therapeutic activity against viruses.",
      question_type: "single",
      sort_order: 4,
    },

    // Sub 3: Struktur & Fungsi (4 soal)
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus3",
      is_reflection: false,
      question_id:
        "Selubung pelindung luar yang membungkus materi genetik virus tersusun atas subunit protein yang disebut...",
      question_en:
        "The outer protein envelope sheltering the viral genome is composed of protein subunits called...",
      question_image_url: "",
      options_id: ["Kapsomer", "Peptidoglikan", "Fosfolipid", "Kapsul"],
      options_en: ["Capsomeres", "Peptidoglycan", "Phospholipids", "Capsules"],
      correct_answer: 0,
      explanation_id:
        "Kapsid tersusun atas subunit-subunit protein berulang yang dinamakan kapsomer.",
      explanation_en:
        "The capsid is assembled from repeating protein subunits known as capsomeres.",
      question_type: "single",
      sort_order: 1,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus3",
      is_reflection: false,
      question_id:
        "Materi genetik yang ditemukan di dalam satu partikel virion virus adalah...",
      question_en:
        "The genetic material enclosed within a single virion is...",
      question_image_url: "",
      options_id: [
        "Hanya satu jenis: DNA saja atau RNA saja",
        "DNA dan RNA secara bersamaan",
        "Protein histon murni tanpa asam nukleat",
        "Plasmid sirkuler ganda bebas",
      ],
      options_en: [
        "Strictly one kind: either DNA alone or RNA alone",
        "DNA and RNA simultaneously",
        "Pure histone proteins without nucleic acids",
        "Free circular double-stranded plasmids",
      ],
      correct_answer: 0,
      explanation_id:
        "Ciri khas virus: hanya memiliki satu macam asam nukleat saja dalam satu virion (DNA atau RNA).",
      explanation_en:
        "A key viral hallmark: each virion carries strictly one nucleic acid type (DNA or RNA).",
      question_type: "single",
      sort_order: 2,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus3",
      is_reflection: false,
      question_id:
        "Bagian bakteriofag yang berfungsi menancapkan jarum penusuk dan menginjeksi DNA ke sel inang adalah...",
      question_en:
        "The phage structure holding injection pins that pierce and deliver DNA into the host cell is the...",
      question_image_url: "",
      options_id: ["Lempeng dasar (base plate)", "Serabut ekor", "Kapsid kepala", "Leher"],
      options_en: ["Base plate", "Tail fibers", "Head capsid", "Collar"],
      correct_answer: 0,
      explanation_id:
        "Lempeng dasar memiliki jarum penusuk yang melubangi dinding sel bakteri saat selubung ekor berkontraksi.",
      explanation_en:
        "The base plate carries injection pins that pierce the host cell wall when the sheath contracts.",
      question_type: "single",
      sort_order: 3,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus3",
      is_reflection: false,
      question_id:
        "Sampul membran (envelope) pada virus bersampul seperti HIV dan Coronavirus tersusun atas lipid yang diperoleh dari...",
      question_en:
        "The lipid envelope of viruses like HIV and Coronaviruses is acquired from...",
      question_image_url: "",
      options_id: [
        "Membran sel inang saat virus bertunas (budding)",
        "Sintesis lipid mandiri oleh genom virus",
        "Dinding sel bakteri inang",
        "Cairan ekstraseluler bebas",
      ],
      options_en: [
        "The host cell membrane during viral budding",
        "Independent lipid synthesis directed by the viral genome",
        "The host bacterial cell wall",
        "Free extracellular fluid",
      ],
      correct_answer: 0,
      explanation_id:
        "Envelope lipid diperoleh ketika nukleokapsid virus bertunas (budding) menembus membran sel inang.",
      explanation_en:
        "The envelope lipid bilayer is derived as the viral nucleocapsid buds through host cell membranes.",
      question_type: "single",
      sort_order: 4,
    },

    // Sub 4: Cara Hidup & Reproduksi (5 soal)
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus4",
      is_reflection: false,
      question_id:
        "Virus mengenali dan menempel pada sel inang secara spesifik berdasarkan prinsip...",
      question_en:
        "Viruses specifically recognize and attach to host cells through the principle of...",
      question_image_url: "",
      options_id: [
        "Kesesuaian reseptor (lock and key)",
        "Gravitasi partikel virion",
        "Perbedaan tekanan osmosis",
        "Ukuran pori dinding sel secara acak",
      ],
      options_en: [
        "Receptor complementarity (lock and key)",
        "Virion gravitational settling",
        "Osmotic pressure differentials",
        "Random cell wall pore size matching",
      ],
      correct_answer: 0,
      explanation_id:
        "Pengenalan sel inang terjadi melalui kecocokan reseptor permukaan inang dengan protein serabut/spike virus (lock and key).",
      explanation_en:
        "Host recognition relies on complementary binding between host surface receptors and viral attachment proteins.",
      question_type: "single",
      sort_order: 1,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus4",
      is_reflection: false,
      question_id:
        "Vektor penularan tidak langsung untuk Flavivirus penyebab penyakit demam berdarah dengue adalah nyamuk...",
      question_en:
        "The indirect transmission vector for Flavivirus causing dengue hemorrhagic fever is the mosquito...",
      question_image_url: "",
      options_id: ["Aedes aegypti", "Anopheles sundaicus", "Culex quinquefasciatus", "Mansonia uniformis"],
      options_en: ["Aedes aegypti", "Anopheles sundaicus", "Culex quinquefasciatus", "Mansonia uniformis"],
      correct_answer: 0,
      explanation_id:
        "Dengue ditularkan secara tidak langsung melalui perantara vektor nyamuk betina Aedes aegypti.",
      explanation_en:
        "Dengue fever is transmitted indirectly via female Aedes aegypti mosquito vectors.",
      question_type: "single",
      sort_order: 2,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus4",
      is_reflection: false,
      question_id:
        "Urutan tahapan yang benar pada siklus litik bakteriofag adalah...",
      question_en:
        "The correct sequential order of stages in the bacteriophage lytic cycle is...",
      question_image_url: "",
      options_id: [
        "Adsorbsi → Penetrasi → Sintesis → Pematangan/Perakitan → Lisis",
        "Penetrasi → Adsorbsi → Sintesis → Lisis → Pematangan",
        "Adsorbsi → Sintesis → Penetrasi → Lisis → Pematangan",
        "Sintesis → Penetrasi → Adsorbsi → Pematangan → Lisis",
      ],
      options_en: [
        "Adsorption → Penetration → Biosynthesis → Assembly → Lysis",
        "Penetration → Adsorption → Biosynthesis → Lysis → Assembly",
        "Adsorption → Biosynthesis → Penetration → Lysis → Assembly",
        "Biosynthesis → Penetration → Adsorption → Assembly → Lysis",
      ],
      correct_answer: 0,
      explanation_id:
        "Urutan daur litik: Adsorbsi (menempel), Penetrasi (injeksi DNA), Sintesis (replikasi protein/DNA), Pematangan (perakitan virion), Lisis (pemecahan sel).",
      explanation_en:
        "Lytic sequence: Adsorption (attachment), Penetration (DNA injection), Biosynthesis, Assembly (virion maturation), Lysis (cell rupture).",
      question_type: "single",
      sort_order: 3,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus4",
      is_reflection: false,
      question_id:
        "DNA virus yang menyatu dan berintegrasi dengan kromosom sel inang pada siklus lisogenik dinamakan...",
      question_en:
        "Viral DNA integrated stably into the host cellular chromosome during lysogeny is termed a...",
      question_image_url: "",
      options_id: ["Profag", "Virion", "Kapsid", "Mesosom"],
      options_en: ["Prophage", "Virion", "Capsid", "Mesosome"],
      correct_answer: 0,
      explanation_id:
        "Profag adalah materi genetik virus yang tersisip dan terintegrasi di dalam kromosom bakteri.",
      explanation_en:
        "A prophage is the viral genome integrated into the circular bacterial chromosome.",
      question_type: "single",
      sort_order: 4,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus4",
      is_reflection: false,
      question_id:
        "Virus yang memiliki kemampuan untuk menjalani siklus litik maupun lisogenik disebut...",
      question_en:
        "Viruses capable of undergoing both lytic and lysogenic reproductive pathways are known as...",
      question_image_url: "",
      options_id: ["Virus temperat (misalnya Fag λ)", "Virus virulen", "Virus telanjang", "Retrovirus obligat"],
      options_en: ["Temperate viruses (e.g. Phage λ)", "Virulent viruses", "Naked viruses", "Obligate retroviruses"],
      correct_answer: 0,
      explanation_id:
        "Virus temperat dapat beralih antara daur litik dan daur lisogenik sesuai kondisi fisiologis inang; contohnya bakteriofag Lambda.",
      explanation_en:
        "Temperate phages switch between lytic and lysogenic cascades depending on cellular conditions; e.g. Phage Lambda.",
      question_type: "single",
      sort_order: 5,
    },

    // Sub 5: Bentuk & Klasifikasi (5 soal)
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus5",
      is_reflection: false,
      question_id:
        "Menurut tata nama sistem ICTV, nama famili virus selalu ditandai dengan akhiran...",
      question_en:
        "Under the ICTV taxonomic system, viral family designations uniformly conclude with the suffix...",
      question_image_url: "",
      options_id: ["-viridae", "-virus", "-virales", "-virinae"],
      options_en: ["-viridae", "-virus", "-virales", "-virinae"],
      correct_answer: 0,
      explanation_id:
        "Famili virus berakhiran -viridae (misal Poxviridae, Retroviridae), sedangkan genus berakhiran -virus.",
      explanation_en:
        "Viral families end in -viridae (e.g. Poxviridae, Retroviridae), while genera conclude in -virus.",
      question_type: "single",
      sort_order: 1,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus5",
      is_reflection: false,
      question_id:
        "Klasifikasi taksonomi ICTV yang benar untuk virus penyebab penyakit cacar adalah...",
      question_en:
        "The correct ICTV classification lineage for the smallpox virus is...",
      question_image_url: "",
      options_id: [
        "Famili Poxviridae, Genus Orthopoxvirus, Spesies Variola virus",
        "Famili Variolaviridae, Genus Pox, Spesies Orthopoxvirus",
        "Famili Herpesviridae, Genus Variola, Spesies Poxvirus",
        "Famili Retroviridae, Genus Lentivirus, Spesies Variola",
      ],
      options_en: [
        "Family Poxviridae, Genus Orthopoxvirus, Species Variola virus",
        "Family Variolaviridae, Genus Pox, Species Orthopoxvirus",
        "Family Herpesviridae, Genus Variola, Species Poxvirus",
        "Family Retroviridae, Genus Lentivirus, Species Variola",
      ],
      correct_answer: 0,
      explanation_id:
        "Taksonomi cacar: Famili Poxviridae → Genus Orthopoxvirus → Spesies Variola virus.",
      explanation_en:
        "Smallpox taxonomy: Family Poxviridae → Genus Orthopoxvirus → Species Variola virus.",
      question_type: "single",
      sort_order: 2,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus5",
      is_reflection: false,
      question_id:
        "Kelompok virus di bawah ini yang semuanya tergolong sebagai VIRUS DNA adalah...",
      question_en:
        "Which group below consists EXCLUSIVELY of DNA viruses?",
      question_image_url: "",
      options_id: [
        "Herpesvirus, Papovavirus, Adenovirus, Parvovirus",
        "Coronavirus, Picornavirus, Paramyxovirus, Retrovirus",
        "Flavivirus, Rhabdovirus, Togavirus, Orthomyxovirus",
        "Poliovirus, HIV, Ebola virus, Influenza virus",
      ],
      options_en: [
        "Herpesvirus, Papovavirus, Adenovirus, Parvovirus",
        "Coronavirus, Picornavirus, Paramyxovirus, Retrovirus",
        "Flavivirus, Rhabdovirus, Togavirus, Orthomyxovirus",
        "Poliovirus, HIV, Ebola virus, Influenza virus",
      ],
      correct_answer: 0,
      explanation_id:
        "Virus DNA meliputi Parvo, Papova, Adeno, Herpes, dan Poxvirus. Corona, Polio, Flavi, dan Influenza adalah virus RNA.",
      explanation_en:
        "DNA viruses include Parvo, Papova, Adeno, Herpes, and Poxviruses. Corona, Polio, Flavi, and Influenza are RNA viruses.",
      question_type: "single",
      sort_order: 3,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus5",
      is_reflection: false,
      question_id:
        "Virus dengan bentuk asimetris menyerupai peluru adalah...",
      question_en:
        "The virus exhibiting an asymmetrical bullet-shaped morphology is the...",
      question_image_url: "",
      options_id: ["Rhabdovirus (penyebab rabies)", "Bakteriofag T4", "Tobacco Mosaic Virus", "Adenovirus"],
      options_en: ["Rhabdovirus (rabies agent)", "Bacteriophage T4", "Tobacco Mosaic Virus", "Adenovirus"],
      correct_answer: 0,
      explanation_id:
        "Rhabdovirus (famili Rhabdoviridae penyebab rabies) memiliki morfologi silindris berujung bundar khas menyerupai peluru.",
      explanation_en:
        "Rhabdoviruses causing rabies display a characteristic cylindrical bullet-shaped morphology.",
      question_type: "single",
      sort_order: 4,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus5",
      is_reflection: false,
      question_id:
        "Morfologi berikut yang BUKAN merupakan bentuk virus, melainkan bentuk sel bakteri adalah...",
      question_en:
        "Which term does NOT designate a viral morphology, but rather a bacterial cell shape?",
      question_image_url: "",
      options_id: ["Kokus dan Streptobasil", "Heliks / Batang", "Polihedral", "Kompleks T"],
      options_en: ["Coccus and Streptobacillus", "Helical / Rod", "Polyhedral", "Complex T"],
      correct_answer: 0,
      explanation_id:
        "Kokus (bulat seluler) dan streptobasil adalah bentuk sel bakteri. Bentuk virus meliputi heliks, polihedral, sferis, peluru, dan kompleks T.",
      explanation_en:
        "Coccus and streptobacillus represent bacterial forms. Virus shapes are helical, polyhedral, spherical, bullet, and complex.",
      question_type: "single",
      sort_order: 5,
    },

    // Sub 6: Peranan Virus (5 soal)
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus6",
      is_reflection: false,
      question_id:
        "Dalam teknologi terapi gen, virus Retrovirus dimanfaatkan sebagai vektor untuk menyisipkan gen pengkode enzim...",
      question_en:
        "In gene therapy biotechnology, Retroviruses serve as vectors delivering genes encoding the enzyme...",
      question_image_url: "",
      options_id: [
        "Adenosin Deaminase (ADA) ke limfosit T",
        "Amilase ke sel pankreas",
        "Pepsinogen ke lambung",
        "Lipase ke usus halus",
      ],
      options_en: [
        "Adenosine Deaminase (ADA) into T lymphocytes",
        "Amylase into pancreatic cells",
        "Pepsinogen into gastric mucosa",
        "Lipase into small intestine",
      ],
      correct_answer: 0,
      explanation_id:
        "Retrovirus dipakai sebagai vektor terapi gen untuk memasukkan gen enzim ADA ke sel limfosit T penderita SCID.",
      explanation_en:
        "Retroviruses deliver ADA enzyme genes into defective T lymphocytes in SCID gene therapy.",
      question_type: "single",
      sort_order: 1,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus6",
      is_reflection: false,
      question_id:
        "Kelompok virus yang dimanfaatkan sebagai agen bioinsektisida ramah lingkungan pembasmi serangga hama adalah...",
      question_en:
        "The viral group deployed as an eco-friendly bioinsecticide against agricultural pests is...",
      question_image_url: "",
      options_id: ["Baculovirus", "Aphthovirus", "Morbillivirus", "Picornavirus"],
      options_en: ["Baculovirus", "Aphthovirus", "Morbillivirus", "Picornavirus"],
      correct_answer: 0,
      explanation_id:
        "Baculovirus dibiakkan dan disemprotkan untuk membasmi hama ulat/serangga tanpa mencemari lingkungan.",
      explanation_en:
        "Baculoviruses are formulated and sprayed to suppress insect pests without chemical environmental pollution.",
      question_type: "single",
      sort_order: 2,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus6",
      is_reflection: false,
      question_id:
        "Penyakit menular pada sapi dan domba yang menimbulkan demam tinggi serta lepuh pada mukosa mulut dan kuku disebabkan oleh...",
      question_en:
        "The epizootic livestock disease causing high fevers and vesicular mouth and hoof lesions is caused by...",
      question_image_url: "",
      options_id: ["Aphthovirus (PMK)", "Rhabdovirus (Rabies)", "Virus NCD (Tetelo)", "Morbillivirus"],
      options_en: ["Aphthovirus (FMD)", "Rhabdovirus (Rabies)", "NCD virus (Newcastle)", "Morbillivirus"],
      correct_answer: 0,
      explanation_id:
        "Aphthovirus menyebabkan Penyakit Mulut dan Kuku (PMK) yang sangat menular pada hewan ternak berkuku belah.",
      explanation_en:
        "Aphthovirus causes Foot-and-Mouth Disease (FMD) in cloven-hoofed livestock.",
      question_type: "single",
      sort_order: 3,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus6",
      is_reflection: false,
      question_id:
        "Penyakit tungro yang menyebabkan tanaman padi kerdil ditularkan melalui perantara vektor serangga...",
      question_en:
        "Tungro disease causing rice stunting and chlorosis is vectored by...",
      question_image_url: "",
      options_id: [
        "Wereng hijau dan wereng cokelat",
        "Nyamuk Anopheles",
        "Kutu daun tembakau",
        "Lalat buah",
      ],
      options_en: [
        "Green and brown leafhoppers / planthoppers",
        "Anopheles mosquitoes",
        "Tobacco aphids",
        "Fruit flies",
      ],
      correct_answer: 0,
      explanation_id:
        "Virus tungro ditularkan oleh serangga wereng hijau (Nephotettix virescens) dan wereng cokelat pada tanaman padi.",
      explanation_en:
        "Tungro viruses are spread to rice paddies by green leafhoppers (Nephotettix virescens) and brown planthoppers.",
      question_type: "single",
      sort_order: 4,
    },
    {
      bab_id: "virus",
      sub_bab_key: "sub.virus6",
      is_reflection: false,
      question_id:
        "Penyakit Tetelo (Newcastle Disease) pada unggas ditandai dengan gejala klinis...",
      question_en:
        "Newcastle Disease (Tetelo) in poultry presents with characteristic clinical manifestations of...",
      question_image_url: "",
      options_id: [
        "Diare, batuk, kehilangan keseimbangan, dan kepala terputar (tortikolis)",
        "Muncul bercak kuning pada bulu sayap",
        "Kuku ayam terlepas dan berlendir",
        "Pembengkakan parotis kelenjar ludah",
      ],
      options_en: [
        "Diarrhea, coughing, loss of balance, and twisted neck tremors (torticollis)",
        "Yellow spots appearing on feathers",
        "Detached claws and foot slime",
        "Swelling of parotid salivary glands",
      ],
      correct_answer: 0,
      explanation_id:
        "Tetelo pada unggas disebabkan oleh virus NCD dengan ciri khas batuk, diare, gangguan syaraf dan tortikolis (kepala tertekuk berputar).",
      explanation_en:
        "Newcastle Disease (NCD) produces respiratory distress, diarrhea, neuro-tremors, and torticollis.",
      question_type: "single",
      sort_order: 5,
    },

    // Refleksi Akhir Bab (5 soal Benar/Salah)
    {
      bab_id: "virus",
      sub_bab_key: "",
      is_reflection: true,
      question_id:
        "Sel inang pada siklus lisogenik tidak segera mengalami lisis dan tetap dapat bereproduksi secara normal.",
      question_en:
        "Host cells in the lysogenic cycle do not undergo immediate lysis and retain normal cellular division.",
      question_image_url: "",
      options_id: ["Benar", "Salah"],
      options_en: ["True", "False"],
      correct_answer: 0,
      explanation_id:
        "Benar. Pada daur lisogenik, genom virus menyisip sebagai profag dan ikut digandakan tanpa mematikan sel inang.",
      explanation_en:
        "True. In lysogeny, the viral genome integrates as a prophage and duplicates alongside host DNA without cell lysis.",
      question_type: "true_false",
      sort_order: 1,
    },
    {
      bab_id: "virus",
      sub_bab_key: "",
      is_reflection: true,
      question_id:
        "HIV mengikat reseptor CD4 pada sel limfosit T pembantu sebagai bukti spesifisitas inang 'lock and key'.",
      question_en:
        "HIV binds specifically to CD4 receptors on helper T cells, demonstrating 'lock and key' host tropism.",
      question_image_url: "",
      options_id: ["Benar", "Salah"],
      options_en: ["True", "False"],
      correct_answer: 0,
      explanation_id:
        "Benar. Glikoprotein gp120 pada HIV secara spesifik mengikat reseptor CD4 limfosit T sistem imun manusia.",
      explanation_en:
        "True. HIV gp120 specifically complexes with CD4 receptors on human T-helper lymphocytes.",
      question_type: "true_false",
      sort_order: 2,
    },
    {
      bab_id: "virus",
      sub_bab_key: "",
      is_reflection: true,
      question_id:
        "Pemberian antibiotik penisilin atau tetrasiklin dapat menyembuhkan penyakit influenza dan cacar.",
      question_en:
        "Administering penicillin or tetracycline antibiotics can cure influenza and smallpox.",
      question_image_url: "",
      options_id: ["Benar", "Salah"],
      options_en: ["True", "False"],
      correct_answer: 1,
      explanation_id:
        "Salah. Antibiotik hanya membunuh bakteri dan sama sekali tidak bekerja melawan virus.",
      explanation_en:
        "False. Antibiotics target bacterial pathways and possess zero efficacy against viral pathogens.",
      question_type: "true_false",
      sort_order: 3,
    },
    {
      bab_id: "virus",
      sub_bab_key: "",
      is_reflection: true,
      question_id:
        "Profag di dalam sel anakan dapat terinduksi menjadi aktif dan beralih memasuki tahapan siklus litik.",
      question_en:
        "A dormant prophage inside daughter cells can be induced to excise and enter the lytic cascade.",
      question_image_url: "",
      options_id: ["Benar", "Salah"],
      options_en: ["True", "False"],
      correct_answer: 0,
      explanation_id:
        "Benar. Faktor stres seperti radiasi UV dapat menginduksi profag keluar dari kromosom dan memicu siklus litik.",
      explanation_en:
        "True. Stress triggers such as UV radiation induce prophage excision into the active lytic pathway.",
      question_type: "true_false",
      sort_order: 4,
    },
    {
      bab_id: "virus",
      sub_bab_key: "",
      is_reflection: true,
      question_id:
        "Penyakit tungro pada tanaman padi ditularkan melalui media udara bebas tanpa membutuhkan vektor serangga.",
      question_en:
        "Tungro disease in rice paddies transmits through ambient air without requiring insect vectors.",
      question_image_url: "",
      options_id: ["Benar", "Salah"],
      options_en: ["True", "False"],
      correct_answer: 1,
      explanation_id:
        "Salah. Tungro ditularkan secara tidak langsung melalui vektor serangga wereng hijau dan wereng cokelat.",
      explanation_en:
        "False. Tungro transmits strictly via leafhopper/planthopper insect vectors.",
      question_type: "true_false",
      sort_order: 5,
    },
  ];

  const { error: quizError } = await supabase.from("sub_bab_quiz").insert(quizzes);
  if (quizError) throw new Error("Quiz insert failed: " + quizError.message);
  console.log("✓ 27 quiz questions inserted.");

  // 6. Insert / Upsert Struktur Fungsi Flashcard
  const { error: structError } = await supabase.from("struktur_fungsi").upsert({
    bab_id: "virus",
    title: "Struktur Tubuh Bakteriofag (Virus T)",
    title_en: "Bacteriophage (T-Phage) Anatomy",
    image_url: "/images/virus/struktur-virus.svg",
    image_alt: "Diagram anatomi bakteriofag T",
    sub_bab_key: "sub.virus3",
    sort_order: 0,
    flashcards: [
      {
        name: "Kapsid (Kepala Polihedral)",
        name_en: "Capsid (Polyhedral Head)",
        description:
          "Selubung terluar kepala virus yang tersusun atas subunit protein kapsomer; berfungsi memberi bentuk dan melindungi materi genetik DNA dari enzim perusak.",
        description_en:
          "The outer head shell constructed of repeating capsomere proteins; shapes the virion and shields the genomic DNA from degradative enzymes.",
        x: 50,
        y: 28,
      },
      {
        name: "Asam Nukleat (DNA)",
        name_en: "Nucleic Acid (DNA)",
        description:
          "Molekul materi genetik (DNA untai ganda) di dalam kapsid yang membawa instruksi replikasi dan perakitan virion-virion baru.",
        description_en:
          "The internal double-stranded DNA molecule harboring instructions for replication and viral component assembly.",
        x: 50,
        y: 35,
      },
      {
        name: "Selubung Ekor (Tail Sheath)",
        name_en: "Tail Sheath",
        description:
          "Silinder protein kontraktil yang dapat memendek untuk mendorong jarum penusuk menembus dinding sel inang saat penetrasi.",
        description_en:
          "A contractile protein cylinder that shortens to thrust the internal injection core through the host cell wall.",
        x: 50,
        y: 55,
      },
      {
        name: "Lempeng Dasar (Base Plate)",
        name_en: "Base Plate",
        description:
          "Lempeng heksagonal di pangkal ekor yang memegang jarum penusuk (tail pins) untuk melubangi membran sel inang.",
        description_en:
          "The hexagonal terminal platform anchoring tail pins to puncture host cellular membranes.",
        x: 50,
        y: 67,
      },
      {
        name: "Serabut Ekor (Tail Fibers)",
        name_en: "Tail Fibers",
        description:
          "Serabut filamen protein yang mengenali reseptor spesifik pada permukaan sel bakteri (lock and key) untuk perlekatan awal.",
        description_en:
          "Flexible protein fibers that identify and latch onto complementary host surface receptors.",
        x: 57,
        y: 77,
      },
      {
        name: "Dinding Sel Inang (Bakteri)",
        name_en: "Host Cell Wall (Bacterium)",
        description:
          "Permukaan luar bakteri (peptidoglikan) yang ditembus oleh bakteriofag untuk menyuntikkan genom DNA ke dalam sitoplasma.",
        description_en:
          "The bacterial outer envelope penetrated by the phage apparatus to deliver DNA into the cytoplasm.",
        x: 50,
        y: 90,
      },
    ],
  });
  if (structError) {
    console.warn("Notice: struktur_fungsi insert:", structError.message);
  } else {
    console.log("✓ struktur_fungsi for virus inserted.");
  }

  console.log("ALL SEEDING COMPLETED SUCCESSFULLY!");
}

main().catch((err) => {
  console.error("FATAL ERROR during seeding:", err);
  process.exit(1);
});
