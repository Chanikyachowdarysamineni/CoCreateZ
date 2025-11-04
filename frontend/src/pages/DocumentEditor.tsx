import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Save, Undo2, Redo2, ChevronDown, Search, X, Check, MessageSquare, 
  Share2, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, 
  AlignRight, AlignJustify, List, ListOrdered, Indent, Outdent, 
  ChevronUp, Palette, Type, Link2, Image, FileText, Minus, Plus,
  Grid3x3, Users, Settings, Maximize2, Minimize2, Table, PieChart,
  Shapes, Bookmark, Hash, FileImage, Video, Paperclip, Calendar,
  Calculator, Printer, Mail, Eye, Zap, Layers, Copy, Scissors,
  ClipboardPaste, RotateCcw, RotateCw, ZoomIn, ZoomOut, Home,
  Layout, BookOpen, HelpCircle, Pen, Highlighter, MousePointer,
  Square, Circle, Triangle, Star, Heart, Smile, Music, Phone,
  MapPin, Camera, Mic, Volume2, Lock, Unlock, Shield, Flag,
  Archive, Trash2, Edit, Edit2, Edit3, PenTool, Brush, Eraser,
  Ruler, Compass, Crop, FlipHorizontal, FlipVertical, MoreHorizontal,
  MoreVertical, Menu, Filter, SortAsc, SortDesc, RefreshCw, Download,
  Upload, CloudDownload, CloudUpload, Folder, FolderOpen, File,
  Files, Clipboard, ClipboardList, ClipboardCheck, Book,
  Library, Tag, Tags, Award, Trophy,
  Medal, Gift, Crown, Gem, Diamond, Briefcase, GraduationCap,
  Split, Columns, Navigation, Focus, Monitor, Smartphone, Tablet, Quote
} from 'lucide-react';

