import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card } from '@/components/ui/card'
import { CharacterStage } from '@/components/CharacterStage'
import { AudioStage } from '@/components/AudioStage'
import { GenerateStage } from '@/components/GenerateStage'
import { SidePanel } from '@/components/SidePanel'
import { StageIndicator } from '@/components/StageIndicator'
import { Sparkles, Wand2, Music, Video } from 'lucide-react'

export type Stage = 'character' | 'audio' | 'generate'

export interface AppState {
  stage: Stage
  characterUrl: string | null
  audioUrl: string | null
  videoUrl: string | null
}

function App() {
  const [state, setState] = useState<AppState>({
    stage: 'character',
    characterUrl: null,
    audioUrl: null,
    videoUrl: null,
  })

  const updateState = (updates: Partial<AppState>) => {
    setState(prev => ({ ...prev, ...updates }))
  }

  const stages = [
    { id: 'character', label: 'Character', icon: Wand2 },
    { id: 'audio', label: 'Audio', icon: Music },
    { id: 'generate', label: 'Generate', icon: Video },
  ]

  return (
    <div className="min-h-screen gradient-bg text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10 flex min-h-screen">
        {/* Logo in top left */}
        <div className="absolute top-6 left-6 z-20">
          <motion.img 
            src="/koala-logo.svg" 
            alt="Koala Logo" 
            className="w-12 h-12"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="p-8 text-center pt-20">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-6xl font-display font-bold gradient-text">
                Talking Avatar
              </h1>
              <p className="text-xl text-white/60">
                Create amazing AI-powered talking avatars in minutes
              </p>
            </motion.div>
          </header>

          {/* Stage Indicator */}
          <div className="px-8 mb-8">
            <StageIndicator 
              stages={stages} 
              currentStage={state.stage} 
              onStageClick={(stage) => {
                // Allow navigation only to completed stages
                if (stage === 'character' || 
                    (stage === 'audio' && state.characterUrl) ||
                    (stage === 'generate' && state.characterUrl && state.audioUrl)) {
                  updateState({ stage: stage as Stage })
                }
              }}
            />
          </div>

          {/* Stage Content */}
          <main className="flex-1 px-8 pb-8">
            <Card className="h-full">
              <AnimatePresence mode="wait">
                {state.stage === 'character' && (
                  <CharacterStage 
                    key="character"
                    state={state}
                    updateState={updateState}
                  />
                )}
                {state.stage === 'audio' && (
                  <AudioStage 
                    key="audio"
                    state={state}
                    updateState={updateState}
                  />
                )}
                {state.stage === 'generate' && (
                  <GenerateStage 
                    key="generate"
                    state={state}
                    updateState={updateState}
                  />
                )}
              </AnimatePresence>
            </Card>
          </main>
        </div>

        {/* Side Panel */}
        <SidePanel state={state} />
      </div>
    </div>
  )
}

export default App