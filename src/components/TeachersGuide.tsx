import React, { useState, useEffect } from 'react';
import { ArrowLeft, Printer, BookOpen, Trash2, CheckCircle2, AlertTriangle, Lightbulb, Users, HelpCircle } from 'lucide-react';
import { Language, translations } from '../utils/translations';
import { soundEngine } from '../utils/audio';

interface TeachersGuideProps {
  lang: Language;
  onBack: () => void;
}

export const TeachersGuide: React.FC<TeachersGuideProps> = ({ lang, onBack }) => {
  const t = translations[lang];
  const [notes, setNotes] = useState<string>('');
  const [notesStatus, setNotesStatus] = useState<string>('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem('kssr_teacher_notes');
      if (saved) {
        setNotes(saved);
      }
    } catch {
      // Safe fallback
    }
  }, []);

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setNotes(val);
    try {
      localStorage.setItem('kssr_teacher_notes', val);
      setNotesStatus(lang === 'ms' ? 'Disimpan ✓' : 'Saved ✓');
      setTimeout(() => setNotesStatus(''), 2000);
    } catch {
      // Safe fallback
    }
  };

  const handleClearNotes = () => {
    const confirmMsg =
      lang === 'ms'
        ? 'Adakah anda pasti mahu mengosongkan semua catatan ini?'
        : 'Are you sure you want to clear all your notes?';
    if (window.confirm(confirmMsg)) {
      setNotes('');
      try {
        localStorage.removeItem('kssr_teacher_notes');
      } catch {
        // Safe fallback
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:bg-white print:text-black">
      {/* Top Action Bar (Hidden in Print) */}
      <div className="max-w-5xl mx-auto mb-6 flex flex-wrap items-center justify-between gap-4 print:hidden">
        <button
          type="button"
          onClick={() => {
            soundEngine.playClick();
            onBack();
          }}
          className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-extrabold text-sm border-2 border-slate-300 shadow-xs transition-all cursor-pointer min-h-[48px]"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>{t.backToApp}</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-2 py-3 px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer min-h-[48px]"
          >
            <Printer className="w-5 h-5" />
            <span>{t.printGuide}</span>
          </button>
        </div>
      </div>

      {/* Guide Document Container */}
      <article className="max-w-5xl mx-auto bg-white rounded-3xl border-2 border-slate-200 shadow-sm p-6 sm:p-10 print:border-none print:shadow-none print:p-0 space-y-10">
        {/* Document Header */}
        <header className="border-b-2 border-slate-200 pb-6 print:border-b">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-black uppercase mb-3 print:border print:border-black">
            <BookOpen className="w-4 h-4 text-amber-700" />
            <span>KSSR Semakan 2017 • Matematik Tahun 6</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight print:text-2xl">
            {t.tgTitle}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 font-semibold mt-1 print:text-sm">
            {t.tgSubtitle}
          </p>
        </header>

        {/* Table of Contents (Hidden in Print) */}
        <nav
          aria-label="Senarai Kandungan Panduan"
          className="bg-amber-50/80 p-5 rounded-2xl border border-amber-200 print:hidden"
        >
          <h2 className="text-sm font-black text-amber-950 uppercase tracking-wider mb-3">
            {t.tgToc}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold">
            <a href="#tujuan" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec1}
            </a>
            <a href="#jadual-dskp" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec2}
            </a>
            <a href="#cara-guna" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec3}
            </a>
            <a href="#ciri-soalan" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec4}
            </a>
            <a href="#jadual-peraturan" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec5}
            </a>
            <a href="#salah-faham" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec6}
            </a>
            <a href="#penggunaan-kelas" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec7}
            </a>
            <a href="#pembezaan" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec8}
            </a>
            <a href="#penyelesaian-masalah" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec9}
            </a>
            <a href="#nota-guru" className="text-amber-800 hover:text-amber-950 hover:underline p-1">
              {t.tgSec10}
            </a>
          </div>
        </nav>

        {/* SECTION 1: Tujuan Aplikasi */}
        <section id="tujuan" className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
            {t.tgSec1}
          </h2>
          <div className="text-sm leading-relaxed text-slate-700 space-y-2">
            {lang === 'ms' ? (
              <p>
                Aplikasi ini dibina khusus untuk membantu murid Tahun 6 menguasai{' '}
                <strong>Standard Pembelajaran 8.2.2</strong> secara interaktif dan berpusatkan murid.
                Matlamat utamanya adalah membolehkan murid menyatakan kebolehjadian suatu peristiwa
                menggunakan lima istilah rasmi: <strong>Mustahil</strong>,{' '}
                <strong>Kecil kemungkinan</strong>, <strong>Sama kemungkinan</strong>,{' '}
                <strong>Besar kemungkinan</strong>, atau <strong>Pasti</strong>, serta berupaya
                memberikan sebab matematik yang munasabah berasaskan nisbah kesudahan sebenar.
              </p>
            ) : (
              <p>
                This application is designed to help Year 6 pupils master{' '}
                <strong>Learning Standard 8.2.2</strong> interactively. Its primary goal is to empower
                pupils to state the likelihood of an event using the five official terms:{' '}
                <strong>Impossible</strong>, <strong>Unlikely</strong>,{' '}
                <strong>Equally likely</strong>, <strong>Likely</strong>, or <strong>Certain</strong>,
                and provide reasonable mathematical justifications based on actual outcome counts.
              </p>
            )}
          </div>
        </section>

        {/* SECTION 2: Jadual Padanan DSKP */}
        <section id="jadual-dskp" className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
            {t.tgSec2}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border border-slate-300 rounded-xl overflow-hidden print:border-collapse">
              <thead className="bg-slate-100 text-slate-900 font-black border-b border-slate-300">
                <tr>
                  <th className="p-3 border-r border-slate-300">
                    {lang === 'ms' ? 'Ciri Aplikasi' : 'App Feature'}
                  </th>
                  <th className="p-3 border-r border-slate-300">
                    {lang === 'ms' ? 'Padanan Standard 8.2.2' : 'Mapping to Standard 8.2.2'}
                  </th>
                  <th className="p-3">
                    {lang === 'ms' ? 'Peranan Pedagogi' : 'Pedagogical Role'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-bold border-r border-slate-200">
                    {lang === 'ms' ? 'Skala 5 Anak Tangga' : '5-Step Ladder Gauge'}
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    {lang === 'ms' ? 'Menyatakan lima istilah rasmi' : 'Stating the five official terms'}
                  </td>
                  <td className="p-3 text-slate-600">
                    {lang === 'ms'
                      ? 'Memberi visual hierarki peluang dari 0% hingga 100% yang menyala secara langsung.'
                      : 'Provides a live visual hierarchy of probability from 0% to 100%.'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-bold border-r border-slate-200">
                    {lang === 'ms' ? 'Ayat & Pilihan Sebab' : 'Reasoning & Distractor Choices'}
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    {lang === 'ms' ? 'Memberi sebab yang munasabah' : 'Providing reasonable justifications'}
                  </td>
                  <td className="p-3 text-slate-600">
                    {lang === 'ms'
                      ? 'Menghubungkan bilangan kesudahan sasaran dengan separuh jumlah kesudahan.'
                      : 'Connects target outcome counts with the benchmark of half of total outcomes.'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-bold border-r border-slate-200">
                    {lang === 'ms' ? 'Butang "Cuba 100 kali"' : '"Try 100 times" Simulation'}
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    {lang === 'ms' ? 'Sokongan visual & pembuktian' : 'Visual support & empirical proof'}
                  </td>
                  <td className="p-3 text-slate-600">
                    {lang === 'ms'
                      ? 'Membuktikan kebarangkalian teori melalui kekerapan eksperimen sebenar.'
                      : 'Demonstrates theoretical likelihood through experimental frequency.'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-bold border-r border-slate-200">
                    {lang === 'ms' ? 'Alat (Dadu, Syiling, dsb)' : 'Tools (Dice, Coin, Spinner, Cards)'}
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    {lang === 'ms' ? 'Aplikasi lima istilah pelbagai konteks' : 'Multi-context likelihood application'}
                  </td>
                  <td className="p-3 text-slate-600">
                    {lang === 'ms'
                      ? 'Mengukuhkan kebolehan murid mengira kesudahan berbanding jumlah kesudahan.'
                      : 'Reinforces pupils counting favorable outcomes versus total outcomes.'}
                  </td>
                </tr>
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-bold border-r border-slate-200">
                    {lang === 'ms' ? 'Situasi Harian' : 'Daily Life Situations'}
                  </td>
                  <td className="p-3 border-r border-slate-200">
                    {lang === 'ms' ? 'Pengelasan lima istilah & sebab logik' : 'Classifying into 5 terms with logic'}
                  </td>
                  <td className="p-3 text-slate-600">
                    {lang === 'ms'
                      ? 'Menghubungkan konsep matematik dengan fenomena alam dan kehidupan harian.'
                      : 'Connects math concepts to natural laws and everyday experiences.'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 3: Cara Penggunaan Langkah Demi Langkah */}
        <section id="cara-guna" className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
            {t.tgSec3}
          </h2>
          <ol className="list-decimal list-inside space-y-2 text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
            {lang === 'ms' ? (
              <>
                <li><strong>Masukkan Nama:</strong> Di skrin utama, murid memasukkan nama dan menekan butang "Mula". Nama disimpan secara automatik dalam pelayar.</li>
                <li><strong>Perhatikan Beg Guli:</strong> Beg kain bermula kosong dan 3 biji guli awal akan jatuh masuk secara automatik berserta kesan bunyi.</li>
                <li><strong>Ubah Bilangan Guli:</strong> Gunakan butang + dan − untuk guli merah (🔴) dan biru (🔵) mengikut nisbah yang dikehendaki (antara 1 hingga 12 guli).</li>
                <li><strong>Perhatikan Tangga & Sebab:</strong> Lihat anak tangga kebolehjadian yang menyala serta baca ayat sebab matematik yang dijana secara langsung.</li>
                <li><strong>Uji Cabutan Rawak ("Ambil 1 guli"):</strong> Tekan butang untuk mencabut sebiji guli secara rawak, perhatikan hasilnya, dan lihat guli dimasukkan semula.</li>
                <li><strong>Jalankan Simulasi ("Cuba 100 kali"):</strong> Tekan butang untuk melihat bar kekerapan 100 ambilan pantas bagi mengesahkan kebolehjadian.</li>
                <li><strong>Terokai Bentuk Alat:</strong> Buka tab "Pilih Bentuk Alat" untuk meneroka dadu, syiling, pemutar, dan kad bernombor dengan pelbagai situasi.</li>
                <li><strong>Kaji Situasi Harian:</strong> Buka tab "Situasi Harian" untuk mengelaskan peristiwa alam dan dunia sebenar kepada lima istilah berserta sebab.</li>
                <li><strong>Latihan Cabaran & Sijil:</strong> Lengkapkan latihan dengan memilih istilah dan sebab yang munasabah untuk menjana Sijil Kejayaan.</li>
              </>
            ) : (
              <>
                <li><strong>Enter Student Name:</strong> On the login screen, pupils enter their name and click "Start". Name is stored locally in the browser.</li>
                <li><strong>Watch the Marble Bag:</strong> The cloth bag starts empty and 3 initial marbles drop in automatically with sound effects.</li>
                <li><strong>Adjust Marble Counts:</strong> Use the + and − buttons for red (🔴) and blue (🔵) marbles to set any ratio (between 1 and 12 total).</li>
                <li><strong>Observe Ladder & Reasoning:</strong> See the active glowing ladder step and read the dynamic mathematical justification.</li>
                <li><strong>Test Random Draw ("Draw 1 marble"):</strong> Click to pull out one random marble, check the result, and watch it return into the bag.</li>
                <li><strong>Run Empirical Test ("Try 100 times"):</strong> Click to see frequency bars across 100 rapid draws to confirm the theoretical likelihood.</li>
                <li><strong>Explore Tools:</strong> Switch to "Choose a Tool" to explore dice, coin, spinner, and cards across multiple events.</li>
                <li><strong>Study Daily Situations:</strong> Switch to "Daily Situations" to classify real-world events into the five terms with reasons.</li>
                <li><strong>Challenge Practice & Certificate:</strong> Complete the quiz by choosing both terms and reasons to earn the Certificate of Achievement.</li>
              </>
            )}
          </ol>
        </section>

        {/* SECTION 4: Penerangan Setiap Ciri & Soalan Cadangan Guru */}
        <section id="ciri-soalan" className="space-y-4">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
            {t.tgSec4}
          </h2>
          <div className="space-y-4 text-xs sm:text-sm">
            {/* Feature 1: Beg Guli */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 print:break-inside-avoid">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                {lang === 'ms' ? '1. Makmal Beg Guli & Anak Tangga' : '1. Marble Bag Lab & Ladder'}
              </h3>
              <p className="text-slate-600 font-medium">
                {lang === 'ms'
                  ? 'Murid melihat manipulatif beg kain dengan bilangan guli merah (🔴) dan biru (🔵) yang boleh diubah, disertai tangga 5 anak tangga dan ayat sebab matematik.'
                  : 'Pupils observe a cloth bag with adjustable red (🔴) and blue (🔵) marbles, accompanied by the 5-step ladder and live reasoning.'}
              </p>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-amber-900 block mb-1">
                  {lang === 'ms' ? 'Soalan Cadangan Guru:' : 'Suggested Teacher Questions:'}
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {lang === 'ms' ? (
                    <>
                      <li>"Jika beg ada 2 merah dan 6 biru, kenapa kebolehjadian merah ialah kecil kemungkinan?"</li>
                      <li>"Berapa biji guli merah yang perlu ditambah supaya kebolehjadiannya menjadi sama kemungkinan?"</li>
                      <li>"Apakah syarat untuk anak tangga pasti menyala?"</li>
                    </>
                  ) : (
                    <>
                      <li>"If the bag has 2 red and 6 blue, why is red unlikely?"</li>
                      <li>"How many red marbles must we add so the likelihood becomes equally likely?"</li>
                      <li>"What condition is required for the certain step to light up?"</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Feature 2: Alat Manipulatif */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 print:break-inside-avoid">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                {lang === 'ms' ? '2. Alat Kebolehjadian (Dadu, Syiling, Pemutar, Kad)' : '2. Probability Tools (Dice, Coin, Spinner, Cards)'}
              </h3>
              <p className="text-slate-600 font-medium">
                {lang === 'ms'
                  ? 'Murid melihat simulasi fizikal objek matematik dan memilih situasi berbeza dengan kiraan kesudahan dikehendaki berbanding jumlah.'
                  : 'Pupils explore physical simulations of math objects and choose situations with computed favorable vs total outcomes.'}
              </p>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-amber-900 block mb-1">
                  {lang === 'ms' ? 'Soalan Cadangan Guru:' : 'Suggested Teacher Questions:'}
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {lang === 'ms' ? (
                    <>
                      <li>"Kenapa mendapat nombor 7 pada sebiji dadu adalah mustahil?"</li>
                      <li>"Pada pemutar 8 sektor (4 kuning, 2 hijau, 1 merah, 1 biru), kenapa kuning adalah sama kemungkinan?"</li>
                      <li>"Mengapakah melambung syiling untuk mendapat Kepala adalah sama kemungkinan (50-50)?"</li>
                    </>
                  ) : (
                    <>
                      <li>"Why is rolling a 7 on a standard die impossible?"</li>
                      <li>"On the 8-sector spinner (4 yellow, 2 green, 1 red, 1 blue), why is yellow equally likely?"</li>
                      <li>"Why is tossing a coin for Heads equally likely (50-50)?"</li>
                    </>
                  )}
                </ul>
              </div>
            </div>

            {/* Feature 3: Situasi Harian */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 print:break-inside-avoid">
              <h3 className="font-black text-slate-900 flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-500" />
                {lang === 'ms' ? '3. Situasi Harian' : '3. Daily Life Situations'}
              </h3>
              <p className="text-slate-600 font-medium">
                {lang === 'ms'
                  ? 'Murid menilai senario kehidupan harian dan memilih istilah yang betul berserta sebab logik atau saintifik.'
                  : 'Pupils evaluate daily scenarios and select the correct term along with logical or scientific reasoning.'}
              </p>
              <div className="bg-white p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-amber-900 block mb-1">
                  {lang === 'ms' ? 'Soalan Cadangan Guru:' : 'Suggested Teacher Questions:'}
                </span>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {lang === 'ms' ? (
                    <>
                      <li>"Mengapakah matahari terbit esok pagi dikelaskan sebagai pasti?"</li>
                      <li>"Adakah kucing bertelur satu peristiwa mustahil? Apakah sebab saintifiknya?"</li>
                      <li>"Mengapakah memenangi cabutan bertuah dengan 1 tiket daripada 1,000 tiket ialah kecil kemungkinan?"</li>
                    </>
                  ) : (
                    <>
                      <li>"Why is the sun rising tomorrow classified as certain?"</li>
                      <li>"Is a cat laying eggs impossible? What is the scientific justification?"</li>
                      <li>"Why is winning a lucky draw with 1 out of 1,000 tickets unlikely?"</li>
                    </>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 5: Jadual Peraturan Lima Istilah & Contoh Nombor */}
        <section id="jadual-peraturan" className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
            {t.tgSec5}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm border border-slate-300 rounded-xl overflow-hidden print:border-collapse">
              <thead className="bg-slate-100 text-slate-900 font-black border-b border-slate-300">
                <tr>
                  <th className="p-3 border-r border-slate-300">Istilah / Term</th>
                  <th className="p-3 border-r border-slate-300">Peraturan / Rule</th>
                  <th className="p-3 border-r border-slate-300">Contoh Guli / Marbles</th>
                  <th className="p-3">Contoh Dadu & Syiling</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-medium">
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-black text-rose-700 border-r border-slate-200">Mustahil / Impossible</td>
                  <td className="p-3 border-r border-slate-200">0 kesudahan sasaran (0%)</td>
                  <td className="p-3 border-r border-slate-200">0 merah daripada 8 guli (0/8)</td>
                  <td className="p-3">Dadu nombor 7 (0/6)</td>
                </tr>
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-black text-orange-700 border-r border-slate-200">Kecil kemungkinan / Unlikely</td>
                  <td className="p-3 border-r border-slate-200">Kurang daripada separuh (&lt; 50%)</td>
                  <td className="p-3 border-r border-slate-200">2 merah daripada 8 guli (2/8 = 25%)</td>
                  <td className="p-3">Dadu nombor 6 (1/6 = 16.7%)</td>
                </tr>
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-black text-amber-800 border-r border-slate-200">Sama kemungkinan / Equally likely</td>
                  <td className="p-3 border-r border-slate-200">Tepat separuh (50%)</td>
                  <td className="p-3 border-r border-slate-200">4 merah daripada 8 guli (4/8 = 50%)</td>
                  <td className="p-3">Syiling Kepala (1/2 = 50%), Dadu nombor genap (3/6)</td>
                </tr>
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-black text-teal-700 border-r border-slate-200">Besar kemungkinan / Likely</td>
                  <td className="p-3 border-r border-slate-200">Lebih separuh, bukan semua (&gt; 50%)</td>
                  <td className="p-3 border-r border-slate-200">6 merah daripada 8 guli (6/8 = 75%)</td>
                  <td className="p-3">Dadu nombor kurang daripada 5 {`{1,2,3,4}`} (4/6)</td>
                </tr>
                <tr className="hover:bg-slate-50 print:break-inside-avoid">
                  <td className="p-3 font-black text-emerald-800 border-r border-slate-200">Pasti / Certain</td>
                  <td className="p-3 border-r border-slate-200">Kesemua kesudahan (100%)</td>
                  <td className="p-3 border-r border-slate-200">8 merah daripada 8 guli (8/8 = 100%)</td>
                  <td className="p-3">Dadu nombor kurang daripada 7 (6/6 = 100%)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* SECTION 6: Salah Faham Lazim Murid & Cara Membetulkannya */}
        <section id="salah-faham" className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
            {t.tgSec6}
          </h2>
          <div className="space-y-3 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1 print:break-inside-avoid">
              <span className="font-black text-rose-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                {lang === 'ms'
                  ? 'Salah faham 1: "Sama kemungkinan (50-50) bermakna setiap dua balingan mesti dapat berselang-seli secara tepat."'
                  : 'Misconception 1: "Equally likely (50-50) means every two tosses must alternate strictly."'}
              </span>
              <p className="text-slate-700 font-medium pl-5">
                <strong>{lang === 'ms' ? 'Cara Membetulkan:' : 'Correction:'}</strong>{' '}
                {lang === 'ms'
                  ? 'Terangkan bahawa kebarangkalian 50% adalah corak purata jangka panjang. Setiap balingan adalah bebas dan rawak. Gunakan butang "Cuba 100 kali" untuk membuktikan bahawa dalam 100 cubaan, keputusannya menghampiri 50% walaupun balingan berturut-turut mungkin berulang.'
                  : 'Explain that 50% is a long-run tendency. Each toss is independent. Use the "Try 100 times" button to demonstrate that over many trials, counts approach 50% despite short runs.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1 print:break-inside-avoid">
              <span className="font-black text-amber-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                {lang === 'ms'
                  ? 'Salah faham 2: "Kecil kemungkinan bermakna peristiwa itu sifar peluang dan tidak akan berlaku langsung."'
                  : 'Misconception 2: "Unlikely means there is zero chance and it will never happen."'}
              </span>
              <p className="text-slate-700 font-medium pl-5">
                <strong>{lang === 'ms' ? 'Cara Membetulkan:' : 'Correction:'}</strong>{' '}
                {lang === 'ms'
                  ? 'Tegaskan perbezaan antara Mustahil (peluang sifar, 0%) dengan Kecil kemungkinan (peluang wujud tetapi kurang daripada separuh). Walaupun peluang kecil, peristiwa tersebut masih boleh terjadi dalam cabutan rawak.'
                  : 'Highlight the difference between Impossible (0% chance) and Unlikely (chance exists but less than half). Although rare, it can still happen on any given trial.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-1 print:break-inside-avoid">
              <span className="font-black text-blue-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
                {lang === 'ms'
                  ? 'Salah faham 3: "Besar kemungkinan bermakna ia sudah pasti berlaku."'
                  : 'Misconception 3: "Likely means it is already guaranteed to occur."'}
              </span>
              <p className="text-slate-700 font-medium pl-5">
                <strong>{lang === 'ms' ? 'Cara Membetulkan:' : 'Correction:'}</strong>{' '}
                {lang === 'ms'
                  ? 'Jelaskan bahawa selagi terdapat sekurang-kurangnya satu kesudahan lain (contoh: 7 merah dan 1 biru), cabutan biru masih boleh berlaku. Hanya jika semua kesudahan memenuhi sasaran barulah ia menjadi Pasti.'
                  : 'Clarify that as long as at least one alternate outcome exists (e.g. 7 red and 1 blue), drawing blue is still possible. Only when all outcomes match target does it become Certain.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 7: Cadangan Penggunaan di Kelas */}
        <section id="penggunaan-kelas" className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
            {t.tgSec7}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 print:break-inside-avoid">
              <span className="font-black text-slate-900 flex items-center gap-1.5">
                <Lightbulb className="w-4 h-4 text-amber-500" />
                {lang === 'ms' ? 'Tayangan Projektor / Smartboard' : 'Projector / Interactive Board'}
              </span>
              <p className="text-slate-600 font-medium">
                {lang === 'ms'
                  ? 'Guru memaparkan beg guli di hadapan kelas. Guru menetapkan 3 merah dan 5 biru, kemudian meminta murid mengangkat kad isyarat atau menyatakan istilah dan sebab sebelum jawapan disahkan.'
                  : 'Teacher projects the marble bag. Set 3 red and 5 blue, then prompt pupils to show signal cards or explain their reasoning before verifying.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 print:break-inside-avoid">
              <span className="font-black text-slate-900 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-teal-600" />
                {lang === 'ms' ? 'Aktiviti Berpasangan / Kumpulan' : 'Pair / Group Work'}
              </span>
              <p className="text-slate-600 font-medium">
                {lang === 'ms'
                  ? 'Murid bekerja secara berpasangan pada komputer riba atau tablet. Murid A mereka bentuk beg guli rahsia, manakala Murid B meneka istilah dan menyatakan sebab matematik.'
                  : 'Pupils work in pairs on laptops or tablets. Pupil A configures a marble bag, while Pupil B predicts the likelihood and states the reason.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 print:break-inside-avoid">
              <span className="font-black text-slate-900 flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-indigo-600" />
                {lang === 'ms' ? 'Pembelajaran Dalam Talian (Google Meet)' : 'Online Classes (Google Meet / Zoom)'}
              </span>
              <p className="text-slate-600 font-medium">
                {lang === 'ms'
                  ? 'Guru berkongsi skrin, menguji balingan dadu atau putaran pemutar, dan meminta semua murid menaip jawapan istilah dan sebab dalam ruangan sembang (chat) secara serentak.'
                  : 'Teacher screen shares, rolls the dice or spins the wheel, and has all pupils type their term and reason into the chat box simultaneously.'}
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1 print:break-inside-avoid">
              <span className="font-black text-slate-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                {lang === 'ms' ? 'Pentaksiran Bilik Darjah (PBD)' : 'Classroom Assessment (PBD)'}
              </span>
              <p className="text-slate-600 font-medium">
                {lang === 'ms'
                  ? 'Gunakan tab "Latihan Cabaran" pada akhir sesi pdp untuk merekod tahap penguasaan murid berdasarkan keupayaan memilih istilah dan sebab yang tepat.'
                  : 'Use the "Challenge Practice" tab at the end of the lesson to record mastery levels based on accurate term and reason selection.'}
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 8: Cadangan Pembezaan Pengajaran */}
        <section id="pembezaan" className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
            {t.tgSec8}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2 print:break-inside-avoid">
              <h3 className="font-black text-amber-950">
                {lang === 'ms' ? 'Murid Memerlukan Sokongan (Pemulihan)' : 'Pupils Needing Support (Remedial)'}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
                {lang === 'ms' ? (
                  <>
                    <li>Gunakan jumlah guli yang kecil dan genap (contoh: 2, 4, atau 6 guli) supaya konsep separuh mudah dilihat.</li>
                    <li>Sediakan senarai pilihan sebab untuk murid memilih berbanding membina ayat secara lisan serta-merta.</li>
                    <li>Fokuskan terlebih dahulu pada dua hujung ekstrem (Mustahil dan Pasti), diikuti Sama kemungkinan (50-50).</li>
                  </>
                ) : (
                  <>
                    <li>Use small even numbers of marbles (e.g., 2, 4, or 6) so the concept of half is easily visualized.</li>
                    <li>Provide reason options for pupils to pick rather than requiring free-form formulation immediately.</li>
                    <li>Focus first on the extremes (Impossible and Certain), followed by Equally likely (50-50).</li>
                  </>
                )}
              </ul>
            </div>
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 space-y-2 print:break-inside-avoid">
              <h3 className="font-black text-emerald-950">
                {lang === 'ms' ? 'Murid Berpencapaian Tinggi (Pengayaan)' : 'High-Achieving Pupils (Enrichment)'}
              </h3>
              <ul className="list-disc list-inside space-y-1 text-slate-700 font-medium">
                {lang === 'ms' ? (
                  <>
                    <li>Minta murid membina ayat sebab dengan kata-kata sendiri tanpa merujuk templat.</li>
                    <li>Cabar murid mereka bentuk situasi pemutar atau dadu tersuai untuk menghasilkan nisbah kebolehjadian tertentu.</li>
                    <li>Bincangkan hubung kait kebarangkalian teori dengan pecahan setara dan peratusan.</li>
                  </>
                ) : (
                  <>
                    <li>Prompt pupils to formulate explanations in their own words without looking at templates.</li>
                    <li>Challenge pupils to design custom spinner or card sets to yield specific target likelihood ratios.</li>
                    <li>Discuss the relationship between theoretical probability, equivalent fractions, and percentages.</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </section>

        {/* SECTION 9: Panduan Penyelesaian Masalah */}
        <section id="penyelesaian-masalah" className="space-y-3">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
            {t.tgSec9}
          </h2>
          <div className="space-y-2 text-xs sm:text-sm text-slate-700 font-medium">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong>{lang === 'ms' ? 'Bunyi tidak kedengaran:' : 'No sound playing:'}</strong>{' '}
              {lang === 'ms'
                ? 'Pelayar web menyekat audio automatik sehingga pengguna menekan mana-mana butang. Tekan butang audio pada bar navigasi dan pastikan kelantangan peranti dibuka.'
                : 'Browsers block autoplay audio until a button is clicked. Click the audio toggle on the navbar and ensure device volume is up.'}
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong>{lang === 'ms' ? 'Animasi terasa perlahan pada peranti lama:' : 'Animations feel slow on older devices:'}</strong>{' '}
              {lang === 'ms'
                ? 'Tekan butang "Kurangkan Gerakan" (ikon aktiviti) di bar navigasi untuk mematikan kesan gerakan kompleks.'
                : 'Click the "Reduced Motion" button (activity icon) in the navbar to disable heavy animations.'}
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <strong>{lang === 'ms' ? 'Penggunaan Luar Talian (Offline):' : 'Offline usage:'}</strong>{' '}
              {lang === 'ms'
                ? 'Aplikasi ini dibina 100% menggunakan kod sisi klien (Web Audio API, SVG, CSS tempatan) tanpa sebarang fail luaran. Ia boleh dibuka tanpa sambungan internet.'
                : 'This app is 100% client-side with Web Audio API, SVG, and local CSS. It runs offline without internet access.'}
            </div>
          </div>
        </section>

        {/* SECTION 10: Ruang Nota Guru */}
        <section id="nota-guru" className="space-y-3 print:break-inside-avoid">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-black text-slate-900 border-l-4 border-amber-500 pl-3">
              {t.tgSec10}
            </h2>
            {notesStatus && (
              <span className="text-xs font-bold text-emerald-600 animate-pulse">
                {notesStatus}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 font-semibold">
            {t.notesSavedNotice}
          </p>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder={t.notesPlaceholder}
            rows={6}
            className="w-full p-4 rounded-2xl bg-amber-50/40 border-2 border-amber-200 focus:border-amber-500 focus:bg-white text-slate-800 text-xs sm:text-sm font-medium outline-hidden transition-all shadow-inner"
          />
          <div className="flex justify-end print:hidden">
            <button
              type="button"
              onClick={handleClearNotes}
              disabled={!notes}
              className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold text-xs flex items-center gap-1.5 border border-slate-300 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed min-h-[44px]"
            >
              <Trash2 className="w-4 h-4" />
              <span>{t.notesClearBtn}</span>
            </button>
          </div>
        </section>
      </article>
    </div>
  );
};
