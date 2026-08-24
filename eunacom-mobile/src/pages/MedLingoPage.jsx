import React, { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { 
  loadGamificationState, 
  saveGamificationState, 
  deductHeart, 
  refillHearts, 
  recordLessonSuccess, 
  claimChestReward 
} from '../utils/gamificationStore'
import { MEDLINGO_MODULES } from '../data/medlingo/modulePaths'
import { getQuestionsForNode } from '../data/medlingo/interactiveQuestions'
import MedLingoHeader from '../components/medlingo/MedLingoHeader'
import MedLingoPath from '../components/medlingo/MedLingoPath'
import MedLingoBottomNav from '../components/medlingo/MedLingoBottomNav'
import MedLingoCollectionTab from '../components/medlingo/tabs/MedLingoCollectionTab'
import MedLingoLeaguesTab from '../components/medlingo/tabs/MedLingoLeaguesTab'
import MedLingoMissionsTab from '../components/medlingo/tabs/MedLingoMissionsTab'
import MedLingoProfileTab from '../components/medlingo/tabs/MedLingoProfileTab'
import MedLingoLessonModal from '../components/medlingo/MedLingoLessonModal'
import MedLingoShopModal from '../components/medlingo/MedLingoShopModal'
import MedLingoMentorPickerModal from '../components/medlingo/MedLingoMentorPickerModal'
import MedLingoMissions from '../components/medlingo/MedLingoMissions'
import '../components/medlingo/medlingo.css'

export default function MedLingoPage() {
  const { user } = useAuth()
  const userId = user?.id || 'guest_user'

  const [gameState, setGameState] = useState(() => loadGamificationState(userId))
  const [selectedModuleId, setSelectedModuleId] = useState('cardiologia')
  const [activeTab, setActiveTab] = useState('sendero') // 'sendero' | 'coleccion' | 'ligas' | 'misiones' | 'perfil'
  
  // Modals state
  const [activeLessonData, setActiveLessonData] = useState(null) // { node, unit, questions }
  const [showShopModal, setShowShopModal] = useState(false)
  const [showMentorPicker, setShowMentorPicker] = useState(false)

  // Reload/save gamification state
  useEffect(() => {
    const loaded = loadGamificationState(userId)
    setGameState(loaded)
  }, [userId])

  const updateAndSaveState = (updater) => {
    setGameState((prevState) => {
      const nextState = typeof updater === 'function' ? updater(prevState) : updater
      saveGamificationState(userId, nextState)
      return nextState
    })
  }

  // Selected module data
  const currentModule = MEDLINGO_MODULES.find(m => m.id === selectedModuleId) || MEDLINGO_MODULES[0]

  // Start a lesson node
  const handleStartLesson = (node, unit) => {
    const questions = getQuestionsForNode(node.id, currentModule)
    setActiveLessonData({
      node,
      unit,
      questions
    })
  }

  // Open a treasure chest
  const handleOpenChest = (chestId, gemsReward) => {
    updateAndSaveState(prev => claimChestReward(prev, chestId, gemsReward))
  }

  // Deduct 1 heart on error
  const handleDeductHeart = () => {
    updateAndSaveState(prev => deductHeart(prev))
  }

  // Finish a lesson successfully
  const handleFinishLesson = ({ nodeId, stars, scorePercent, xpEarned, gemsEarned }) => {
    updateAndSaveState(prev => recordLessonSuccess(prev, {
      nodeId,
      stars,
      scorePercent,
      xpEarned,
      gemsEarned
    }))
  }

  // Shop actions
  const handleRefillHearts = (cost) => {
    updateAndSaveState(prev => {
      const stateWithRefill = refillHearts(prev)
      return {
        ...stateWithRefill,
        gems: Math.max(0, (prev.gems || 0) - cost)
      }
    })
  }

  const handleBuyStreakFreeze = (cost) => {
    updateAndSaveState(prev => ({
      ...prev,
      gems: Math.max(0, (prev.gems || 0) - cost),
      streakFreezeTokens: (prev.streakFreezeTokens || 0) + 1
    }))
  }

  const handleBuyDoubleXp = (cost) => {
    updateAndSaveState(prev => ({
      ...prev,
      gems: Math.max(0, (prev.gems || 0) - cost),
      inventory: {
        ...(prev.inventory || {}),
        doubleXpActiveUntil: Date.now() + 15 * 60 * 1000 // 15 mins
      }
    }))
  }

  // Mentor picker action
  const handleSelectMentor = (mentorId) => {
    updateAndSaveState(prev => ({
      ...prev,
      activeMentorId: mentorId
    }))
  }

  // Claim quest reward
  const handleClaimQuestReward = (questKey, gemsReward) => {
    updateAndSaveState(prev => {
      const quests = { ...(prev.dailyQuests || {}) }
      const claimed = { ...(quests.claimed || {}) }
      claimed[questKey] = true
      quests.claimed = claimed

      return {
        ...prev,
        gems: (prev.gems || 0) + gemsReward,
        dailyQuests: quests
      }
    })
  }

  return (
    <div className="medlingo-page">
      {/* ── Top Sticky Header ── */}
      <MedLingoHeader
        state={gameState}
        currentModuleId={selectedModuleId}
        onSelectModule={setSelectedModuleId}
        onOpenShop={() => setShowShopModal(true)}
        onOpenMentorPicker={() => setShowMentorPicker(true)}
      />

      {/* ── Main Tab Content ── */}
      <main className="medlingo-main-viewport">
        {activeTab === 'sendero' && (
          <div className="medlingo-body-container animate-scale-up">
            {/* Left: The Snake Road / Path */}
            <div className="medlingo-path-column">
              <MedLingoPath
                moduleData={currentModule}
                state={gameState}
                onStartLesson={handleStartLesson}
                onOpenChest={handleOpenChest}
              />
            </div>

            {/* Right: Daily Missions & League Panel (Desktop Sidebar) */}
            <MedLingoMissions
              state={gameState}
              onClaimReward={handleClaimQuestReward}
            />
          </div>
        )}

        {activeTab === 'coleccion' && (
          <MedLingoCollectionTab
            state={gameState}
            onOpenShop={() => setShowShopModal(true)}
          />
        )}

        {activeTab === 'ligas' && (
          <MedLingoLeaguesTab
            state={gameState}
            onOpenShop={() => setShowShopModal(true)}
          />
        )}

        {activeTab === 'misiones' && (
          <MedLingoMissionsTab
            state={gameState}
            onUpdateState={updateAndSaveState}
            onOpenShop={() => setShowShopModal(true)}
          />
        )}

        {activeTab === 'perfil' && (
          <MedLingoProfileTab
            state={gameState}
            onOpenMentorPicker={() => setShowMentorPicker(true)}
            onOpenShop={() => setShowShopModal(true)}
          />
        )}
      </main>

      {/* ── Dedicated Duolingo Bottom Navigation Bar ── */}
      <MedLingoBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
      />

      {/* ── Fullscreen Lesson Modal ── */}
      {activeLessonData && (
        <MedLingoLessonModal
          node={activeLessonData.node}
          unit={activeLessonData.unit}
          moduleData={currentModule}
          questions={activeLessonData.questions}
          state={gameState}
          onClose={() => setActiveLessonData(null)}
          onDeductHeart={handleDeductHeart}
          onFinishLesson={handleFinishLesson}
          onOpenShop={() => setShowShopModal(true)}
        />
      )}

      {/* ── Shop Modal ── */}
      {showShopModal && (
        <MedLingoShopModal
          state={gameState}
          onClose={() => setShowShopModal(false)}
          onRefillHearts={handleRefillHearts}
          onBuyStreakFreeze={handleBuyStreakFreeze}
          onBuyDoubleXp={handleBuyDoubleXp}
        />
      )}

      {/* ── Mentor Picker Modal ── */}
      {showMentorPicker && (
        <MedLingoMentorPickerModal
          activeMentorId={gameState.activeMentorId}
          userLevel={gameState.userLevel || 1}
          onSelectMentor={handleSelectMentor}
          onClose={() => setShowMentorPicker(false)}
        />
      )}
    </div>
  )
}
