import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Save, Undo2, Redo2, ChevronDown, Search, X, Plus, Minus,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Grid3x3, Download, Upload, Printer, Copy, Scissors, ClipboardPaste,
  FileSpreadsheet, Filter, SortAsc, SortDesc, PieChart, BarChart3,
  Table, Percent, DollarSign, Calendar, Hash, Type, Palette,
  Eye, Lock, Unlock, Maximize2, Minimize2, Settings, HelpCircle,
  MoreVertical, Trash2, Edit, RefreshCw, FileDown, FileUp,
  ChevronLeft, ChevronRight, Share2, Users, MessageSquare,
  TrendingUp, Calculator, Sigma, ChevronUp, List, Image,
  Link2, FunctionSquare, Columns, Split, Merge
} from 'lucide-react';

interface Cell {
  value: string;
  formula?: string;
  style?: {
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    fontSize?: number;
    fontFamily?: string;
    color?: string;
    backgroundColor?: string;
    textAlign?: 'left' | 'center' | 'right';
    format?: string;
    borderTop?: string;
    borderBottom?: string;
    borderLeft?: string;
    borderRight?: string;
  };
}

interface Sheet {
  id: string;
  name: string;
  cells: { [key: string]: Cell };
  columnWidths: { [key: number]: number };
  rowHeights: { [key: number]: number };
}

