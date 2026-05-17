import { useState } from "react";
import { Upload, File, X, CheckCircle } from "lucide-react";

export const FileUpload = ({ onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const selectedFile = e.dataTransfer.files[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setFile(selectedFile);
      onFileSelect(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    onFileSelect(null);
  };

  return (
    <div className="w-full">
      {!file ? (
        <label
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          className={`relative group flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${
            dragActive ? "border-accent bg-accent/5" : "border-slate-700 hover:border-slate-500 hover:bg-slate-800/50"
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <div className="w-16 h-16 mb-4 bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-slate-700 transition-colors">
              <Upload className="text-slate-400 group-hover:text-accent" size={32} />
            </div>
            <p className="mb-2 text-sm text-slate-300">
              <span className="font-semibold text-accent">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-slate-500">PDF certificates (MAX. 5MB)</p>
          </div>
          <input type="file" className="hidden" accept=".pdf" onChange={handleChange} />
        </label>
      ) : (
        <div className="glass-morphism p-4 flex items-center justify-between border-accent/20">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
              <File className="text-accent" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-white max-w-[200px] truncate">{file.name}</p>
              <p className="text-xs text-slate-400">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="text-green-500" size={20} />
            <button
              onClick={removeFile}
              className="p-2 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
