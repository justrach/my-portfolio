'use client'
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import AccentryComponent from "@/src/app/components/homepage/wordTopLevel";
import ChatPage from "../../chat/page";

export default function HomeClient() {


  return (
    <main className="h-full">
      {/* {!showThread && <AccentryComponent />}
      {showThread && ( */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className="absolute top-0 left-0 w-full h-full"
        >
          <ChatPage />
        </motion.div>

    </main>
  );
}