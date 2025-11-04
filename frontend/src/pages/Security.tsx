import React from 'react';

const Security: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Security</h1>
      <p className="text-muted-foreground mt-4">Security and compliance features that protect your data.</p>

      <section className="mt-6 space-y-4">
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold">Encryption</h3>
          <p className="mt-2">All data in transit and at rest is encrypted with industry-standard protocols.</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold">Access Controls</h3>
          <p className="mt-2">Role-based access control and SSO integrations (SAML, OIDC).</p>
        </div>
        <div className="p-6 border rounded-lg">
          <h3 className="font-semibold">Compliance</h3>
          <p className="mt-2">GDPR-ready and SOC2 privacy controls available for enterprises.</p>
        </div>
      </section>
    </main>
  );
};

export default Security;
