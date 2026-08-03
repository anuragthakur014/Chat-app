import { useState } from "react";

function WallpaperModal({
  open,
  onClose,
  onUpload,
  onRemove,
}) {
  const [file, setFile] = useState(null);

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">

      <div className="bg-white rounded-xl w-[350px] p-5">

        <h2 className="text-xl font-bold mb-4">
          Change Wallpaper
        </h2>

        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setFile(e.target.files[0])
          }
        />

        <div className="flex justify-end gap-3 mt-5">

          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-lg"
          >
            Cancel
          </button>

          <button
            onClick={onRemove}
            className="px-4 py-2 bg-red-500 text-white rounded-lg"
          >
            Remove
          </button>

          <button
            onClick={() => file && onUpload(file)}
            className="px-4 py-2 bg-green-600 text-white rounded-lg"
          >
            Upload
          </button>

        </div>

      </div>

    </div>
  );
}

export default WallpaperModal;