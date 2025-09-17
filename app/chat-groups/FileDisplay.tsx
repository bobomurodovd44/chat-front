import React from "react";
import { FileIcon, Music, FileText, Image as ImageIcon } from "lucide-react";

type FileDisplayProps = {
  fileUrl: string;
  fileType: string;
  fileName?: string;
};

const FileDisplay: React.FC<FileDisplayProps> = ({
  fileUrl,
  fileType,
  fileName,
}) => {
  if (fileType.startsWith("image/")) {
    return (
      <div className="p-2">
        <img
          src={fileUrl}
          alt="Uploaded"
          className="w-full rounded-lg shadow"
        />
      </div>
    );
  }

  if (fileType.startsWith("audio/")) {
    return (
      <audio controls>
        <source src={fileUrl} />
        Sizning brauzeringiz audio qo‘llab-quvvatlamaydi.
      </audio>
    );
  }

  if (fileType === "application/pdf") {
    return (
      <a
        href={fileUrl}
        target="_blank" // yangi tabda ochadi
        rel="noopener noreferrer"
        className="p-4 max-w-full bg-gray-100 rounded-lg shadow flex items-center gap-2"
      >
        <FileIcon className="w-6 h-6 text-blue-600" />

        <p className="text-sm truncate font-normal flex-1">{fileName}</p>
      </a>
    );
  }
};

export default FileDisplay;
