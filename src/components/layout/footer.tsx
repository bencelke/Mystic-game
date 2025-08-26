'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-muted/50 border-t"
    >
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="col-span-1 md:col-span-2">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 mb-4"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Mystic
              </span>
            </motion.div>
            <p className="text-muted-foreground max-w-md">
              Experience the next generation of gaming with Mystic. Immerse
              yourself in stunning visuals, captivating gameplay, and endless
              adventures.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {['Features', 'About', 'Contact', 'Support'].map(item => (
                <motion.li
                  key={item}
                  whileHover={{ x: 5 }}
                  className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
                >
                  {item}
                </motion.li>
              ))}
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-semibold mb-4">Connect</h3>
            <div className="flex space-x-3">
              {['Twitter', 'Discord', 'GitHub'].map(platform => (
                <motion.div
                  key={platform}
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-10 h-10 p-0 rounded-full"
                  >
                    {platform.charAt(0)}
                  </Button>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center"
        >
          <p className="text-sm text-muted-foreground">
            © 2024 Mystic. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              Privacy Policy
            </span>
            <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer">
              Terms of Service
            </span>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
}
