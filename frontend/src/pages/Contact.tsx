import React from 'react';

const Contact: React.FC = () => {
  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold">Contact</h1>
      <p className="text-muted-foreground mt-4">Get in touch with our sales and support teams.</p>

      <section className="mt-6 max-w-lg">
        <form className="space-y-4">
          <input className="w-full p-3 border rounded" placeholder="Name" />
          <input className="w-full p-3 border rounded" placeholder="Email" />
          <textarea className="w-full p-3 border rounded" rows={5} placeholder="Message" />
          <button className="px-4 py-2 bg-primary text-white rounded">Send</button>
        </form>
      </section>
    </main>
  );
};

export default Contact;
