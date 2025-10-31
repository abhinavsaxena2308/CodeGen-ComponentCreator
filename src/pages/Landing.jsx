import React from 'react';
import { Link } from 'react-router-dom';
import { FaCode, FaArrowRight } from 'react-icons/fa';
import ElectricBorder from '../component/ElectricBorder';

const Landing = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/20">
            <FaCode className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent mb-6">
            CodeGen Component Creator
          </h1>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
            Create beautiful, responsive React components with AI-powered
            suggestions and real-time previews. Streamline your development
            workflow and build faster than ever.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-green-500/20 transition-all duration-200"
            >
              Get Started
              <FaArrowRight className="w-4 h-4" />
            </Link>
            <a
              href="#features"
              className="px-8 py-4 border border-gray-700 hover:border-gray-600 rounded-lg font-medium transition-colors duration-200"
            >
              Learn More
            </a>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div
        id="features"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20"
      >
        <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              title: "AI-Powered",
              description:
                "Generate components using advanced AI suggestions tailored to your needs.",
              icon: "🤖",
            },
            {
              title: "Real-time Preview",
              description:
                "See your changes instantly as you build and customize components.",
              icon: "⚡",
            },
            {
              title: "Fully Responsive",
              description:
                "Create components that look great on any device or screen size.",
              icon: "📱",
            },
          ].map((feature, index) => (
            <ElectricBorder
              key={index}
              color="#7df9ff"
              speed={1}
              chaos={0.5}
              thickness={2}
              style={{ borderRadius: 16 }}
            >
              <div className="bg-gray-800/50 p-6 rounded-xl hover:bg-gray-800/70 transition-colors duration-200 h-full">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-green-400">
                  {feature.title}
                </h3>
                <p className="text-gray-300">{feature.description}</p>
              </div>
            </ElectricBorder>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gray-800/30 mt-20 py-16">
        <div className="max-w-3xl mx-auto text-center px-4">
          <h2 className="text-3xl font-bold mb-6">
            Ready to build something amazing?
          </h2>
          <p className="text-gray-300 mb-8">
            Join thousands of developers who are already creating beautiful
            components with CodeGen.
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-medium rounded-lg shadow-lg shadow-green-500/20 transition-all duration-200"
          >
            Get Started for Free
            <FaArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;