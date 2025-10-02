import React, { useState, useEffect, useCallback } from 'react';
import type { FloorData, Theme, ModalMode, FloorContent } from '../types';
import { PencilIcon, TrashIcon, PlusIcon } from './Icons';

interface FloorManagementModalProps {
  floors: FloorData[];
  onClose: () => void;
  onSave: (updatedFloors: FloorData[]) => void;
  theme: Theme;
}

const emptyFloor: Omit<FloorData, 'level'> = {
  name: '',
  description: '',
  content: null,
  musicContent: null,
};

const fileToBase64 = (file: File): Promise<FloorContent> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve({ type: file.type, data: reader.result as string, name: file.name });
        reader.onerror = error => reject(error);
    });
};

const FloorForm: React.FC<{
  floor: Omit<FloorData, 'level'>;
  onUpdate: (field: keyof typeof emptyFloor, value: any) => void;
  theme: Theme;
}> = ({ floor, onUpdate, theme }) => {
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, field: 'content' | 'musicContent') => {
        if (e.target.files && e.target.files[0]) {
            try {
                const fileContent = await fileToBase64(e.target.files[0]);
                onUpdate(field, fileContent);
            } catch (error) {
                console.error("Failed to read file", error);
                onUpdate(field, null);
            }
        }
    };

    const removeContent = (field: 'content' | 'musicContent') => {
        onUpdate(field, null);
    };

    const inputClasses = "w-full p-2 bg-gray-700 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500";
    const labelClasses = "block text-sm font-medium text-gray-300 mb-1";
    
    return (
        <div className="space-y-4 max-h-[60vh] overflow-y-auto p-1">
            <div><label className={labelClasses}>Floor Name*</label><input type="text" value={floor.name} onChange={e => onUpdate('name', e.target.value)} className={inputClasses} required /></div>
            <div><label className={labelClasses}>Description</label><textarea value={floor.description ?? ''} onChange={e => onUpdate('description', e.target.value)} className={inputClasses} rows={3}></textarea></div>
            <div>
                <label className={labelClasses}>Floor Music (Audio File)</label>
                {floor.musicContent ? (
                    <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                        <p className="text-sm text-gray-300 truncate">{floor.musicContent.name}</p>
                        <button onClick={() => removeContent('musicContent')} className="text-red-500 hover:text-red-400 font-bold ml-2">Remove</button>
                    </div>
                ) : (
                    <input type="file" accept="audio/*" onChange={e => handleFileChange(e, 'musicContent')} className={`${inputClasses} file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-gray-300 hover:file:bg-gray-500`} />
                )}
            </div>
            <div>
                <label className={labelClasses}>Interior Content (Image, GIF, Video, etc.)</label>
                {floor.content ? (
                    <div className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                        <p className="text-sm text-gray-300 truncate">{floor.content.name}</p>
                        <button onClick={() => removeContent('content')} className="text-red-500 hover:text-red-400 font-bold ml-2">Remove</button>
                    </div>
                ) : (
                    <input type="file" onChange={e => handleFileChange(e, 'content')} className={`${inputClasses} file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-600 file:text-gray-300 hover:file:bg-gray-500`} />
                )}
            </div>
        </div>
    );
};

const FloorManagementModal: React.FC<FloorManagementModalProps> = ({ floors, onClose, onSave, theme }) => {
  const [editingFloor, setEditingFloor] = useState<FloorData | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Omit<FloorData, 'level'>>(emptyFloor);

  const themeClasses: Record<Theme, { accent: string, border: string }> = {
    cyberpunk: { accent: 'bg-cyan-500', border: 'border-cyan-500/50' },
    outrun: { accent: 'bg-pink-500', border: 'border-pink-500/50' },
    vaporwave: { accent: 'bg-teal-400', border: 'border-teal-400/50' },
  };
  const activeTheme = themeClasses[theme];
  
  const handleEdit = (floor: FloorData) => {
    setIsAdding(false);
    setEditingFloor(floor);
    setFormData(floor);
  };
  
  const handleAdd = () => {
    setEditingFloor(null);
    setIsAdding(true);
    setFormData(emptyFloor);
  };

  const handleUpdate = (field: keyof typeof emptyFloor, value: any) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const handleDelete = (level: number) => {
    if (window.confirm('Are you sure you want to delete this floor? This cannot be undone.')) {
        // Re-level subsequent floors
        const newFloors = floors
            .filter(f => f.level !== level)
            .sort((a, b) => a.level - b.level)
            .map((floor, index) => ({...floor, level: index}));
        onSave(newFloors);
    }
  };
  
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAdding) {
      const newLevel = floors.length > 0 ? Math.max(...floors.map(f => f.level)) + 1 : 0;
      onSave([...floors, { ...formData, level: newLevel }]);
    } else if (editingFloor) {
      onSave(floors.map(f => f.level === editingFloor.level ? { ...formData, level: editingFloor.level } : f));
    }
    setIsAdding(false);
    setEditingFloor(null);
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className={`w-full max-w-4xl bg-gray-900 rounded-lg border-2 ${activeTheme.border} shadow-lg flex flex-col`}>
        <header className="flex justify-between items-center p-4 border-b border-gray-700">
          <h2 className="text-2xl font-bold">Manage Floors</h2>
          <button onClick={onClose} className="text-2xl">&times;</button>
        </header>
        
        <div className="flex-grow flex p-4 gap-4 overflow-hidden">
            <div className="w-1/3 flex flex-col border-r border-gray-700 pr-4">
                <ul className="flex-grow space-y-2 overflow-y-auto">
                    {floors.sort((a,b) => a.level - b.level).map(floor => (
                        <li key={floor.level} className="flex justify-between items-center bg-gray-800 p-2 rounded-md">
                            <span>{floor.level}: {floor.name}</span>
                            <div className="space-x-2">
                                <button onClick={() => handleEdit(floor)} className="text-gray-400 hover:text-white"><PencilIcon className="w-5 h-5"/></button>
                                <button onClick={() => handleDelete(floor.level)} className="text-gray-400 hover:text-red-500"><TrashIcon className="w-5 h-5"/></button>
                            </div>
                        </li>
                    ))}
                </ul>
                <button onClick={handleAdd} className={`mt-4 w-full flex items-center justify-center p-2 rounded-md ${activeTheme.accent} text-gray-900 font-bold`}>
                    <PlusIcon className="w-5 h-5 mr-2" /> Add New Floor
                </button>
            </div>
            <div className="w-2/3">
                {isAdding || editingFloor ? (
                    <form onSubmit={handleFormSubmit}>
                        <h3 className="text-xl mb-4 font-semibold">{isAdding ? 'Add New Floor' : `Editing Floor ${editingFloor?.level}`}</h3>
                        <FloorForm floor={formData} onUpdate={handleUpdate} theme={theme} />
                        <div className="mt-4 flex justify-end space-x-3">
                            <button type="button" onClick={() => { setIsAdding(false); setEditingFloor(null); }} className="px-4 py-2 bg-gray-600 rounded-md">Cancel</button>
                            <button type="submit" className={`px-4 py-2 ${activeTheme.accent} text-gray-900 rounded-md font-bold`}>Save Changes</button>
                        </div>
                    </form>
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-500">
                        <p>Select a floor to edit or add a new one.</p>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};

export default FloorManagementModal;