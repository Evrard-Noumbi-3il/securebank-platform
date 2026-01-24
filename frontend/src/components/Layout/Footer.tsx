import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Github, Linkedin, Mail, ExternalLink } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-white">SecureBank</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Plateforme bancaire moderne et sécurisée avec architecture microservices.
            </p>
            <div className="flex items-center space-x-3">
              <a
                href="https://github.com/Evrard-Noumbi-3il/securebank-platform"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a
                href="mailto:contact@securebank.com"
                className="p-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                aria-label="Email"
              >
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Produits</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/accounts" className="text-sm hover:text-white transition-colors">
                  Comptes
                </Link>
              </li>
              <li>
                <Link to="/transactions" className="text-sm hover:text-white transition-colors">
                  Transactions
                </Link>
              </li>
              <li>
                <Link to="/transfer" className="text-sm hover:text-white transition-colors">
                  Virements
                </Link>
              </li>
              
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Ressources</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://github.com/Evrard-Noumbi-3il/securebank-platform/blob/main/README.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors flex items-center"
                >
                  Documentation
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Evrard-Noumbi-3il/securebank-platform/blob/main/API.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors flex items-center"
                >
                  API Documentation
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Evrard-Noumbi-3il/securebank-platform/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm hover:text-white transition-colors flex items-center"
                >
                  Support
                  <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-semibold mb-4">Légal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  Conditions d'utilisation
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  Politique de confidentialité
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  Politique de cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-sm hover:text-white transition-colors">
                  Mentions légales
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            {/* Copyright */}
            <p className="text-sm text-gray-400">
              © {currentYear} SecureBank Platform. Projet étudiant - Portfolio Bac+4.
            </p>

            {/* Tech Stack Badge */}
            <div className="flex items-center space-x-2">
              <span className="text-xs text-gray-500">Construit avec</span>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-gray-800 rounded text-xs font-medium text-gray-300">
                  React
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs font-medium text-gray-300">
                  TypeScript
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs font-medium text-gray-300">
                  Spring Boot
                </span>
                <span className="px-2 py-1 bg-gray-800 rounded text-xs font-medium text-gray-300">
                  PostgreSQL
                </span>
              </div>
            </div>

            {/* Project Info */}
            <a
              href="https://github.com/Evrard-Noumbi-3il/securebank-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-400 hover:text-primary-300 transition-colors flex items-center"
            >
              Voir sur GitHub
              <ExternalLink className="w-4 h-4 ml-1" />
            </a>
          </div>
        </div>

        {/* Security Notice */}
        <div className="border-t border-gray-800 py-4">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <Shield className="w-4 h-4" />
            <p>
              Ce projet utilise une architecture microservices sécurisée avec JWT, rate limiting et audit de sécurité.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;