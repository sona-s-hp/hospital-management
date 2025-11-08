"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Letter animation
const letterAnimation = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const container = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.3,
    },
  },
};

const questions = [
  "Doctor Availability",
  "Department Info",
  "Appointment Status",
  "Hospital Services",
  "Billing Info",
];

// AnimatedText component
function AnimatedText({ text, className = "" }: { text: string; className?: string }) {
  return (
    <motion.span
      variants={container}
      initial="hidden"
      animate="visible"
      className={`inline-block ${className}`}
      aria-label={text}
      role="text"
    >
      {[...text].map((char, index) => (
        <motion.span key={index} variants={letterAnimation} className="inline-block" aria-hidden="true">
          {char === " " ? "\u00A0" : char}
        </motion.span>
      ))}
    </motion.span>
  );
}



const position = [10.0159, 76.3419];

export default function Hospital() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const [chatHistory, setChatHistory] = useState<string[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState("");

  const images = [
    "/images/slide1.jpg",
    "/images/slide2.jpeg",
    "/images/slide3.jpg",
  ];

  const titles = ["Your Health", "Your Smile", "Your Recovery"];
  const descriptions = [
    "Providing compassionate, cutting-edge healthcare for your family’s wellness and comfort.",
    "Restoring confidence and care through every bright smile we help protect.",
    "Focused on your fast, full recovery with expert support at every step.",
  ];

  const animations = [
    {
      initial: { x: 1000, opacity: 0, scale: 1.2 },
      animate: { x: 0, opacity: 1, scale: 1 },
      exit: { x: -1000, opacity: 0, scale: 0.8 },
    },
    {
      initial: { scale: 0.8, opacity: 0 },
      animate: { scale: 1, opacity: 1 },
      exit: { scale: 1.2, opacity: 0 },
    },
    {
      initial: { y: 500, opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit: { y: -500, opacity: 0 },
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);
   const departments = [
    {
      name: "Orthopedic Surgeon",
      note: "Our dentistry department offers comprehensive dental care including cleaning, fillings, cosmetic treatments, and oral surgery. Our goal is to help you smile confidently.",
      image: "/images/dep1.jpeg",
    },
    {
      name: "Cardiology",
      note: "Our cardiology unit provides advanced heart care services including ECG, echocardiography, angiography, and cardiac rehabilitation.",
      image: "/images/dept2.jpeg",
    },
    {
      name: "Gynecologist Specialists",
      note: "Our ENT department specializes in ear, nose, and throat treatments, from hearing loss diagnosis to sinus and throat surgeries.",
      image: "/images/dept3.jpeg",
    },
    {
      name: "Laboratory",
      note: "Our advanced lab provides diagnostic tests including X-ray, MRI, and blood analysis to support accurate and timely diagnosis.",
      image: "/images/dep4.jpeg",
      subservices: [
        { name: "X-Ray", desc: "We use advanced digital X-ray imaging for quick and clear results.", image: "/images/xray.jpeg" },
        { name: "MRI", desc: "Our MRI scans provide detailed body images for accurate diagnosis.", image: "/images/mri.jpeg" },
        { name: "Blood Test", desc: "Comprehensive blood testing ensures fast and reliable results.", image: "/images/blood.jpeg" },
      ],
    },
    {
      name: "Neurology",
      note: "Our neurology department diagnoses and treats disorders of the brain, spine, and nerves with precision and care.",
      image: "/images/dep5.jpeg",
    },
  ];

  const [selectedDept, setSelectedDept] = useState(departments[0]);
  const [selectedSub, setSelectedSub] = useState<any>(null);


 const doctors = [
  // Orthopedic Surgeon
  {
    name: "Dr. Priya Nair",
    department: "Orthopedic Surgeon",
    experience: "10 years",
    image: "/images/doc2.png",
    description: "Specialist in cosmetic and restorative dentistry."
  },
  {
    name: "Dr. John Mathew",
    department: "Orthopedic Surgeon",
    experience: "5 years",
    image: "/images/doc6.png",
    description: "Expert in pediatric and preventive dentistry."
  },
  {
    name: "Dr. Sneha Raj",
    department: "Orthopedic Surgeon",
    experience: "7 years",
    image: "/images/doc11.jpg",
    description: "Performs advanced root canal and crown procedures."
  },

  // ❤️ Cardiology
  {
    name: "Dr. Arun Kumar",
    department: "Cardiology",
    experience: "15 years",
    image: "/images/doc1.png",
    description: "Expert cardiologist providing advanced heart care."
  },
  {
    name: "Dr. Meena Joseph",
    department: "Cardiology",
    experience: "9 years",
    image: "/images/doc12.jpg",
    description: "Specialist in cardiac imaging and rehabilitation."
  },
  {
    name: "Dr. Nithin Raj",
    department: "Cardiology",
    experience: "6 years",
    image: "/images/doc7.png",
    description: "Focuses on minimally invasive cardiac procedures."
  },

  //  Gynecologist Specialists
  {
    name: "Dr. Jefin Joseph",
    department: "Gynecologist",
    experience: "8 years",
    image: "/images/doc3.png",
    description: "Expert in ear and throat surgeries."
  },
  {
    name: "Dr. Kavya Menon",
    department: "Gynecologist",
    experience: "6 years",
    image: "/images/doc13.jpg",
    description: "Treats sinus and allergy-related ENT issues."
  },
  {
    name: "Dr. Ajay Thomas",
    department: "Gynecologist",
    experience: "12 years",
    image: "/images/doc8.png",
    description: "Performs advanced endoscopic ENT procedures."
  },

  // 🧠 Neurologist
  {
    name: "Dr. Rahul Varma",
    department: "Neurologist",
    experience: "11 years",
    image: "/images/doc9.png",
    description: "Neurologist specializing in stroke and brain disorders."
  },
  {
    name: "Dr. Neha Suresh",
    department: "Neurologist",
    experience: "8 years",
    image: "/images/doc4.png",
    description: "Focuses on epilepsy and neurodegenerative diseases."
  },
  {
    name: "Dr. Aditya Raj",
    department: "Neurologist",
    experience: "5 years",
    image: "/images/doc10.jpeg",
    description: "Specialist in neuroimaging and spinal disorders."
  },

  // Pediatrician
  {
    name: "Dr. Anjali Menon",
    department: "Pediatrician",
    experience: "9 years",
    image: "/images/doc14.jpg",
    description: "Head of diagnostic testing and pathology."
  },
  {
    name: "Dr. Thomas Varghese",
    department: "Pediatrician",
    experience: "6 years",
    image: "/images/doc5.png",
    description: "Specialist in biochemical and microbiological analysis."
  },
  {
    name: "Dr. Rekha Pillai",
    department: "Pediatrician",
    experience: "10 years",
    image: "/images/doc15.jpg",
    description: "Expert in hematology and clinical research."
  },
];

const filteredDoctors = doctors.filter(
  (doc) => doc.department === selectedDept.name
);

const campimages = [
  "/images/camp1.jpg",
  "/images/camp2.jpg",
  "/images/camp3.jpg",
  "/images/camp4.jpg",
  "/images/camp5.jpg",
  "/images/camp6.jpg",
];
 const appoinmentimages=[
  "/images/appoint1.jpg",
  "/images/emergency1.jpg",
 ];

 const partnerLogos = [
  { src: "/images/partner1.jpg", alt: "CellNetix" },
  { src: "/images/partner2.jpg", alt: "MedBlue" },
  { src: "/images/partner3.jpg", alt: "Serenex" },
  { src: "/images/partner4.jpg", alt: "MedLife" },
];


 const handleSelect = (q: string) => {
    setSelectedQuestion(q);
    // Add a hospital-based AI response
    let answer = "";
    switch (q) {
      case "Doctor Availability":
        answer = "Our doctors are available Mon-Sat 8am-8pm. You can book online.";
        break;
      case "Department Info":
        answer = "We have Cardiology, Neurology, Orthopedics, ENT, Lab & more.";
        break;
      case "Appointment Status":
        answer = "You can check your appointments under 'My Appointments'.";
        break;
      case "Hospital Services":
        answer = "We provide in-patient, out-patient, lab, imaging, and emergency services.";
        break;
      case "Billing Info":
        answer = "You can view bills and payments in your account dashboard.";
        break;
      default:
        answer = "Thank you for contacting Zane Care Hospital!";
    }
    setChatHistory((prev) => [...prev, `You: ${q}`, `Hospital: ${answer}`]);
  };

  const handleClose = () => {
    setChatHistory((prev) => [...prev, "Hospital: Thank you!"]);
    setTimeout(() => {
      setOpen(false);
      setChatHistory([]);
      setSelectedQuestion("");
    }, 1000);
  };

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 w-full via-purple-500 to-pink-500 text-white shadow-md z-50">
  <div className="flex justify-between items-center px-6 py-3">
    {/* Logo / Hospital Name */}
    <div className="flex items-center gap-3">
      <Image
        src="/images/hospitallogo.png"
        alt="Hospital Logo"
        width={45}
        height={45}
        className="rounded-full shadow-md border-2 border-yellow-300"
      />
      <h1 className="text-2xl font-bold text-yellow-300 tracking-wide">
        Zane Care Hospital
      </h1>
    </div>
    

    {/* Navigation Links */}
    <ul className="flex gap-6 items-center">
      <li><a href="/" className=" text-black hover:text-yellow-300 transition">Home</a></li>
  <li>
    <a
      href="#"
      className="text-black hover:text-yellow-300 transition"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("departments-section")?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      Departments
    </a>
  </li>
  <li>
    <a
      href="#"
      className="text-black hover:text-yellow-300 transition"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("doctor-section")?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      Doctors
    </a>
  </li>
  <li>
    <a
      href="#"
      className="text-black hover:text-yellow-300 transition"
      onClick={(e) => {
        e.preventDefault();
        document.getElementById("contact-section")?.scrollIntoView({ behavior: "smooth" });
      }}
    >
      Contact
    </a>
  </li>
</ul>


  </div>
</nav>


      {/* Carousel */}
     
<section className="relative w-full h-screen overflow-hidden">
  <div className="absolute inset-0 w-full h-full">
    <AnimatePresence initial={false} mode="wait">
      <motion.img
        key={currentIndex}
        src={images[currentIndex]}
        initial={animations[currentIndex].initial}
        animate={animations[currentIndex].animate}
        exit={animations[currentIndex].exit}
        transition={{ duration: 0.8, ease: "easeInOut" }}
        className="absolute inset-0 w-full h-full object-cover"
        alt={`Hospital ${currentIndex + 1}`}
      />
    </AnimatePresence>
    <div className="absolute inset-0 bg-black/60" />
  </div>

  {/* Overlay Content */}
  <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-6 space-y-6 max-w-3xl mx-auto">
    <p className="uppercase tracking-widest text-yellow-300 font-semibold mb-2">
      Your Health, Our Mission 💛
    </p>

    <AnimatePresence mode="wait">
      <motion.h1
        key={`title-${currentIndex}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.6 }}
        className="text-4xl md:text-6xl font-bold mb-4"
      >
        We Care About{" "}
        <AnimatedText
          text={titles[currentIndex]}
          className="bg-gradient-to-r from-yellow-200 via-pink-300 to-orange-400 bg-clip-text text-transparent"
        />
      </motion.h1>
    </AnimatePresence>

    <motion.div
      key={`line-${currentIndex}`}
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "60%", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={{ duration: 0.6, delay: 0.2, ease: "easeInOut" }}
      className="h-1 bg-gradient-to-r from-yellow-400 via-pink-400 to-red-400 rounded-full mb-4"
    />

    <AnimatePresence mode="wait">
      <motion.p
        key={`desc-${currentIndex}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="text-gray-200 max-w-2xl leading-relaxed"
      >
        Compassion, care, and commitment come together here — where every heartbeat matters.
      </motion.p>
    </AnimatePresence>

    {/* ✅ Login & Register side-by-side */}
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5, duration: 0.8 }}
      className="flex flex-col sm:flex-row items-center gap-4 mt-8"
    >
      {/* Login Button */}
      <motion.a
        href="/login"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="px-8 py-3 bg-yellow-400 text-black font-semibold rounded-lg shadow-lg hover:bg-yellow-500 transition duration-300"
      >
        Login
      </motion.a>

      {/* Register Dropdown */}
      <motion.a
        whileHover={{ scale: 1.05 }}
         href="/register"
        className="relative group px-8 py-3 bg-white text-gray-900 font-semibold rounded-lg shadow-lg hover:bg-gray-200 transition"
      >
        
          Register Here...
     
        
      </motion.a>
    </motion.div>

    {/* Tagline below buttons */}
    <p className="text-sm text-gray-300 italic mt-3">
      “Log in or register to be part of a healthcare family that truly listens and cares.”  
    </p>
  </div>
</section>



      {/* Floating Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-8 right-8 bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition z-50"
      >
        💬 Chat Here
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-20 right-8 w-80 bg-white shadow-xl rounded-xl overflow-hidden flex flex-col z-50"
          >
            <div className="bg-indigo-600 text-white px-4 py-2 flex justify-between items-center">
              <h3 className="font-semibold">Zane Care AI Chat</h3>
              <button onClick={handleClose} className="text-xl font-bold">
                ✖
              </button>
            </div>
            <div className="flex-1 p-4 space-y-2 overflow-y-auto max-h-72">
              {chatHistory.length === 0 && (
                <p className="text-gray-500 text-sm">Select a question below to get started.</p>
              )}
              {chatHistory.map((msg, i) => (
                <p key={i} className={msg.startsWith("You:") ? "text-right" : "text-left"}>
                  {msg}
                </p>
              ))}
            </div>
            <div className="border-t p-2 flex flex-wrap gap-2">
              {questions.map((q) => (
                <button
                  key={q}
                  onClick={() => handleSelect(q)}
                  className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm hover:bg-indigo-200 transition"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

 {/*department Section */}

 <motion.div
  id="departments-section"
  className="min-h-screen bg-slate-50 pt-24 px-6 md:px-16"
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
      {/* Heading */}
      <div className="text-center mb-12">
        <p className="uppercase tracking-widest text-indigo-500 font-semibold mb-2">
          Our Departments
        </p>
        <h1 className="text-4xl font-bold text-slate-800">
          Our Medical Services
        </h1>
      </div>

      {/* Department Buttons */}
      <div className="flex flex-wrap justify-center gap-4 mb-12">
        {departments.map((dept) => (
          <button
            key={dept.name}
            onClick={() => {
              setSelectedDept(dept);
              setSelectedSub(null);
            }}
            className={`px-6 py-4 rounded-xl shadow-md transition-all duration-300 font-semibold ${
              selectedDept.name === dept.name
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white scale-105"
                : "bg-white text-gray-700 hover:scale-105"
            }`}
          >
            {dept.name}
          </button>
        ))}
      </div>

      {/* Subservices (only for Lab) */}
      {selectedDept.subservices && (
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {selectedDept.subservices.map((sub: any) => (
            <button
              key={sub.name}
              onClick={() => setSelectedSub(sub)}
              className={`px-4 py-2 rounded-lg border font-medium transition-all duration-300 ${
                selectedSub?.name === sub.name
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-indigo-50"
              }`}
            >
              {sub.name}
            </button>
          ))}
        </div>
      )}

      {/* Department Info */}
      <div className="flex flex-col md:flex-row items-center gap-10 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSub ? selectedSub.name : selectedDept.name}
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 40 }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2 text-gray-700"
          >
            <h2 className="text-3xl font-bold text-slate-800 mb-4">
              {selectedSub ? selectedSub.name : selectedDept.name}
            </h2>
            <p className="text-lg leading-relaxed">
              {selectedSub ? selectedSub.desc : selectedDept.note}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Image */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedSub ? selectedSub.image : selectedDept.image}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.5 }}
            className="md:w-1/2 flex justify-center"
          >
            <Image
              src={selectedSub ? selectedSub.image : selectedDept.image}
              alt={selectedSub ? selectedSub.name : selectedDept.name}
              width={500}
              height={350}
              className="rounded-2xl shadow-lg object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>
   </motion.div>

    {/* Doctors Section */}

