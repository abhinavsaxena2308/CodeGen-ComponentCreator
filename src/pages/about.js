import React from 'react';
import { FaCode, FaUsers, FaRocket, FaShieldAlt } from 'react-icons/fa';
import { MdOutlineSecurity, MdSpeed } from 'react-icons/md';

const About = () => {
  const features = [
    {
      icon: <FaCode className="w-8 h-8 text-green-400" />,
      title: 'AI-Powered',
      description: 'Leveraging cutting-edge AI to generate clean, efficient code.'
    },
    {
      icon: <MdSpeed className="w-8 h-8 text-green-400" />,
      title: 'Lightning Fast',
      description: 'Generate components in seconds, not hours.'
    },
    {
      icon: <FaShieldAlt className="w-8 h-8 text-green-400" />,
      title: 'Secure',
      description: 'Your code stays private and secure.'
    },
    {
      icon: <FaUsers className="w-8 h-8 text-green-400" />,
      title: 'Community Driven',
      description: 'Built by developers, for developers.'
    }
  ];

  const team = [
    {
      name: 'John Doe',
      role: 'Founder & CEO',
      avatar: 'https://randomuser.me/api/portraits/men/1.jpg'
    },
    {
      name: 'Jane Smith',
      role: 'Lead Developer',
      avatar: 'https://randomuser.me/api/portraits/women/1.jpg'
    },
    {
      name: 'Alex Johnson',
      role: 'UI/UX Designer',
      avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Hero Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
            About CodeGen
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Revolutionizing the way developers create components with AI-powered code generation.
          </p>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose <span className="text-green-400">CodeGen</span>?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="bg-gray-800/50 p-6 rounded-xl hover:bg-gray-800/80 transition-all duration-300 border border-gray-700/50 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-12">
          Meet Our <span className="text-green-400">Team</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <div 
              key={index}
              className="bg-gray-800/50 rounded-xl p-6 text-center hover:bg-gray-800/80 transition-all duration-300 border border-gray-700/50 hover:border-green-500/30"
            >
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-green-500/30">
                <img 
                  src={member.avatar} 
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold">{member.name}</h3>
              <p className="text-green-400">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-green-900/20 to-emerald-900/20">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
          <p className="text-xl text-gray-300 mb-8">
            Join thousands of developers who are already boosting their productivity with CodeGen.
          </p>
          <button className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:opacity-90 transition-opacity shadow-lg shadow-green-500/20">
            Get Started for Free
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
