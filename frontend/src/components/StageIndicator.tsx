import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Stage {
  id: string
  label: string
  icon: LucideIcon
}

interface StageIndicatorProps {
  stages: Stage[]
  currentStage: string
  onStageClick: (stage: string) => void
}

export function StageIndicator({ stages, currentStage, onStageClick }: StageIndicatorProps) {
  const currentIndex = stages.findIndex(s => s.id === currentStage)

  return (
    <div className="flex items-center justify-center space-x-4">
      {stages.map((stage, index) => {
        const Icon = stage.icon
        const isActive = stage.id === currentStage
        const isCompleted = index < currentIndex

        return (
          <div key={stage.id} className="flex items-center">
            <motion.button
              onClick={() => onStageClick(stage.id)}
              className={cn(
                "relative flex flex-col items-center p-4 rounded-xl transition-all",
                "hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-primary",
                isActive && "bg-white/10"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center transition-all",
                  "border-2",
                  isActive && "gradient-primary text-white border-transparent glow",
                  isCompleted && "bg-primary/20 border-primary text-primary",
                  !isActive && !isCompleted && "bg-white/5 border-white/20 text-white/60"
                )}
              >
                <Icon className="w-6 h-6" />
              </div>
              <span className={cn(
                "mt-2 text-sm font-medium",
                isActive && "text-white",
                !isActive && "text-white/60"
              )}>
                {stage.label}
              </span>
            </motion.button>

            {index < stages.length - 1 && (
              <div className="w-24 h-0.5 bg-white/10 mx-2">
                <motion.div
                  className="h-full gradient-primary"
                  initial={{ width: 0 }}
                  animate={{ width: isCompleted ? '100%' : '0%' }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}