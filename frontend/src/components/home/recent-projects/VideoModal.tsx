"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Dialog, DialogPanel, DialogBackdrop } from "@headlessui/react";
import type { Project } from "./RecentProjects";

interface VideoModalProps {
    selectedVideo: Project | null;
    onClose: () => void;
}

export default function VideoModal({
    selectedVideo,
    onClose,
}: VideoModalProps) {
    return (
        <AnimatePresence>
            {selectedVideo && (
                <Dialog
                    open={!!selectedVideo}
                    onClose={onClose}
                    className="relative z-50"
                >
                    <DialogBackdrop
                        as={motion.div}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-slate-950/80 dark:bg-black/90 backdrop-blur-md"
                    />

                    <div className="fixed inset-0 flex items-center justify-center p-3 sm:p-6 lg:p-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 10 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 10 }}
                            transition={{
                                type: "spring",
                                stiffness: 350,
                                damping: 28,
                            }}
                        >
                            <DialogPanel
                                className="relative w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0D121F] border border-border-color dark:border-dark-border-color shadow-2xl"
                            >
                                {/* Modal Header */}
                                <div className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b border-border-color dark:border-dark-border-color shrink-0">
                                    <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-slate-100 truncate pr-4">
                                        {selectedVideo.title}
                                    </h3>
                                    <button
                                        type="button"
                                        onClick={onClose}
                                        aria-label="Close modal"
                                        className="p-1.5 rounded-full text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                    </button>
                                </div>

                                {/* Video Display */}
                                <div className="relative w-full bg-black aspect-video max-h-[calc(90vh-70px)] flex items-center justify-center overflow-hidden">
                                    {selectedVideo.videoUrl ? (
                                        <video
                                            src={selectedVideo.videoUrl}
                                            poster={selectedVideo.thumbnail}
                                            controls
                                            autoPlay
                                            playsInline
                                            preload="metadata"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <iframe
                                            className="w-full h-full border-0"
                                            src={`https://www.youtube-nocookie.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
                                            title={selectedVideo.title}
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                        />
                                    )}
                                </div>
                            </DialogPanel>
                        </motion.div>
                    </div>
                </Dialog>
            )}
        </AnimatePresence>
    );
}
