'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from '@/components/ui/navigation-menu';

export function MysticDemo() {
  return (
    <div className="min-h-screen p-8">
      {/* Background with Mystic gradient */}
      <div className="absolute inset-0 bg-mystic-gradient opacity-50" />

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-6xl font-bold mb-4 font-cinzel">
            <span className="bg-gradient-to-r from-purple-600 to-yellow-400 bg-clip-text text-transparent">
              Mystic Theme
            </span>
          </h1>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto font-inter">
            Showcasing the new Mystic design tokens and shadcn/ui components
          </p>
        </motion.div>

        {/* Navigation Menu Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-12"
        >
          <Card className="mystic-card">
            <CardHeader>
              <CardTitle className="mystic-gold">Navigation Menu</CardTitle>
              <CardDescription>
                Modern navigation with dropdown menus
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NavigationMenu>
                <NavigationMenuList>
                  <NavigationMenuItem>
                    <NavigationMenuTrigger className="bg-purple-600 hover:bg-purple-700">
                      Features
                    </NavigationMenuTrigger>
                    <NavigationMenuContent>
                      <div className="w-96 p-4 mystic-card">
                        <div className="grid gap-3">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="secondary"
                              className="bg-yellow-400 text-black"
                            >
                              New
                            </Badge>
                            <span>Advanced Animations</span>
                          </div>
                          <Separator className="bg-purple-600/20" />
                          <div className="flex items-center gap-2">
                            <Badge
                              variant="outline"
                              className="border-purple-600 text-purple-400"
                            >
                              Beta
                            </Badge>
                            <span>Multiplayer Support</span>
                          </div>
                        </div>
                      </div>
                    </NavigationMenuContent>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-[#1b1036]/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-purple-600 hover:text-white">
                      About
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                  <NavigationMenuItem>
                    <NavigationMenuLink className="group inline-flex h-10 w-max items-center justify-center rounded-md bg-[#1b1036]/50 px-4 py-2 text-sm font-medium transition-colors hover:bg-purple-600 hover:text-white">
                      Contact
                    </NavigationMenuLink>
                  </NavigationMenuItem>
                </NavigationMenuList>
              </NavigationMenu>
            </CardContent>
          </Card>
        </motion.div>

        {/* Component Showcase */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Button Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="mystic-card h-full">
              <CardHeader>
                <CardTitle className="mystic-gold">Buttons</CardTitle>
                <CardDescription>
                  Various button styles with Mystic theme
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button className="w-full bg-purple-600 hover:bg-purple-700 shadow-glow">
                  Primary Action
                </Button>
                <Button
                  variant="outline"
                  className="w-full border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black"
                >
                  Secondary Action
                </Button>
                <Button
                  variant="ghost"
                  className="w-full text-yellow-400 hover:bg-yellow-400/10"
                >
                  Ghost Button
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Badge Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Card className="mystic-card h-full">
              <CardHeader>
                <CardTitle className="mystic-gold">Badges</CardTitle>
                <CardDescription>Status indicators and labels</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge className="bg-purple-600">Default</Badge>
                  <Badge
                    variant="secondary"
                    className="bg-yellow-400 text-black"
                  >
                    Secondary
                  </Badge>
                  <Badge
                    variant="outline"
                    className="border-purple-600 text-purple-400"
                  >
                    Outline
                  </Badge>
                </div>
                <Separator className="bg-purple-600/20" />
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Status:</span>
                    <Badge className="bg-green-500">Online</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Version:</span>
                    <Badge variant="outline">v2.1.0</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Card Demo */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="mystic-card h-full shadow-glow">
              <CardHeader>
                <CardTitle className="mystic-gold">Enhanced Cards</CardTitle>
                <CardDescription>
                  Cards with Mystic glow effects
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-[#0a0717]/50 rounded-lg border border-purple-600/10">
                    <h4 className="font-semibold mystic-gold mb-2">
                      Feature Card
                    </h4>
                    <p className="text-sm text-gray-300">
                      This card demonstrates the Mystic theme with custom colors
                      and effects.
                    </p>
                  </div>
                  <Separator className="bg-purple-600/20" />
                  <div className="flex items-center gap-2">
                    <Badge className="bg-yellow-400 text-black">Hot</Badge>
                    <span className="text-sm">New feature available!</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Color Palette Demo */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12"
        >
          <Card className="mystic-card">
            <CardHeader>
              <CardTitle className="mystic-gold">
                Mystic Color Palette
              </CardTitle>
              <CardDescription>
                Custom color tokens for the Mystic theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { name: 'BG1', color: 'bg-[#1b1036]', text: 'text-white' },
                  { name: 'BG2', color: 'bg-[#0a0717]', text: 'text-white' },
                  {
                    name: 'Primary',
                    color: 'bg-purple-600',
                    text: 'text-white',
                  },
                  {
                    name: 'Primary2',
                    color: 'bg-purple-700',
                    text: 'text-white',
                  },
                  {
                    name: 'Accent',
                    color: 'bg-yellow-400',
                    text: 'text-black',
                  },
                  {
                    name: 'Accent2',
                    color: 'bg-yellow-300',
                    text: 'text-black',
                  },
                ].map(item => (
                  <div key={item.name} className="text-center">
                    <div
                      className={`w-full h-16 rounded-lg ${item.color} ${item.text} flex items-center justify-center font-bold mb-2 shadow-glow`}
                    >
                      {item.name}
                    </div>
                    <span className="text-xs text-gray-400">{item.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Font Showcase */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <Card className="mystic-card">
            <CardHeader>
              <CardTitle className="mystic-gold font-cinzel">
                Typography
              </CardTitle>
              <CardDescription className="font-inter">
                Custom fonts for the Mystic theme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mystic-gold mb-2 font-cinzel">
                    Cinzel Decorative (Display)
                  </h3>
                  <div className="space-y-2">
                    <p className="text-3xl font-cinzel font-normal">
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p className="text-2xl font-cinzel font-bold">
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p className="text-xl font-cinzel font-black">
                      The quick brown fox jumps over the lazy dog
                    </p>
                  </div>
                </div>
                <Separator className="bg-purple-600/20" />
                <div>
                  <h3 className="text-lg font-semibold mystic-gold mb-2 font-inter">
                    Inter (Body)
                  </h3>
                  <div className="space-y-2">
                    <p className="text-lg font-inter">
                      The quick brown fox jumps over the lazy dog
                    </p>
                    <p className="text-base font-inter">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Sed do eiusmod tempor incididunt ut labore et dolore magna
                      aliqua.
                    </p>
                    <p className="text-sm font-inter">
                      Ut enim ad minim veniam, quis nostrud exercitation ullamco
                      laboris nisi ut aliquip ex ea commodo consequat.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
