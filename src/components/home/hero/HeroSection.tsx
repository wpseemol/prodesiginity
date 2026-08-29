import HeroContent from "./HeroContent";
import HeroVideoPlayer from "./HeroVideoPlayer";

export default function HeroSection() {
    return (
        <section className="relative overflow-hidden bg-white dark:bg-[#090D16] py-12 md:py-20 lg:py-36 transition-colors duration-300 font-sans">
            {/* Background Decorative Glows */}
            <div className="absolute top-1/3 left-1/4 -translate-x-1/2 w-72 h-72 md:w-125 md:h-125 bg-violet-600/10 dark:bg-violet-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 right-10 w-64 h-64 md:w-112.5 md:h-112.5 bg-blue-600/10 dark:bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

            <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-14 items-center">
                    <HeroVideoPlayer
                        videoId="dQw4w9WgXcQ"
                        thumbnailSrc="/assets/images/Prodesignity-hero-images.jpg"
                    />
                    <HeroContent />
                </div>
            </div>
        </section>
    );
}
