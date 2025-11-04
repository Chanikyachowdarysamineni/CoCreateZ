import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Save, Undo2, Redo2, Play, Pause, ChevronDown, X, Plus, Minus,
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight,
  Type, Image, Shapes, PieChart, Table, Video, Music,
  Copy, Scissors, ClipboardPaste, Trash2, Edit, Eye, Grid3x3,
  Maximize2, Minimize2, Share2, Users, MessageSquare, Download,
  Upload, Printer, Settings, HelpCircle, FileText, Layout,
  Palette, Zap, List, ListOrdered, Link2, MoreVertical,
  Square, Circle, Triangle, Star, ChevronLeft, ChevronRight,
  SkipBack, SkipForward, Monitor, Smartphone, ArrowRight,
  MousePointer, Pen, Highlighter, Eraser, Move, RotateCw,
  FlipHorizontal, FlipVertical, Layers, Lock, Unlock, Film,
  Mic, Hash, Calendar, MapPin, Package, Sparkles, Wand2,
  GripVertical, AlignJustify, Columns, Split, Merge
} from 'lucide-react';

interface TextElement {
  id: string;
  type: 'text';
  content: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  fontFamily: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: 'left' | 'center' | 'right' | 'justify';
  rotation: number;
}

interface ImageElement {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface ShapeElement {
  id: string;
  type: 'shape';
  shape: 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'star';
  x: number;
  y: number;
  width: number;
  height: number;
  fillColor: string;
  borderColor: string;
  borderWidth: number;
  rotation: number;
}

type SlideElement = TextElement | ImageElement | ShapeElement;

interface Slide {
  id: string;
  title: string;
  layout: string;
  background: string;
  elements: SlideElement[];
  notes: string;
  transition: string;
  duration: number;
}

const PowerPointEditor: React.FC = () => {
  // Core state
  const [presentationName, setPresentationName] = useState('Presentation1 - PowerPoint');
  const [slides, setSlides] = useState<Slide[]>([
    {
      id: '1',
      title: 'Slide 1',
      layout: 'title',
      background: '#FFFFFF',
      elements: [
        {
          id: 'title-1',
          type: 'text',
          content: 'Click to add title',
          x: 50,
          y: 150,
          width: 700,
          height: 100,
          fontSize: 44,
          fontFamily: 'Calibri',
          color: '#000000',
          bold: true,
          italic: false,
          underline: false,
          align: 'center',
          rotation: 0
        },
        {
          id: 'subtitle-1',
          type: 'text',
          content: 'Click to add subtitle',
          x: 50,
          y: 280,
          width: 700,
          height: 60,
          fontSize: 28,
          fontFamily: 'Calibri',
          color: '#666666',
          bold: false,
          italic: false,
          underline: false,
          align: 'center',
          rotation: 0
        }
      ],
      notes: '',
      transition: 'fade',
      duration: 5
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  
  // UI state
  const [activeTab, setActiveTab] = useState('Home');
  const [zoom, setZoom] = useState(100);
  const [showNotes, setShowNotes] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [isModified, setIsModified] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null);
  
  // Formatting state
  const [fontFamily, setFontFamily] = useState('Calibri');
  const [fontSize, setFontSize] = useState(18);
  const [textColor, setTextColor] = useState('#000000');
  const [fillColor, setFillColor] = useState('#FFFFFF');
  const [selectedTheme, setSelectedTheme] = useState('Office');
  const [selectedTransition, setSelectedTransition] = useState('fade');
  
  // Dialog state
  const [showLayoutDialog, setShowLayoutDialog] = useState(false);
  const [showThemeDialog, setShowThemeDialog] = useState(false);
  const [showTransitionDialog, setShowTransitionDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [showShapeDialog, setShowShapeDialog] = useState(false);
  const [showChartDialog, setShowChartDialog] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  
  // Editing state
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);
  
  // Clipboard
  const [clipboard, setClipboard] = useState<SlideElement | null>(null);
  
  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const slideCanvasRef = useRef<HTMLDivElement>(null);
  const presentationTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Constants
  const SLIDE_WIDTH = 800;
  const SLIDE_HEIGHT = 450;
  const tabs = ['File', 'Home', 'Insert', 'Design', 'Transitions', 'Animations', 'Slide Show', 'Review', 'View'];
  const fonts = ['Calibri', 'Arial', 'Times New Roman', 'Georgia', 'Verdana', 'Comic Sans MS'];
  const fontSizes = [10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 44, 54, 64, 72];
  
  const layouts = [
    { name: 'Title Slide', id: 'title' },
    { name: 'Title and Content', id: 'titleContent' },
    { name: 'Two Content', id: 'twoContent' },
    { name: 'Blank', id: 'blank' },
    { name: 'Content with Caption', id: 'contentCaption' },
    { name: 'Picture with Caption', id: 'pictureCaption' }
  ];
  
  const themes = [
    { name: 'Office', colors: ['#FFFFFF', '#4472C4', '#ED7D31', '#A5A5A5'] },
    { name: 'Ion', colors: ['#FFFFFF', '#00B0F0', '#7030A0', '#C00000'] },
    { name: 'Organic', colors: ['#F5F5DC', '#8B4513', '#228B22', '#FF8C00'] },
    { name: 'Slice', colors: ['#FFFFFF', '#FF6B6B', '#4ECDC4', '#45B7D1'] },
    { name: 'Retrospect', colors: ['#2C3E50', '#E74C3C', '#ECF0F1', '#3498DB'] }
  ];
  
  const transitions = [
    'None', 'Fade', 'Push', 'Wipe', 'Split', 'Reveal', 'Random Bars', 
    'Shape', 'Uncover', 'Cover', 'Flash', 'Dissolve'
  ];
  
  // Helper functions
  const getCurrentSlide = useCallback(() => {
    return slides[currentSlideIndex];
  }, [slides, currentSlideIndex]);
  
  const updateSlide = useCallback((updates: Partial<Slide>) => {
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides[currentSlideIndex] = {
        ...newSlides[currentSlideIndex],
        ...updates
      };
      return newSlides;
    });
    setIsModified(true);
  }, [currentSlideIndex]);
  
  const getSelectedElement = useCallback(() => {
    if (!selectedElementId) return null;
    const slide = getCurrentSlide();
    return slide.elements.find(el => el.id === selectedElementId) || null;
  }, [selectedElementId, getCurrentSlide]);
  
  const updateElement = useCallback((id: string, updates: Partial<SlideElement>) => {
    const slide = getCurrentSlide();
    const newElements = slide.elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    );
    updateSlide({ elements: newElements });
  }, [getCurrentSlide, updateSlide]);
  
