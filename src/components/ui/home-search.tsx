"use client";
import React, { useState } from "react";
import { Input } from "./input";
import { Camera, Upload } from "lucide-react";
import { Button } from "./button";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const HomeSearch: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isImageSearch, setImageSearch] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [searchImage, setSearchImage] = useState<File | null>(null);
  const [isUpload, setIsUpload] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searching for:", searchTerm);
  };

  const handleImageSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Searching by image:", searchImage);
  };

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      if(file.size> 20*104*1024){
        toast.error("Image size must be less than 20 MB");
        return;
      }
      

      setSearchImage(file);
      setIsUpload(true);


      const reader = new FileReader();
      reader.onloadend = () => {
  if (typeof reader.result === "string") {
    setImagePreview(reader.result); 
  }
        setIsUpload(true);
        toast.success("Image uploaded successfully");

      }

      reader.onerror=()=>{
        setIsUpload(false);
        toast.error("Failed to read the image");
      };

      reader.readAsDataURL(file);




    }
  };

  const { getInputProps, getRootProps, isDragReject, isDragActive } =
    useDropzone({
      onDrop,
      accept: {
        "image/*": [".jpeg", ".jpg", ".png"],
      },
      maxFiles: 1,
      maxSize: 20 * 1024 * 1024, 
    });

  return (
    <div className="">
      {/* Text Search */}
      <form onSubmit={handleSubmit}>
        <div className="relative flex items-center">
          <Input
            type="text"
            placeholder="Enter make, model or use our AI Image Search.."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-12 py-6 w-full rounded-full border-gray-300 bg-white/95 backdrop-blur-sm mx-auto"
          />

          {/* Camera Toggle */}
          <div className="absolute right-[100px]">
            <Camera
              size={35}
              onClick={() => setImageSearch(!isImageSearch)}
              className="cursor-pointer rounded-xl p-1.5"
              style={{
                background: isImageSearch ? "black" : "",
                color: isImageSearch ? "white" : "",
              }}
            />
          </div>

          {/* Search Button */}
          <Button type="submit" className="absolute right-2 rounded-full">
            Search
          </Button>
        </div>
      </form>

      {/* Image Search Section */}
      {isImageSearch && (
        <div className="mt-4 bg-red-100 border rounded-2xl">
          <form onSubmit={handleImageSearch}>
            <div>
              {imagePreview ? (
                <div className="flex flex-col items-center">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="h-40 w-40 object-cover rounded-lg mb-2"
                  />





                  <Button variant="outline"
                  onClick={()=>{
                    setSearchImage(null);
                    setImagePreview(""),
                    toast.info("Image removed");
                  }}
                  >remov image</Button>
                </div>
              ) : (
                <div
                  {...getRootProps()}
                  className="border-2 border border-gray-400 p-6 rounded-lg flex flex-col items-center justify-center cursor-pointer" 
                >
                  <input {...getInputProps()} />
                  <Upload className="h-12 w-12 text-gray-400 mb-2" />
                  <p>
                    {isDragActive && !isDragReject
                      ? "Leave the file here to upload"
                      : "Drag & Drop a car image or click to select"}
                  </p>
                  {isDragReject && (
                    <p className="text-red-500 mb-2">Invalid image type</p>
                  )}
                  <p className="text-gray-400 text-sm">
                    Supports: JPG, PNG (max 20MB)
                  </p>
                </div>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default HomeSearch;
