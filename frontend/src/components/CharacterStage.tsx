import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AppState } from '@/App'
import { Upload, Wand2, ArrowRight, Loader2, Edit3 } from 'lucide-react'
import axios from 'axios'

interface CharacterStageProps {
  state: AppState
  updateState: (updates: Partial<AppState>) => void
}

export function CharacterStage({ state, updateState }: CharacterStageProps) {
  const [prompt, setPrompt] = useState('')
  const [editPrompt, setEditPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const generateCharacter = async () => {
    if (!prompt) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('prompt', prompt)
      formData.append('model', 'imagen4')
      
      const response = await axios.post('/api/characters/generate', formData)
      updateState({ characterUrl: response.data.url })
      setPrompt('')
    } catch (error) {
      console.error('Error generating character:', error)
      alert('Failed to generate character')
    } finally {
      setLoading(false)
    }
  }

  const uploadCharacter = async () => {
    if (!file) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('name', 'Uploaded Character')
      
      const response = await axios.post('/api/characters/upload', formData)
      updateState({ characterUrl: response.data.url })
      setFile(null)
    } catch (error) {
      console.error('Error uploading character:', error)
      alert('Failed to upload character')
    } finally {
      setLoading(false)
    }
  }

  const editCharacter = async () => {
    if (!editPrompt || !state.characterUrl) return
    
    setLoading(true)
    try {
      const formData = new FormData()
      formData.append('image_url', state.characterUrl)
      formData.append('prompt', editPrompt)
      
      const response = await axios.post('/api/characters/edit', formData)
      updateState({ characterUrl: response.data.url })
      setEditPrompt('')
    } catch (error) {
      console.error('Error editing character:', error)
      alert('Failed to edit character')
    } finally {
      setLoading(false)
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
        <CardTitle className="text-3xl">Create Your Character</CardTitle>
        <CardDescription className="text-lg">
          Generate an AI character or upload your own image
          <br />
          <span className="text-sm text-yellow-400/80 mt-2 inline-block">
            💡 Tip: Works best with human-like characters with visible faces
          </span>
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {!state.characterUrl ? (
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-2 glass">
              <TabsTrigger value="generate">Generate with AI</TabsTrigger>
              <TabsTrigger value="upload">Upload Image</TabsTrigger>
            </TabsList>
            
            <TabsContent value="generate" className="space-y-4">
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="A professional businesswoman with shoulder-length brown hair, wearing a blue blazer, warm smile"
                className="w-full h-32 px-4 py-3 rounded-lg glass text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Button
                onClick={generateCharacter}
                disabled={!prompt || loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="mr-2 h-4 w-4" />
                    Generate Character
                  </>
                )}
              </Button>
            </TabsContent>
            
            <TabsContent value="upload" className="space-y-4">
              <div
                className="w-full h-64 rounded-lg glass border-2 border-dashed border-white/20 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => document.getElementById('file-input')?.click()}
              >
                <Upload className="w-12 h-12 mb-4 text-white/40" />
                <p className="text-white/60 mb-2">Click to upload or drag and drop</p>
                <p className="text-sm text-white/40">PNG, JPG up to 10MB</p>
                <input
                  id="file-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
              </div>
              {file && (
                <p className="text-sm text-white/60 text-center">
                  Selected: {file.name}
                </p>
              )}
              <Button
                onClick={uploadCharacter}
                disabled={!file || loading}
                size="lg"
                className="w-full"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Character
                  </>
                )}
              </Button>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-6">
            <div className="glass p-6 rounded-xl space-y-4">
              <h3 className="text-xl font-semibold">Edit Your Character (Optional)</h3>
              <div className="flex gap-3">
                <input
                  type="text"
                  value={editPrompt}
                  onChange={(e) => setEditPrompt(e.target.value)}
                  placeholder="Add sunglasses and a smile"
                  className="flex-1 px-4 py-2 rounded-lg glass text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <Button
                  onClick={editCharacter}
                  disabled={!editPrompt || loading}
                  variant="secondary"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Edit3 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <Button
              onClick={() => updateState({ stage: 'audio' })}
              size="lg"
              className="w-full"
            >
              Continue to Audio
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </motion.div>
  )
}