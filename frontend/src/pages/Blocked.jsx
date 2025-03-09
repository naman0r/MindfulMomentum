import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import TopNav from "../components/TopNav";
import Footer from "../components/Footer.jsx";

const Blocked = () => {
  const [quote, setQuote] = useState("Stay focused on what matters most.");
  const quotes = [
    "Stay focused on what matters most.",
    "Small steps lead to big achievements.",
    "Your future self will thank you.",
    "Embrace the power of now.",
    "Focus is your superpower.",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      setQuote(randomQuote);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    initial: { opacity: 0 },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.5,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    initial: { y: 20, opacity: 0 },
    animate: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  const pulseVariants = {
    initial: { scale: 1 },
    animate: {
      scale: [1, 1.1, 1],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  const circleVariants = {
    animate: {
      scale: [1, 2, 2, 1, 1],
      rotate: [0, 0, 270, 270, 0],
      borderRadius: ["20%", "20%", "50%", "50%", "20%"],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <>
      <TopNav />
      <motion.div
        className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center p-4 text-white relative overflow-hidden"
        variants={containerVariants}
        initial="initial"
        animate="animate"
      >
        {/* Background animated circles */}
        <motion.div
          className="absolute w-64 h-64 bg-white/10 rounded-full -top-32 -left-32 blur-xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            transition: { duration: 10, repeat: Infinity },
          }}
        />
        <motion.div
          className="absolute w-64 h-64 bg-white/10 rounded-full -bottom-32 -right-32 blur-xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            transition: { duration: 8, repeat: Infinity },
          }}
        />

        {/* Main content */}
        <motion.div
          variants={itemVariants}
          className="text-6xl font-bold mb-8 text-center"
        >
          Be Focused!
        </motion.div>

        <motion.div
          variants={pulseVariants}
          animate="animate"
          className="w-32 h-32 bg-white/20 rounded-xl mb-8 flex items-center justify-center backdrop-blur-sm"
        >
          <motion.div
            variants={circleVariants}
            animate="animate"
            className="w-16 h-16 bg-white/40 rounded-md"
          />
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="text-xl text-center max-w-md mb-8"
        >
          {quote}
        </motion.div>

        <motion.div
          variants={itemVariants}
          className="text-sm text-white/60 text-center max-w-sm"
        >
          This site is currently blocked to help you maintain focus. Take a deep
          breath and return to your important work.
        </motion.div>
      </motion.div>
      <Footer />
    </>
  );
};

export default Blocked;
