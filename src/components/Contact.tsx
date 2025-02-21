import React, { useState } from 'react';
import { Navbar } from './Navbar';
import { Mail, Send, MessageSquare } from 'lucide-react';

export function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      message: ''
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a237e] via-[#4a148c] to-[#880e4f]">
      <Navbar userEmail={null} />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-4">Contact Us</h1>
          <p className="text-violet-200 text-center mb-12">
            Have questions or feedback? We'd love to hear from you.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold text-white mb-4">Get in Touch</h2>
                <p className="text-violet-200 mb-6">
                  Feel free to reach out to us with any questions or concerns.
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-4 text-violet-200">
                  <Mail className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:sahithiv0305@gmail.com" className="text-violet-300 hover:text-violet-100">
                      sahithiv0305@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-violet-200">
                  <MessageSquare className="h-6 w-6" />
                  <div>
                    <p className="font-medium">Support</p>
                    <p>24/7 customer support</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-violet-500/20">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-violet-200">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      className="mt-1 block w-full bg-white/5 border border-violet-500/30 rounded-lg py-2 px-3 text-violet-100 placeholder-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-violet-200">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="mt-1 block w-full bg-white/5 border border-violet-500/30 rounded-lg py-2 px-3 text-violet-100 placeholder-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-violet-200">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full bg-white/5 border border-violet-500/30 rounded-lg py-2 px-3 text-violet-100 placeholder-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-violet-200">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="mt-1 block w-full bg-white/5 border border-violet-500/30 rounded-lg py-2 px-3 text-violet-100 placeholder-violet-400/50 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-transparent"
                    required
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transform transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Send Message</span>
                  <Send className="h-5 w-5" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}