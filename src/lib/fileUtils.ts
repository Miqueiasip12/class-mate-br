// Utility functions for handling different types of file uploads

export const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20MB

export const ACCEPTED_FILE_TYPES = {
  images: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
  documents: [
    'application/pdf',
    'application/msword', 
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain'
  ],
  media: [
    'audio/mpeg', 
    'audio/mp3',
    'video/mp4'
  ]
};

export const ALL_ACCEPTED_TYPES = [
  ...ACCEPTED_FILE_TYPES.images,
  ...ACCEPTED_FILE_TYPES.documents,
  ...ACCEPTED_FILE_TYPES.media
];

export const validateFile = (file: File, allowedTypes?: string[]): string | null => {
  const typesToCheck = allowedTypes || ALL_ACCEPTED_TYPES;
  
  if (!typesToCheck.includes(file.type)) {
    return 'Formato de arquivo não suportado.';
  }
  
  if (file.size > MAX_FILE_SIZE) {
    return 'Arquivo muito grande. Tamanho máximo: 20MB.';
  }
  
  return null;
};

export const getFileIcon = (fileType: string): string => {
  if (ACCEPTED_FILE_TYPES.images.includes(fileType)) {
    return '🖼️';
  }
  if (fileType === 'application/pdf') {
    return '📄';
  }
  if (fileType.includes('word') || fileType.includes('document')) {
    return '📝';
  }
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) {
    return '📊';
  }
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) {
    return '📽️';
  }
  if (fileType.includes('audio')) {
    return '🎵';
  }
  if (fileType.includes('video')) {
    return '🎬';
  }
  return '📎';
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Convert file to base64 for storage
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
  });
};