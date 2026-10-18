import React from "react";
import { ImFileEmpty, ImFileMusic, ImFileVideo } from "react-icons/im";
import { IoClose } from "react-icons/io5";

const SelectedFillePreview = ({ fileSelected, filePreview, setFileSelected }) => {
  return fileSelected ? (
    <div className="w-[320px] absolute bottom-16 left-4 bg-wa-panel-light dark:bg-wa-panel-dark text-wa-text-primary-light dark:text-wa-text-primary-dark border border-wa-border-light dark:border-wa-border-dark rounded-2xl p-3 shadow-wa-modal z-30">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-wa-teal uppercase tracking-wider">
          Attachment preview
        </span>
        <button
          onClick={() => setFileSelected(null)}
          className="p-1 rounded-full hover:bg-wa-surface text-wa-text-secondary-light dark:text-wa-text-secondary-dark"
        >
          <IoClose size={20} />
        </button>
      </div>
      <div className="h-[180px] rounded-xl overflow-hidden bg-black/5 dark:bg-black/30 flex items-center justify-center">
        {fileSelected.type.startsWith("image/") ? (
          <img
            src={filePreview}
            alt="Preview"
            className="w-full h-full object-contain"
          />
        ) : fileSelected.type.startsWith("video/") ? (
          <video
            controls
            src={filePreview}
            className="w-full h-full object-contain"
          />
        ) : fileSelected.type.startsWith("audio/") ? (
          <audio controls src={filePreview} className="w-full px-2" />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <ImFileEmpty size={36} className="text-wa-teal mb-2" />
            <p className="text-xs font-semibold truncate max-w-[240px]">
              {fileSelected.name}
            </p>
            <p className="text-[11px] text-wa-text-secondary-light dark:text-wa-text-secondary-dark mt-0.5">
              {(fileSelected.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>
    </div>
  ) : null;
};

export default SelectedFillePreview;