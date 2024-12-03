import React from 'react'
import { ImFileEmpty, ImFileMusic, ImFileVideo } from 'react-icons/im'
import { IoClose } from 'react-icons/io5'

const SelectedFillePreview = ({fileSelected, filePreview, setFileSelected}) => {
  return fileSelected ? (
        <div className="w-[300px] absolute bottom-14 left-0 bg-secondary  rounded-t-lg p-2">
          <div className="flex item-center justify-between">
            <div className=""></div>
            <button
              onClick={() => setFileSelected(null)}
              className=" mb-2 hover:bg-background duration-100 p-1 rounded-full"
            >
              <IoClose size={24} />
            </button>
          </div>
          <div className=" h-[200px]">
            {fileSelected.type.startsWith("image/") ? (
              <img
                src={filePreview}
                alt="Preview"
                className="w-full h-full object-contain rounded-lg"
              />
            ) : fileSelected.type.startsWith("video/") ? (
              <video
                controls
                width="500"
                src={filePreview}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : fileSelected.type.startsWith("audio/") ? (
              <audio
                controls
                src={filePreview}
                className="w-full h-full object-contain rounded-lg"
              />
            ) : (
              <div className="flex flex-col h-full w-full items-center justify-center px-4">
                {
                  <div className="file-icon mb-4">
                    {fileSelected.type.startsWith("audio/") ? (
                      <ImFileMusic size={30} />
                    ) : fileSelected.type.startsWith("video/") ? (
                      <ImFileVideo size={30} />
                    ) : (
                      <ImFileEmpty size={30} />
                    )}
                  </div>
                }
                <p className="line-clamp-1">
                  File Name: {fileSelected.name}
                </p>
                <p className="line-clamp-1">
                  File Type: {fileSelected.type}
                </p>
                <p className="line-clamp-1">
                  File Size:{" "}
                  {(fileSelected.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            )}
          </div>
        </div>
  ) : null
}

export default SelectedFillePreview