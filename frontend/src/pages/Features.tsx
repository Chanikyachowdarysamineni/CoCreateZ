import React from 'react';
import FeaturesList from '../components/Features';

const Features: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-12">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Features</h1>
        <p className="text-muted-foreground mt-2">Explore the core capabilities of CollabSync.</p>
      </header>
      <section>
        <FeaturesList />
      </section>
    </main>
  );
};

export default Features;