<motion.div
  id="doctor-section"
  className="mt-12 max-w-6xl mx-auto"
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.8, ease: "easeOut" }}
>
  <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">
    Meet Our {selectedDept.name} Doctors
  </h2>

  <AnimatePresence mode="wait">
    <motion.div
      key={selectedDept.name}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8"
    >
      {filteredDoctors.map((doc) => (
        <motion.div
          key={doc.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-6 text-center"
        >
          <Image
            key={doc.image} // Important to trigger re-render
            src={doc.image}
            alt={doc.name}
            width={200}
            height={200}
            className="rounded-full mx-auto mb-4 object-cover"
          />
          <h3 className="text-xl font-semibold text-slate-800">{doc.name}</h3>
          <p className="text-indigo-500 font-medium">{doc.experience}</p>
          <p className="text-gray-600 mt-2">{doc.description}</p>
        </motion.div>
      ))}
    </motion.div>
  </AnimatePresence>
</motion.div>



{/* Tip Section */}
<section className="mt-24 bg-white py-16 px-6 md:px-16 shadow-inner rounded-2xl">
  <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10">

    {/* Left: Doctor Image */}
    <motion.div
      initial={{ x: -150, opacity: 0 }}
      whileInView={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      viewport={{ once: true }}
      className="md:w-1/3 flex justify-center"
    >
      <Image
        src="/images/doc_tip.jpg" // 🩺 replace with your doctor image
        alt="Doctor giving health tip"
        width={300}
        height={300}
        className="rounded-xl shadow-lg object-cover"
      />
    </motion.div>

    {/* Right: Tip Content */}
    <div className="md:w-2/3 text-gray-700">
      <motion.h3
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl font-bold text-slate-800 mb-3"
      >
        Today's Tip from <span className="text-indigo-600">Dr. Hanman</span>
      </motion.h3>

      <motion.h4
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        viewport={{ once: true }}
        className="text-xl font-semibold text-indigo-500 mb-4"
      >
        How to live a healthy lifestyle?
      </motion.h4>

      {/* Animated Tip Lines */}
      <motion.ul
        initial="hidden"
        whileInView="visible"
        variants={{
          hidden: {},
          visible: {
            transition: { staggerChildren: 0.25, delayChildren: 0.3 },
          },
        }}
        viewport={{ once: true }}
        className="space-y-3 list-disc list-inside text-lg leading-relaxed"
      >
        {[
          "Don't just worry about the things you cannot help.",
          "Eat healthy, work better, do gardening.",
          "Some relationships can kill you — avoid them the most.",
          "Focus on the good things that you like.",
          "Stay positive and take time to relax daily.",
        ].map((tip, index) => (
          <motion.li
            key={index}
            variants={{
              hidden: { opacity: 0, x: 30 },
              visible: { opacity: 1, x: 0 },
            }}
            transition={{ duration: 0.6 }}
            className="text-gray-600"
          >
            {tip}
          </motion.li>
        ))}
      </motion.ul>

      {/* Doctor Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 1 }}
        viewport={{ once: true }}
        className="mt-6"
      >
        <p className="font-semibold text-slate-800">Dr. Drew Stronghold, MPH</p>
        <p className="text-gray-500 italic">Medicine, Surgery</p>
      </motion.div>
    </div>
  </div>
</section>

{/* camp images Section */}
<section id="camp-section" className="py-20 px-6 md:px-16 bg-white text-center">
      <motion.h2
        className="text-4xl md:text-5xl font-bold text-blue-900 mb-10"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        Our Medical Camp
      </motion.h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {campimages.map((src, i) => (
          <motion.div
            key={i}
            className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group"
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: i * 0.1 }}
          >
            <Image
              src={src}
              alt={`Medical Camp ${i + 1}`}
              width={400}
              height={300}
              className="object-cover w-full h-[280px] transform group-hover:scale-105 transition duration-500"
            />
          </motion.div>
        ))}
      </div>
    </section>


 {/* Emergency Contact Section and  Appointment Section  */}


          {/* Emergency Contact Section and Appointment Section */}
