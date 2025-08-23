import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950 dark:to-indigo-950">
      <div className="container mx-auto px-4 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Discover Amazing
              <span className="text-primary"> Products</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Shop our curated collection of premium products. From cutting-edge electronics 
              to sustainable lifestyle items, find everything you need with unbeatable quality 
              and customer service.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild size="lg" className="text-base">
                <Link href="#products">Shop Now</Link>
              </Button>
              <Button variant="outline" size="lg" className="text-base">
                Learn More
              </Button>
            </div>
          </div>

          {/* Hero Image */}
          <div className="relative">
            <div className="relative h-96 lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&h=600&fit=crop"
                alt="Shopping experience"
                fill
                className="object-cover"
                priority
                
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Floating cards */}
            <div className="absolute -top-4 -left-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transform rotate-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-sm font-medium">Free Shipping</span>
              </div>
            </div>
            
            <div className="absolute -bottom-4 -right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 transform -rotate-3">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-bold">★</span>
                </div>
                <span className="text-sm font-medium">Premium Quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-200/20 dark:bg-blue-800/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-purple-200/20 dark:bg-purple-800/20 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
