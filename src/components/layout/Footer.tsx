import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../../public/Cyneth-logo.png";

import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react";

interface FooterProps {}

const Footer: React.FC<FooterProps> = () => {
  return (
    <footer className="bg-neutral-900 text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Image 
              src={Logo} 
              alt="Logo Cyneth Sanitarios" 
              width={150} 
              height={50} 
              className="mb-4" 
            />
            <p className="text-sm text-gray-400 text-center md:text-left">
              Productos premium desde 1999
            </p>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <div className="flex flex-col items-center md:items-start gap-3">
              <a
                href="mailto:ventas@cyneth.com.ar"
                className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors"
              >
                <Mail size={16} />
                ventas@cyneth.com.ar
              </a>
              <a
                href="tel:+541145678900"
                className="flex items-center gap-2 text-sm hover:text-red-500 transition-colors"
              >
                <Phone size={16} />
                +54 11 2316-8857
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-4">Enlaces Rápidos</h3>
            <nav className="flex flex-col items-center md:items-start gap-2">
              <Link href="/nosotros" className="text-sm hover:text-red-500 transition-colors">
                Sobre Nosotros
              </Link>
              <Link href="/catalogo" className="text-sm hover:text-red-500 transition-colors">
                Catálogo
              </Link>
              <Link href="/distribuidores" className="text-sm hover:text-red-500 transition-colors">
                Distribuidores
              </Link>
              <Link href="/contacto" className="text-sm hover:text-red-500 transition-colors">
                Contacto
              </Link>
            </nav>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-4">Seguinos en nuestras redes</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/cynethsanitarios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-red-500 transition-colors"
                aria-label="Facebook"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/cynethsanitarios"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-red-500 transition-colors"
                aria-label="Instagram"
              >
                <Instagram size={24} />
              </a>
            </div>
            <div className="mt-4 flex items-start gap-2">
              <MapPin size={16} className="mt-1 flex-shrink-0" />
              <p className="text-sm">Buenos Aires, Argentina</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">
            &copy; {new Date().getFullYear()} CYNETH SANITARIOS. Todos los derechos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
