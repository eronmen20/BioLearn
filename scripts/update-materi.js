const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const newContentId = `<section>
  <h3>Kapsul atau Lapisan Lendir</h3>
  <img src="/images/bakteri/kapsul.svg" alt="Diagram Kapsul dan Lapisan Lendir Bakteri" />
  <p>
    <strong>Kapsul</strong> merupakan lapisan lengket yang tersusun atas polisakarida atau protein di bagian paling luar sel bakteri.
    Lapisan ini memungkinkan bakteri melekat pada permukaan (substrat) maupun pada bakteri lain dalam satu koloni.
    Selain berfungsi sebagai alat perlekatan, beberapa kapsul juga melindungi bakteri dari dehidrasi serta membantu bakteri patogen menghindari serangan sistem kekebalan (fagositosis) tubuh inangnya.
  </p>
  <p>
    Berdasarkan ketebalannya, kapsul dibedakan menjadi dua jenis, yaitu <strong>kapsul</strong> dan <strong>lapisan lendir</strong>:
  </p>
  <h4>a. Kapsul</h4>
  <p>
    Lapisan pelindung yang tebal dan berikatan kuat dengan dinding sel, umumnya dimiliki oleh bakteri patogen (seperti <em>Salmonella sp.</em> dan <em>Streptococcus pneumoniae</em>). Berfungsi membantu virulensi bakteri bertahan di dalam tubuh inang.
  </p>
  <h4>b. Lapisan Lendir</h4>
  <p>
    Lapisan pelindung yang lebih tipis, longgar, dan mudah terlepas, umumnya dimiliki oleh bakteri saprofit. Tersusun atas air dan polisakarida untuk mencegah kekeringan dan membantu adhesi substrat.
  </p>

  <h3>Dinding Sel</h3>
  <img src="/images/bakteri/dinding-sel.svg" alt="Diagram Dinding Sel Peptidoglikan (Murein)" />
  <p>
    <strong>Dinding sel</strong> merupakan struktur kaku di luar membran plasma yang dimiliki hampir semua bakteri. Berbeda dengan dinding sel tumbuhan (selulosa) atau fungi (kitin), dinding sel bakteri tersusun atas <strong>peptidoglikan (murein)</strong>—jaringan rantai disakarida (NAG dan NAM) yang dihubungkan oleh ikatan silang peptida.
  </p>
  <h4>Fungsi Utama Dinding Sel:</h4>
  <ul>
    <li>Mempertahankan bentuk sel bakteri agar tetap konstan dan kokoh.</li>
    <li>Memberikan perlindungan fisik dari benturan dan tekanan mekanik.</li>
    <li>Mencegah sel pecah (lisis osmotik) ketika berada di lingkungan cairan hipotonik.</li>
    <li>Menjadi dasar pewarnaan Gram (Gram-Positif dinding tebal ungu vs Gram-Negatif dinding tipis merah).</li>
  </ul>

  <h3>Membran Plasma</h3>
  <img src="/images/bakteri/membran-plasma.svg" alt="Diagram Fosfolipid Bilayer Membran Plasma" />
  <p>
    <strong>Membran plasma</strong> tersusun atas lapisan ganda fosfolipid (<em>phospholipid bilayer</em>) dan protein integral maupun perifer. Membran ini bersifat <strong>selektif permeabel</strong>, mengatur lalu lintas zat masuk dan keluar sel.
  </p>
  <p>
    Karena bakteri prokariot tidak memiliki mitokondria, membran plasma bakteri mengalami invaginasi membentuk lipatan (mesosom) yang kaya enzim sitokrom dan ATP sintase untuk tempat respirasi seluler.
  </p>
  <h4>Fungsi Membran Plasma:</h4>
  <ul>
    <li>Membungkus dan membatasi sitoplasma sel dari lingkungan luar.</li>
    <li>Mengatur transportasi nutrisi, ion, dan pembuangan sisa metabolit.</li>
    <li>Tempat berlangsungnya transpor elektron dan pembentukan energi dalam bentuk <strong>ATP</strong>.</li>
  </ul>

  <h3>Sitoplasma</h3>
  <p>
    <strong>Sitoplasma</strong> merupakan cairan koloid homogen kental yang mengisi seluruh bagian dalam sel bakteri dan dibatasi oleh membran plasma. Tidak memiliki sitoskeleton kompleks seperti sel eukariotik, sitoplasma bakteri terdiri dari 80% air, protein terlarut, enzim, karbohidrat, lipid, dan ion anorganik.
  </p>
  <p>
    Sitoplasma merupakan panggung utama tempat berlangsungnya seluruh <strong>reaksi kimia dan metabolisme seluler</strong> bakteri, mulai dari glikolisis, biosintesis asam amino, hingga replikasi molekuler. Di dalam sitoplasma juga tersuspensi nukleoid, ribosom, plasmid, serta badan inklusi cadangan makanan (seperti granula glikogen atau polifosfat).
  </p>

  <h3>Nukleoid</h3>
  <img src="/images/bakteri/nukleoid.svg" alt="Diagram Nukleoid dan DNA Sirkuler Bakteri" />
  <p>
    <strong>Nukleoid</strong> (daerah inti) merupakan wilayah tempat berkumpulnya materi genetik utama bakteri. Berbeda dengan eukariotik, DNA bakteri <strong>tidak diselubungi membran inti</strong> sehingga bersentuhan langsung dengan sitoplasma.
  </p>
  <p>
    Materi genetik pada nukleoid berupa <strong>satu molekul DNA untai ganda sirkuler panjang (kromosom bakteri)</strong> yang memadat dan terlipat superkoil. Berisi ribuan gen esensial yang mengontrol seluruh siklus hidup, pembelahan sel, dan metabolisme bakteri.
  </p>

  <h3>Plasmid</h3>
  <img src="/images/bakteri/plasmid.svg" alt="Diagram Molekul Plasmid dan Gen Resistensi" />
  <p>
    <strong>Plasmid</strong> adalah molekul DNA sirkuler kecil di luar kromosom utama (ekstrakromosomal) yang dapat bereplikasi secara mandiri. Ukurannya jauh lebih kecil dari kromosom bakteri.
  </p>
  <p>
    Plasmid umumnya membawa gen-gen khusus non-esensial yang memberikan keuntungan adaptif, dan dapat dipindahkan antar-bakteri melalui mekanisme konjugasi.
  </p>
  <h4>Fungsi dan Karakteristik Plasmid:</h4>
  <ul>
    <li>Membawa gen resistensi antibiotik (Plasmid R) yang membuat bakteri kebal obat.</li>
    <li>Membawa faktor fertilitas (Plasmid F) untuk pembentukan pilus seks pada konjugasi.</li>
    <li>Membawa gen penghasil toksin atau bakteriosin.</li>
    <li>Dimanfaatkan luas dalam bioteknologi sebagai vektor kloning DNA rekombinan.</li>
  </ul>

  <h3>Ribosom</h3>
  <img src="/images/bakteri/ribosom.svg" alt="Diagram Ribosom 70S Bakteri (Subunit 50S dan 30S)" />
  <p>
    <strong>Ribosom</strong> adalah struktur tanpa membran yang berfungsi sebagai <strong>mesin sintesis protein</strong> melalui proses translasi kode genetik dari mRNA.
  </p>
  <p>
    Ribosom bakteri berukuran <strong>70S</strong>, tersusun atas dua subunit: <strong>subunit besar (50S)</strong> dan <strong>subunit kecil (30S)</strong>. Ukuran 70S ini lebih kecil dari ribosom eukariotik (80S), sehingga menjadi target selektif banyak jenis antibiotik (seperti eritromisin dan tetrasiklin) yang menghambat sintesis protein bakteri tanpa merusak sel tubuh manusia.
  </p>

  <h3>Flagela</h3>
  <img src="/images/bakteri/flagela.svg" alt="Diagram Struktur Flagela dan Motor Badan Basal" />
  <p>
    <strong>Flagela</strong> merupakan struktur cambuk panjang berdiameter sekitar 20 nm yang berfungsi sebagai alat gerak (motilitas) bakteri untuk mendekati nutrisi atau menjauhi zat berbahaya (kemotaksis).
  </p>
  <p>
    Struktur flagela terdiri atas 3 komponen utama:
  </p>
  <ul>
    <li><strong>Filamen:</strong> Tabung heliks panjang tersusun dari protein <em>flagelin</em> yang berputar sebagai baling-baling.</li>
    <li><strong>Kait (Hook):</strong> Penghubung fleksibel yang menyalurkan torsi putaran ke filamen.</li>
    <li><strong>Badan Basal:</strong> Motor cincin tertanam di membran plasma dan dinding sel, digerakkan oleh gradien proton (daya gerak proton) hingga ribuan putaran per menit!</li>
  </ul>

  <h3>Pilus dan Fimbriae</h3>
  <img src="/images/bakteri/pilus.svg" alt="Diagram Pilus Konjugasi dan Fimbriae Pelekatan" />
  <p>
    <strong>Pili</strong> dan <strong>fimbriae</strong> adalah struktur tonjolan halus seperti rambut di permukaan sel bakteri yang tersusun dari protein <em>pilin</em>. Keduanya lebih tipis dan kaku dibandingkan flagela.
  </p>
  <h4>Perbedaan Pilus dan Fimbriae:</h4>
  <ul>
    <li><strong>Fimbriae:</strong> Berjumlah ratusan di permukaan sel, berfungsi membantu pelekatan (adhesi) bakteri pada jaringan tubuh inang atau substrat kolonisasi.</li>
    <li><strong>Pilus Seks (Pilus Konjugasi):</strong> Berjumlah sedikit (1-10 per sel), lebih panjang, berfungsi membentuk tabung konjugasi untuk mentransfer materi genetik (plasmid) antar sel bakteri.</li>
  </ul>
</section>`;

