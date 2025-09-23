import React, { useState } from 'react';
import IndexScreen from './src/screens/IndexScreen';
import SlidesScreen from './src/screens/SlidesScreen';

export default function App() {
  const [showSlides, setShowSlides] = useState(false);

  return showSlides ? (
    <SlidesScreen onBack={() => setShowSlides(false)} />
  ) : (
    <IndexScreen onSuccess={() => setShowSlides(true)} />
  );
}