<section className="grid md:grid-cols-2 w-full gap-6 md:gap-10 px-4 md:px-10 py-6">
  {/* Emergency Contact Section */}
  <motion.div
    className="relative h-[420px] md:h-[500px] text-white flex flex-col justify-center items-center text-center px-8 bg-cover bg-center rounded-[3rem] overflow-hidden shadow-2xl"
    style={{ backgroundImage: `url('${appoinmentimages[1]}')` }}
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    {/* ✅ Gradient glass overlay */}
    <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/40 via-blue-700/30 to-blue-500/20 backdrop-blur-[2px] rounded-[3rem]"></div>

    <motion.div
      className="relative z-10 max-w-md"
      initial={{ scale: 0.9, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
        For Any Emergency Contact
      </h2>
      <p className="text-gray-200 mb-8 text-lg leading-relaxed">
        Our doctors are available 24/7 to help you anytime.
      </p>
      <motion.a
        href="tel:+103784673467"
        className="inline-block bg-white text-blue-700 font-semibold px-8 py-4 rounded-full shadow-xl hover:bg-blue-100 hover:shadow-2xl transition-all text-lg tracking-wide"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        📞 +10 378 4673 467
      </motion.a>
    </motion.div>
  </motion.div>

  {/* Appointment Section */}
  <motion.div
    className="relative h-[420px] md:h-[500px] text-white flex flex-col justify-center items-center text-center px-8 bg-cover bg-center rounded-[3rem] overflow-hidden shadow-2xl"
    style={{ backgroundImage: `url('${appoinmentimages[0]}')` }}
    initial={{ opacity: 0, y: 60 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
  >
    {/* ✅ Gradient glass overlay */}
    <div className="absolute inset-0 bg-gradient-to-br from-blue-700/40 via-blue-500/30 to-blue-300/20 backdrop-blur-[2px] rounded-[3rem]"></div>

    <motion.div
      className="relative z-10 max-w-md"
      initial={{ scale: 0.9, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.4 }}
    >
      <h2 className="text-4xl md:text-5xl font-extrabold mb-4 drop-shadow-lg">
        Make an Online Appointment
      </h2>
      <p className="text-gray-200 mb-8 text-lg leading-relaxed">
        Schedule your appointment easily with our online system.
      </p>
      <motion.a
        href="#appointment"
        className="inline-block border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-blue-700 transition-all shadow-lg hover:shadow-2xl tracking-wide"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        Make an Appointment
      </motion.a>
    </motion.div>
  </motion.div>
</section>




{/* contact Section */}
<motion.section
  id="contact-section"
  className="py-20 px-6 md:px-16 bg-slate-50 scroll-mt-24"
  initial={{ opacity: 0, y: 50 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={{ duration: 0.8, ease: "easeOut" }}>
  <div className="max-w-6xl mx-auto mb-12 text-center">
    <h2 className="text-3xl font-bold text-slate-800 mb-2">Visit Us</h2>
    <p className="text-gray-600">We’re located at the heart of Kochi. Feel free to reach out or visit.</p>
  </div>

  <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto items-center">
    
    {/* Left: Contact Info */}
    <div className="space-y-6 text-gray-700">
      <h3 className="text-2xl font-bold text-slate-800">Contact Information</h3>
      <p className="text-lg">Have questions or need assistance? We're here to help you 24/7.</p>

      <div>
        <h4 className="font-semibold text-indigo-600">🏥 Address</h4>
        <p>Zane Care Hospital, Main Road, Kochi, Kerala 682030</p>
      </div>

      <div>
        <h4 className="font-semibold text-indigo-600">📞 Phone</h4>
        <p>+91 98765 43210</p>
      </div>

      <div>
        <h4 className="font-semibold text-indigo-600">📧 Email</h4>
        <p>contact@zanecarehospital.com</p>
      </div>

      <div>
        <h4 className="font-semibold text-indigo-600">⏰ Visiting Hours</h4>
        <p>
          Mon - Sat: 8:00 AM – 8:00 PM<br />
          Sun: 10:00 AM – 4:00 PM
        </p>
      </div>
    </div>

    {/* Right: Map */}
    <div className="w-full h-[400px] rounded-xl overflow-hidden shadow-lg z-0">
      <MapContainer
        center={[10.0159, 76.3419]}
        zoom={15}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={[10.0159, 76.3419]}>
          <Popup>Zane Care Hospital</Popup>
        </Marker>
      </MapContainer>
    </div>
  </div>
</motion.section>

{/* partner Section */}

 <section className="py-20 px-6 md:px-16 bg-white scroll-mt-24">
      {/* Heading Animation */}
      <motion.div
        className="max-w-6xl mx-auto text-center mb-12"
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Our Partners</h2>
        <p className="text-gray-600">
          We proudly collaborate with leading healthcare and research organizations.
        </p>
      </motion.div>

      {/* Partner Logos Animation */}
      <motion.div
        className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-center"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={{
          hidden: {},
          visible: {
            transition: {
              staggerChildren: 0.2, // delay between each logo
            },
          },
        }}
      >
        {partnerLogos.map((logo, index) => (
          <motion.img
            key={index}
            src={logo.src}
            alt={logo.alt}
            className="h-16 object-contain mx-auto"
            variants={{
              hidden: { opacity: 0, y: 30, scale: 0.9 },
              visible: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </motion.div>
    </section>



<footer className="bg-slate-900 text-white py-8 px-6 md:px-12">
  <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6">
    {/* About */}
    <div>
      <h4 className="text-base font-semibold mb-3">Zane Care Hospital</h4>
      <p className="text-sm text-gray-300 leading-relaxed">
        Zane Care Hospital is dedicated to providing exceptional healthcare with compassion and cutting-edge technology. We are your trusted partner in wellness.
      </p>
    </div>

    {/* Quick Links */}
    <div>
      <h4 className="text-base font-semibold mb-3">Quick Links</h4>
      <ul className="space-y-1 text-sm text-gray-300">
        <li><a href="#doctor-section" className="hover:text-white">Doctors</a></li>
        <li><a href="#departments-section" className="hover:text-white">Departments</a></li>
        <li><a href="#visit-section" className="hover:text-white">Visit Us</a></li>
        <li><a href="/contact" className="hover:text-white">Contact</a></li>
      </ul>
    </div>

    {/* Contact Info */}
    <div>
      <h4 className="text-base font-semibold mb-3">Contact Us</h4>
      <p className="text-sm text-gray-300 leading-relaxed">
        Zane Care Hospital<br />Main Road, Kochi, Kerala 682030
      </p>
      <p className="text-sm text-gray-300 mt-1">Phone: +91 98765 43210</p>
      <p className="text-sm text-gray-300">Email: contact@zanecarehospital.com</p>
    </div>

    {/* Social / Newsletter */}
    <div>
      <h4 className="text-base font-semibold mb-3">Stay Connected</h4>
      <p className="text-sm text-gray-300 mb-1">Follow us on:</p>
      <div className="flex space-x-4 text-xl">
        <a href="#" aria-label="Facebook" className="hover:text-indigo-400">🌐</a>
        <a href="#" aria-label="Twitter" className="hover:text-indigo-400">🐦</a>
        <a href="#" aria-label="Instagram" className="hover:text-indigo-400">📷</a>
      </div>
    </div>
  </div>

  {/* Bottom line */}
  <div className="mt-8 border-t border-slate-700 pt-4 text-center text-sm text-gray-400">
    &copy; {new Date().getFullYear()} Zane Care Hospital. All rights reserved.
  </div>
</footer>





    </>
  );
}
