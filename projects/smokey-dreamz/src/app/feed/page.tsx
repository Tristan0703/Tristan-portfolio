import { Globe, ArrowRight } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}

const blogPosts: BlogPost[] = [
  {
    id: "1",
    title: "The Rise of Craft Cannabis",
    excerpt: "Exploring the shift towards small-batch, artisanal cultivation methods and their impact on quality.",
    date: "April 8, 2026",
    category: "Industry",
    image: "craft"
  },
  {
    id: "2",
    title: "Understanding Terpenes",
    excerpt: "A deep dive into the aromatic compounds that give each strain its unique character and effects.",
    date: "April 5, 2026",
    category: "Education",
    image: "terpene"
  },
  {
    id: "3",
    title: "Spring Collection Preview",
    excerpt: "Get an exclusive look at the new strains joining our menu this season.",
    date: "April 1, 2026",
    category: "Products",
    image: "spring"
  },
  {
    id: "4",
    title: "The Art of Proper Storage",
    excerpt: "How to preserve the freshness and potency of your cannabis products at home.",
    date: "March 28, 2026",
    category: "Tips",
    image: "storage"
  },
];

export default function FeedPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      <main className="flex-1">
        <section className="py-24 px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <span className="text-xs font-medium tracking-widest uppercase text-gold mb-6 block">Stay Connected</span>
              <h1 className="font-serif text-5xl md:text-6xl text-white mb-6">The Feed</h1>
              <p className="text-zinc-500 max-w-xl mx-auto leading-relaxed">
                Market updates, strain insights, and exclusive content from the Smokey Dreamz community.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
              {blogPosts.map((post, index) => (
                <article
                  key={post.id}
                  className="group bg-surface border border-gold/10 rounded-2xl overflow-hidden hover:border-gold/30 transition-all duration-500 animate-fade-in opacity-0"
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
                >
                  <div className="aspect-video bg-gradient-to-br from-zinc-800/30 to-zinc-900/50 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <span className="font-serif text-5xl text-zinc-700/40 group-hover:text-zinc-600/50 transition-colors">
                      {post.title.charAt(0)}
                    </span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <span className="px-3 py-1 text-xs font-medium bg-gold/10 text-gold border border-gold/20 rounded-full">
                        {post.category}
                      </span>
                      <span className="text-zinc-600 text-xs">{post.date}</span>
                    </div>
                    <h2 className="font-serif text-xl text-white group-hover:text-gold transition-colors mb-3">
                      {post.title}
                    </h2>
                    <p className="text-zinc-500 text-sm leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <section className="border-t border-gold/10 pt-20">
              <div className="text-center mb-12">
                <h2 className="font-serif text-3xl text-white mb-4">Join Our Community</h2>
                <p className="text-zinc-500 max-w-md mx-auto">
                  Follow us on social media for exclusive drops and behind-the-scenes content
                </p>
              </div>

              <div className="flex justify-center">
                <a
                  href="https://instagram.com/smokeydreamz"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-purple-600/20 via-pink-600/20 to-orange-600/20 border border-pink-500/30 hover:border-pink-500/60 rounded-2xl transition-all duration-300"
                >
                  <Globe className="w-6 h-6 text-pink-400" />
                  <div className="text-left">
                    <span className="block text-white font-medium">Join the Dream</span>
                    <span className="text-pink-400 text-sm">@smokeydreamz</span>
                  </div>
                </a>
              </div>
            </section>

            <section className="mt-20 p-10 bg-surface border border-gold/10 rounded-2xl">
              <div className="max-w-2xl mx-auto text-center">
                <h2 className="font-serif text-2xl text-white mb-4">Stay Updated</h2>
                <p className="text-zinc-500 mb-8">
                  Subscribe for exclusive updates, new strain alerts, and members-only offers.
                </p>
                <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="your.email@example.com"
                    className="flex-1 px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder-zinc-600 focus:outline-none focus:border-gold transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gold hover:bg-gold-light text-background font-medium tracking-wide rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-gold/20"
                  >
                    Subscribe
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </form>
              </div>
            </section>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
