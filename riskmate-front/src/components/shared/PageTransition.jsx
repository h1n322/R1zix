import React from 'react';
import { motion } from 'framer-motion';

const PageTransition = ({ children }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}     // Стан ДО появи: прозорий і зміщений на 20px вниз
      animate={{ opacity: 1, y: 0 }}      // Стан ПІСЛЯ появи: видимий і на своєму місці
      transition={{ duration: 0.4, ease: "easeOut" }} // Тривалість 0.4 секунди, плавне гальмування
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;