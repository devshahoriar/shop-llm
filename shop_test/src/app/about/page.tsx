/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import Image from "next/image";
import { features, team } from "@/data";

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-20 dark:from-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-bold md:text-5xl">
              About YupStore
            </h1>
            <p className="text-muted-foreground text-lg leading-relaxed">
              We&apos;re passionate about bringing you the best products at
              incredible prices. Since our founding, we&apos;ve been committed
              to quality, customer satisfaction, and making shopping a
              delightful experience.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="mb-6 text-3xl font-bold md:text-4xl">Our Story</h2>
              <div className="text-muted-foreground space-y-4">
                <p>
                  Founded in 2020, YupStore began as a small team with a big
                  vision: to create an e-commerce platform that puts customer
                  experience first. We believed that online shopping should be
                  simple, trustworthy, and enjoyable.
                </p>
                <p>
                  Today, we&apos;ve grown into a trusted destination for
                  thousands of customers worldwide, but our core values remain
                  the same. We carefully curate every product in our catalog,
                  ensuring that each item meets our high standards for quality
                  and value.
                </p>
                <p>
                  Our mission is to connect people with products they love while
                  building lasting relationships based on trust and exceptional
                  service.
                </p>
              </div>
            </div>
            <div className="relative">
              <div className="relative h-96 overflow-hidden rounded-lg shadow-lg">
                <Image
                  src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&h=400&fit=crop"
                  alt="Our team at work"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Why Choose YupStore?
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              We&apos;re committed to providing the best shopping experience
              possible with these key features.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mb-4 text-4xl">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Meet Our Team
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              The passionate people behind YupStore who make it all possible.
            </p>
          </div>

          <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
            {team.map((member, index) => (
              <div key={index} className="text-center">
                <div className="relative mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{member.name}</h3>
                <p className="text-muted-foreground">{member.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Ready to Start Shopping?
          </h2>
          <p className="mb-8 text-lg opacity-90">
            Discover our amazing collection of products and experience the
            YupStore difference.
          </p>
          <Button asChild size="lg" variant="secondary">
            <Link href="/">Browse Products</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
