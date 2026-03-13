"use client";

import { useCallback, useRef, useState, type DragEvent, type ChangeEvent } from "react";
import { ImageIcon, Upload, X, AlertCircle } from "lucide-react";

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_SIZE_MB = 5;
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

/* ------------------------------------------------------------------ */
/*  Props                                                             */
/* ------------------------------------------------------------------ */

interface ImageUploadProps {
    /** Called when a valid file is selected/dropped. */
    onFileSelect: (file: File) => void;
    /** Called when the user removes the selected image. */
    onClear: () => void;
    /** Whether an upload is in progress. */
    uploading?: boolean;
    /** Optional error message. */
    error?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                         */
/* ------------------------------------------------------------------ */

export default function ImageUpload({
    onFileSelect,
    onClear,
    uploading = false,
    error,
}: ImageUploadProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);

    /* ---- Validate & process file ---- */
    const processFile = useCallback(
        (file: File) => {
            setValidationError(null);

            if (!ACCEPTED_TYPES.includes(file.type)) {
                setValidationError("Only JPEG, PNG, and WebP images are allowed.");
                return;
            }

            if (file.size > MAX_SIZE_BYTES) {
                setValidationError(`File must be under ${MAX_SIZE_MB}MB.`);
                return;
            }

            // Generate preview
            const url = URL.createObjectURL(file);
            setPreview(url);
            setFileName(file.name);
            onFileSelect(file);
        },
        [onFileSelect],
    );

    /* ---- Clear ---- */
    const handleClear = useCallback(() => {
        setPreview(null);
        setFileName(null);
        setValidationError(null);
        if (inputRef.current) inputRef.current.value = "";
        onClear();
    }, [onClear]);

    /* ---- Drag handlers ---- */
    const onDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        setDragOver(true);
    }, []);

    const onDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        setDragOver(false);
    }, []);

    const onDrop = useCallback(
        (e: DragEvent) => {
            e.preventDefault();
            setDragOver(false);
            const file = e.dataTransfer.files?.[0];
            if (file) processFile(file);
        },
        [processFile],
    );

    /* ---- File input handler ---- */
    const onInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            const file = e.target.files?.[0];
            if (file) processFile(file);
        },
        [processFile],
    );

    const displayError = validationError ?? error;

    /* ---- Preview state ---- */
    if (preview) {
        return (
            <div className="space-y-2">
                <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase">
                    <ImageIcon className="h-3.5 w-3.5" />
                    Cover Image
                </label>

                <div className="relative overflow-hidden rounded-2xl border border-neutral-200 bg-neutral-50">
                    {/* Preview image */}
                    <img
                        src={preview}
                        alt="Preview"
                        className="h-48 w-full object-cover"
                    />

                    {/* Overlay bar */}
                    <div className="flex items-center justify-between border-t border-neutral-200 bg-white px-4 py-2.5">
                        <span className="text-xs font-medium text-neutral-600 truncate max-w-[200px]">
                            {fileName}
                        </span>

                        {uploading ? (
                            <div className="flex items-center gap-2 text-xs text-primary-600">
                                <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600" />
                                Uploading…
                            </div>
                        ) : (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-neutral-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                                <X className="h-3.5 w-3.5" />
                                Remove
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    /* ---- Drop zone state ---- */
    return (
        <div className="space-y-2">
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold tracking-wide text-neutral-600 uppercase">
                <ImageIcon className="h-3.5 w-3.5" />
                Cover Image
                <span className="font-normal normal-case text-neutral-400">
                    (optional)
                </span>
            </label>

            <div
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => inputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-6 py-10 text-center transition-all duration-200 ${dragOver
                        ? "border-primary-400 bg-primary-50"
                        : "border-neutral-300 bg-neutral-50/60 hover:border-primary-300 hover:bg-neutral-50"
                    }`}
            >
                <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl transition ${dragOver
                            ? "bg-primary-100 text-primary-600"
                            : "bg-neutral-100 text-neutral-400"
                        }`}
                >
                    <Upload className="h-5 w-5" />
                </div>

                <div>
                    <p className="text-sm font-medium text-neutral-700">
                        {dragOver ? "Drop your image here" : "Drag & drop or click to upload"}
                    </p>
                    <p className="mt-1 text-xs text-neutral-400">
                        JPEG, PNG, or WebP • Max {MAX_SIZE_MB}MB
                    </p>
                </div>

                <input
                    ref={inputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.webp"
                    onChange={onInputChange}
                    className="hidden"
                />
            </div>

            {displayError && (
                <div className="flex items-center gap-1.5 text-xs text-red-600">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    {displayError}
                </div>
            )}
        </div>
    );
}
