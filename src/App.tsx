import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import InvoiceList from './pages/InvoiceList';
import InvoiceForm from './pages/InvoiceForm';
import InvoiceDetail from './pages/InvoiceDetail';
import { FileText, PlusCircle, LayoutDashboard } from 'lucide-react';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <Toaster position="top-center" />
        <nav className="bg-white shadow-sm border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <Link to="/" className="flex items-center space-x-2 text-indigo-600 font-bold text-xl">
                  <FileText className="w-7 h-7" />
                  <span>FacturaFacil</span>
                </Link>
              </div>
              <div className="flex items-center space-x-6">
                <Link to="/" className="flex items-center text-gray-600 hover:text-indigo-600 font-medium transition-colors">
                   <LayoutDashboard className="w-4 h-4 mr-1" /> Panel
                </Link>
                <Link to="/create" className="flex items-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors font-medium text-sm">
                   <PlusCircle className="w-4 h-4 mr-1" /> Nueva Factura
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<InvoiceList />} />
            <Route path="/create" element={<InvoiceForm />} />
            <Route path="/invoice/:id" element={<InvoiceDetail />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;