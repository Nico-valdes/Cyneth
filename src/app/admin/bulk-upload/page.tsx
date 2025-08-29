import BulkUpload from '@/components/BulkUpload';

export default function BulkUploadPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Panel de Administración</h1>
          <p className="text-gray-600 mt-2">Carga masiva de productos</p>
        </div>
        
        <BulkUpload />
      </div>
    </div>
  );
}
