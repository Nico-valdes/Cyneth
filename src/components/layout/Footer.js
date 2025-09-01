import React from "react"
import Image from "next/image"
import Link from "next/link"
import Logo from "../../../public/LOGO-ELECTRONICA ARGENTINA-01.png"

import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-black text-white py-12 px-4">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="flex flex-col items-center md:items-start">
            <Image src={Logo} alt="Logo Electrónica Argentina" width={150} height={50} className="mb-4" />
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <div className="flex flex-col items-center md:items-start gap-3">
              <a
                href="mailto:Ventas@electronicargentina.com.ar"
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
              >
                <Mail size={16} />
                Ventas@electronicargentina.com.ar
              </a>
              <a
                href="tel:+54 9 2229433411"
                className="flex items-center gap-2 text-sm hover:text-blue-400 transition-colors"
              >
                <Phone size={16} />
                +54 9 2229433411
              </a>
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-4">Enlaces Rápidos</h3>
            <nav className="flex flex-col items-center md:items-start gap-2">
              <Link href="/nosotros" className="text-sm hover:text-blue-400 transition-colors">
                Sobre Nosotros
              </Link>
              <Link href="/catalogo" className="text-sm hover:text-blue-400 transition-colors">
                Productos
              </Link>
              <Link href="/distribuidores" className="text-sm hover:text-blue-400 transition-colors">
                Distribuidores
              </Link>
              <Link href="/#contacto" className="text-sm hover:text-blue-400 transition-colors">
                Contacto
              </Link>
            </nav>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-lg font-bold mb-4">Seguinos en nuestras redes</h3>
            <div className="flex gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=100063790187794"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-blue-400 transition-colors"
              >
                <Facebook size={24} />
              </a>
              <a
                href="https://www.instagram.com/electronicasrl/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm hover:text-blue-400 transition-colors"
              >
                <Instagram size={24} />
              </a>
            </div>
            <div className="mt-4 flex items-start gap-2">
              <MapPin size={16} className="mt-1 flex-shrink-0" />
              <p className="text-sm">Calle 416 N°1242, Juan María Gutiérrez, Berazategui, Provincia de Buenos Aires, Argentina</p>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-700 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} TINA DIGITAL. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
