import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { AppState } from '@/App'
import { ArrowLeft, ArrowRight, Loader2, Play, Music } from 'lucide-react'
import axios from 'axios'

interface AudioStageProps {
  state: AppState
  updateState: (updates: Partial<AppState>) => void
}

const voices = [
  { id: 'Rachel', name: 'Rachel', description: 'Female, American' },
  { id: 'Aria', name: 'Aria', description: 'Female, American' },
  { id: 'Sarah', name: 'Sarah', description: 'Female, American' },
  { id: 'Laura', name: 'Laura', description: 'Female, British' },
  { id: 'Charlotte', name: 'Charlotte', description: 'Female, Swedish' },
  { id: 'Lily', name: 'Lily', description: 'Female, British' },
  { id: 'Roger', name: 'Roger', description: 'Male, American' },
  { id: 'Charlie', name: 'Charlie', description: 'Male, Australian' },
  { id: 'George', name: 'George', description: 'Male, British' },
  { id: 'Callum', name: 'Callum', description: 'Male, American' },
  { id: 'Liam', name: 'Liam', description: 'Male, American' },
  { id: 'Bill', name: 'Bill', description: 'Male, American' },
]

export function AudioStage({ state, updateState }: AudioStageProps) {
  const [text, setText] = useState('')
  const [selectedVoice, setSelectedVoice] = useState('Rachel')
  const [loading, setLoading] = useState(false)
  const [previewingVoice, setPreviewingVoice] = useState<string | null>(null)

  const generateAudio = async () => {
    if (!text) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('text', text)
      formData.append('voice', selectedVoice)
      
      const response = await axios.post('/api/audio/generate', formData)
      updateState({ audioUrl: response.data.url })
      setText('') // Clear text for next generation
    } catch (error) {
      console.error('Error generating audio:', error)
      alert('Failed to generate audio')
    } finally {
      setLoading(false)
    }
  }

  const previewVoice = async (voice: string) => {
    setPreviewingVoice(voice)
    try {
      const formData = new FormData()
      formData.append('voice', voice)
      
      const response = await axios.post('/api/audio/preview', formData)
      const audio = new Audio(response.data.audio_url)
      audio.play()
      audio.onended = () => setPreviewingVoice(null)
    } catch (error) {
      console.error('Error previewing voice:', error)
      setPreviewingVoice(null)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8"
    >
      <CardHeader>
        <CardTitle className="text-3xl">Generate Speech</CardTitle>
        <CardDescription className="text-lg">
          Write what your character should say and choose a voice
          <br />
          <span className="text-sm text-yellow-400/80 mt-2 inline-block">
            💡 Tip: Keep your speech under 15 seconds for best results
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!state.audioUrl ? (
          <>
            <div className="space-y-4">
              <Label htmlFor="speech-text" className="text-lg">
                Speech Text
              </Label>
              <textarea
                id="speech-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Hello! I'm your AI avatar. I can speak any text you give me with a natural, expressive voice."
                className="w-full h-32 px-4 py-3 rounded-lg glass text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-4">
              <Label className="text-lg">Choose a Voice</Label>
              <RadioGroup
                value={selectedVoice}
                onValueChange={setSelectedVoice}
                className="grid grid-cols-2 gap-4"
              >
                {voices.map((voice) => (
                  <div
                    key={voice.id}
                    className="relative flex items-center space-x-3 glass rounded-lg p-4 hover:bg-white/5 transition-colors"
                  >
                    <RadioGroupItem value={voice.id} id={voice.id} />
                    <Label
                      htmlFor={voice.id}
                      className="flex-1 cursor-pointer"
                    >
                      <div className="font-medium">{voice.name}</div>
                      <div className="text-sm text-white/60">{voice.description}</div>
                    </Label>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => previewVoice(voice.id)}
                      disabled={previewingVoice === voice.id}
                    >
                      {previewingVoice === voice.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Play className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <Button
              onClick={generateAudio}
              disabled={!text || loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Audio...
                </>
              ) : (
                <>
                  <Music className="mr-2 h-4 w-4" />
                  Generate Audio
                </>
              )}
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <div className="glass p-6 rounded-xl">
              <p className="text-white/60 mb-4">Voice: {selectedVoice}</p>
              <audio
                src={state.audioUrl}
                controls
                className="w-full"
              />
            </div>
            
            <Button
              onClick={() => updateState({ audioUrl: null })}
              variant="secondary"
              size="lg"
              className="w-full mb-4"
            >
              <Music className="mr-2 h-4 w-4" />
              Generate Another Audio
            </Button>
            
            <div className="flex gap-4">
              <Button
                onClick={() => updateState({ stage: 'character' })}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Character
              </Button>
              <Button
                onClick={() => updateState({ stage: 'generate' })}
                size="lg"
                className="flex-1"
              >
                Continue to Generate
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </motion.div>
  )
}