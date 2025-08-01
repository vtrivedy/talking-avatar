import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { AppState } from '@/App'
import { ArrowLeft, Loader2, Video, Download, RefreshCw } from 'lucide-react'
import axios from 'axios'

interface GenerateStageProps {
  state: AppState
  updateState: (updates: Partial<AppState>) => void
}

export function GenerateStage({ state, updateState }: GenerateStageProps) {
  const [loading, setLoading] = useState(false)

  const generateAvatar = async () => {
    if (!state.characterUrl || !state.audioUrl) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('character_url', state.characterUrl)
      formData.append('audio_url', state.audioUrl)
      formData.append('name', 'My Talking Avatar')
      
      const response = await axios.post('/api/avatar/create', formData)
      updateState({ videoUrl: response.data.url })
    } catch (error: any) {
      console.error('Error generating avatar:', error)
      const errorMessage = error.response?.data?.detail || 'Failed to generate avatar'
      alert(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const downloadVideo = () => {
    if (!state.videoUrl) return
    
    const a = document.createElement('a')
    a.href = state.videoUrl
    a.download = 'talking-avatar.mp4'
    a.click()
  }

  const startOver = () => {
    updateState({
      stage: 'character',
      characterUrl: null,
      audioUrl: null,
      videoUrl: null,
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="p-8"
    >
      <CardHeader>
        <CardTitle className="text-3xl">Create Your Talking Avatar</CardTitle>
        <CardDescription className="text-lg">
          Combine your character and audio to create the final video
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!state.videoUrl ? (
          <>
            <div className="grid grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Character</CardTitle>
                </CardHeader>
                <CardContent>
                  <img
                    src={state.characterUrl || ''}
                    alt="Character"
                    className="w-full rounded-lg"
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Audio</CardTitle>
                </CardHeader>
                <CardContent>
                  <audio
                    src={state.audioUrl || ''}
                    controls
                    className="w-full"
                  />
                </CardContent>
              </Card>
            </div>

            <Button
              onClick={generateAvatar}
              disabled={loading}
              size="lg"
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Your Avatar...
                </>
              ) : (
                <>
                  <Video className="mr-2 h-4 w-4" />
                  Generate Talking Avatar
                </>
              )}
            </Button>

            <Button
              onClick={() => updateState({ stage: 'audio' })}
              variant="secondary"
              size="lg"
              className="w-full"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Audio
            </Button>
          </>
        ) : (
          <div className="space-y-6">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="glass p-6 rounded-xl"
            >
              <h3 className="text-2xl font-semibold text-center mb-6 gradient-text">
                🎉 Your Talking Avatar is Ready!
              </h3>
              <video
                src={state.videoUrl}
                controls
                className="w-full rounded-lg shadow-2xl"
              />
            </motion.div>
            
            <div className="flex gap-4">
              <Button
                onClick={downloadVideo}
                size="lg"
                className="flex-1"
              >
                <Download className="mr-2 h-4 w-4" />
                Download Video
              </Button>
              <Button
                onClick={startOver}
                variant="secondary"
                size="lg"
                className="flex-1"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Create Another
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </motion.div>
  )
}