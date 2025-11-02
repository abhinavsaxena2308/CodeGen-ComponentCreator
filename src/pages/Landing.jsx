import React from "react";
import { Link } from "react-router-dom";
import { FaArrowRight } from "react-icons/fa";
import ElectricBorder from "../component/ElectricBorder";
import Hyperspeed from "../component/Hyperspeed"; // adjust path if needed
import { hyperspeedPresets } from "../component/hyperspeedPresets"; // adjust path if needed

const Landing = () => {
  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Content Container */}
      <div className="relative z-10">
        {/* Hyperspeed Section */}
        <div className="relative w-full h-screen overflow-hidden">
          <Hyperspeed effectOptions={hyperspeedPresets.one} />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center z-10">
            <h1 className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-white mb-6 drop-shadow-[0_0_15px_rgba(34,197,94,0.6)]">
              CodeGen Component Creator
            </h1>

            <p className="text-xl text-gray-300 max-w-3xl mx-auto mb-10">
              Create beautiful, responsive React components with AI-powered
              suggestions and real-time previews. Streamline your development
              workflow and build faster than ever.
            </p>
            <div className="flex gap-4">
              <Link
                to="/auth"
                className="px-8 py-3 bg-white/90 hover:bg-white text-gray-900 rounded-full font-semibold shadow-md transition-all duration-300"
              >
                Sign Up
              </Link>
              <Link
                to="/about"
                className="px-8 py-3 bg-gray-800/60 border border-white/30 rounded-full text-white font-semibold backdrop-blur-sm transition-all duration-300"
              >
                Learn More
              </Link>
            </div>
          </div>
        </div>
        {/* Features Section */}
        <div
          id="features"
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10"
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
        <div className="bg-gray-800/30 mt-0 py-16">
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
    </div>
  );
};

export default Landing;