const ExcelEditor: React.FC = () => {
  // Core state
  const [workbookName, setWorkbookName] = useState('Workbook1 - Excel');
  const [sheets, setSheets] = useState<Sheet[]>([
    {
      id: '1',
      name: 'Sheet1',
      cells: {},
      columnWidths: {},
      rowHeights: {}
    }
  ]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);
  const [selectedRange, setSelectedRange] = useState<{
    startRow: number;
    startCol: number;
    endRow: number;
    endCol: number;
  } | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [editingCell, setEditingCell] = useState<{row: number, col: number} | null>(null);
  const [formulaBarValue, setFormulaBarValue] = useState('');
  
  // UI state
  const [activeTab, setActiveTab] = useState('Home');
  const [zoom, setZoom] = useState(100);
  const [showGridlines, setShowGridlines] = useState(true);
  const [showFormulas, setShowFormulas] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  
  // Formatting state
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState(11);
  const [textColor, setTextColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#FFFFFF');
  const [numberFormat, setNumberFormat] = useState('General');
  
  // Dialog state
  const [showFindDialog, setShowFindDialog] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [showFormatDialog, setShowFormatDialog] = useState(false);
  const [showInsertDialog, setShowInsertDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  
  // Clipboard
  const [clipboard, setClipboard] = useState<{
    cells: { [key: string]: Cell };
    range: { startRow: number; startCol: number; endRow: number; endCol: number };
  } | null>(null);
  const [clipboardMode, setClipboardMode] = useState<'copy' | 'cut' | null>(null);
  
  // History for undo/redo
  const [history, setHistory] = useState<Sheet[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Constants
  const ROWS = 100;
  const COLS = 26;
  const DEFAULT_COL_WIDTH = 100;
  const DEFAULT_ROW_HEIGHT = 25;
  
  const tabs = ['File', 'Home', 'Insert', 'Page Layout', 'Formulas', 'Data', 'Review', 'View'];
  const fonts = ['Calibri', 'Arial', 'Times New Roman', 'Courier New', 'Verdana', 'Georgia'];
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32];
  const numberFormats = [
    'General',
    'Number',
    'Currency',
    'Accounting',
    'Short Date',
    'Long Date',
    'Time',
    'Percentage',
    'Fraction',
    'Scientific',
    'Text'
  ];
  
  // Helper functions
  const colToLetter = (col: number): string => {
    let letter = '';
    while (col >= 0) {
      letter = String.fromCharCode((col % 26) + 65) + letter;
      col = Math.floor(col / 26) - 1;
    }
    return letter;
  };
  
  const getCellKey = (row: number, col: number): string => {
    return `${colToLetter(col)}${row + 1}`;
  };
  
  const getCell = (row: number, col: number): Cell => {
    const sheet = sheets[activeSheetIndex];
    const key = getCellKey(row, col);
    return sheet.cells[key] || { value: '', style: {} };
  };
  
  const setCell = useCallback((row: number, col: number, updates: Partial<Cell>) => {
    setSheets(prev => {
      const newSheets = [...prev];
      const sheet = { ...newSheets[activeSheetIndex] };
      const key = getCellKey(row, col);
      sheet.cells = {
        ...sheet.cells,
        [key]: {
          ...sheet.cells[key],
          ...updates
        }
      };
      newSheets[activeSheetIndex] = sheet;
      return newSheets;
    });
    setIsModified(true);
  }, [activeSheetIndex]);
  
  // Formula evaluation
  const evaluateFormula = useCallback((formula: string): string => {
    if (!formula.startsWith('=')) return formula;
    
    try {
      let expr = formula.substring(1);
      
      // Handle cell references (e.g., A1, B2)
      expr = expr.replace(/([A-Z]+)(\d+)/g, (match, col, row) => {
        const colIndex = col.split('').reduce((acc: number, char: string) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
        const rowIndex = parseInt(row) - 1;
        const cell = getCell(rowIndex, colIndex);
        const value = cell.formula ? evaluateFormula(cell.formula) : cell.value;
        return value || '0';
      });
      
      // Handle common functions
      expr = expr.replace(/SUM\(([^)]+)\)/g, (match, range) => {
        const values = range.split(':').map((ref: string) => {
          const colMatch = ref.match(/([A-Z]+)(\d+)/);
          if (colMatch) {
            const colIndex = colMatch[1].split('').reduce((acc: number, char: string) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
            const rowIndex = parseInt(colMatch[2]) - 1;
            const cell = getCell(rowIndex, colIndex);
            return parseFloat(cell.value) || 0;
          }
          return 0;
        });
        return values.reduce((a: number, b: number) => a + b, 0).toString();
      });
      
      expr = expr.replace(/AVERAGE\(([^)]+)\)/g, (match, range) => {
        const values = range.split(':').map((ref: string) => {
          const colMatch = ref.match(/([A-Z]+)(\d+)/);
          if (colMatch) {
            const colIndex = colMatch[1].split('').reduce((acc: number, char: string) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
            const rowIndex = parseInt(colMatch[2]) - 1;
            const cell = getCell(rowIndex, colIndex);
            return parseFloat(cell.value) || 0;
          }
          return 0;
        });
        const sum = values.reduce((a: number, b: number) => a + b, 0);
        return (sum / values.length).toString();
      });
      
      expr = expr.replace(/COUNT\(([^)]+)\)/g, (match, range) => {
        const values = range.split(':').filter((ref: string) => {
          const colMatch = ref.match(/([A-Z]+)(\d+)/);
          if (colMatch) {
            const colIndex = colMatch[1].split('').reduce((acc: number, char: string) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
            const rowIndex = parseInt(colMatch[2]) - 1;
            const cell = getCell(rowIndex, colIndex);
            return cell.value !== '';
          }
          return false;
        });
        return values.length.toString();
      });
      
      expr = expr.replace(/MAX\(([^)]+)\)/g, (match, range) => {
        const values = range.split(':').map((ref: string) => {
          const colMatch = ref.match(/([A-Z]+)(\d+)/);
          if (colMatch) {
            const colIndex = colMatch[1].split('').reduce((acc: number, char: string) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
            const rowIndex = parseInt(colMatch[2]) - 1;
            const cell = getCell(rowIndex, colIndex);
            return parseFloat(cell.value) || 0;
          }
          return 0;
        });
        return Math.max(...values).toString();
      });
      
      expr = expr.replace(/MIN\(([^)]+)\)/g, (match, range) => {
        const values = range.split(':').map((ref: string) => {
          const colMatch = ref.match(/([A-Z]+)(\d+)/);
          if (colMatch) {
            const colIndex = colMatch[1].split('').reduce((acc: number, char: string) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
            const rowIndex = parseInt(colMatch[2]) - 1;
            const cell = getCell(rowIndex, colIndex);
            return parseFloat(cell.value) || 0;
          }
          return 0;
        });
        return Math.min(...values).toString();
      });
      
      // Evaluate the expression
      const result = eval(expr);
      return result.toString();
    } catch (error) {
      return '#ERROR!';
    }
  }, [activeSheetIndex, sheets]);
  
  // Format cell value based on format
  const formatCellValue = useCallback((value: string, format: string): string => {
    if (!value || value === '#ERROR!') return value;
    
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    
    switch (format) {
      case 'Currency':
        return `$${numValue.toFixed(2)}`;
      case 'Percentage':
        return `${(numValue * 100).toFixed(2)}%`;
      case 'Number':
        return numValue.toFixed(2);
      case 'Scientific':
        return numValue.toExponential(2);
      default:
        return value;
    }
  }, []);
  
  // Cell editing
  const handleCellClick = useCallback((row: number, col: number, event: React.MouseEvent) => {
    if (event.shiftKey && selectedCell) {
      // Range selection
      setSelectedRange({
        startRow: Math.min(selectedCell.row, row),
        startCol: Math.min(selectedCell.col, col),
        endRow: Math.max(selectedCell.row, row),
        endCol: Math.max(selectedCell.col, col)
      });
    } else {
      setSelectedCell({ row, col });
      setSelectedRange(null);
      const cell = getCell(row, col);
      setFormulaBarValue(cell.formula || cell.value);
    }
    setEditingCell(null);
  }, [selectedCell]);
  
  const handleCellDoubleClick = useCallback((row: number, col: number) => {
    setEditingCell({ row, col });
    const cell = getCell(row, col);
    setFormulaBarValue(cell.formula || cell.value);
    setTimeout(() => cellInputRef.current?.focus(), 0);
  }, []);
  
  const handleCellChange = useCallback((value: string) => {
    if (editingCell) {
      if (value.startsWith('=')) {
        const evaluated = evaluateFormula(value);
        setCell(editingCell.row, editingCell.col, {
          value: evaluated,
          formula: value
        });
      } else {
        setCell(editingCell.row, editingCell.col, { value, formula: undefined });
      }
      setFormulaBarValue(value);
    }
  }, [editingCell, evaluateFormula, setCell]);
  
  const handleCellKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!selectedCell) return;
    
    if (event.key === 'Enter') {
      if (editingCell) {
        setEditingCell(null);
        setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col });
      } else {
        handleCellDoubleClick(selectedCell.row, selectedCell.col);
      }
    } else if (event.key === 'Tab') {
      event.preventDefault();
      setEditingCell(null);
      if (event.shiftKey) {
        setSelectedCell({ row: selectedCell.row, col: Math.max(0, selectedCell.col - 1) });
      } else {
        setSelectedCell({ row: selectedCell.row, col: Math.min(COLS - 1, selectedCell.col + 1) });
      }
    } else if (event.key === 'Escape') {
      setEditingCell(null);
      const cell = getCell(selectedCell.row, selectedCell.col);
      setFormulaBarValue(cell.formula || cell.value);
    } else if (event.key === 'Delete' || event.key === 'Backspace') {
      if (!editingCell) {
        event.preventDefault();
        if (selectedRange) {
          for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
            for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
              setCell(row, col, { value: '', formula: undefined });
            }
          }
        } else {
          setCell(selectedCell.row, selectedCell.col, { value: '', formula: undefined });
        }
        setFormulaBarValue('');
      }
    } else if (event.key.startsWith('Arrow')) {
      event.preventDefault();
      setEditingCell(null);
      const newCell = { ...selectedCell };
      switch (event.key) {
        case 'ArrowUp':
          newCell.row = Math.max(0, selectedCell.row - 1);
          break;
        case 'ArrowDown':
          newCell.row = Math.min(ROWS - 1, selectedCell.row + 1);
          break;
        case 'ArrowLeft':
          newCell.col = Math.max(0, selectedCell.col - 1);
          break;
        case 'ArrowRight':
          newCell.col = Math.min(COLS - 1, selectedCell.col + 1);
          break;
      }
      setSelectedCell(newCell);
      const cell = getCell(newCell.row, newCell.col);
      setFormulaBarValue(cell.formula || cell.value);
    } else if (!editingCell && event.key.length === 1 && !event.ctrlKey && !event.metaKey) {
      // Start editing if user types a character
      setEditingCell(selectedCell);
      setFormulaBarValue(event.key);
      setCell(selectedCell.row, selectedCell.col, { value: event.key, formula: undefined });
    }
  }, [selectedCell, editingCell, selectedRange, handleCellDoubleClick, setCell]);
  
  // Formatting functions
  const applyFormatting = useCallback((styleUpdates: Partial<Cell['style']>) => {
    if (selectedRange) {
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const cell = getCell(row, col);
          setCell(row, col, {
            style: { ...cell.style, ...styleUpdates }
          });
        }
      }
    } else if (selectedCell) {
      const cell = getCell(selectedCell.row, selectedCell.col);
      setCell(selectedCell.row, selectedCell.col, {
        style: { ...cell.style, ...styleUpdates }
      });
    }
  }, [selectedCell, selectedRange, setCell]);
  
  // Clipboard operations
  const handleCopy = useCallback(() => {
    if (selectedRange) {
      const cells: { [key: string]: Cell } = {};
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          const key = getCellKey(row, col);
          cells[key] = getCell(row, col);
        }
      }
      setClipboard({ cells, range: selectedRange });
      setClipboardMode('copy');
    } else if (selectedCell) {
      const key = getCellKey(selectedCell.row, selectedCell.col);
      setClipboard({
        cells: { [key]: getCell(selectedCell.row, selectedCell.col) },
        range: {
          startRow: selectedCell.row,
          startCol: selectedCell.col,
          endRow: selectedCell.row,
          endCol: selectedCell.col
        }
      });
      setClipboardMode('copy');
    }
  }, [selectedCell, selectedRange]);
  
  const handleCut = useCallback(() => {
    handleCopy();
    setClipboardMode('cut');
    if (selectedRange) {
      for (let row = selectedRange.startRow; row <= selectedRange.endRow; row++) {
        for (let col = selectedRange.startCol; col <= selectedRange.endCol; col++) {
          setCell(row, col, { value: '', formula: undefined });
        }
      }
    } else if (selectedCell) {
      setCell(selectedCell.row, selectedCell.col, { value: '', formula: undefined });
    }
  }, [selectedCell, selectedRange, handleCopy, setCell]);
  
  const handlePaste = useCallback(() => {
    if (!clipboard || !selectedCell) return;
    
    const rowOffset = selectedCell.row - clipboard.range.startRow;
    const colOffset = selectedCell.col - clipboard.range.startCol;
    
    Object.entries(clipboard.cells).forEach(([key, cell]) => {
      const match = key.match(/([A-Z]+)(\d+)/);
      if (match) {
        const col = match[1].split('').reduce((acc, char) => acc * 26 + char.charCodeAt(0) - 64, 0) - 1;
        const row = parseInt(match[2]) - 1;
        const newRow = row + rowOffset;
        const newCol = col + colOffset;
        if (newRow >= 0 && newRow < ROWS && newCol >= 0 && newCol < COLS) {
          setCell(newRow, newCol, cell);
        }
      }
    });
  }, [clipboard, selectedCell, setCell]);
  
  // Sheet management
  const addSheet = useCallback(() => {
    const newSheet: Sheet = {
      id: Date.now().toString(),
      name: `Sheet${sheets.length + 1}`,
      cells: {},
      columnWidths: {},
      rowHeights: {}
    };
    setSheets([...sheets, newSheet]);
    setActiveSheetIndex(sheets.length);
  }, [sheets]);
  
  const deleteSheet = useCallback((index: number) => {
    if (sheets.length === 1) {
      alert('Cannot delete the last sheet');
      return;
    }
    const newSheets = sheets.filter((_, i) => i !== index);
    setSheets(newSheets);
    if (activeSheetIndex >= newSheets.length) {
      setActiveSheetIndex(newSheets.length - 1);
    }
  }, [sheets, activeSheetIndex]);
  
  const renameSheet = useCallback((index: number) => {
    const newName = prompt('Enter new sheet name:', sheets[index].name);
    if (newName && newName.trim()) {
      const newSheets = [...sheets];
      newSheets[index] = { ...newSheets[index], name: newName.trim() };
      setSheets(newSheets);
    }
  }, [sheets]);
  
  // File operations
  const handleSave = useCallback(() => {
    const data = {
      name: workbookName,
      sheets,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${workbookName.replace(' - Excel', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsModified(false);
    setLastSavedTime(new Date());
  }, [workbookName, sheets]);
  
  const handleLoad = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setWorkbookName(data.name);
        setSheets(data.sheets);
        setActiveSheetIndex(0);
        setIsModified(false);
      } catch (error) {
        alert('Error loading file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
          case 's':
            event.preventDefault();
            handleSave();
            break;
          case 'c':
            if (!editingCell) {
              event.preventDefault();
              handleCopy();
            }
            break;
          case 'x':
            if (!editingCell) {
              event.preventDefault();
              handleCut();
            }
            break;
          case 'v':
            if (!editingCell) {
              event.preventDefault();
              handlePaste();
            }
            break;
          case 'z':
            event.preventDefault();
            // Undo
            break;
          case 'y':
            event.preventDefault();
            // Redo
            break;
          case 'f':
            event.preventDefault();
            setShowFindDialog(true);
            break;
          case 'b':
            if (!editingCell) {
              event.preventDefault();
              applyFormatting({ bold: true });
            }
            break;
          case 'i':
            if (!editingCell) {
              event.preventDefault();
              applyFormatting({ italic: true });
            }
            break;
          case 'u':
            if (!editingCell) {
              event.preventDefault();
              applyFormatting({ underline: true });
            }
            break;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSave, handleCopy, handleCut, handlePaste, editingCell, applyFormatting]);
  
  // Auto-save
  useEffect(() => {
    if (autoSave && isModified) {
      const timer = setTimeout(() => {
        handleSave();
      }, 30000);
      return () => clearTimeout(timer);
    }
  }, [autoSave, isModified, handleSave]);
  
  const ToolbarButton: React.FC<{
    onClick: () => void;
    children: React.ReactNode;
    title: string;
    active?: boolean;
    disabled?: boolean;
  }> = ({ onClick, children, title, active = false, disabled = false }) => (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      className={`p-2 hover:bg-gray-100 rounded transition-colors ${
        active ? 'bg-blue-100 text-blue-600' : 'text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
  
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} flex flex-col h-screen bg-gray-50`}>
      {/* Title Bar */}
      <div className="bg-white border-b flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-green-600 rounded flex items-center justify-center text-white font-bold text-sm">
            E
          </div>
          <input
            type="text"
            value={workbookName}
            onChange={(e) => {
              setWorkbookName(e.target.value);
              setIsModified(true);
            }}
            className="text-sm font-medium focus:outline-none focus:border-b border-blue-500"
          />
          {isModified && <span className="text-orange-500 text-sm">*</span>}
          <button
            onClick={() => setAutoSave(!autoSave)}
            className={`px-2 py-1 rounded-full text-xs flex items-center gap-1 ${
              autoSave ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
            }`}
          >
            <Save size={12} />
            {autoSave ? 'Auto-save ON' : 'Auto-save OFF'}
          </button>
          {lastSavedTime && (
            <span className="text-xs text-gray-500">
              Last saved: {lastSavedTime.toLocaleTimeString()}
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-gray-100 rounded">
            <Users size={16} />
          </button>
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`p-2 hover:bg-gray-100 rounded ${showComments ? 'bg-blue-100' : ''}`}
          >
            <MessageSquare size={16} />
          </button>
          <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
            <Share2 size={14} className="inline mr-1" />
            Share
          </button>
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 hover:bg-gray-100 rounded"
          >
            {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Ribbon Tabs */}
      <div className="bg-white border-b">
        <div className="flex border-b">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab 
                  ? 'border-green-500 text-green-600 bg-green-50' 
                  : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* File Tab */}
        {activeTab === 'File' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">New</div>
                <ToolbarButton onClick={() => {
                  if (isModified) {
                    if (window.confirm('Save changes?')) {
                      handleSave();
                    }
                  }
                  setSheets([{ id: '1', name: 'Sheet1', cells: {}, columnWidths: {}, rowHeights: {} }]);
                  setActiveSheetIndex(0);
                  setWorkbookName('Workbook1 - Excel');
                  setIsModified(false);
                }} title="New Workbook">
                  <FileSpreadsheet size={16} />
                </ToolbarButton>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Open</div>
                <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Open File">
                  <Upload size={16} />
                </ToolbarButton>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Save</div>
                <ToolbarButton onClick={handleSave} title="Save" disabled={!isModified}>
                  <Save size={16} />
                </ToolbarButton>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Export</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={handleSave} title="Export as JSON">
                    <Download size={16} />
                  </ToolbarButton>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Print</div>
                <ToolbarButton onClick={() => window.print()} title="Print">
                  <Printer size={16} />
                </ToolbarButton>
              </div>
            </div>
          </div>
        )}

        {/* Home Tab */}
        {activeTab === 'Home' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              {/* Clipboard */}
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Clipboard</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={handlePaste} title="Paste (Ctrl+V)">
                    <ClipboardPaste size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={handleCopy} title="Copy (Ctrl+C)">
                    <Copy size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={handleCut} title="Cut (Ctrl+X)">
                    <Scissors size={16} />
                  </ToolbarButton>
                </div>
              </div>

              {/* Font */}
              <div className="flex flex-col gap-2 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Font</div>
                <div className="flex items-center gap-2">
                  <select 
                    value={fontFamily} 
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      applyFormatting({ fontFamily: e.target.value });
                    }}
                    className="text-sm border rounded px-2 py-1 w-32"
                  >
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <select 
                    value={fontSize} 
                    onChange={(e) => {
                      setFontSize(parseInt(e.target.value));
                      applyFormatting({ fontSize: parseInt(e.target.value) });
                    }}
                    className="text-sm border rounded px-2 py-1 w-16"
                  >
                    {fontSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => applyFormatting({ bold: true })} title="Bold (Ctrl+B)">
                    <Bold size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => applyFormatting({ italic: true })} title="Italic (Ctrl+I)">
                    <Italic size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => applyFormatting({ underline: true })} title="Underline (Ctrl+U)">
                    <Underline size={16} />
                  </ToolbarButton>
                  <div className="relative">
                    <ToolbarButton onClick={() => {}} title="Text Color">
                      <Type size={16} />
                    </ToolbarButton>
                  </div>
                  <div className="relative">
                    <ToolbarButton onClick={() => {}} title="Fill Color">
                      <Palette size={16} />
                    </ToolbarButton>
                  </div>
                </div>
              </div>

              {/* Alignment */}
              <div className="flex flex-col gap-2 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Alignment</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => applyFormatting({ textAlign: 'left' })} title="Align Left">
                    <AlignLeft size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => applyFormatting({ textAlign: 'center' })} title="Center">
                    <AlignCenter size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => applyFormatting({ textAlign: 'right' })} title="Align Right">
                    <AlignRight size={16} />
                  </ToolbarButton>
                </div>
              </div>

              {/* Number Format */}
              <div className="flex flex-col gap-2 px-3">
                <div className="text-xs font-medium text-gray-600">Number</div>
                <select 
                  value={numberFormat} 
                  onChange={(e) => {
                    setNumberFormat(e.target.value);
                    applyFormatting({ format: e.target.value });
                  }}
                  className="text-sm border rounded px-2 py-1"
                >
                  {numberFormats.map(format => (
                    <option key={format} value={format}>{format}</option>
                  ))}
                </select>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => applyFormatting({ format: 'Percentage' })} title="Percentage">
                    <Percent size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => applyFormatting({ format: 'Currency' })} title="Currency">
                    <DollarSign size={16} />
                  </ToolbarButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Insert Tab */}
        {activeTab === 'Insert' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Tables</div>
                <ToolbarButton onClick={() => {}} title="Table">
                  <Table size={16} />
                </ToolbarButton>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Illustrations</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => {}} title="Picture">
                    <Image size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setShowChartDialog(true)} title="Chart">
                    <PieChart size={16} />
                  </ToolbarButton>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Links</div>
                <ToolbarButton onClick={() => {}} title="Hyperlink">
                  <Link2 size={16} />
                </ToolbarButton>
              </div>
            </div>
          </div>
        )}

        {/* Formulas Tab */}
        {activeTab === 'Formulas' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Function Library</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => {
                    if (selectedCell) {
                      setFormulaBarValue('=SUM(');
                      setEditingCell(selectedCell);
                    }
                  }} title="AutoSum">
                    <Sigma size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="More Functions">
                    <FunctionSquare size={16} />
                  </ToolbarButton>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Defined Names</div>
                <ToolbarButton onClick={() => {}} title="Define Name">
                  <Hash size={16} />
                </ToolbarButton>
              </div>
            </div>
          </div>
        )}

        {/* Data Tab */}
        {activeTab === 'Data' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Sort & Filter</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => {}} title="Sort A to Z">
                    <SortAsc size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="Sort Z to A">
                    <SortDesc size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="Filter">
                    <Filter size={16} />
                  </ToolbarButton>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Data Tools</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => {}} title="Data Validation">
                    <List size={16} />
                  </ToolbarButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Tab */}
        {activeTab === 'View' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Show</div>
                <div className="flex gap-1">
                  <ToolbarButton 
                    onClick={() => setShowGridlines(!showGridlines)} 
                    title="Gridlines" 
                    active={showGridlines}
                  >
                    <Grid3x3 size={16} />
                  </ToolbarButton>
                  <ToolbarButton 
                    onClick={() => setShowFormulas(!showFormulas)} 
                    title="Formulas" 
                    active={showFormulas}
                  >
                    <FunctionSquare size={16} />
                  </ToolbarButton>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Zoom</div>
                <div className="flex items-center gap-2">
                  <ToolbarButton 
                    onClick={() => setZoom(Math.max(10, zoom - 10))} 
                    title="Zoom Out"
                  >
                    <Minus size={16} />
                  </ToolbarButton>
                  <span className="text-sm min-w-12 text-center">{zoom}%</span>
                  <ToolbarButton 
                    onClick={() => setZoom(Math.min(400, zoom + 10))} 
                    title="Zoom In"
                  >
                    <Plus size={16} />
                  </ToolbarButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Access Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b">
          <ToolbarButton onClick={() => {}} title="Undo">
            <Undo2 size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => {}} title="Redo">
            <Redo2 size={16} />
          </ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <ToolbarButton onClick={() => setShowFindDialog(true)} title="Find">
            <Search size={16} />
          </ToolbarButton>
        </div>
      </div>

      {/* Formula Bar */}
      <div className="bg-white border-b px-4 py-2 flex items-center gap-2">
        <div className="flex items-center gap-2 min-w-20">
          <span className="text-sm font-medium text-gray-600">
            {selectedCell ? getCellKey(selectedCell.row, selectedCell.col) : ''}
          </span>
        </div>
        <div className="w-px h-6 bg-gray-300"></div>
        <FunctionSquare size={16} className="text-gray-600" />
        <input
          type="text"
          value={formulaBarValue}
          onChange={(e) => {
            setFormulaBarValue(e.target.value);
            if (editingCell) {
              handleCellChange(e.target.value);
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && selectedCell) {
              handleCellChange(formulaBarValue);
              setEditingCell(null);
              setSelectedCell({ row: selectedCell.row + 1, col: selectedCell.col });
            } else if (e.key === 'Escape') {
              setEditingCell(null);
              if (selectedCell) {
                const cell = getCell(selectedCell.row, selectedCell.col);
                setFormulaBarValue(cell.formula || cell.value);
              }
            }
          }}
          onFocus={() => {
            if (selectedCell && !editingCell) {
              setEditingCell(selectedCell);
            }
          }}
          className="flex-1 px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
          placeholder="Enter value or formula"
        />
      </div>

      {/* Spreadsheet Grid */}
      <div 
        ref={containerRef}
        className="flex-1 overflow-auto bg-white"
        onKeyDown={handleCellKeyDown}
        tabIndex={0}
      >
        <div style={{ transform: `scale(${zoom / 100})`, transformOrigin: 'top left' }}>
          <table className="border-collapse">
            <thead>
              <tr>
                <th className="sticky left-0 top-0 z-20 bg-gray-100 border border-gray-300 w-12 h-6"></th>
                {Array.from({ length: COLS }, (_, i) => (
                  <th 
                    key={i} 
                    className="sticky top-0 z-10 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-700 px-2"
                    style={{ 
                      minWidth: sheets[activeSheetIndex]?.columnWidths[i] || DEFAULT_COL_WIDTH,
                      maxWidth: sheets[activeSheetIndex]?.columnWidths[i] || DEFAULT_COL_WIDTH
                    }}
                  >
                    {colToLetter(i)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: ROWS }, (_, row) => (
                <tr key={row}>
                  <td className="sticky left-0 z-10 bg-gray-100 border border-gray-300 text-xs font-medium text-gray-700 text-center w-12">
                    {row + 1}
                  </td>
                  {Array.from({ length: COLS }, (_, col) => {
                    const cell = getCell(row, col);
                    const isSelected = selectedCell?.row === row && selectedCell?.col === col;
                    const isInRange = selectedRange && 
                      row >= selectedRange.startRow && 
                      row <= selectedRange.endRow &&
                      col >= selectedRange.startCol && 
                      col <= selectedRange.endCol;
                    const isEditing = editingCell?.row === row && editingCell?.col === col;
                    
                    const displayValue = showFormulas && cell.formula 
                      ? cell.formula 
                      : formatCellValue(cell.value, cell.style?.format || 'General');
                    
                    return (
                      <td
                        key={col}
                        onClick={(e) => handleCellClick(row, col, e)}
                        onDoubleClick={() => handleCellDoubleClick(row, col)}
                        className={`border text-sm px-2 py-1 cursor-cell ${
                          showGridlines ? 'border-gray-300' : 'border-transparent'
                        } ${isSelected || isInRange ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
                        style={{
                          minWidth: sheets[activeSheetIndex]?.columnWidths[col] || DEFAULT_COL_WIDTH,
                          maxWidth: sheets[activeSheetIndex]?.columnWidths[col] || DEFAULT_COL_WIDTH,
                          height: sheets[activeSheetIndex]?.rowHeights[row] || DEFAULT_ROW_HEIGHT,
                          fontFamily: cell.style?.fontFamily,
                          fontSize: cell.style?.fontSize,
                          fontWeight: cell.style?.bold ? 'bold' : 'normal',
                          fontStyle: cell.style?.italic ? 'italic' : 'normal',
                          textDecoration: cell.style?.underline ? 'underline' : 'none',
                          color: cell.style?.color,
                          backgroundColor: cell.style?.backgroundColor,
                          textAlign: cell.style?.textAlign,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        {isEditing ? (
                          <input
                            ref={cellInputRef}
                            type="text"
                            value={formulaBarValue}
                            onChange={(e) => {
                              setFormulaBarValue(e.target.value);
                              handleCellChange(e.target.value);
                            }}
                            className="w-full h-full border-none outline-none bg-transparent"
                            autoFocus
                          />
                        ) : (
                          displayValue
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sheet Tabs */}
      <div className="bg-white border-t px-4 py-2 flex items-center gap-2">
        <div className="flex gap-1">
          <button className="p-1 hover:bg-gray-100 rounded" disabled>
            <ChevronLeft size={16} />
          </button>
          <button className="p-1 hover:bg-gray-100 rounded" disabled>
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex-1 flex items-center gap-1 overflow-x-auto">
          {sheets.map((sheet, index) => (
            <div
              key={sheet.id}
              className={`group relative px-4 py-1 border-r cursor-pointer hover:bg-gray-50 ${
                activeSheetIndex === index ? 'bg-white font-medium' : 'bg-gray-50'
              }`}
              onClick={() => setActiveSheetIndex(index)}
            >
              <span className="text-sm">{sheet.name}</span>
              <div className="hidden group-hover:flex absolute right-0 top-0 h-full items-center pr-1 bg-inherit">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    renameSheet(index);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Rename"
                >
                  <Edit size={12} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteSheet(index);
                  }}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="Delete"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
          <button
            onClick={addSheet}
            className="p-1 hover:bg-gray-100 rounded"
            title="Add Sheet"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-green-600 text-white px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span>Ready</span>
          {selectedRange && (
            <span>
              Selected: {colToLetter(selectedRange.startCol)}{selectedRange.startRow + 1}:
              {colToLetter(selectedRange.endCol)}{selectedRange.endRow + 1}
            </span>
          )}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-1 hover:bg-green-700 rounded">
            <Minus size={12} />
          </button>
          <span className="min-w-12 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(400, zoom + 10))} className="p-1 hover:bg-green-700 rounded">
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleLoad}
        className="hidden"
      />

      {/* Find Dialog */}
      {showFindDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Find and Replace</h3>
              <button onClick={() => setShowFindDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Find..."
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex gap-2">
                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                  Find Next
                </button>
                <button className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700">
                  Replace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chart Dialog */}
      {showChartDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Insert Chart</h3>
              <button onClick={() => setShowChartDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {['Column', 'Line', 'Pie', 'Bar'].map(type => (
                <button
                  key={type}
                  onClick={() => setShowChartDialog(false)}
                  className="p-4 border rounded hover:bg-gray-50 flex flex-col items-center gap-2"
                >
                  <PieChart size={24} />
                  <span className="text-xs">{type} Chart</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExcelEditor;