import React, { useState, useEffect } from 'react';
import { Navbar } from './Navbar';
import { Mail, Send, MessageSquare, Loader2, CheckCircle2, XCircle } from 'lucide-react';
import emailjs from '@emailjs/browser';

emailjs.init("bzvuzhIiMtog_-2Y1");

export function Contact() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: ''
  });

  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  // Clear status after 5 seconds
  useEffect(() => {
    if (status === 'success' || status === 'error') {
      const timer = setTimeout(() => {
        setStatus('idle');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');

    try {
      // Modified template parameters to match EmailJS template
      const templateParams = {
        // Include every possible variable name for the message
        message: formData.message,
        feedback: formData.message,
        content: formData.message,
        user_message: formData.message,
        message_html: formData.message,
        // Include all other standard fields
        from_name: `${formData.firstName} ${formData.lastName}`,
        from_email: formData.email,
        reply_to: formData.email,
        to_name: "Truth Behind Pixels",
        subject: "Feedback Form Submission"
      };

      await emailjs.send(
        'service_1txcm4m',
        'template_ryjft1g',
        templateParams
      );

      setStatus('success');
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        message: ''
      });
    } catch (error) {
      console.error('Error sending email:', error);
      setStatus('error');
    }
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
                    <a href="mailto:truthbehindpixels@gmail.com" className="text-violet-300 hover:text-violet-100">
                      truthbehindpixels@gmail.com
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
                  disabled={status === 'sending'}
                  className={`w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center space-x-2 transform transition-all duration-300 ${
                    status === 'sending' ? 'opacity-75 cursor-not-allowed' : 'hover:scale-[1.02] active:scale-[0.98]'
                  }`}
                >
                  {status === 'sending' ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <span>Send Message</span>
                      <Send className="h-5 w-5" />
                    </>
                  )}
                </button>

                {/* Status Messages */}
                {status === 'success' && (
                  <div className="flex items-center space-x-2 text-green-400 bg-green-400/10 p-3 rounded-lg">
                    <CheckCircle2 className="h-5 w-5" />
                    <span>Message sent successfully!</span>
                  </div>
                )}

                {status === 'error' && (
                  <div className="flex items-center space-x-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
                    <XCircle className="h-5 w-5" />
                    <span>Failed to send message. Please try again.</span>
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
