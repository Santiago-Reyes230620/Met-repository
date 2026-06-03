import Link from "next/link";
import { GraduationCap, BookOpen, Github, Twitter, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border/40 bg-background/95">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="flex items-center space-x-2 group mb-4">
              <div className="relative">
                <GraduationCap className="h-6 w-6 text-primary transition-transform group-hover:scale-110" />
                <BookOpen className="absolute -bottom-0.5 -right-0.5 h-3 w-3 text-chart-2" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-primary to-chart-2 bg-clip-text text-transparent">
                MET Prep
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-md">
              Master the Michigan English Test with comprehensive practice exercises,
              quizzes, and progress tracking. Build your skills and confidence for exam success.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Features</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/grammar" className="hover:text-foreground transition-colors">Grammar Exercises</Link></li>
              <li><Link href="/vocabulary" className="hover:text-foreground transition-colors">Vocabulary Practice</Link></li>
              <li><Link href="/reading" className="hover:text-foreground transition-colors">Reading Comprehension</Link></li>
              <li><Link href="/quiz" className="hover:text-foreground transition-colors">Practice Quizzes</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-3 text-foreground">Connect</h3>
            <div className="flex space-x-3">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border/40 mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} MET Prep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