  const deleteElement = useCallback((id: string) => {
    const slide = getCurrentSlide();
    const newElements = slide.elements.filter(el => el.id !== id);
    updateSlide({ elements: newElements });
    setSelectedElementId(null);
  }, [getCurrentSlide, updateSlide]);
  
  // Slide management
  const addSlide = useCallback((layout: string = 'blank') => {
    const newSlide: Slide = {
      id: Date.now().toString(),
      title: `Slide ${slides.length + 1}`,
      layout,
      background: '#FFFFFF',
      elements: layout === 'title' ? [
        {
          id: `title-${Date.now()}`,
          type: 'text',
          content: 'Click to add title',
          x: 50,
          y: 150,
          width: 700,
          height: 100,
          fontSize: 44,
          fontFamily: 'Calibri',
          color: '#000000',
          bold: true,
          italic: false,
          underline: false,
          align: 'center',
          rotation: 0
        }
      ] : [],
      notes: '',
      transition: 'fade',
      duration: 5
    };
    setSlides([...slides, newSlide]);
    setCurrentSlideIndex(slides.length);
    setIsModified(true);
  }, [slides]);
  
  const duplicateSlide = useCallback((index: number) => {
    const slideToDuplicate = slides[index];
    const newSlide: Slide = {
      ...slideToDuplicate,
      id: Date.now().toString(),
      title: `${slideToDuplicate.title} (Copy)`,
      elements: slideToDuplicate.elements.map(el => ({
        ...el,
        id: `${el.id}-copy-${Date.now()}`
      }))
    };
    const newSlides = [...slides];
    newSlides.splice(index + 1, 0, newSlide);
    setSlides(newSlides);
    setCurrentSlideIndex(index + 1);
    setIsModified(true);
  }, [slides]);
  
  const deleteSlide = useCallback((index: number) => {
    if (slides.length === 1) {
      alert('Cannot delete the last slide');
      return;
    }
    const newSlides = slides.filter((_, i) => i !== index);
    setSlides(newSlides);
    if (currentSlideIndex >= newSlides.length) {
      setCurrentSlideIndex(newSlides.length - 1);
    }
    setIsModified(true);
  }, [slides, currentSlideIndex]);
  
  const moveSlide = useCallback((fromIndex: number, toIndex: number) => {
    const newSlides = [...slides];
    const [removed] = newSlides.splice(fromIndex, 1);
    newSlides.splice(toIndex, 0, removed);
    setSlides(newSlides);
    setCurrentSlideIndex(toIndex);
    setIsModified(true);
  }, [slides]);
  
