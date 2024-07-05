'use client'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AccentryComponent from "@/src/app/components/homepage/wordTopLevel";
import { Thread } from "@/src/app/components/ui/assistant-ui/thread";

export default function HomeClient() {
  const [showThread, setShowThread] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowThread(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="h-full">
      {!showThread && <AccentryComponent />}
      {showThread && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-0 left-0 w-full h-full"
        >
          <Thread />
        </motion.div>
      )}
    </main>
  );
}