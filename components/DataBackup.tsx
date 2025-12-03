import React from 'react';
import { Download, Upload, AlertTriangle } from 'lucide-react';

interface DataBackupProps {
  onExport: () => void;
  onImport: (file: File) => void;
}

const DataBackup: React.FC<DataBackupProps> = ({ onExport, onImport }) => {
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      e.target.value = ''; // Reset input
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
        <AlertTriangle size={20} className="text-amber-500" />
        Backup de Dados
      </h3>

      <p className="text-sm text-slate-600 mb-6">
        Faça backup regular dos seus dados para não perder informações.
        Os dados são salvos no navegador e podem ser perdidos se você limpar o cache.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onExport}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm font-medium"
        >
          <Download size={18} />
          Exportar Dados
        </button>

        <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm font-medium cursor-pointer">
          <Upload size={18} />
          Importar Dados
          <input
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
        <p className="text-xs text-amber-800">
          <strong>Importante:</strong> O arquivo de backup contém todos os dados do sistema
          (produtos, vendas, clientes, etc.). Guarde em local seguro.
        </p>
      </div>
    </div>
  );
};

export default DataBackup;
