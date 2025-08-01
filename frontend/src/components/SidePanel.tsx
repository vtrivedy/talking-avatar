import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AppState } from '@/App'
import { Image, Music, Sparkles } from 'lucide-react'

interface SidePanelProps {
  state: AppState
}

export function SidePanel({ state }: SidePanelProps) {
  return (
    <div className="w-96 p-8 space-y-6 border-l border-white/10">
      <motion.h2
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="text-2xl font-display font-semibold gradient-text"
      >
        Preview
      </motion.h2>

      <AnimatePresence>
        {/* Character Preview */}
        {state.characterUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Image className="w-5 h-5" />
                  Character
                </CardTitle>
              </CardHeader>
              <CardContent>
                <img
                  src={state.characterUrl}
                  alt="Character"
                  className="w-full rounded-lg shadow-xl"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Audio Preview */}
        {state.audioUrl && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Music className="w-5 h-5" />
                  Audio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <audio
                  src={state.audioUrl}
                  controls
                  className="w-full"
                />
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Empty State */}
        {!state.characterUrl && !state.audioUrl && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center h-64 text-center space-y-4"
          >
            <Sparkles className="w-16 h-16 text-white/20" />
            <p className="text-white/40">
              Your creations will appear here
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}