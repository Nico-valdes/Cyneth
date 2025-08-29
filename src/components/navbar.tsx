import { Phone, Mail, MapPin } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="bg-gray-800 text-white shadow-lg">
      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-2xl font-bold text-red-500">
              CYNETH <span className="text-white">SANITARIOS</span>
            </h1>
          </div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <a
                href="#inicio"
                className="text-white hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Inicio
              </a>
              <a
                href="#productos"
                className="text-gray-300 hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Productos
              </a>
              <a
                href="#servicios"
                className="text-gray-300 hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Servicios
              </a>
              <a
                href="#nosotros"
                className="text-gray-300 hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Nosotros
              </a>
              <a
                href="#contacto"
                className="text-gray-300 hover:text-red-400 px-3 py-2 text-sm font-medium transition-colors"
              >
                Contacto
              </a>
            </div>
          </div>

          <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors">
            Cotizar
          </button>
        </div>
      </div>
    </nav>
  )
}