  // Element management
  const addTextBox = useCallback(() => {
    const newElement: TextElement = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'Click to edit text',
      x: 200,
      y: 150,
      width: 400,
      height: 100,
      fontSize: 18,
      fontFamily: 'Calibri',
      color: '#000000',
      bold: false,
      italic: false,
      underline: false,
      align: 'left',
      rotation: 0
    };
    const slide = getCurrentSlide();
    updateSlide({ elements: [...slide.elements, newElement] });
    setSelectedElementId(newElement.id);
  }, [getCurrentSlide, updateSlide]);
  
  const addImage = useCallback((src: string) => {
    const newElement: ImageElement = {
      id: `image-${Date.now()}`,
      type: 'image',
      src,
      x: 200,
      y: 100,
      width: 400,
      height: 300,
      rotation: 0
    };
    const slide = getCurrentSlide();
    updateSlide({ elements: [...slide.elements, newElement] });
    setSelectedElementId(newElement.id);
    setShowImageDialog(false);
  }, [getCurrentSlide, updateSlide]);
  
  const addShape = useCallback((shape: 'rectangle' | 'circle' | 'triangle' | 'arrow' | 'star') => {
    const newElement: ShapeElement = {
      id: `shape-${Date.now()}`,
      type: 'shape',
      shape,
      x: 300,
      y: 150,
      width: 200,
      height: 150,
      fillColor: '#4472C4',
      borderColor: '#000000',
      borderWidth: 2,
      rotation: 0
    };
    const slide = getCurrentSlide();
    updateSlide({ elements: [...slide.elements, newElement] });
    setSelectedElementId(newElement.id);
    setShowShapeDialog(false);
  }, [getCurrentSlide, updateSlide]);
  
  // Text formatting
  const applyTextFormatting = useCallback((updates: Partial<TextElement>) => {
    if (selectedElementId) {
      const element = getSelectedElement();
      if (element?.type === 'text') {
        updateElement(selectedElementId, updates);
      }
    }
  }, [selectedElementId, getSelectedElement, updateElement]);
  
  // Clipboard operations
  const handleCopy = useCallback(() => {
    const element = getSelectedElement();
    if (element) {
      setClipboard(element);
    }
  }, [getSelectedElement]);
  
  const handleCut = useCallback(() => {
    const element = getSelectedElement();
    if (element) {
      setClipboard(element);
      deleteElement(element.id);
    }
  }, [getSelectedElement, deleteElement]);
  
  const handlePaste = useCallback(() => {
    if (clipboard) {
      const newElement = {
        ...clipboard,
        id: `${clipboard.type}-${Date.now()}`,
        x: clipboard.x + 20,
        y: clipboard.y + 20
      };
      const slide = getCurrentSlide();
      updateSlide({ elements: [...slide.elements, newElement] });
      setSelectedElementId(newElement.id);
    }
  }, [clipboard, getCurrentSlide, updateSlide]);
  
  // Presentation mode
  const startPresentation = useCallback(() => {
    setIsPresentationMode(true);
    setIsPlaying(true);
    setCurrentSlideIndex(0);
    setIsFullscreen(true);
  }, []);
  
  const stopPresentation = useCallback(() => {
    setIsPresentationMode(false);
    setIsPlaying(false);
    setIsFullscreen(false);
    if (presentationTimerRef.current) {
      clearTimeout(presentationTimerRef.current);
    }
  }, []);
  
  const nextSlide = useCallback(() => {
    if (currentSlideIndex < slides.length - 1) {
      setCurrentSlideIndex(currentSlideIndex + 1);
    } else if (isPresentationMode) {
      stopPresentation();
    }
  }, [currentSlideIndex, slides.length, isPresentationMode, stopPresentation]);
  
  const previousSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(currentSlideIndex - 1);
    }
  }, [currentSlideIndex]);
  
  // Auto-advance slides in presentation mode
  useEffect(() => {
    if (isPlaying && isPresentationMode) {
      const duration = getCurrentSlide().duration * 1000;
      presentationTimerRef.current = setTimeout(nextSlide, duration);
      return () => {
        if (presentationTimerRef.current) {
          clearTimeout(presentationTimerRef.current);
        }
      };
    }
  }, [isPlaying, isPresentationMode, currentSlideIndex, getCurrentSlide, nextSlide]);
  
  // File operations
  const handleSave = useCallback(() => {
    const data = {
      name: presentationName,
      slides,
      timestamp: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${presentationName.replace(' - PowerPoint', '')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setIsModified(false);
    setLastSavedTime(new Date());
  }, [presentationName, slides]);
  
  const handleLoad = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        setPresentationName(data.name);
        setSlides(data.slides);
        setCurrentSlideIndex(0);
        setIsModified(false);
      } catch (error) {
        alert('Error loading file');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  }, []);
  
  const handleImageUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        addImage(result);
      };
      reader.readAsDataURL(file);
    }
    event.target.value = '';
  }, [addImage]);
  
  // Mouse handlers for dragging and resizing
  const handleMouseDown = useCallback((e: React.MouseEvent, elementId: string) => {
    e.stopPropagation();
    setSelectedElementId(elementId);
    setIsDragging(true);
    const element = getSelectedElement();
    if (element) {
      setDragOffset({
        x: e.clientX - element.x,
        y: e.clientY - element.y
      });
    }
  }, [getSelectedElement]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && selectedElementId) {
      const element = getSelectedElement();
      if (element) {
        const canvas = slideCanvasRef.current;
        if (canvas) {
          const rect = canvas.getBoundingClientRect();
          const scale = zoom / 100;
          const newX = (e.clientX - rect.left) / scale - dragOffset.x;
          const newY = (e.clientY - rect.top) / scale - dragOffset.y;
          updateElement(selectedElementId, {
            x: Math.max(0, Math.min(SLIDE_WIDTH - element.width, newX)),
            y: Math.max(0, Math.min(SLIDE_HEIGHT - element.height, newY))
          });
        }
      }
    }
  }, [isDragging, selectedElementId, dragOffset, zoom, getSelectedElement, updateElement]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setIsResizing(false);
  }, []);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isPresentationMode) {
        switch (e.key) {
          case 'ArrowRight':
          case 'PageDown':
          case ' ':
            e.preventDefault();
            nextSlide();
            break;
          case 'ArrowLeft':
          case 'PageUp':
            e.preventDefault();
            previousSlide();
            break;
          case 'Escape':
            e.preventDefault();
            stopPresentation();
            break;
        }
        return;
      }
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 's':
            e.preventDefault();
            handleSave();
            break;
          case 'c':
            e.preventDefault();
            handleCopy();
            break;
          case 'x':
            e.preventDefault();
            handleCut();
            break;
          case 'v':
            e.preventDefault();
            handlePaste();
            break;
          case 'd':
            e.preventDefault();
            duplicateSlide(currentSlideIndex);
            break;
          case 'm':
            e.preventDefault();
            addSlide();
            break;
        }
      } else if (e.key === 'Delete' && selectedElementId && !editingTextId) {
        e.preventDefault();
        deleteElement(selectedElementId);
      } else if (e.key === 'F5') {
        e.preventDefault();
        startPresentation();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isPresentationMode, selectedElementId, editingTextId, currentSlideIndex,
    handleSave, handleCopy, handleCut, handlePaste, deleteElement, 
    duplicateSlide, addSlide, startPresentation, stopPresentation,
    nextSlide, previousSlide
  ]);
  
  // Auto-save
  useEffect(() => {
    if (autoSave && isModified) {
      const timer = setTimeout(handleSave, 30000);
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
        active ? 'bg-orange-100 text-orange-600' : 'text-gray-700'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {children}
    </button>
  );
  
  // Presentation Mode Component
  if (isPresentationMode) {
    const currentSlide = getCurrentSlide();
    
    return (
      <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
        <div className="relative w-full h-full flex items-center justify-center">
          <div 
            className="relative"
            style={{ 
              width: '90vw', 
              height: '90vh',
              maxWidth: '1600px',
              maxHeight: '900px'
            }}
          >
            <div 
              className="w-full h-full flex items-center justify-center"
              style={{ backgroundColor: currentSlide.background }}
            >
              {currentSlide.elements.map(element => {
                if (element.type === 'text') {
                  return (
                    <div
                      key={element.id}
                      style={{
                        position: 'absolute',
                        left: `${(element.x / SLIDE_WIDTH) * 100}%`,
                        top: `${(element.y / SLIDE_HEIGHT) * 100}%`,
                        width: `${(element.width / SLIDE_WIDTH) * 100}%`,
                        height: `${(element.height / SLIDE_HEIGHT) * 100}%`,
                        fontSize: `${element.fontSize * 1.5}px`,
                        fontFamily: element.fontFamily,
                        color: element.color,
                        fontWeight: element.bold ? 'bold' : 'normal',
                        fontStyle: element.italic ? 'italic' : 'normal',
                        textDecoration: element.underline ? 'underline' : 'none',
                        textAlign: element.align,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: element.align === 'center' ? 'center' : 
                                       element.align === 'right' ? 'flex-end' : 'flex-start',
                        transform: `rotate(${element.rotation}deg)`
                      }}
                    >
                      {element.content}
                    </div>
                  );
                } else if (element.type === 'image') {
                  return (
                    <img
                      key={element.id}
                      src={element.src}
                      alt=""
                      style={{
                        position: 'absolute',
                        left: `${(element.x / SLIDE_WIDTH) * 100}%`,
                        top: `${(element.y / SLIDE_HEIGHT) * 100}%`,
                        width: `${(element.width / SLIDE_WIDTH) * 100}%`,
                        height: `${(element.height / SLIDE_HEIGHT) * 100}%`,
                        objectFit: 'contain',
                        transform: `rotate(${element.rotation}deg)`
                      }}
                    />
                  );
                } else if (element.type === 'shape') {
                  return (
                    <div
                      key={element.id}
                      style={{
                        position: 'absolute',
                        left: `${(element.x / SLIDE_WIDTH) * 100}%`,
                        top: `${(element.y / SLIDE_HEIGHT) * 100}%`,
                        width: `${(element.width / SLIDE_WIDTH) * 100}%`,
                        height: `${(element.height / SLIDE_HEIGHT) * 100}%`,
                        backgroundColor: element.fillColor,
                        border: `${element.borderWidth}px solid ${element.borderColor}`,
                        borderRadius: element.shape === 'circle' ? '50%' : '0',
                        transform: `rotate(${element.rotation}deg)`
                      }}
                    />
                  );
                }
                return null;
              })}
            </div>
          </div>
          
          {/* Presentation Controls */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black bg-opacity-75 px-4 py-2 rounded-lg">
            <button
              onClick={previousSlide}
              disabled={currentSlideIndex === 0}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded disabled:opacity-50"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            <button
              onClick={nextSlide}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
              <ChevronRight size={20} />
            </button>
            <span className="text-white text-sm mx-2">
              {currentSlideIndex + 1} / {slides.length}
            </span>
            <button
              onClick={stopPresentation}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className={`${isFullscreen ? 'fixed inset-0 z-50' : ''} flex flex-col h-screen bg-gray-50`}>
      {/* Title Bar */}
      <div className="bg-white border-b flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-orange-600 rounded flex items-center justify-center text-white font-bold text-sm">
            P
          </div>
          <input
            type="text"
            value={presentationName}
            onChange={(e) => {
              setPresentationName(e.target.value);
              setIsModified(true);
            }}
            className="text-sm font-medium focus:outline-none focus:border-b border-orange-500"
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
          <button className="p-2 hover:bg-gray-100 rounded">
            <MessageSquare size={16} />
          </button>
          <button className="px-3 py-1 bg-orange-600 text-white rounded text-sm hover:bg-orange-700">
            <Share2 size={14} className="inline mr-1" />
            Share
          </button>
          <button
            onClick={startPresentation}
            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            <Play size={14} className="inline mr-1" />
            Present
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
                  ? 'border-orange-500 text-orange-600 bg-orange-50' 
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
                  if (isModified && window.confirm('Save changes?')) {
                    handleSave();
                  }
                  setSlides([{
                    id: '1',
                    title: 'Slide 1',
                    layout: 'title',
                    background: '#FFFFFF',
                    elements: [],
                    notes: '',
                    transition: 'fade',
                    duration: 5
                  }]);
                  setCurrentSlideIndex(0);
                  setPresentationName('Presentation1 - PowerPoint');
                  setIsModified(false);
                }} title="New Presentation">
                  <FileText size={16} />
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
                <ToolbarButton onClick={handleSave} title="Export">
                  <Download size={16} />
                </ToolbarButton>
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
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Slides</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => addSlide('blank')} title="New Slide">
                    <Plus size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setShowLayoutDialog(true)} title="Layout">
                    <Layout size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => deleteSlide(currentSlideIndex)} title="Delete Slide" disabled={slides.length === 1}>
                    <Trash2 size={16} />
                  </ToolbarButton>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Clipboard</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={handlePaste} title="Paste">
                    <ClipboardPaste size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={handleCopy} title="Copy">
                    <Copy size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={handleCut} title="Cut">
                    <Scissors size={16} />
                  </ToolbarButton>
                </div>
              </div>

              <div className="flex flex-col gap-2 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Font</div>
                <div className="flex items-center gap-2">
                  <select 
                    value={fontFamily} 
                    onChange={(e) => {
                      setFontFamily(e.target.value);
                      applyTextFormatting({ fontFamily: e.target.value });
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
                      applyTextFormatting({ fontSize: parseInt(e.target.value) });
                    }}
                    className="text-sm border rounded px-2 py-1 w-16"
                  >
                    {fontSizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => applyTextFormatting({ bold: true })} title="Bold">
                    <Bold size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => applyTextFormatting({ italic: true })} title="Italic">
                    <Italic size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => applyTextFormatting({ underline: true })} title="Underline">
                    <Underline size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="Text Color">
                    <Type size={16} />
                  </ToolbarButton>
                </div>
              </div>

              <div className="flex flex-col gap-2 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Paragraph</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => applyTextFormatting({ align: 'left' })} title="Align Left">
                    <AlignLeft size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => applyTextFormatting({ align: 'center' })} title="Center">
                    <AlignCenter size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => applyTextFormatting({ align: 'right' })} title="Align Right">
                    <AlignRight size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="Bullets">
                    <List size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="Numbering">
                    <ListOrdered size={16} />
                  </ToolbarButton>
                </div>
              </div>

              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Drawing</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => {}} title="Draw">
                    <Pen size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="Erase">
                    <Eraser size={16} />
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
                <div className="text-xs font-medium text-gray-600">Slides</div>
                <ToolbarButton onClick={() => addSlide('blank')} title="New Slide">
                  <Plus size={16} />
                </ToolbarButton>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Text</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={addTextBox} title="Text Box">
                    <Type size={16} />
                  </ToolbarButton>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Illustrations</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => setShowImageDialog(true)} title="Picture">
                    <Image size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setShowShapeDialog(true)} title="Shapes">
                    <Shapes size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setShowChartDialog(true)} title="Chart">
                    <PieChart size={16} />
                  </ToolbarButton>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Links</div>
                <ToolbarButton onClick={() => {}} title="Hyperlink">
                  <Link2 size={16} />
                </ToolbarButton>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Tables</div>
                <ToolbarButton onClick={() => {}} title="Table">
                  <Table size={16} />
                </ToolbarButton>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Media</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => {}} title="Video">
                    <Video size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="Audio">
                    <Music size={16} />
                  </ToolbarButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Design Tab */}
        {activeTab === 'Design' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Themes</div>
                <ToolbarButton onClick={() => setShowThemeDialog(true)} title="Themes">
                  <Palette size={16} />
                </ToolbarButton>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Variants</div>
                <div className="flex gap-1">
                  {themes[0].colors.map((color, i) => (
                    <button
                      key={i}
                      onClick={() => updateSlide({ background: color })}
                      className="w-6 h-6 rounded border-2 border-gray-300"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Customize</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => {}} title="Slide Size">
                    <Monitor size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="Format Background">
                    <Palette size={16} />
                  </ToolbarButton>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Transitions Tab */}
        {activeTab === 'Transitions' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col gap-2 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Transition to This Slide</div>
                <select 
                  value={getCurrentSlide().transition} 
                  onChange={(e) => updateSlide({ transition: e.target.value })}
                  className="text-sm border rounded px-2 py-1"
                >
                  {transitions.map(trans => (
                    <option key={trans} value={trans.toLowerCase()}>{trans}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex flex-col gap-2 px-3">
                <div className="text-xs font-medium text-gray-600">Timing</div>
                <div className="flex items-center gap-2">
                  <label className="text-xs">Duration (s):</label>
                  <input
                    type="number"
                    value={getCurrentSlide().duration}
                    onChange={(e) => updateSlide({ duration: parseInt(e.target.value) || 5 })}
                    className="w-16 text-sm border rounded px-2 py-1"
                    min="1"
                    max="60"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Slide Show Tab */}
        {activeTab === 'Slide Show' && (
          <div className="p-3 bg-gray-50 border-b">
            <div className="flex items-center gap-6">
              <div className="flex flex-col items-center gap-1 px-3 border-r">
                <div className="text-xs font-medium text-gray-600">Start Slide Show</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={startPresentation} title="From Beginning">
                    <Play size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {
                    setIsPresentationMode(true);
                    setIsPlaying(true);
                  }} title="From Current Slide">
                    <SkipForward size={16} />
                  </ToolbarButton>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Set Up</div>
                <div className="flex gap-1">
                  <ToolbarButton onClick={() => {}} title="Set Up Show">
                    <Settings size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => {}} title="Rehearse Timings">
                    <Film size={16} />
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
                  <ToolbarButton onClick={() => setShowRuler(!showRuler)} title="Ruler" active={showRuler}>
                    <GripVertical size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setShowGrid(!showGrid)} title="Gridlines" active={showGrid}>
                    <Grid3x3 size={16} />
                  </ToolbarButton>
                  <ToolbarButton onClick={() => setShowNotes(!showNotes)} title="Notes" active={showNotes}>
                    <FileText size={16} />
                  </ToolbarButton>
                </div>
              </div>
              
              <div className="flex flex-col items-center gap-1 px-3">
                <div className="text-xs font-medium text-gray-600">Zoom</div>
                <div className="flex items-center gap-2">
                  <ToolbarButton onClick={() => setZoom(Math.max(10, zoom - 10))} title="Zoom Out">
                    <Minus size={16} />
                  </ToolbarButton>
                  <span className="text-sm min-w-12 text-center">{zoom}%</span>
                  <ToolbarButton onClick={() => setZoom(Math.min(400, zoom + 10))} title="Zoom In">
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
          <ToolbarButton onClick={startPresentation} title="Start Presentation (F5)">
            <Play size={16} />
          </ToolbarButton>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Slide Thumbnails */}
        <div className="w-64 bg-white border-r overflow-y-auto p-4">
          <div className="space-y-2">
            {slides.map((slide, index) => (
              <div
                key={slide.id}
                onClick={() => setCurrentSlideIndex(index)}
                className={`group relative cursor-pointer border-2 rounded overflow-hidden ${
                  currentSlideIndex === index ? 'border-orange-500 ring-2 ring-orange-200' : 'border-gray-200'
                }`}
              >
                <div className="absolute top-1 left-1 bg-white rounded px-2 py-1 text-xs font-medium">
                  {index + 1}
                </div>
                <div
                  className="aspect-video"
                  style={{
                    backgroundColor: slide.background,
                    transform: 'scale(0.95)',
                    fontSize: '8px'
                  }}
                >
                  {slide.elements.map(element => {
                    if (element.type === 'text') {
                      return (
                        <div
                          key={element.id}
                          style={{
                            position: 'absolute',
                            left: `${(element.x / SLIDE_WIDTH) * 100}%`,
                            top: `${(element.y / SLIDE_HEIGHT) * 100}%`,
                            width: `${(element.width / SLIDE_WIDTH) * 100}%`,
                            fontSize: '6px',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {element.content}
                        </div>
                      );
                    }
                    return null;
                  })}
                </div>
                <div className="hidden group-hover:flex absolute top-1 right-1 gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      duplicateSlide(index);
                    }}
                    className="p-1 bg-white rounded hover:bg-gray-100"
                    title="Duplicate"
                  >
                    <Copy size={12} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteSlide(index);
                    }}
                    className="p-1 bg-white rounded hover:bg-gray-100"
                    title="Delete"
                    disabled={slides.length === 1}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            ))}
            <button
              onClick={() => addSlide('blank')}
              className="w-full aspect-video border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-orange-500 hover:bg-orange-50"
            >
              <Plus size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Slide Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center p-8">
            <div
              ref={slideCanvasRef}
              className="relative bg-white shadow-lg"
              style={{
                width: `${SLIDE_WIDTH * (zoom / 100)}px`,
                height: `${SLIDE_HEIGHT * (zoom / 100)}px`,
                backgroundColor: getCurrentSlide().background
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none" style={{
                  backgroundImage: 'linear-gradient(#e5e7eb 1px, transparent 1px), linear-gradient(90deg, #e5e7eb 1px, transparent 1px)',
                  backgroundSize: '20px 20px'
                }} />
              )}
              
              {getCurrentSlide().elements.map(element => {
                const isSelected = selectedElementId === element.id;
                const scale = zoom / 100;
                
                if (element.type === 'text') {
                  return (
                    <div
                      key={element.id}
                      onMouseDown={(e) => handleMouseDown(e, element.id)}
                      onDoubleClick={() => setEditingTextId(element.id)}
                      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
                      style={{
                        left: element.x * scale,
                        top: element.y * scale,
                        width: element.width * scale,
                        height: element.height * scale,
                        fontSize: element.fontSize * scale,
                        fontFamily: element.fontFamily,
                        color: element.color,
                        fontWeight: element.bold ? 'bold' : 'normal',
                        fontStyle: element.italic ? 'italic' : 'normal',
                        textDecoration: element.underline ? 'underline' : 'none',
                        textAlign: element.align,
                        transform: `rotate(${element.rotation}deg)`,
                        padding: 4 * scale,
                        border: isSelected ? '2px dashed #f97316' : 'none'
                      }}
                    >
                      {editingTextId === element.id ? (
                        <textarea
                          value={element.content}
                          onChange={(e) => updateElement(element.id, { content: e.target.value })}
                          onBlur={() => setEditingTextId(null)}
                          className="w-full h-full resize-none border-none outline-none bg-transparent"
                          style={{
                            fontSize: 'inherit',
                            fontFamily: 'inherit',
                            color: 'inherit',
                            fontWeight: 'inherit',
                            fontStyle: 'inherit',
                            textDecoration: 'inherit',
                            textAlign: 'inherit'
                          }}
                          autoFocus
                        />
                      ) : (
                        element.content
                      )}
                    </div>
                  );
                } else if (element.type === 'image') {
                  return (
                    <div
                      key={element.id}
                      onMouseDown={(e) => handleMouseDown(e, element.id)}
                      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
                      style={{
                        left: element.x * scale,
                        top: element.y * scale,
                        width: element.width * scale,
                        height: element.height * scale,
                        transform: `rotate(${element.rotation}deg)`
                      }}
                    >
                      <img
                        src={element.src}
                        alt=""
                        className="w-full h-full object-contain"
                      />
                    </div>
                  );
                } else if (element.type === 'shape') {
                  return (
                    <div
                      key={element.id}
                      onMouseDown={(e) => handleMouseDown(e, element.id)}
                      className={`absolute cursor-move ${isSelected ? 'ring-2 ring-orange-500' : ''}`}
                      style={{
                        left: element.x * scale,
                        top: element.y * scale,
                        width: element.width * scale,
                        height: element.height * scale,
                        backgroundColor: element.fillColor,
                        border: `${element.borderWidth}px solid ${element.borderColor}`,
                        borderRadius: element.shape === 'circle' ? '50%' : '0',
                        transform: `rotate(${element.rotation}deg)`
                      }}
                    />
                  );
                }
                return null;
              })}
              
              {selectedElementId && (
                <div className="absolute top-2 right-2 flex gap-1 bg-white rounded shadow-lg p-1">
                  <button
                    onClick={() => selectedElementId && deleteElement(selectedElementId)}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                  <button
                    onClick={handleCopy}
                    className="p-1 hover:bg-gray-100 rounded"
                    title="Copy"
                  >
                    <Copy size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Notes Section */}
          {showNotes && (
            <div className="h-32 bg-white border-t p-4">
              <textarea
                value={getCurrentSlide().notes}
                onChange={(e) => updateSlide({ notes: e.target.value })}
                placeholder="Click to add notes"
                className="w-full h-full resize-none border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          )}
        </div>
      </div>

      {/* Status Bar */}
      <div className="bg-orange-600 text-white px-4 py-1 flex items-center justify-between text-xs">
        <div className="flex items-center gap-4">
          <span>Slide {currentSlideIndex + 1} of {slides.length}</span>
          {selectedElementId && <span>Element selected</span>}
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => setZoom(Math.max(10, zoom - 10))} className="p-1 hover:bg-orange-700 rounded">
            <Minus size={12} />
          </button>
          <span className="min-w-12 text-center">{zoom}%</span>
          <button onClick={() => setZoom(Math.min(400, zoom + 10))} className="p-1 hover:bg-orange-700 rounded">
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* File Inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleLoad}
        className="hidden"
      />
      
      <input
        ref={imageInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
      />

      {/* Layout Dialog */}
      {showLayoutDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Choose Layout</h3>
              <button onClick={() => setShowLayoutDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {layouts.map(layout => (
                <button
                  key={layout.id}
                  onClick={() => {
                    updateSlide({ layout: layout.id });
                    setShowLayoutDialog(false);
                  }}
                  className="p-4 border-2 rounded hover:border-orange-500 hover:bg-orange-50"
                >
                  <div className="aspect-video bg-gray-100 rounded mb-2"></div>
                  <div className="text-xs font-medium text-center">{layout.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Theme Dialog */}
      {showThemeDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl w-[600px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium">Choose Theme</h3>
              <button onClick={() => setShowThemeDialog(false)}>
                <X size={16} />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {themes.map(theme => (
                <button
                  key={theme.name}
                  onClick={() => {
                    setSelectedTheme(theme.name);
                    updateSlide({ background: theme.colors[0] });
                    setShowThemeDialog(false);
                  }}
                  className="p-4 border-2 rounded hover:border-orange-500"
                >
                  <div className="aspect-video bg-gray-100 rounded mb-2 flex items-center justify-center">
                    <div className="flex gap-1">
                      {theme.colors.map((color, i) => (
                        <div
                          key={i}
                          className="w-8 h-8 rounded"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="text-sm font-medium text-center">{theme.name}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
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
                <button
                  onClick={() => imageInputRef.current?.click()}
                  className="w-full px-4 py-3 border-2 border-dashed rounded hover:border-orange-500 hover:bg-orange-50"
                >
                  <Upload size={24} className="mx-auto mb-2" />
                  <span className="text-sm">Click to upload</span>
                </button>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Or enter URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  className="w-full border rounded px-3 py-2"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const url = (e.target as HTMLInputElement).value;
                      if (url) {
                        addImage(url);
                      }
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Shape Dialog */}
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
                { type: 'triangle', name: 'Triangle', icon: Triangle },
                { type: 'arrow', name: 'Arrow', icon: ArrowRight },
                { type: 'star', name: 'Star', icon: Star }
              ].map(shape => (
                <button
                  key={shape.type}
                  onClick={() => addShape(shape.type as any)}
                  className="p-4 border rounded hover:bg-orange-50 flex flex-col items-center gap-2"
                >
                  <shape.icon size={24} />
                  <span className="text-xs">{shape.name}</span>
                </button>
              ))}
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
                  onClick={() => {
                    // Add chart placeholder
                    const newElement: ShapeElement = {
                      id: `chart-${Date.now()}`,
                      type: 'shape',
                      shape: 'rectangle',
                      x: 200,
                      y: 100,
                      width: 400,
                      height: 300,
                      fillColor: '#E5E7EB',
                      borderColor: '#9CA3AF',
                      borderWidth: 2,
                      rotation: 0
                    };
                    const slide = getCurrentSlide();
                    updateSlide({ elements: [...slide.elements, newElement] });
                    setShowChartDialog(false);
                  }}
                  className="p-4 border rounded hover:bg-orange-50 flex flex-col items-center gap-2"
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

export default PowerPointEditor;