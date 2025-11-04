import { useState } from "react";
// Dialog imports consolidated below
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
  ChevronDown,
  Upload,
  Plus,
  MoreVertical,
  Edit,
  Trash2
} from "lucide-react";
import Navbar from "@/components/Navbar";
import { useEffect } from "react";
import { io } from "socket.io-client";
import FileUpload from "@/components/FileUpload";

const Uploads = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [userFiles, setUserFiles] = useState<any[]>([]);

  // Fetch files for logged-in user from backend
  useEffect(() => {
    async function fetchFiles() {
      try {
        const res = await fetch("/api/files", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
        });
        if (res.ok) {
          const data = await res.json();
          setUserFiles(data.files || []);
        }
      } catch (err) {
        // Handle error (show toast, etc.)
      }
    }
    fetchFiles();

    // Real-time updates via socket.io
    const socket = io("http://localhost:4000");
    socket.on("file-uploaded", (file) => {
      setUserFiles(prev => [file, ...prev]);
    });
    socket.on("file-deleted", (fileId) => {
      setUserFiles(prev => prev.filter(f => f.id !== fileId));
    });
    socket.on("file-updated", (file) => {
      setUserFiles(prev => prev.map(f => f.id === file.id ? file : f));
    });
    return () => {
      socket.disconnect();
    };
  }, []);

  const fileTypes = [
    { id: "all", label: "All Files", icon: FileText },
    { id: "excel", label: "Excel Files", icon: FileSpreadsheet },
    { id: "powerpoint", label: "PowerPoint", icon: Presentation },
    { id: "word", label: "Word Documents", icon: FileText }
  ];

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

  const filteredFiles = userFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === "all" || file.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleUploadComplete = (newFile: any) => {
    setUserFiles(prev => [newFile, ...prev]);
    setIsUploadDialogOpen(false);
  };

  const handleDeleteFile = (fileId: number) => {
    setUserFiles(prev => prev.filter(file => file.id !== fileId));
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Uploads</h1>
            <p className="text-muted-foreground">Manage and organize your uploaded files</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search your files..."
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

            <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="w-4 h-4" />
                  Upload File
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Upload New File</DialogTitle>
                </DialogHeader>
                <FileUpload onUploadComplete={handleUploadComplete} />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FileText className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userFiles.length}</p>
                  <p className="text-sm text-muted-foreground">Total Files</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userFiles.filter(f => f.isShared).length}</p>
                  <p className="text-sm text-muted-foreground">Shared Files</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Eye className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{userFiles.reduce((sum, f) => sum + f.views, 0)}</p>
                  <p className="text-sm text-muted-foreground">Total Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Upload className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">16.4</p>
                  <p className="text-sm text-muted-foreground">MB Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Files Grid */}
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
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                          {file.name}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2 mt-1">
                          <span>by {file.owner}</span>
                          {file.isShared && (
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            file.status === 'active' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {file.status}
                          </span>
                        </CardDescription>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Edit className="w-4 h-4" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <Share2 className="w-4 h-4" />
                          Share Settings
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="gap-2 text-red-600"
                          onClick={() => handleDeleteFile(file.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* File Stats */}
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {file.lastModified}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {file.views} views
                    </div>
                  </div>

                  {/* Collaborators */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <div className="flex -space-x-2">
                        {(Array.isArray(file.collaborators) ? file.collaborators : []).slice(0, 3).map((collaborator, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-gradient-primary border-2 border-background flex items-center justify-center text-xs font-bold text-white"
                            title={collaborator}
                          >
                            {collaborator[0]}
                          </div>
                        ))}
                        {Array.isArray(file.collaborators) && file.collaborators.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-xs font-bold">
                            +{file.collaborators.length - 3}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{file.size}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="hero"
                      className="flex-1"
                      onClick={() => {
                        setPreviewFile(file);
                        setPreviewOpen(true);
                      }}
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Open
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Download logic: simulate download
                        alert(`Downloading ${file.name}`);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        // Share logic: simulate share
                        alert(`Share link for ${file.name}: https://yourapp.com/files/${file.id}`);
                      }}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    {file.owner === "You" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-600 border-red-200"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
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
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No files found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery 
                ? `No files match your search for "${searchQuery}"`
                : "You haven't uploaded any files yet"
              }
            </p>
            {!searchQuery && (
              <Button onClick={() => setIsUploadDialogOpen(true)} className="gap-2">
                <Plus className="w-4 h-4" />
                Upload Your First File
              </Button>
            )}
          </div>
        )}
      {/* File Preview Modal */}
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>File Preview</DialogTitle>
          </DialogHeader>
          {previewFile && (
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">{previewFile.name}</h3>
              {/* Basic preview logic: show info, and preview for images */}
              {['jpg','jpeg','png','gif','bmp','svg'].includes((previewFile.type || '').toLowerCase()) ? (
                <img src={previewFile.url || ''} alt={previewFile.name} className="max-w-full max-h-96 border rounded" />
              ) : (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <p className="text-gray-700">Type: {previewFile.type}</p>
                  <p className="text-gray-700">Size: {previewFile.size}</p>
                  <p className="text-gray-700">Description: {previewFile.description || 'No description'}</p>
                  <Button
                    variant="outline"
                    onClick={() => alert(`Downloading ${previewFile.name}`)}
                    className="mt-4"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
      </div>
    </div>
  );
};

export default Uploads;