import React from 'react';

const Pricing: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Pricing</h1>
      <p className="text-muted-foreground mt-4">Flexible pricing plans for teams of all sizes.</p>

      <section className="mt-8 grid md:grid-cols-3 gap-6">
        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-xl">Free</h2>
          <p className="mt-2">Essential features for small teams and trials.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-xl">Pro</h2>
          <p className="mt-2">Advanced collaboration, increased limits and priority support.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h2 className="font-semibold text-xl">Enterprise</h2>
          <p className="mt-2">Custom plans, SSO, and dedicated account management.</p>
        </div>
      </section>
    </main>
  );
};

export default Pricing;