const DocumentEditor: React.FC = () => {
  // Core state
  const [documentName, setDocumentName] = useState('Document1');
  const [autoSave, setAutoSave] = useState(false);
  const [activeTab, setActiveTab] = useState('Home');
  const [showComments, setShowComments] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showFind, setShowFind] = useState(false);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');

  // File management state
  const [currentFilePath, setCurrentFilePath] = useState('');
  const [isDocumentModified, setIsDocumentModified] = useState(false);
  const [showSaveAsDialog, setShowSaveAsDialog] = useState(false);
  const [showNewDocumentDialog, setShowNewDocumentDialog] = useState(false);
  const [recentFiles, setRecentFiles] = useState<Array<{name: string, path: string, lastModified: string}>>([]);
  const [saveFormat, setSaveFormat] = useState('docx');
  const [saveFileName, setSaveFileName] = useState('');
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  
  // Font and formatting state
  const [fontFamily, setFontFamily] = useState('Aptos');
  const [fontSize, setFontSize] = useState('12');
  const [selectedStyle, setSelectedStyle] = useState('Normal');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffff00');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);
  
  // Formatting state
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [isBulletList, setIsBulletList] = useState(false);
  const [isNumberedList, setIsNumberedList] = useState(false);
  
  // Document state
  const [documentContent, setDocumentContent] = useState('');
  const [history, setHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Document formatting state
  const [documentTheme, setDocumentTheme] = useState('Office');
  const [pageLayout, setPageLayout] = useState('Portrait');
  const [pageSize, setPageSize] = useState('Letter');
  const [margins, setMargins] = useState('Normal');
  const [columns, setColumns] = useState(1);
  const [showRuler, setShowRuler] = useState(false);
  const [showGridlines, setShowGridlines] = useState(false);
  const [showNavigationPane, setShowNavigationPane] = useState(false);
  
  // Insert features state
  const [showTableDialog, setShowTableDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showShapeDialog, setShowShapeDialog] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showDateTimeDialog, setShowDateTimeDialog] = useState(false);
  const [showSymbolDialog, setShowSymbolDialog] = useState(false);
  
  // Review features state
  const [trackChanges, setTrackChanges] = useState(false);
  const [spellCheck, setSpellCheck] = useState(true);
  const [showReviewPane, setShowReviewPane] = useState(false);
  
  // View features state
  const [viewMode, setViewMode] = useState('Print Layout');
  const [readingMode, setReadingMode] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  
  const [comments, setComments] = useState<Array<{id: number, text: string, comment: string, timestamp: string, author: string}>>([]);
  const [wordCount, setWordCount] = useState(0);
  
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data arrays
  const tabs = ['File', 'Home', 'Insert', 'Draw', 'Design', 'Layout', 'References', 'Mailings', 'Review', 'View', 'Help'];
  
  const themes = [
    'Office', 'Facet', 'Integral', 'Ion', 'Madison', 'Celestial',
    'Slice', 'Vapor Trail', 'Wood Type', 'Berlin', 'Dividend'
  ];
  
  const fonts = [
    'Aptos', 'Calibri', 'Arial', 'Times New Roman', 'Helvetica', 
    'Georgia', 'Verdana', 'Courier New', 'Comic Sans MS', 'Impact',
    'Trebuchet MS', 'Palatino', 'Garamond', 'Tahoma'
  ];
  
  const fontSizes = [8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 32, 36, 48, 60, 72];
  
  const styles = [
    { name: 'Normal', tag: 'p', style: { fontSize: '12px', fontWeight: 'normal' } },
    { name: 'No Spacing', tag: 'p', style: { fontSize: '12px', margin: 0, lineHeight: 1 } },
    { name: 'Heading 1', tag: 'h1', style: { fontSize: '24px', fontWeight: 'bold', color: '#2e74b5' } },
    { name: 'Heading 2', tag: 'h2', style: { fontSize: '18px', fontWeight: 'bold', color: '#2e74b5' } },
    { name: 'Title', tag: 'h1', style: { fontSize: '28px', fontWeight: 'bold', textAlign: 'center' } }
  ];
  
  const pageSizes = [
    { name: 'Letter', width: '8.5"', height: '11"' },
    { name: 'Legal', width: '8.5"', height: '14"' },
    { name: 'A4', width: '8.27"', height: '11.69"' },
    { name: 'A3', width: '11.69"', height: '16.54"' },
    { name: 'Tabloid', width: '11"', height: '17"' }
  ];
  
  const marginPresets = [
    { name: 'Normal', top: '1"', bottom: '1"', left: '1"', right: '1"' },
    { name: 'Narrow', top: '0.5"', bottom: '0.5"', left: '0.5"', right: '0.5"' },
    { name: 'Moderate', top: '1"', bottom: '1"', left: '0.75"', right: '0.75"' },
    { name: 'Wide', top: '1"', bottom: '1"', left: '2"', right: '2"' }
  ];
  
  const commonSymbols = [
    '©', '®', '™', '°', '±', '≤', '≥', '≠', '≈', '∞', 
    '→', '←', '↑', '↓', '⟷', '★', '☆', '♠', '♣', '♥', '♦'
  ];

  // Load recent files on mount
  useEffect(() => {
    const savedRecentFiles = localStorage.getItem('wordProcessor_recentFiles');
    if (savedRecentFiles) {
      try {
        setRecentFiles(JSON.parse(savedRecentFiles));
      } catch (error) {
        console.warn('Error loading recent files:', error);
      }
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    if (autoSave && isDocumentModified && currentFilePath) {
      const autoSaveInterval = setInterval(() => {
        handleSaveDocument();
      }, 30000);

      return () => clearInterval(autoSaveInterval);
    }
  }, [autoSave, isDocumentModified, currentFilePath]);

  // Update word count
  useEffect(() => {
    if (editorRef.current) {
      const text = editorRef.current.innerText || '';
      const words = text.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }
  }, [documentContent]);

  // Handle content changes
  const handleContentChange = useCallback(() => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (content !== documentContent) {
        setDocumentContent(content);
        setIsDocumentModified(true);
        
        // Add to history
        if (historyIndex < history.length - 1) {
          setHistory([...history.slice(0, historyIndex + 1), content]);
        } else {
          setHistory([...history, content]);
        }
        setHistoryIndex(prev => prev + 1);
      }
    }
  }, [documentContent, history, historyIndex]);

  // File management functions
  const createNewDocument = useCallback(() => {
    if (isDocumentModified) {
      const shouldSave = window.confirm('Do you want to save changes to the current document?');
      if (shouldSave) {
        handleSaveDocument();
      }
    }

    if (editorRef.current) {
      editorRef.current.innerHTML = '';
      setDocumentName('Document1');
      setCurrentFilePath('');
      setIsDocumentModified(false);
      setLastSavedTime(null);
      setDocumentContent('');
      setHistory(['']);
      setHistoryIndex(0);
      setWordCount(0);
    }
  }, [isDocumentModified]);

  const handleSaveDocument = useCallback(() => {
    if (!editorRef.current) return;

    try {
      if (!currentFilePath) {
        setShowSaveAsDialog(true);
        return;
      }

      const content = editorRef.current.innerHTML;
      
      // Create a blob and download
      const blob = new Blob([content], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = currentFilePath;
      a.click();
      window.URL.revokeObjectURL(url);

      setIsDocumentModified(false);
      setLastSavedTime(new Date());
      
      updateRecentFiles(documentName, currentFilePath);

    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error saving document: ' + error);
    }
  }, [currentFilePath, documentName]);

  const handleSaveAsDocument = useCallback((fileName: string, format: string) => {
    if (!editorRef.current) return;

    try {
      const content = editorRef.current.innerHTML;
      let blob: Blob;
      let extension: string;

      if (format === 'html') {
        blob = new Blob([`<!DOCTYPE html><html><head><meta charset="UTF-8"><title>${fileName}</title></head><body>${content}</body></html>`], 
          { type: 'text/html' });
        extension = 'html';
      } else if (format === 'txt') {
        blob = new Blob([editorRef.current.innerText], { type: 'text/plain' });
        extension = 'txt';
      } else {
        blob = new Blob([content], { type: 'text/html' });
        extension = 'html';
      }

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.${extension}`;
      a.click();
      window.URL.revokeObjectURL(url);

      setDocumentName(fileName);
      setCurrentFilePath(`${fileName}.${extension}`);
      setIsDocumentModified(false);
      setLastSavedTime(new Date());
      setShowSaveAsDialog(false);

      updateRecentFiles(fileName, `${fileName}.${extension}`);

    } catch (error) {
      console.error('Error saving document:', error);
      alert('Error saving document: ' + error);
    }
  }, []);

  const updateRecentFiles = useCallback((name: string, path: string) => {
    const newFile = {
      name,
      path,
      lastModified: new Date().toISOString()
    };

    setRecentFiles(prev => {
      const filtered = prev.filter(file => file.path !== path);
      const updated = [newFile, ...filtered].slice(0, 10);
      localStorage.setItem('wordProcessor_recentFiles', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handlePrintDocument = useCallback(() => {
    window.print();
  }, []);

  // File handling
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !editorRef.current) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        if (editorRef.current) {
          if (file.type === 'text/plain') {
            editorRef.current.innerText = content;
          } else {
            editorRef.current.innerHTML = content;
          }
          setDocumentName(file.name.replace(/\.[^/.]+$/, ''));
          setCurrentFilePath(file.name);
          setIsDocumentModified(false);
          setDocumentContent(editorRef.current.innerHTML);
          updateRecentFiles(file.name, file.name);
        }
      } catch (error) {
        console.error('Error opening file:', error);
        alert('Error opening file: ' + error);
      }
    };
    
    if (file.type === 'text/plain') {
      reader.readAsText(file);
    } else {
      reader.readAsText(file);
    }

    event.target.value = '';
  }, [updateRecentFiles]);

  // Execute formatting commands
  const executeCommand = useCallback((command: string, value?: any) => {
    editorRef.current?.focus();
    
    try {
      switch (command) {
        case 'bold':
          document.execCommand('bold', false);
          setIsBold(!isBold);
          break;
        case 'italic':
          document.execCommand('italic', false);
          setIsItalic(!isItalic);
          break;
        case 'underline':
          document.execCommand('underline', false);
          setIsUnderline(!isUnderline);
          break;
        case 'strikeThrough':
          document.execCommand('strikeThrough', false);
          setIsStrikethrough(!isStrikethrough);
          break;
        case 'fontName':
          document.execCommand('fontName', false, value);
          setFontFamily(value);
          break;
        case 'fontSize':
          document.execCommand('fontSize', false, '7');
          const fontElements = document.getElementsByTagName('font');
          for (let i = 0; i < fontElements.length; i++) {
            if (fontElements[i].size === '7') {
              fontElements[i].removeAttribute('size');
              fontElements[i].style.fontSize = value + 'px';
            }
          }
          setFontSize(value);
          break;
        case 'foreColor':
          document.execCommand('foreColor', false, value);
          setTextColor(value);
          break;
        case 'hiliteColor':
          document.execCommand('hiliteColor', false, value);
          setHighlightColor(value);
          break;
        case 'justifyLeft':
          document.execCommand('justifyLeft', false);
          setTextAlign('left');
          break;
        case 'justifyCenter':
          document.execCommand('justifyCenter', false);
          setTextAlign('center');
          break;
        case 'justifyRight':
          document.execCommand('justifyRight', false);
          setTextAlign('right');
          break;
        case 'justifyFull':
          document.execCommand('justifyFull', false);
          setTextAlign('justify');
          break;
        case 'insertUnorderedList':
          document.execCommand('insertUnorderedList', false);
          setIsBulletList(!isBulletList);
          break;
        case 'insertOrderedList':
          document.execCommand('insertOrderedList', false);
          setIsNumberedList(!isNumberedList);
          break;
        case 'indent':
          document.execCommand('indent', false);
          break;
        case 'outdent':
          document.execCommand('outdent', false);
          break;
        case 'undo':
          if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            setHistoryIndex(newIndex);
            if (editorRef.current) {
              editorRef.current.innerHTML = history[newIndex];
              setDocumentContent(history[newIndex]);
            }
          }
          break;
        case 'redo':
          if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            setHistoryIndex(newIndex);
            if (editorRef.current) {
              editorRef.current.innerHTML = history[newIndex];
              setDocumentContent(history[newIndex]);
            }
          }
          break;
        case 'copy':
          document.execCommand('copy', false);
          break;
        case 'cut':
          document.execCommand('cut', false);
          setIsDocumentModified(true);
          break;
        case 'paste':
          document.execCommand('paste', false);
          setIsDocumentModified(true);
          break;
        case 'selectAll':
          document.execCommand('selectAll', false);
          break;
        case 'insertHTML':
          document.execCommand('insertHTML', false, value);
          setIsDocumentModified(true);
          break;
        case 'clearFormatting':
          document.execCommand('removeFormat', false);
          break;
        default:
          console.log('Command not implemented:', command);
      }
      
      handleContentChange();
    } catch (error) {
      console.error('Error executing command:', error);
    }
  }, [isBold, isItalic, isUnderline, isStrikethrough, isBulletList, isNumberedList, 
      historyIndex, history, handleContentChange]);

  const insertTable = useCallback((rows: number = 3, cols: number = 3) => {
    let tableHTML = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 10px 0;">';
    for (let i = 0; i < rows; i++) {
      tableHTML += '<tr>';
      for (let j = 0; j < cols; j++) {
        tableHTML += '<td style="border: 1px solid #ddd; padding: 8px; min-width: 50px; min-height: 30px;"><br/></td>';
      }
      tableHTML += '</tr>';
    }
    tableHTML += '</table><p><br/></p>';
    executeCommand('insertHTML', tableHTML);
  }, [executeCommand]);

  const insertImage = useCallback((src: string) => {
    const imgHTML = `<img src="${src}" style="max-width: 100%; height: auto; margin: 10px 0;" /><p><br/></p>`;
    executeCommand('insertHTML', imgHTML);
  }, [executeCommand]);

  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        insertImage(result);
        setShowImageDialog(false);
      };
      reader.readAsDataURL(file);
    } else {
      alert('Please select a valid image file.');
    }

    event.target.value = '';
  }, [insertImage]);

  const insertShape = useCallback((shapeType: string) => {
    let shapeHTML = '';
    const baseStyle = 'display: inline-block; margin: 10px; padding: 20px;';
    
    switch (shapeType) {
      case 'rectangle':
        shapeHTML = `<div style="${baseStyle} border: 2px solid #2196F3; background: #e3f2fd; width: 100px; height: 60px;"></div>`;
        break;
      case 'circle':
        shapeHTML = `<div style="${baseStyle} border: 2px solid #2196F3; background: #e3f2fd; width: 80px; height: 80px; border-radius: 50%;"></div>`;
        break;
      case 'triangle':
        shapeHTML = `<div style="${baseStyle} width: 0; height: 0; border-left: 50px solid transparent; border-right: 50px solid transparent; border-bottom: 87px solid #2196F3;"></div>`;
        break;
      default:
        shapeHTML = `<div style="${baseStyle} border: 2px solid #2196F3; background: #e3f2fd; width: 100px; height: 60px;"></div>`;
    }
    
    executeCommand('insertHTML', shapeHTML + '<p><br/></p>');
    setShowShapeDialog(false);
  }, [executeCommand]);

  const insertSymbol = useCallback((symbol: string) => {
    executeCommand('insertHTML', symbol);
  }, [executeCommand]);

  const insertHyperlink = useCallback((text: string, url: string) => {
    const linkHTML = `<a href="${url}" target="_blank" style="color: #2196F3; text-decoration: underline;">${text}</a>`;
    executeCommand('insertHTML', linkHTML);
    setShowLinkDialog(false);
  }, [executeCommand]);

  const insertDateTime = useCallback((format: string = 'full') => {
    const now = new Date();
    let dateString = '';
    
    switch (format) {
      case 'date':
        dateString = now.toLocaleDateString();
        break;
      case 'time':
        dateString = now.toLocaleTimeString();
        break;
      case 'full':
        dateString = now.toLocaleString();
        break;
      case 'iso':
        dateString = now.toISOString().split('T')[0];
        break;
    }
    
    executeCommand('insertHTML', dateString);
    setShowDateTimeDialog(false);
  }, [executeCommand]);

  const addNewComment = useCallback(() => {
    const selection = window.getSelection();
    if (selection?.toString()) {
      const commentText = prompt('Enter your comment:');
      if (commentText) {
        const newComment = {
          id: Date.now(),
          text: selection.toString(),
          comment: commentText,
          timestamp: new Date().toLocaleString(),
          author: 'User'
        };
        setComments(prev => [...prev, newComment]);
        
        // Highlight the selected text
        const span = document.createElement('span');
        span.style.backgroundColor = '#fff3cd';
        span.style.borderBottom = '2px solid #ffc107';
        span.title = commentText;
        
        const range = selection.getRangeAt(0);
        range.surroundContents(span);
        
        setIsDocumentModified(true);
      }
    } else {
      alert('Please select some text to comment on.');
    }
  }, []);

  // Find and Replace
  const handleFindNext = useCallback(() => {
    if (!findText) return;
    window.find(findText, false, false, true, false, true, false);
  }, [findText]);

  const handleReplace = useCallback((findText: string, replaceText: string, replaceAll: boolean = false) => {
    if (!editorRef.current || !findText) return;
    
    const content = editorRef.current.innerHTML;
    const regex = new RegExp(findText, replaceAll ? 'gi' : 'i');
    const newContent = content.replace(regex, replaceText);
    
    editorRef.current.innerHTML = newContent;
    setDocumentContent(newContent);
    setIsDocumentModified(true);
    handleContentChange();
  }, [handleContentChange]);

  // Zoom controls
  const handleZoomChange = useCallback((newZoom: number) => {
    const clampedZoom = Math.max(10, Math.min(500, newZoom));
    setZoom(clampedZoom);
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      if (isCtrl) {
        switch (event.key.toLowerCase()) {
          case 'n':
            event.preventDefault();
            createNewDocument();
            break;
          case 'o':
            event.preventDefault();
            fileInputRef.current?.click();
            break;
          case 's':
            event.preventDefault();
            if (isShift) {
              setShowSaveAsDialog(true);
            } else {
              handleSaveDocument();
            }
            break;
          case 'p':
            event.preventDefault();
            handlePrintDocument();
            break;
          case 'z':
            event.preventDefault();
            if (isShift) {
              executeCommand('redo');
            } else {
              executeCommand('undo');
            }
            break;
          case 'y':
            event.preventDefault();
            executeCommand('redo');
            break;
          case 'b':
            event.preventDefault();
            executeCommand('bold');
            break;
          case 'i':
            event.preventDefault();
            executeCommand('italic');
            break;
          case 'u':
            event.preventDefault();
            executeCommand('underline');
            break;
          case 'k':
            event.preventDefault();
            setShowLinkDialog(true);
            break;
          case 'f':
            event.preventDefault();
            setShowFind(true);
            break;
          case '=':
          case '+':
            event.preventDefault();
            handleZoomChange(zoom + 10);
            break;
          case '-':
            event.preventDefault();
            handleZoomChange(zoom - 10);
            break;
          case '0':
            event.preventDefault();
            handleZoomChange(100);
            break;
        }
      }

      if (event.key === 'Escape') {
        event.preventDefault();
        setShowFind(false);
        setShowSaveAsDialog(false);
        setShowNewDocumentDialog(false);
        setShowTableDialog(false);
        setShowImageDialog(false);
        setShowShapeDialog(false);
        setShowChartDialog(false);
        setShowLinkDialog(false);
        setShowBookmarkDialog(false);
        setShowDateTimeDialog(false);
        setShowSymbolDialog(false);
        setShowColorPicker(false);
        setShowHighlightPicker(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [createNewDocument, handleSaveDocument, handlePrintDocument, executeCommand, 
      zoom, handleZoomChange]);

  // Toolbar Button Component
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
          <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white font-bold text-sm">
            W
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={documentName}
              onChange={(e) => {
                setDocumentName(e.target.value);
                setIsDocumentModified(true);
              }}
              className="text-sm font-medium focus:outline-none focus:border-b border-blue-500 px-2 py-1"
            />
            {isDocumentModified && <span className="text-orange-500 text-sm">*</span>}
          </div>
          <div className="flex items-center gap-2">
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
                Saved: {lastSavedTime.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowComments(!showComments)}
            className={`p-2 hover:bg-gray-100 rounded ${showComments ? 'bg-blue-100' : ''}`}
          >
            <MessageSquare size={16} />
          </button>
          <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
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
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
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
                <ToolbarButton onClick={createNewDocument} title="New Document">
                  <File size={16} />
                </ToolbarButton>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Open</div>
                <ToolbarButton onClick={() => fileInputRef.current?.click()} title="Open File">
                  <FolderOpen size={16} />
                </ToolbarButton>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Save</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={handleSaveDocument} title="Save" disabled={!isDocumentModified}>
                    <Save size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setShowSaveAsDialog(true)} title="Save As">
                    <Download size={16} />
                  </ToolbarButton>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Print</div>
                <ToolbarButton onClick={handlePrintDocument} title="Print">
                  <Printer size={16} />
                </ToolbarButton>
              </div>
              <div className="flex-1 pl-4">
                <div className="text-sm font-medium text-gray-600 mb-2">Recent Files</div>
                <div className="space-y-1 max-h-24 overflow-auto">
                  {recentFiles.length === 0 ? (
                    <p className="text-xs text-gray-400">No recent files</p>
                  ) : (
                    recentFiles.slice(0, 5).map((file, index) => (
                      <div key={index} className="text-xs text-gray-600 hover:text-blue-600 cursor-pointer">
                        📄 {file.name}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Home Tab */}
        {activeTab === 'Home' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Clipboard</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => executeCommand('paste')} title="Paste (Ctrl+V)">
                    <ClipboardPaste size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('copy')} title="Copy (Ctrl+C)">
                    <Copy size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('cut')} title="Cut (Ctrl+X)">
                    <Scissors size={16} />
                  </ToolbarButton>
                </div>
              </div>

              <div className="flex flex-col gap-2 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Font</div>
                <div className="flex items-center gap-2">
                  <select 
                    value={fontFamily} 
                    onChange={(e) => executeCommand('fontName', e.target.value)}
                    className="text-sm border rounded px-2 py-1 w-32"
                  >
                    {fonts.map(font => (
                      <option key={font} value={font}>{font}</option>
                    ))}
                  </select>
                  <select 
                    value={fontSize} 
                    onChange={(e) => executeCommand('fontSize', e.target.value)}
                    className="text-sm border rounded px-2 py-1 w-16"
                  >
                    {fontSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => executeCommand('bold')} title="Bold (Ctrl+B)" active={isBold}>
                    <Bold size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('italic')} title="Italic (Ctrl+I)" active={isItalic}>
                    <Italic size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('underline')} title="Underline (Ctrl+U)" active={isUnderline}>
                    <Underline size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('strikeThrough')} title="Strikethrough" active={isStrikethrough}>
                    <Strikethrough size={16} />
                  </ToolbarButton>
                  <div className="relative">
                    <ToolbarButton 
                      onClick={() => setShowColorPicker(!showColorPicker)} 
                      title="Text Color"
                    >
                      <Type size={16} />
                    </ToolbarButton>
                    {showColorPicker && (
                      <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg z-10">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => executeCommand('foreColor', e.target.value)}
                          className="w-8 h-8"
                        />
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <ToolbarButton 
                      onClick={() => setShowHighlightPicker(!showHighlightPicker)} 
                      title="Highlight"
                    >
                      <Highlighter size={16} />
                    </ToolbarButton>
                    {showHighlightPicker && (
                      <div className="absolute top-full left-0 mt-1 p-2 bg-white border rounded shadow-lg z-10">
                        <input
                          type="color"
                          value={highlightColor}
                          onChange={(e) => executeCommand('hiliteColor', e.target.value)}
                          className="w-8 h-8"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Paragraph</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => executeCommand('justifyLeft')} title="Align Left" active={textAlign === 'left'}>
                    <AlignLeft size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('justifyCenter')} title="Center" active={textAlign === 'center'}>
                    <AlignCenter size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('justifyRight')} title="Align Right" active={textAlign === 'right'}>
                    <AlignRight size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('justifyFull')} title="Justify" active={textAlign === 'justify'}>
                    <AlignJustify size={16} />
                  </ToolbarButton>
                </div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => executeCommand('insertUnorderedList')} title="Bullets" active={isBulletList}>
                    <List size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('insertOrderedList')} title="Numbering" active={isNumberedList}>
                    <ListOrdered size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('outdent')} title="Decrease Indent">
                    <Outdent size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => executeCommand('indent')} title="Increase Indent">
                    <Indent size={16} />
                  </ToolbarButton>
                </div>
              </div>

              <div className="flex flex-col gap-2 px-3">
                <div className="text-xs font-medium text-gray-600">Styles</div>
                <select 
                  value={selectedStyle} 
                  onChange={(e) => setSelectedStyle(e.target.value)}
                  className="text-sm border rounded px-2 py-1 w-32"
                >
                  {styles.map(style => (
                    <option key={style.name} value={style.name}>{style.name}</option>
                  ))}
                </select>
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
                <ToolbarButton onClick={() => setShowTableDialog(true)} title="Table">
                  <Table size={16} />
                </ToolbarButton>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Illustrations</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => setShowImageDialog(true)} title="Pictures">
                    <Image size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setShowShapeDialog(true)} title="Shapes">
                    <Shapes size={16} />
                  </ToolbarButton>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Links</div>
                <ToolbarButton onClick={() => setShowLinkDialog(true)} title="Hyperlink">
                  <Link2 size={16} />
                </ToolbarButton>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Comments</div>
                <ToolbarButton onClick={addNewComment} title="New Comment">
                  <MessageSquare size={16} />
                </ToolbarButton>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Text</div>
                <ToolbarButton onClick={() => setShowDateTimeDialog(true)} title="Date & Time">
                  <Calendar size={16} />
                </ToolbarButton>
              </div>
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Symbols</div>
                <ToolbarButton onClick={() => setShowSymbolDialog(true)} title="Symbol">
                  <Type size={16} />
                </ToolbarButton>
              </div>
            </div>
          </div>
        )}

        {/* Other tabs simplified */}
        {['Draw', 'Design', 'Layout', 'References', 'Mailings'].includes(activeTab) && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="text-sm text-gray-500">
              {activeTab} tab features available
            </div>
          </div>
        )}

        {/* Review Tab */}
        {activeTab === 'Review' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Proofing</div>
                <ToolbarButton onClick={() => setSpellCheck(!spellCheck)} title="Spell Check" active={spellCheck}>
                  <Check size={16} />
                </ToolbarButton>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Comments</div>
                <ToolbarButton onClick={addNewComment} title="New Comment">
                  <MessageSquare size={16} />
                </ToolbarButton>
              </div>
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Tracking</div>
                <ToolbarButton onClick={() => setTrackChanges(!trackChanges)} title="Track Changes" active={trackChanges}>
                  <Edit size={16} />
                </ToolbarButton>
              </div>
            </div>
          </div>
        )}

        {/* View Tab */}
        {activeTab === 'View' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Views</div>
                <ToolbarButton onClick={() => setFocusMode(!focusMode)} title="Focus" active={focusMode}>
                  <Eye size={16} />
                </ToolbarButton>
              </div>
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Show</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => setShowRuler(!showRuler)} title="Ruler" active={showRuler}>
                    <Ruler size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setShowGridlines(!showGridlines)} title="Gridlines" active={showGridlines}>
                    <Grid3x3 size={16} />
                  </ToolbarButton>
                </div>
              </div>
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Zoom</div>
                <div className="flex items-center gap-2">
                  <ToolbarButton onClick={() => handleZoomChange(zoom - 10)} title="Zoom Out">
                    <ZoomOut size={16} />
                  </ToolbarButton>
                  <span className="text-sm min-w-12 text-center">{zoom}%</span>
                  <ToolbarButton onClick={() => handleZoomChange(zoom + 10)} title="Zoom In">
                    <ZoomIn size={16} />
                  </ToolbarButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Tab */}
        {activeTab === 'Help' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="text-sm text-gray-600">
              <p className="mb-2"><strong>Keyboard Shortcuts:</strong></p>
              <ul className="text-xs space-y-1">
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+N</kbd> - New Document</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+O</kbd> - Open File</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+S</kbd> - Save</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+P</kbd> - Print</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+B</kbd> - Bold</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+I</kbd> - Italic</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+U</kbd> - Underline</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+Z</kbd> - Undo</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+Y</kbd> - Redo</li>
                <li>• <kbd className="px-1 bg-gray-200 rounded">Ctrl+F</kbd> - Find</li>
              </ul>
            </div>
          </div>
        )}

        {/* Quick Access Toolbar */}
        <div className="flex items-center gap-2 px-4 py-2 bg-white border-b">
          <ToolbarButton onClick={() => executeCommand('undo')} title="Undo (Ctrl+Z)" disabled={historyIndex === 0}>
            <Undo2 size={16} />
          </ToolbarButton>
          <ToolbarButton onClick={() => executeCommand('redo')} title="Redo (Ctrl+Y)" disabled={historyIndex >= history.length - 1}>
            <Redo2 size={16} />
          </ToolbarButton>
          <div className="w-px h-6 bg-gray-300 mx-2"></div>
          <ToolbarButton onClick={() => setShowFind(true)} title="Find">
            <Search size={16} />
          </ToolbarButton>
          <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
            <span>Words: {wordCount}</span>
            <span>Page 1</span>
          </div>
        </div>
      </div>

      {/* File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".html,.txt"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 flex flex-col">
          {/* Ruler */}
          {showRuler && (
            <div className="h-6 bg-white border-b flex items-center px-4 text-xs text-gray-500">
              <div className="w-full h-4 bg-gray-100 relative">
                {Array.from({length: 17}, (_, i) => (
                  <div key={i} className="absolute h-2 w-px bg-gray-400" style={{left: `${i * 6.25}%`}}>
                    {i % 2 === 0 && <span className="absolute -top-3 text-xs">{i}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Document Editor */}
          <div className="flex-1 overflow-auto bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
            <div 
              className="max-w-4xl mx-auto bg-white shadow-2xl"
              style={{ 
                transform: `scale(${zoom / 100})`, 
                transformOrigin: 'top center',
                minHeight: '11in',
                width: pageSize === 'Letter' ? '8.5in' : pageSize === 'A4' ? '21cm' : '8.5in',
                padding: margins === 'Normal' ? '1in' : margins === 'Narrow' ? '0.5in' : '1in'
              }}
            >
              {showGridlines && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              )}
              
              <div
                ref={editorRef}
                contentEditable
                onInput={handleContentChange}
                onBlur={handleContentChange}
                className="min-h-full p-8 outline-none focus:outline-none"
                style={{
                  fontFamily: fontFamily,
                  fontSize: `${fontSize}px`,
                  lineHeight: '1.6',
                  color: '#2c3e50',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap'
                }}
                suppressContentEditableWarning
              >
                {documentContent === '' && wordCount === 0 && (
                  <div className="text-gray-400 pointer-events-none select-none">
                    Start typing your document here...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Comments Panel */}
        {showComments && (
          <div className="w-80 bg-white border-l p-4 overflow-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Comments</h3>
              <button onClick={addNewComment} className="text-blue-600 hover:text-blue-700 text-sm">
                + New
              </button>
            </div>
            {comments.length === 0 ? (
              <p className="text-sm text-gray-500">No comments yet. Select text and add a comment.</p>
            ) : (
              <div className="space-y-3">
                {comments.map(comment => (
                  <div key={comment.id} className="border-l-4 border-blue-500 pl-3 py-2 bg-blue-50">
                    <p className="text-xs text-gray-600 font-medium mb-1">"{comment.text}"</p>
                    <p className="text-sm">{comment.comment}</p>
                    <p className="text-xs text-gray-400 mt-1">{comment.author} • {comment.timestamp}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dialogs */}
      {showFind && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Find and Replace</h3>
              <button onClick={() => setShowFind(false)}>
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
                onKeyDown={(e) => e.key === 'Enter' && handleFindNext()}
              />
              <input
                type="text"
                placeholder="Replace with..."
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
                className="w-full border rounded px-3 py-2"
              />
              <div className="flex gap-2">
                <button 
                  onClick={handleFindNext}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  disabled={!findText}
                >
                  Find Next
                </button>
                <button 
                  onClick={() => handleReplace(findText, replaceText, false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  disabled={!findText || !replaceText}
                >
                  Replace
                </button>
                <button 
                  onClick={() => handleReplace(findText, replaceText, true)}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
                  disabled={!findText || !replaceText}
                >
                  Replace All
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showTableDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Insert Table</h3>
              <button onClick={() => setShowTableDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Select table size (click a cell):</p>
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({length: 64}, (_, i) => (
                    <div 
                      key={i} 
                      className="w-6 h-6 border border-gray-300 hover:bg-blue-100 cursor-pointer"
                      onClick={() => {
                        const cols = (i % 8) + 1;
                        const rows = Math.floor(i / 8) + 1;
                        insertTable(rows, cols);
                        setShowTableDialog(false);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {showSaveAsDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Save As</h3>
              <button onClick={() => setShowSaveAsDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">File Name</label>
                <input
                  type="text"
                  value={saveFileName || documentName}
                  onChange={(e) => setSaveFileName(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                  placeholder="Enter file name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select 
                  value={saveFormat} 
                  onChange={(e) => setSaveFormat(e.target.value)}
                  className="w-full border rounded px-3 py-2"
                >
                  <option value="html">HTML Document (.html)</option>
                  <option value="txt">Plain Text (.txt)</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => handleSaveAsDocument(saveFileName || documentName, saveFormat)}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save
                </button>
                <button 
                  onClick={() => setShowSaveAsDialog(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showImageDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Insert Image</h3>
              <button onClick={() => setShowImageDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Upload Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border rounded px-3 py-2 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Or enter image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full border rounded px-3 py-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = (e.target as HTMLInputElement).value;
                      if (url) {
                        insertImage(url);
                        setShowImageDialog(false);
                      }
                    }
                  }}
                />
              </div>
              <button 
                onClick={() => setShowImageDialog(false)}
                className="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showShapeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Insert Shape</h3>
              <button onClick={() => setShowShapeDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'rectangle', name: 'Rectangle', icon: Square },
                { type: 'circle', name: 'Circle', icon: Circle },
                { type: 'triangle', name: 'Triangle', icon: Triangle }
              ].map(shape => (
                <button
                  key={shape.type}
                  onClick={() => insertShape(shape.type)}
                  className="p-4 border rounded hover:bg-gray-50 flex flex-col items-center gap-2"
                >
                  <shape.icon size={24} />
                  <span className="text-xs">{shape.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showLinkDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Insert Hyperlink</h3>
              <button onClick={() => setShowLinkDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Display text"
                className="w-full border rounded px-3 py-2"
                id="link-text"
              />
              <input
                type="url"
                placeholder="URL (https://example.com)"
                className="w-full border rounded px-3 py-2"
                id="link-url"
              />
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    const text = (document.getElementById('link-text') as HTMLInputElement)?.value || 'Link';
                    const url = (document.getElementById('link-url') as HTMLInputElement)?.value;
                    if (url) {
                      insertHyperlink(text, url);
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Insert
                </button>
                <button 
                  onClick={() => setShowLinkDialog(false)}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {showDateTimeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Insert Date & Time</h3>
              <button onClick={() => setShowDateTimeDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="space-y-3">
              {[
                { format: 'full', label: 'Full Date & Time', example: new Date().toLocaleString() },
                { format: 'date', label: 'Date Only', example: new Date().toLocaleDateString() },
                { format: 'time', label: 'Time Only', example: new Date().toLocaleTimeString() },
                { format: 'iso', label: 'ISO Date', example: new Date().toISOString().split('T')[0] }
              ].map(option => (
                <button
                  key={option.format}
                  onClick={() => insertDateTime(option.format)}
                  className="w-full p-3 border rounded hover:bg-gray-50 text-left"
                >
                  <div className="font-medium text-sm">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.example}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {showSymbolDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-96">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Insert Symbol</h3>
              <button onClick={() => setShowSymbolDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {commonSymbols.map(symbol => (
                <button
                  key={symbol}
                  onClick={() => {
                    insertSymbol(symbol);
                    setShowSymbolDialog(false);
                  }}
                  className="w-10 h-10 border rounded hover:bg-blue-100 flex items-center justify-center text-lg"
                >
                  {symbol}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Status Bar */}
      <div className="bg-blue-600 text-white px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span>Page 1 of 1</span>
          <span>Words: {wordCount}</span>
          <span>Characters: {wordCount * 5}</span>
          {trackChanges && <span className="bg-yellow-500 px-2 py-0.5 rounded">Track Changes ON</span>}
          {spellCheck && <span className="bg-green-500 px-2 py-0.5 rounded">Spell Check ON</span>}
          {isDocumentModified && <span className="bg-orange-500 px-2 py-0.5 rounded">Modified</span>}
        </div>
        <div className="flex items-center gap-4">
          {currentFilePath && (
            <span className="text-xs">{currentFilePath}</span>
          )}
          <button
            onClick={() => handleZoomChange(zoom - 10)}
            className="p-1 hover:bg-blue-700 rounded"
            disabled={zoom <= 10}
          >
            <Minus size={12} />
          </button>
          <span className="min-w-12 text-center">{zoom}%</span>
          <button
            onClick={() => handleZoomChange(zoom + 10)}
            className="p-1 hover:bg-blue-700 rounded"
            disabled={zoom >= 500}
          >
            <Plus size={12} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DocumentEditor;