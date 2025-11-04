import { useState, useEffect, useRef } from "react";
import { io, Socket } from 'socket.io-client';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  FileSpreadsheet, 
  Presentation, 
  FileText, 
  Search,
  Filter,
  Download,
  Share2,
  Eye,
  Clock,
  Users,
  ChevronDown
} from "lucide-react";
import Navbar from "@/components/Navbar";

const Files = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const fileTypes = [
    { id: "all", label: "All Files", icon: FileText },
    { id: "excel", label: "Excel Files", icon: FileSpreadsheet },
    { id: "powerpoint", label: "PowerPoint", icon: Presentation },
    { id: "word", label: "Word Documents", icon: FileText }
  ];

  // Replace static files with state for real-time updates
  const [files, setFiles] = useState([]);
  const socketRef = useRef<Socket | null>(null);

  // Real-time file updates
  useEffect(() => {
    const socket = io('http://localhost:4000');
    socketRef.current = socket;
    socket.emit('join-document', 'files-list');
    socket.on('doc-changes', (newFiles) => {
      setFiles(newFiles);
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  // Broadcast new file upload to all users
  const handleFileUpload = (newFile) => {
    const updatedFiles = [newFile, ...files];
    setFiles(updatedFiles);
    socketRef.current?.emit('doc-changes', { docId: 'files-list', changes: updatedFiles });
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "excel":
        return FileSpreadsheet;
      case "powerpoint":
        return Presentation;
      default:
        return FileText;
    }
  };

  const filteredFiles = files.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         file.owner.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
  {/* Header */}
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Existing Files</h1>
            <p className="text-muted-foreground">Browse and collaborate on files shared by your team</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2">
                    <Filter className="w-4 h-4" />
                    {fileTypes.find(t => t.id === filterType)?.label}
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {fileTypes.map((type) => {
                    const Icon = type.icon;
                    return (
                      <DropdownMenuItem 
                        key={type.id}
                        onClick={() => setFilterType(type.id)}
                        className="gap-2"
                      >
                        <Icon className="w-4 h-4" />
                        {type.label}
                      </DropdownMenuItem>
                    );
                  })}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
        </div>

        {/* Files Grid */}
  {/* Files Grid - real-time */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredFiles.map((file, index) => {
            const Icon = getFileIcon(file.type);
            return (
              <Card 
                key={file.id}
                className="group hover:shadow-elegant transition-all duration-300 hover:-translate-y-1 cursor-pointer animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex items-center gap-3">
                        {/* Upload Button removed as per requirements */}
                        {/* File Type Dropdown */}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="gap-2">
                              <Filter className="w-4 h-4" />
                              {fileTypes.find(t => t.id === filterType)?.label}
                              <ChevronDown className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {fileTypes.map((type) => {
                              const Icon = type.icon;
                              return (
                                <DropdownMenuItem 
                                  key={type.id}
                                  onClick={() => setFilterType(type.id)}
                                  className="gap-2"
                                >
                                  <Icon className="w-4 h-4" />
                                  {type.label}
                                </DropdownMenuItem>
                              );
                            })}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button size="sm" variant="hero" className="flex-1">
                      <Eye className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
  </div>

        {/* Empty State */}
        {filteredFiles.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No files found</h3>
            <p className="text-muted-foreground">
              {searchQuery 
                ? `No files match your search for "${searchQuery}"`
                : "No files available in this category"
              }
            </p>
          </div>
        )}
      </div>
  </div>
  );
};

export default Files;