import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Download, Share2, Info } from "lucide-react";
import { usePhotos, PhotoItem } from "../store/api";

export function PhotosModule() {
  const { photos } = usePhotos();
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoItem | null>(null);

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "24px 32px", overflowY: "auto", background: "oklch(99% 0.01 265)" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 32, flexShrink: 0 }}>
        <div style={{ 
          width: 48, height: 48, borderRadius: 14, 
          display: "flex", alignItems: "center", justifyContent: "center", 
          background: "linear-gradient(135deg, oklch(67% 0.21 275), oklch(79% 0.14 175))",
          color: "#fff", boxShadow: "0 8px 16px oklch(67% 0.21 275 / 0.2)"
        }}>
          <Camera size={24} strokeWidth={2} />
        </div>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "oklch(25% 0.04 265)", margin: 0, letterSpacing: "-0.02em" }}>Photos</h1>
          <p style={{ margin: 0, color: "oklch(52% 0.025 265)", fontSize: 15 }}>{photos.length} items in your gallery</p>
        </div>
      </div>

      {/* Empty State */}
      {photos.length === 0 && (
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "oklch(52% 0.025 265)" }}>
          <Camera size={64} strokeWidth={1} style={{ marginBottom: 16, opacity: 0.5 }} />
          <h3 style={{ fontSize: 20, fontWeight: 600, color: "oklch(35% 0.04 265)", margin: "0 0 8px" }}>No photos yet</h3>
          <p style={{ margin: 0 }}>Upload some images in the Files app to see them here.</p>
        </div>
      )}

      {/* Gallery Grid */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", 
        gap: 20,
        alignItems: "start"
      }}>
        <AnimatePresence>
          {photos.map((photo, i) => (
            <motion.div
              key={photo.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
              style={{
                position: "relative",
                borderRadius: 20,
                overflow: "hidden",
                cursor: "pointer",
                background: "oklch(97% 0.01 265)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                aspectRatio: "4/3",
              }}
              onClick={() => setSelectedPhoto(photo)}
              whileHover="hover"
            >
              <img 
                src={photo.url} 
                alt={photo.name} 
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} 
              />
              
              {/* Glassmorphic Hover Overlay */}
              <motion.div
                variants={{
                  hover: { opacity: 1 }
                }}
                initial={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0) 50%)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: 16,
                  color: "#fff"
                }}
              >
                <div style={{ fontSize: 14, fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", marginBottom: 8 }}>
                  {photo.name}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="photo-action-btn" onClick={(e) => { e.stopPropagation(); window.open(photo.url, '_blank'); }}>
                    <Download size={16} />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Lightbox Modal */}
      <AnimatePresence>
        {selectedPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 1000,
              background: "rgba(0, 0, 0, 0.85)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
            onClick={() => setSelectedPhoto(null)}
          >
            <motion.button 
              style={{
                position: "absolute", top: 24, right: 24,
                width: 48, height: 48, borderRadius: 24,
                background: "rgba(255,255,255,0.1)",
                border: "none", color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                cursor: "pointer"
              }}
              whileHover={{ scale: 1.1, background: "rgba(255,255,255,0.2)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setSelectedPhoto(null)}
            >
              <X size={24} />
            </motion.button>
            
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              src={selectedPhoto.url}
              alt={selectedPhoto.name}
              style={{
                maxWidth: "90%",
                maxHeight: "90%",
                objectFit: "contain",
                borderRadius: 16,
                boxShadow: "0 24px 48px rgba(0,0,0,0.5)"
              }}
              onClick={(e) => e.stopPropagation()}
            />
          </motion.div>
        )}
      </AnimatePresence>
      
      <style>{`
        .photo-action-btn {
          width: 32px; height: 32px;
          border-radius: 8px;
          border: none;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          color: white;
          display: flex; alignItems: center; justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .photo-action-btn:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: scale(1.05);
        }
      `}</style>
    </div>
  );
}
