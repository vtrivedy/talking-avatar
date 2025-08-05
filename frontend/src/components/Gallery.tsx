import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Play, Pause, Image, Music, Video, Calendar, Trash2 } from 'lucide-react'
import axios from 'axios'

interface GalleryItem {
  id: string
  url: string
  name: string
  created: string
}

export function Gallery() {
  const [characters, setCharacters] = useState<GalleryItem[]>([])
  const [audio, setAudio] = useState<GalleryItem[]>([])
  const [avatars, setAvatars] = useState<GalleryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [playingAudio, setPlayingAudio] = useState<string | null>(null)
  const [audioElements, setAudioElements] = useState<{[key: string]: HTMLAudioElement}>({})

  useEffect(() => {
    fetchGalleryItems()
  }, [])

  const fetchGalleryItems = async () => {
    try {
      const [charRes, audioRes, avatarRes] = await Promise.all([
        axios.get('/api/characters/list'),
        axios.get('/api/audio/list'),
        axios.get('/api/avatars/list')
      ])
      
      setCharacters(charRes.data)
      setAudio(audioRes.data)
      setAvatars(avatarRes.data)
    } catch (error) {
      console.error('Error fetching gallery items:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleAudioPlayback = (audioUrl: string, audioId: string) => {
    if (playingAudio === audioId) {
      audioElements[audioId]?.pause()
      setPlayingAudio(null)
    } else {
      // Pause any currently playing audio
      if (playingAudio && audioElements[playingAudio]) {
        audioElements[playingAudio].pause()
      }
      
      // Create or get audio element
      let audioElement = audioElements[audioId]
      if (!audioElement) {
        audioElement = new Audio(audioUrl)
        audioElement.onended = () => setPlayingAudio(null)
        setAudioElements(prev => ({ ...prev, [audioId]: audioElement }))
      }
      
      audioElement.play()
      setPlayingAudio(audioId)
    }
  }

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-8 pt-24 max-w-7xl mx-auto"
    >
      <CardHeader className="px-0">
        <CardTitle className="text-4xl font-display gradient-text">My Gallery</CardTitle>
        <p className="text-lg text-white/60 mt-2">
          View and manage all your created content
        </p>
      </CardHeader>

      <Tabs defaultValue="characters" className="w-full">
        <TabsList className="grid w-full grid-cols-3 glass mb-8">
          <TabsTrigger value="characters" className="flex items-center gap-2">
            <Image className="w-4 h-4" />
            Characters ({characters.length})
          </TabsTrigger>
          <TabsTrigger value="audio" className="flex items-center gap-2">
            <Music className="w-4 h-4" />
            Audio ({audio.length})
          </TabsTrigger>
          <TabsTrigger value="avatars" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Avatars ({avatars.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="characters" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {characters.map((character) => (
              <motion.div
                key={character.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden">
                  <div className="aspect-square relative group">
                    <img
                      src={character.url}
                      alt={character.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => downloadFile(character.url, character.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardContent className="p-4">
                    <p className="text-sm text-white/60 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(character.created)}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          {characters.length === 0 && (
            <div className="text-center py-12 text-white/40">
              No characters created yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="audio" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {audio.map((audioItem) => (
              <motion.div
                key={audioItem.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                          <Music className="w-6 h-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{audioItem.name}</p>
                          <p className="text-sm text-white/60">{formatDate(audioItem.created)}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => toggleAudioPlayback(audioItem.url, audioItem.id)}
                        >
                          {playingAudio === audioItem.id ? (
                            <Pause className="h-4 w-4" />
                          ) : (
                            <Play className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="icon"
                          variant="secondary"
                          onClick={() => downloadFile(audioItem.url, audioItem.name)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <audio
                      src={audioItem.url}
                      className="w-full"
                      controls
                    />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          {audio.length === 0 && (
            <div className="text-center py-12 text-white/40">
              No audio files created yet
            </div>
          )}
        </TabsContent>

        <TabsContent value="avatars" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {avatars.map((avatar) => (
              <motion.div
                key={avatar.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="overflow-hidden">
                  <div className="aspect-video relative group bg-black">
                    <video
                      src={avatar.url}
                      className="w-full h-full object-contain"
                      controls
                      preload="metadata"
                    />
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-white/60 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(avatar.created)}
                      </p>
                      <Button
                        size="icon"
                        variant="secondary"
                        onClick={() => downloadFile(avatar.url, avatar.name)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          {avatars.length === 0 && (
            <div className="text-center py-12 text-white/40">
              No avatars created yet
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div>
  )
}