const newContentEn = `<section>
  <h3>Capsule or Slime Layer</h3>
  <img src="/images/bakteri/kapsul.svg" alt="Bacterial Capsule and Slime Layer Diagram" />
  <p>
    <strong>The capsule</strong> is a sticky outer protective layer composed of polysaccharides or proteins.
    This layer allows bacteria to adhere to surfaces and to other bacteria in a colony, prevents dehydration, and shields pathogenic bacteria from phagocytosis by host immune cells.
  </p>
  <h4>a. Capsule</h4>
  <p>A thick, dense protective layer firmly attached to the cell wall, common in virulent pathogens like <em>Salmonella sp.</em></p>
  <h4>b. Slime Layer</h4>
  <p>A thinner, loosely attached layer predominantly composed of water and polysaccharides that prevents desiccation.</p>

  <h3>Cell Wall</h3>
  <img src="/images/bakteri/dinding-sel.svg" alt="Peptidoglycan Cell Wall Diagram" />
  <p>
    <strong>The bacterial cell wall</strong> is composed of <strong>peptidoglycan (murein)</strong>—a polymer of alternating NAG and NAM disaccharides cross-linked by amino acid peptides.
  </p>
  <h4>Key Functions:</h4>
  <ul>
    <li>Maintains rigidity and defined cell shape.</li>
    <li>Protects against osmotic lysis in hypotonic environments.</li>
    <li>Serves as the basis for Gram staining (Gram-positive purple vs Gram-negative pink).</li>
  </ul>

  <h3>Plasma Membrane</h3>
  <img src="/images/bakteri/membran-plasma.svg" alt="Plasma Membrane Phospholipid Bilayer Diagram" />
  <p>
    <strong>The plasma membrane</strong> is a selectively permeable phospholipid bilayer embedded with transport and enzymatic proteins.
    In bacteria, it also hosts electron transport chains and ATP synthase for cellular respiration in place of mitochondria.
  </p>

  <h3>Cytoplasm</h3>
  <p>
    <strong>The cytoplasm</strong> is the gelatinous fluid filling the cell interior inside the plasma membrane. It consists of 80% water along with suspended enzymes, ions, ribosomes, plasmids, and the nucleoid.
    It serves as the dynamic site for all cellular metabolic reactions and macromolecule synthesis.
  </p>

  <h3>Nucleoid</h3>
  <img src="/images/bakteri/nukleoid.svg" alt="Bacterial Nucleoid and Circular DNA Diagram" />
  <p>
    <strong>The nucleoid</strong> is the region harboring the bacterial circular chromosome. Unlike eukaryotes, bacterial DNA is <strong>not enclosed within a nuclear membrane</strong> and directly interfaces with the cytoplasm.
  </p>

  <h3>Plasmid</h3>
  <img src="/images/bakteri/plasmid.svg" alt="Plasmid DNA Molecule Diagram" />
  <p>
    <strong>Plasmids</strong> are small, circular extrachromosomal DNA molecules capable of autonomous self-replication. They frequently carry adaptive traits such as antibiotic resistance (R-plasmids) and fertility genes (F-plasmids).
  </p>

  <h3>Ribosomes</h3>
  <img src="/images/bakteri/ribosom.svg" alt="70S Bacterial Ribosome Diagram" />
  <p>
    <strong>Bacterial ribosomes</strong> are <strong>70S</strong> molecular complexes (50S large subunit + 30S small subunit) responsible for translating mRNA into functional proteins.
  </p>

  <h3>Flagella</h3>
  <img src="/images/bakteri/flagela.svg" alt="Flagella and Motor Basal Apparatus Diagram" />
  <p>
    <strong>Flagella</strong> are long, whip-like organelles powered by a proton gradient motor in the basal body, rotating to provide bacterial motility (chemotaxis).
  </p>

  <h3>Pilus and Fimbriae</h3>
  <img src="/images/bakteri/pilus.svg" alt="Conjugation Pilus and Fimbriae Diagram" />
  <p>
    <strong>Fimbriae</strong> enable attachment to host tissues, while <strong>sex pili</strong> form conjugation bridges for horizontal gene transfer between bacterial cells.
  </p>
</section>`;

async function run() {
  const { error } = await supabase
    .from("materi")
    .update({
      content_id: newContentId,
      content_en: newContentEn,
      updated_at: new Date().toISOString(),
    })
    .eq("bab_id", "bakteri")
    .eq("sub_bab_key", "struktur.sel.bakteri");

  if (error) {
    console.error("Error updating materi:", error);
    process.exit(1);
  }
  console.log("Successfully updated materi in Supabase for struktur.sel.bakteri!");
}

run();
